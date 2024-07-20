--
-- PostgreSQL database dump
--

-- Dumped from database version 15.1 (Ubuntu 15.1-1.pgdg20.04+1)
-- Dumped by pg_dump version 15.7 (Homebrew)
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;
DROP SCHEMA public;
--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;
ALTER SCHEMA extensions OWNER TO postgres;
--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;
ALTER SCHEMA public OWNER TO pg_database_owner;
--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';
--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public' AS $$ BEGIN
INSERT INTO public.wtf_users (id, email)
VALUES (NEW.id, NEW.email) ON CONFLICT (email) DO NOTHING;
-- Assuming 'email' is the column with a unique constraint
RETURN NEW;
END;
$$;
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;
--
-- Name: notify_event(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.notify_event() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE data_text TEXT;
BEGIN IF TG_OP = 'DELETE' THEN data_text := row_to_json(OLD)::text;
ELSE data_text := row_to_json(NEW)::text;
END IF;
-- Include the operation type and table name in the JSON payload
data_text := json_build_object(
    'data',
    data_text,
    'operation',
    TG_OP,
    'table_name',
    TG_TABLE_NAME,
    'triggered_function',
    TG_NAME
)::text;
-- Use pg_notify to send the notification
PERFORM pg_notify('my_event_channel', data_text);
RETURN NEW;
END;
$$;
ALTER FUNCTION public.notify_event() OWNER TO postgres;
--
-- Name: update_engagement_scores_and_log(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_engagement_scores_and_log() RETURNS text LANGUAGE plpgsql AS $$
DECLARE profile RECORD;
new_total_engagement_points INT;
new_wallet VARCHAR;
error_occurred BOOLEAN := FALSE;
error_message TEXT := '';
BEGIN FOR profile IN
SELECT username,
    total_engagement_score
FROM view_engagement_leaderboard LOOP BEGIN -- Attempt to get the wallet from wtf_users
SELECT provisioned_wallet INTO new_wallet
FROM public.wtf_users
WHERE lower(twitter_username) = lower(profile.username);
-- Try to update an existing record
UPDATE public.twitter_engagement_score
SET total_engagement_points = profile.total_engagement_score,
    wallet = new_wallet,
    updated_at = NOW()
WHERE lower(profile_screen_name) = lower(profile.username);
IF NOT FOUND THEN -- If no record was updated, insert a new one
INSERT INTO public.twitter_engagement_score (
        profile_screen_name,
        wallet,
        total_engagement_points,
        updated_at
    )
VALUES (
        profile.username,
        new_wallet,
        profile.total_engagement_score,
        NOW()
    );
END IF;
EXCEPTION
WHEN others THEN -- Catch and store the first error message
IF NOT error_occurred THEN error_message := 'Error processing engagement score for ' || profile.username || ': ' || SQLERRM;
error_occurred := TRUE;
END IF;
-- Optional: continue processing even if one iteration fails
CONTINUE;
END;
END LOOP;
-- After loop, decide what to log based on whether an error occurred
IF error_occurred THEN
INSERT INTO cron_logs (timestamp, status, message)
VALUES (NOW(), 'error', error_message);
RETURN 'Error. Check cron_logs for details.';
ELSE
INSERT INTO cron_logs (timestamp, status, message)
VALUES (
        NOW(),
        'done',
        'All Twitter Engagement Scores updated successfully.'
    );
RETURN 'Success. All Twitter Engagement Scores updated.';
END IF;
END;
$$;
ALTER FUNCTION public.update_engagement_scores_and_log() OWNER TO postgres;
--
-- Name: update_engagement_scores_and_log_v2(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_engagement_scores_and_log_v2() RETURNS text LANGUAGE plpgsql AS $$
DECLARE profile RECORD;
error_occurred BOOLEAN := FALSE;
error_message TEXT := '';
BEGIN FOR profile IN
SELECT username,
    total_engagement_score,
    u.provisioned_wallet
FROM view_engagement_leaderboard l
    JOIN public.wtf_users u ON lower(l.username) = lower(u.twitter_username) LOOP BEGIN
INSERT INTO public.twitter_engagement_score (
        profile_screen_name,
        wallet,
        total_engagement_points,
        updated_at
    )
VALUES (
        profile.username,
        profile.provisioned_wallet,
        profile.total_engagement_score,
        NOW()
    ) ON CONFLICT (profile_screen_name) DO
UPDATE
SET total_engagement_points = EXCLUDED.total_engagement_points,
    wallet = EXCLUDED.wallet,
    updated_at = NOW();
EXCEPTION
WHEN others THEN -- Append error message for each error
IF NOT error_occurred THEN error_message := 'Error processing engagement score for ' || profile.username || ': ' || SQLERRM;
ELSE error_message := error_message || chr(10) || 'Error processing engagement score for ' || profile.username || ': ' || SQLERRM;
END IF;
error_occurred := TRUE;
CONTINUE;
END;
END LOOP;
-- After loop, log details based on error occurrence
IF error_occurred THEN
INSERT INTO cron_logs (timestamp, status, message)
VALUES (NOW(), 'error', error_message);
RETURN 'Error. Check cron_logs for details.';
ELSE
INSERT INTO cron_logs (timestamp, status, message)
VALUES (
        NOW(),
        'done',
        'All Twitter Engagement Scores updated successfully.'
    );
RETURN 'Success. All Twitter Engagement Scores updated.';
END IF;
END;
$$;
ALTER FUNCTION public.update_engagement_scores_and_log_v2() OWNER TO postgres;
--
-- Name: update_score_difference(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_score_difference() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN -- Calculate the score difference
NEW.score_difference = NEW.total_engagement_points - OLD.total_engagement_points;
-- Update the updated_at column only if the total_engagement_points has changed
IF NEW.total_engagement_points <> OLD.total_engagement_points THEN NEW.updated_at = NOW();
END IF;
RETURN NEW;
END;
$$;
ALTER FUNCTION public.update_score_difference() OWNER TO postgres;
--
-- Name: update_twitter_engagement_score(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_twitter_engagement_score() RETURNS text LANGUAGE plpgsql AS $$
DECLARE profile RECORD;
BEGIN FOR profile IN
SELECT username,
    total_engagement_score,
    u.provisioned_wallet
FROM view_engagement_leaderboard l
    JOIN public.wtf_users u ON lower(l.username) = lower(u.twitter_username) LOOP
INSERT INTO public.twitter_engagement_score (
        profile_screen_name,
        wallet,
        total_engagement_points,
        updated_at
    )
VALUES (
        profile.username,
        profile.provisioned_wallet,
        profile.total_engagement_score,
        NOW()
    ) ON CONFLICT (profile_screen_name) DO
UPDATE
SET total_engagement_points = EXCLUDED.total_engagement_points,
    wallet = EXCLUDED.wallet,
    updated_at = NOW();
END LOOP;
RETURN 'Success. Twitter Engagement Scores updated.';
END;
$$;
ALTER FUNCTION public.update_twitter_engagement_score() OWNER TO postgres;
SET default_tablespace = '';
SET default_table_access_method = heap;
--
-- Name: alpha_keys; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alpha_keys (
    alpha_key text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    provisioned boolean,
    provisioned_at timestamp with time zone,
    player_id integer
);
ALTER TABLE public.alpha_keys OWNER TO postgres;
--
-- Name: auction_listings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auction_listings (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    "assetContractAddress" text,
    "minimumBidAmount" text,
    "buyoutBidAmount" text,
    "endTimeInSeconds" text,
    asset jsonb,
    status text
);
ALTER TABLE public.auction_listings OWNER TO postgres;
--
-- Name: auction_listings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.auction_listings
ALTER COLUMN id
ADD GENERATED BY DEFAULT AS IDENTITY (
        SEQUENCE NAME public.auction_listings_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1
    );
--
-- Name: contract; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contract (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    abi character varying NOT NULL,
    address character varying NOT NULL,
    network character varying NOT NULL,
    "providerCredential" text,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.contract OWNER TO postgres;
--
-- Name: contract_duplicate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contract_duplicate (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    abi character varying,
    address character varying,
    network character varying,
    "providerCredential" text,
    "createdDate" timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text),
    "updatedDate" timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text)
);
ALTER TABLE public.contract_duplicate OWNER TO postgres;
--
-- Name: TABLE contract_duplicate; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.contract_duplicate IS 'This is a duplicate of contract';
--
-- Name: credential; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.credential (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    "nodeCredentialName" character varying NOT NULL,
    "credentialData" character varying NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.credential OWNER TO postgres;
--
-- Name: credential_duplicate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.credential_duplicate (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    "nodeCredentialName" character varying,
    "credentialData" character varying,
    "createdDate" timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text),
    "updatedDate" timestamp with time zone
);
ALTER TABLE public.credential_duplicate OWNER TO postgres;
--
-- Name: TABLE credential_duplicate; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.credential_duplicate IS 'This is a duplicate of credential';
--
-- Name: cron_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cron_logs (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    status text,
    "timestamp" timestamp with time zone,
    message text
);
ALTER TABLE public.cron_logs OWNER TO postgres;
--
-- Name: cron_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.cron_logs
ALTER COLUMN id
ADD GENERATED BY DEFAULT AS IDENTITY (
        SEQUENCE NAME public.cron_logs_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1
    );
--
-- Name: dashboard_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dashboard_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    email text NOT NULL,
    password text NOT NULL
);
ALTER TABLE public.dashboard_users OWNER TO postgres;
--
-- Name: direct_listings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.direct_listings (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    "assetContractAddress" text,
    asset jsonb,
    "endTimeInSeconds" text,
    status text,
    price text,
    currency text
);
ALTER TABLE public.direct_listings OWNER TO postgres;
--
-- Name: direct_listings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.direct_listings
ALTER COLUMN id
ADD GENERATED BY DEFAULT AS IDENTITY (
        SEQUENCE NAME public.direct_listings_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1
    );
--
-- Name: execution; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.execution (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    "shortId" character varying NOT NULL,
    "executionData" character varying NOT NULL,
    state character varying NOT NULL,
    "workflowShortId" character varying NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "stoppedDate" timestamp without time zone,
    "workflowId" uuid
);
ALTER TABLE public.execution OWNER TO postgres;
--
-- Name: execution_duplicate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.execution_duplicate (
    id bigint NOT NULL,
    "executionData" text NOT NULL,
    state character varying,
    "workflowShortId" character varying,
    "shortId" character varying,
    "createdDate" timestamp with time zone,
    "stoppedDate" timestamp with time zone
);
ALTER TABLE public.execution_duplicate OWNER TO postgres;
--
-- Name: TABLE execution_duplicate; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.execution_duplicate IS 'This is a duplicate of execution';
--
-- Name: execution_duplicate_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.execution_duplicate
ALTER COLUMN id
ADD GENERATED BY DEFAULT AS IDENTITY (
        SEQUENCE NAME public.execution_duplicate_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1
    );
--
-- Name: game_variables; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.game_variables (
    id bigint NOT NULL,
    name text,
    value jsonb
);
ALTER TABLE public.game_variables OWNER TO postgres;
--
-- Name: game_variables_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.game_variables
ALTER COLUMN id
ADD GENERATED BY DEFAULT AS IDENTITY (
        SEQUENCE NAME public.game_variables_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1
    );
--
-- Name: kristof_test; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kristof_test (id integer NOT NULL, test text);
ALTER TABLE public.kristof_test OWNER TO postgres;
--
-- Name: kristof_test_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.kristof_test_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE public.kristof_test_id_seq OWNER TO postgres;
--
-- Name: kristof_test_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.kristof_test_id_seq OWNED BY public.kristof_test.id;
--
-- Name: match_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.match_history (
    id bigint NOT NULL,
    start_time bigint,
    end_time bigint,
    match_id text
);
ALTER TABLE public.match_history OWNER TO postgres;
--
-- Name: match_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.match_history
ALTER COLUMN id
ADD GENERATED BY DEFAULT AS IDENTITY (
        SEQUENCE NAME public.match_history_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1
    );
--
-- Name: matches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.matches (
    id integer NOT NULL,
    player_id integer,
    xp_earned double precision,
    duration_in_mins double precision,
    created_at timestamp with time zone DEFAULT now(),
    game_type text
);
ALTER TABLE public.matches OWNER TO postgres;
--
-- Name: matches_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.matches_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE public.matches_id_seq OWNER TO postgres;
--
-- Name: matches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.matches_id_seq OWNED BY public.matches.id;
--
-- Name: monster_game_resources; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.monster_game_resources (
    id integer NOT NULL,
    name text,
    address text
);
ALTER TABLE public.monster_game_resources OWNER TO postgres;
--
-- Name: monster_game_resources_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.monster_game_resources_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE public.monster_game_resources_id_seq OWNER TO postgres;
--
-- Name: monster_game_resources_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.monster_game_resources_id_seq OWNED BY public.monster_game_resources.id;
--
-- Name: monster_game_variables; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.monster_game_variables (
    id integer NOT NULL,
    name text,
    value text
);
ALTER TABLE public.monster_game_variables OWNER TO postgres;
--
-- Name: monster_game_variables_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.monster_game_variables_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE public.monster_game_variables_id_seq OWNER TO postgres;
--
-- Name: monster_game_variables_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.monster_game_variables_id_seq OWNED BY public.monster_game_variables.id;
--
-- Name: monster_match_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.monster_match_history (
    id integer NOT NULL,
    start_time bigint,
    end_time bigint,
    match_id text
);
ALTER TABLE public.monster_match_history OWNER TO postgres;
--
-- Name: monster_match_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.monster_match_history_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE public.monster_match_history_id_seq OWNER TO postgres;
--
-- Name: monster_match_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.monster_match_history_id_seq OWNED BY public.monster_match_history.id;
--
-- Name: monster_player_inventory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.monster_player_inventory (
    id integer NOT NULL,
    player_id bigint,
    resource_id bigint,
    quantity bigint
);
ALTER TABLE public.monster_player_inventory OWNER TO postgres;
--
-- Name: monster_player_inventory_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.monster_player_inventory_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE public.monster_player_inventory_id_seq OWNER TO postgres;
--
-- Name: monster_player_inventory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.monster_player_inventory_id_seq OWNED BY public.monster_player_inventory.id;
--
-- Name: monster_player_match_performance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.monster_player_match_performance (
    id integer NOT NULL,
    player_id bigint,
    match_id text,
    headshots bigint
);
ALTER TABLE public.monster_player_match_performance OWNER TO postgres;
--
-- Name: monster_player_match_performance_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.monster_player_match_performance_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE public.monster_player_match_performance_id_seq OWNER TO postgres;
--
-- Name: monster_player_match_performance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.monster_player_match_performance_id_seq OWNED BY public.monster_player_match_performance.id;
--
-- Name: monster_players; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.monster_players (
    id integer NOT NULL,
    steam_username text,
    wallet text
);
ALTER TABLE public.monster_players OWNER TO postgres;
--
-- Name: monster_players_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.monster_players_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE public.monster_players_id_seq OWNER TO postgres;
--
-- Name: monster_players_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.monster_players_id_seq OWNED BY public.monster_players.id;
--
-- Name: oz_test_table; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.oz_test_table (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    "test-id" smallint
);
ALTER TABLE public.oz_test_table OWNER TO postgres;
--
-- Name: oz_test_table_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.oz_test_table
ALTER COLUMN id
ADD GENERATED BY DEFAULT AS IDENTITY (
        SEQUENCE NAME public.oz_test_table_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1
    );
--
-- Name: player_inventory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.player_inventory (
    id bigint NOT NULL,
    player_id bigint,
    resource_id bigint,
    quantity bigint
);
ALTER TABLE public.player_inventory OWNER TO postgres;
--
-- Name: player_inventory_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.player_inventory
ALTER COLUMN id
ADD GENERATED BY DEFAULT AS IDENTITY (
        SEQUENCE NAME public.player_inventory_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1
    );
--
-- Name: player_match_performance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.player_match_performance (
    id bigint NOT NULL,
    player_id bigint,
    match_id text,
    headshots bigint
);
ALTER TABLE public.player_match_performance OWNER TO postgres;
--
-- Name: player_match_performance_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.player_match_performance
ALTER COLUMN id
ADD GENERATED BY DEFAULT AS IDENTITY (
        SEQUENCE NAME public.player_match_performance_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1
    );
--
-- Name: player_portal; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.player_portal (
    id integer NOT NULL,
    option text,
    value text
);
ALTER TABLE public.player_portal OWNER TO postgres;
--
-- Name: player_portal_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.player_portal_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE public.player_portal_id_seq OWNER TO postgres;
--
-- Name: player_portal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.player_portal_id_seq OWNED BY public.player_portal.id;
--
-- Name: players; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.players (
    steam_username text,
    external_wallet text,
    sol_wallet text,
    steam_id text,
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    alpha_key_status text,
    eth_wallet text
);
ALTER TABLE public.players OWNER TO postgres;
--
-- Name: players_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.players
ALTER COLUMN id
ADD GENERATED BY DEFAULT AS IDENTITY (
        SEQUENCE NAME public.players_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1
    );
--
-- Name: resources; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resources (
    id bigint NOT NULL,
    name text,
    address text
);
ALTER TABLE public.resources OWNER TO postgres;
--
-- Name: resources_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.resources
ALTER COLUMN id
ADD GENERATED BY DEFAULT AS IDENTITY (
        SEQUENCE NAME public.resources_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1
    );
--
-- Name: run_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.run_history (id integer NOT NULL, record text);
ALTER TABLE public.run_history OWNER TO postgres;
--
-- Name: run_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.run_history_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE public.run_history_id_seq OWNER TO postgres;
--
-- Name: run_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.run_history_id_seq OWNED BY public.run_history.id;
--
-- Name: run_variables; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.run_variables (
    id integer NOT NULL,
    jump_force integer,
    gravity double precision,
    template text
);
ALTER TABLE public.run_variables OWNER TO postgres;
--
-- Name: run_variables_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.run_variables_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE public.run_variables_id_seq OWNER TO postgres;
--
-- Name: run_variables_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.run_variables_id_seq OWNED BY public.run_variables.id;
--
-- Name: test12345; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.test12345 (id integer NOT NULL, test text);
ALTER TABLE public.test12345 OWNER TO postgres;
--
-- Name: test123_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.test123_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE public.test123_id_seq OWNER TO postgres;
--
-- Name: test123_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.test123_id_seq OWNED BY public.test12345.id;
--
-- Name: twitter_engagement_score_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.twitter_engagement_score_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE public.twitter_engagement_score_id_seq OWNER TO postgres;
--
-- Name: twitter_engagement_score; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.twitter_engagement_score (
    id integer DEFAULT nextval(
        'public.twitter_engagement_score_id_seq'::regclass
    ) NOT NULL,
    profile_screen_name text,
    wallet character varying(255),
    updated_at timestamp with time zone DEFAULT now(),
    total_engagement_points integer,
    score_difference bigint DEFAULT '0'::bigint
);
ALTER TABLE public.twitter_engagement_score OWNER TO postgres;
--
-- Name: twitter_engagement_score_wip_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.twitter_engagement_score_wip_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE public.twitter_engagement_score_wip_id_seq OWNER TO postgres;
--
-- Name: twitter_follower_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.twitter_follower_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE public.twitter_follower_id_seq OWNER TO postgres;
--
-- Name: twitter_followers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.twitter_followers (
    id integer DEFAULT nextval('public.twitter_follower_id_seq'::regclass) NOT NULL,
    user_id bigint,
    screenname text,
    url text,
    name text,
    location text,
    description text,
    profile_url text,
    followers_count bigint,
    friends_count bigint,
    statuses_count bigint,
    urls text,
    restricted_access boolean,
    banned text,
    created_date date,
    uploaded_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.twitter_followers OWNER TO postgres;
--
-- Name: twitter_mention_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.twitter_mention_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE public.twitter_mention_id_seq OWNER TO postgres;
--
-- Name: twitter_mentions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.twitter_mentions (
    id integer DEFAULT nextval('public.twitter_mention_id_seq'::regclass) NOT NULL,
    tweet_url text,
    tweet_id bigint,
    profile_screen_name text,
    profile_name text,
    profile_location text,
    profile_description text,
    profile_url text,
    is_retweet text,
    retweet_count bigint,
    like_count bigint,
    reply_count bigint,
    view_count bigint,
    text text,
    media_type text,
    media_url text,
    date timestamp with time zone,
    uploaded_at timestamp with time zone DEFAULT now(),
    remarks character varying
);
ALTER TABLE public.twitter_mentions OWNER TO postgres;
--
-- Name: twitter_scores_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.twitter_scores_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE public.twitter_scores_id_seq OWNER TO postgres;
--
-- Name: twitter_scrape_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.twitter_scrape_log_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE public.twitter_scrape_log_id_seq OWNER TO postgres;
--
-- Name: twitter_tweet_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.twitter_tweet_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE public.twitter_tweet_id_seq OWNER TO postgres;
--
-- Name: twitter_tweets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.twitter_tweets (
    id integer DEFAULT nextval('public.twitter_tweet_id_seq'::regclass) NOT NULL,
    tweet_url text,
    tweet_id bigint,
    profile_screen_name text,
    profile_name text,
    profile_location text,
    profile_description text,
    profile_url text,
    is_retweet text,
    retweet_count bigint,
    like_count bigint,
    reply_count bigint,
    view_count bigint,
    text text,
    media_type text,
    media_url text,
    date timestamp with time zone,
    uploaded_at timestamp with time zone DEFAULT now(),
    remarks character varying
);
ALTER TABLE public.twitter_tweets OWNER TO postgres;
--
-- Name: view_engagement_leaderboard; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.view_engagement_leaderboard AS
SELECT ranked_mentions.profile_screen_name AS username,
    sum(
        (
            (
                (
                    ranked_mentions.retweet_count + ranked_mentions.like_count
                ) + ranked_mentions.reply_count
            ) + ranked_mentions.view_count
        )
    ) AS total_engagement_score,
    sum(ranked_mentions.retweet_count) AS total_retweet_count,
    sum(ranked_mentions.like_count) AS total_like_count,
    sum(ranked_mentions.reply_count) AS total_reply_count,
    sum(ranked_mentions.view_count) AS total_view_count
FROM (
        SELECT twitter_mentions.id,
            twitter_mentions.tweet_url,
            twitter_mentions.tweet_id,
            twitter_mentions.profile_screen_name,
            twitter_mentions.profile_name,
            twitter_mentions.profile_location,
            twitter_mentions.profile_description,
            twitter_mentions.profile_url,
            twitter_mentions.is_retweet,
            twitter_mentions.retweet_count,
            twitter_mentions.like_count,
            twitter_mentions.reply_count,
            twitter_mentions.view_count,
            twitter_mentions.text,
            twitter_mentions.media_type,
            twitter_mentions.media_url,
            twitter_mentions.date,
            twitter_mentions.uploaded_at,
            twitter_mentions.remarks,
            row_number() OVER (
                PARTITION BY twitter_mentions.profile_screen_name,
                twitter_mentions.tweet_id
                ORDER BY twitter_mentions.id DESC
            ) AS rn
        FROM public.twitter_mentions
    ) ranked_mentions
WHERE (ranked_mentions.rn = 1)
GROUP BY ranked_mentions.profile_screen_name
ORDER BY (
        sum(
            (
                (
                    (
                        ranked_mentions.retweet_count + ranked_mentions.like_count
                    ) + ranked_mentions.reply_count
                ) + ranked_mentions.view_count
            )
        )
    ) DESC;
ALTER TABLE public.view_engagement_leaderboard OWNER TO postgres;
--
-- Name: view_mention_stats; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.view_mention_stats AS WITH latest_stats AS (
    SELECT mentions.tweet_id,
        max(mentions.id) AS max_id
    FROM public.twitter_mentions mentions
    GROUP BY mentions.tweet_id
),
total_engagement_stats AS (
    SELECT tm_1.tweet_id,
        sum(
            (
                (
                    (
                        COALESCE(tm_1.retweet_count, (0)::bigint) + COALESCE(tm_1.like_count, (0)::bigint)
                    ) + COALESCE(tm_1.reply_count, (0)::bigint)
                ) + COALESCE(tm_1.view_count, (0)::bigint)
            )
        ) AS total_engagement
    FROM (
            public.twitter_mentions tm_1
            JOIN latest_stats ls ON (
                (
                    (tm_1.tweet_id = ls.tweet_id)
                    AND (tm_1.id = ls.max_id)
                )
            )
        )
    GROUP BY tm_1.tweet_id
)
SELECT tm.tweet_url,
    tm.tweet_id,
    tm.text AS tweet,
    tes.total_engagement,
    tm.retweet_count,
    tm.like_count,
    tm.reply_count,
    tm.view_count,
    tm.profile_screen_name AS username,
    tm.profile_name,
    tm.profile_location,
    tm.profile_description,
    tm.date
FROM (
        public.twitter_mentions tm
        JOIN total_engagement_stats tes ON ((tm.tweet_id = tes.tweet_id))
    )
WHERE (
        tm.id = (
            SELECT latest_stats.max_id
            FROM latest_stats
            WHERE (latest_stats.tweet_id = tm.tweet_id)
        )
    )
ORDER BY tes.total_engagement DESC;
ALTER TABLE public.view_mention_stats OWNER TO postgres;
--
-- Name: wtf_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wtf_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    email text NOT NULL,
    wallet text,
    twitter_id text,
    twitter_username text,
    connected_time text,
    score bigint DEFAULT '0'::bigint,
    social_score bigint DEFAULT '0'::bigint,
    provisioned_wallet text,
    claimed_daily timestamp with time zone,
    telegram_id text
);
ALTER TABLE public.wtf_users OWNER TO postgres;
--
-- Name: view_tweet_stats; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.view_tweet_stats AS WITH latest_stats AS (
    SELECT tweets.tweet_id,
        max(tweets.id) AS max_id
    FROM public.twitter_tweets tweets
    GROUP BY tweets.tweet_id
),
total_engagement_stats AS (
    SELECT tt_1.tweet_id,
        sum(
            (
                (
                    (
                        COALESCE(tt_1.retweet_count, (0)::bigint) + COALESCE(tt_1.like_count, (0)::bigint)
                    ) + COALESCE(tt_1.reply_count, (0)::bigint)
                ) + COALESCE(tt_1.view_count, (0)::bigint)
            )
        ) AS total_engagement
    FROM (
            public.twitter_tweets tt_1
            JOIN latest_stats ls ON (
                (
                    (tt_1.tweet_id = ls.tweet_id)
                    AND (tt_1.id = ls.max_id)
                )
            )
        )
    GROUP BY tt_1.tweet_id
)
SELECT tt.tweet_url,
    tt.tweet_id,
    tt.text AS tweet,
    tes.total_engagement,
    tt.retweet_count,
    tt.like_count,
    tt.reply_count,
    tt.view_count,
    tt.profile_screen_name AS username,
    CASE
        WHEN (wtf_users.twitter_username IS NOT NULL) THEN true
        ELSE false
    END AS wtf_user,
    tt.profile_name,
    tt.profile_location,
    tt.profile_description,
    tt.date
FROM (
        (
            public.twitter_tweets tt
            JOIN total_engagement_stats tes ON ((tt.tweet_id = tes.tweet_id))
        )
        LEFT JOIN public.wtf_users ON (
            (
                tt.profile_screen_name = wtf_users.twitter_username
            )
        )
    )
WHERE (
        tt.id = (
            SELECT latest_stats.max_id
            FROM latest_stats
            WHERE (latest_stats.tweet_id = tt.tweet_id)
        )
    )
ORDER BY tes.total_engagement DESC;
ALTER TABLE public.view_tweet_stats OWNER TO postgres;
--
-- Name: webhook; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.webhook (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    "nodeId" character varying NOT NULL,
    "webhookEndpoint" character varying NOT NULL,
    "httpMethod" character varying NOT NULL,
    "workflowShortId" character varying NOT NULL,
    "webhookId" character varying,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.webhook OWNER TO postgres;
--
-- Name: webhook_duplicate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.webhook_duplicate (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "nodeId" character varying NOT NULL,
    "webhookEndpoint" character varying,
    "httpMethod" character varying,
    "workflowShortId" character varying,
    "createdDate" timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text),
    "updatedDate" timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text)
);
ALTER TABLE public.webhook_duplicate OWNER TO postgres;
--
-- Name: TABLE webhook_duplicate; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.webhook_duplicate IS 'This is a duplicate of webhook';
--
-- Name: workflows; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workflows (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    name text,
    nodes jsonb [],
    edges jsonb [],
    table_name text,
    short_id text,
    execution_count bigint DEFAULT '0'::bigint,
    type text,
    cron_id text
);
ALTER TABLE public.workflows OWNER TO postgres;
--
-- Name: mud_worlds; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mud_worlds (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    chain_id text,
    address text,
    name text,
    abi jsonb[]
);
ALTER TABLE public.mud_worlds OWNER TO postgres;
--
-- Name: wtf_dating_multiplier; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wtf_dating_multiplier (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    "Location" text,
    "Gift" text,
    "Multiplier" bigint
);
ALTER TABLE public.wtf_dating_multiplier OWNER TO postgres;
--
-- Name: wtf_dating_multiplier_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.wtf_dating_multiplier
ALTER COLUMN id
ADD GENERATED BY DEFAULT AS IDENTITY (
        SEQUENCE NAME public.wtf_dating_multiplier_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1
    );
--
-- Name: wtf_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wtf_items (
    id bigint NOT NULL,
    name text NOT NULL,
    options text,
    type text DEFAULT 'weapon'::text
);
ALTER TABLE public.wtf_items OWNER TO postgres;
--
-- Name: wtf_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.wtf_items
ALTER COLUMN id
ADD GENERATED BY DEFAULT AS IDENTITY (
        SEQUENCE NAME public.wtf_items_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1
    );
--
-- Name: wtf_match_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wtf_match_history (
    id integer NOT NULL,
    played_at timestamp without time zone DEFAULT now(),
    player_1_kills bigint,
    player_1_deaths bigint,
    player_2_kills bigint,
    player_2_deaths bigint,
    winner text,
    team_1_deaths integer,
    team_1_kills integer,
    team_2_deaths integer,
    team_2_kills integer
);
ALTER TABLE public.wtf_match_history OWNER TO postgres;
--
-- Name: wtf_match_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.wtf_match_history_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE public.wtf_match_history_id_seq OWNER TO postgres;
--
-- Name: wtf_match_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.wtf_match_history_id_seq OWNED BY public.wtf_match_history.id;
--
-- Name: wtf_mini_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wtf_mini_items (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    name text,
    image text
);
ALTER TABLE public.wtf_mini_items OWNER TO postgres;
--
-- Name: wtf_mini_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.wtf_mini_items
ALTER COLUMN id
ADD GENERATED BY DEFAULT AS IDENTITY (
        SEQUENCE NAME public.wtf_mini_items_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1
    );
--
-- Name: wtf_mints; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wtf_mints (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    wallet_address text,
    transaction text,
    contract_address text
);
ALTER TABLE public.wtf_mints OWNER TO postgres;
--
-- Name: wtf_mints_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.wtf_mints
ALTER COLUMN id
ADD GENERATED BY DEFAULT AS IDENTITY (
        SEQUENCE NAME public.wtf_mints_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1
    );
--
-- Name: wtf_player_customizations_weapon; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wtf_player_customizations_weapon (
    id integer NOT NULL,
    weapons text,
    stock text,
    skin text,
    handguard text,
    sight text,
    charm text,
    barrel text,
    suppressor text
);
ALTER TABLE public.wtf_player_customizations_weapon OWNER TO postgres;
--
-- Name: wtf_player_customizations_weapon_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.wtf_player_customizations_weapon_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE public.wtf_player_customizations_weapon_id_seq OWNER TO postgres;
--
-- Name: wtf_player_customizations_weapon_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.wtf_player_customizations_weapon_id_seq OWNED BY public.wtf_player_customizations_weapon.id;
--
-- Name: wtf_player_inventory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wtf_player_inventory (
    inventory_id bigint NOT NULL,
    name text,
    player text,
    upgrades text
);
ALTER TABLE public.wtf_player_inventory OWNER TO postgres;
--
-- Name: wtf_player_items_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.wtf_player_inventory
ALTER COLUMN inventory_id
ADD GENERATED BY DEFAULT AS IDENTITY (
        SEQUENCE NAME public.wtf_player_items_item_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1
    );
--
-- Name: wtf_player_stats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wtf_player_stats (
    id integer NOT NULL,
    player text NOT NULL,
    xp integer,
    total_match_losses integer,
    total_kills integer,
    total_round_wins integer,
    total_round_losses integer,
    total_deaths integer,
    total_match_wins integer,
    level integer,
    total_assists integer
);
ALTER TABLE public.wtf_player_stats OWNER TO postgres;
--
-- Name: wtf_player_stats_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.wtf_player_stats_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE public.wtf_player_stats_id_seq OWNER TO postgres;
--
-- Name: wtf_player_stats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.wtf_player_stats_id_seq OWNED BY public.wtf_player_stats.id;
--
-- Name: wtf_players; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wtf_players (
    player text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.wtf_players OWNER TO postgres;
--
-- Name: wtf_players_eth_denver; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wtf_players_eth_denver (
    id integer NOT NULL,
    username text,
    wallet text,
    created_at timestamp without time zone DEFAULT now()
);
ALTER TABLE public.wtf_players_eth_denver OWNER TO postgres;
--
-- Name: wtf_players_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.wtf_players_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE public.wtf_players_id_seq OWNER TO postgres;
--
-- Name: wtf_players_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.wtf_players_id_seq OWNED BY public.wtf_players_eth_denver.id;
--
-- Name: wtf_portal; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wtf_portal (
    id integer NOT NULL,
    wallet_address text,
    created_at date
);
ALTER TABLE public.wtf_portal OWNER TO postgres;
--
-- Name: wtf_portal_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.wtf_portal_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE public.wtf_portal_id_seq OWNER TO postgres;
--
-- Name: wtf_portal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.wtf_portal_id_seq OWNED BY public.wtf_portal.id;
--
-- Name: wtf_subscribers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wtf_subscribers (
    email text NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);
ALTER TABLE public.wtf_subscribers OWNER TO postgres;
--
-- Name: wtf_test; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wtf_test (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    email text
);
ALTER TABLE public.wtf_test OWNER TO postgres;
--
-- Name: wtf_test_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.wtf_test
ALTER COLUMN id
ADD GENERATED BY DEFAULT AS IDENTITY (
        SEQUENCE NAME public.wtf_test_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1
    );
--
-- Name: wtf_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wtf_transactions (
    id integer NOT NULL,
    type text,
    date timestamp with time zone DEFAULT now()
);
ALTER TABLE public.wtf_transactions OWNER TO postgres;
--
-- Name: wtf_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.wtf_transactions_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE public.wtf_transactions_id_seq OWNER TO postgres;
--
-- Name: wtf_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.wtf_transactions_id_seq OWNED BY public.wtf_transactions.id;
--
-- Name: wtf_tx; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wtf_tx (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    transactionhash text,
    from_address text,
    to_address text,
    amount text,
    chain_id text,
    contract_address text
);
ALTER TABLE public.wtf_tx OWNER TO postgres;
--
-- Name: wtf_tx_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.wtf_tx
ALTER COLUMN id
ADD GENERATED BY DEFAULT AS IDENTITY (
        SEQUENCE NAME public.wtf_tx_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1
    );
--
-- Name: wtf_user_inventory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wtf_user_inventory (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid DEFAULT gen_random_uuid(),
    item_id bigint,
    quantity bigint DEFAULT '1'::bigint,
    item_name text,
    status boolean DEFAULT true,
    image text
);
ALTER TABLE public.wtf_user_inventory OWNER TO postgres;
--
-- Name: wtf_users_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.wtf_user_inventory
ALTER COLUMN id
ADD GENERATED BY DEFAULT AS IDENTITY (
        SEQUENCE NAME public.wtf_users_item_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1
    );
--
-- Name: wtf_users_test; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wtf_users_test (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    email text
);
ALTER TABLE public.wtf_users_test OWNER TO postgres;
--
-- Name: wtf_users_test_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.wtf_users_test
ALTER COLUMN id
ADD GENERATED BY DEFAULT AS IDENTITY (
        SEQUENCE NAME public.wtf_users_test_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1
    );
--
-- Name: kristof_test id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kristof_test
ALTER COLUMN id
SET DEFAULT nextval('public.kristof_test_id_seq'::regclass);
--
-- Name: matches id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matches
ALTER COLUMN id
SET DEFAULT nextval('public.matches_id_seq'::regclass);
--
-- Name: monster_game_resources id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monster_game_resources
ALTER COLUMN id
SET DEFAULT nextval('public.monster_game_resources_id_seq'::regclass);
--
-- Name: monster_game_variables id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monster_game_variables
ALTER COLUMN id
SET DEFAULT nextval('public.monster_game_variables_id_seq'::regclass);
--
-- Name: monster_match_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monster_match_history
ALTER COLUMN id
SET DEFAULT nextval('public.monster_match_history_id_seq'::regclass);
--
-- Name: monster_player_inventory id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monster_player_inventory
ALTER COLUMN id
SET DEFAULT nextval(
        'public.monster_player_inventory_id_seq'::regclass
    );
--
-- Name: monster_player_match_performance id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monster_player_match_performance
ALTER COLUMN id
SET DEFAULT nextval(
        'public.monster_player_match_performance_id_seq'::regclass
    );
--
-- Name: monster_players id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monster_players
ALTER COLUMN id
SET DEFAULT nextval('public.monster_players_id_seq'::regclass);
--
-- Name: player_portal id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_portal
ALTER COLUMN id
SET DEFAULT nextval('public.player_portal_id_seq'::regclass);
--
-- Name: run_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.run_history
ALTER COLUMN id
SET DEFAULT nextval('public.run_history_id_seq'::regclass);
--
-- Name: run_variables id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.run_variables
ALTER COLUMN id
SET DEFAULT nextval('public.run_variables_id_seq'::regclass);
--
-- Name: test12345 id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test12345
ALTER COLUMN id
SET DEFAULT nextval('public.test123_id_seq'::regclass);
--
-- Name: wtf_match_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_match_history
ALTER COLUMN id
SET DEFAULT nextval('public.wtf_match_history_id_seq'::regclass);
--
-- Name: wtf_player_customizations_weapon id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_player_customizations_weapon
ALTER COLUMN id
SET DEFAULT nextval(
        'public.wtf_player_customizations_weapon_id_seq'::regclass
    );
--
-- Name: wtf_player_stats id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_player_stats
ALTER COLUMN id
SET DEFAULT nextval('public.wtf_player_stats_id_seq'::regclass);
--
-- Name: wtf_players_eth_denver id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_players_eth_denver
ALTER COLUMN id
SET DEFAULT nextval('public.wtf_players_id_seq'::regclass);
--
-- Name: wtf_portal id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_portal
ALTER COLUMN id
SET DEFAULT nextval('public.wtf_portal_id_seq'::regclass);
--
-- Name: wtf_transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_transactions
ALTER COLUMN id
SET DEFAULT nextval('public.wtf_transactions_id_seq'::regclass);
--
-- Name: contract PK_17c3a89f58a2997276084e706e8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contract
ADD CONSTRAINT "PK_17c3a89f58a2997276084e706e8" PRIMARY KEY (id);
--
-- Name: credential PK_3a5169bcd3d5463cefeec78be82; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credential
ADD CONSTRAINT "PK_3a5169bcd3d5463cefeec78be82" PRIMARY KEY (id);
--
-- Name: webhook PK_9e1d7557a6a1935b3aabf9cd246; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.webhook
ADD CONSTRAINT "PK_9e1d7557a6a1935b3aabf9cd246" PRIMARY KEY (id, "webhookEndpoint", "httpMethod");
--
-- Name: execution PK_cc6684fedf29ec4c86db8448a2b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.execution
ADD CONSTRAINT "PK_cc6684fedf29ec4c86db8448a2b" PRIMARY KEY (id);
--
-- Name: alpha_keys alpha_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alpha_keys
ADD CONSTRAINT alpha_keys_pkey PRIMARY KEY (alpha_key);
--
-- Name: auction_listings auction_listings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auction_listings
ADD CONSTRAINT auction_listings_pkey PRIMARY KEY (id);
--
-- Name: contract_duplicate contract_duplicate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contract_duplicate
ADD CONSTRAINT contract_duplicate_pkey PRIMARY KEY (id);
--
-- Name: credential_duplicate credential_duplicate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credential_duplicate
ADD CONSTRAINT credential_duplicate_pkey PRIMARY KEY (id);
--
-- Name: cron_logs cron_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cron_logs
ADD CONSTRAINT cron_logs_pkey PRIMARY KEY (id);
--
-- Name: dashboard_users dashboard_users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dashboard_users
ADD CONSTRAINT dashboard_users_email_key UNIQUE (email);
--
-- Name: direct_listings direct_listings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.direct_listings
ADD CONSTRAINT direct_listings_pkey PRIMARY KEY (id);
--
-- Name: execution_duplicate execution_duplicate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.execution_duplicate
ADD CONSTRAINT execution_duplicate_pkey PRIMARY KEY (id);
--
-- Name: game_variables game_variables_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_variables
ADD CONSTRAINT game_variables_pkey PRIMARY KEY (id);
--
-- Name: kristof_test kristof_test_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kristof_test
ADD CONSTRAINT kristof_test_pkey PRIMARY KEY (id);
--
-- Name: match_history match_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match_history
ADD CONSTRAINT match_history_pkey PRIMARY KEY (id);
--
-- Name: matches matches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matches
ADD CONSTRAINT matches_pkey PRIMARY KEY (id);
--
-- Name: monster_game_resources monster_game_resources_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monster_game_resources
ADD CONSTRAINT monster_game_resources_pkey PRIMARY KEY (id);
--
-- Name: monster_game_variables monster_game_variables_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monster_game_variables
ADD CONSTRAINT monster_game_variables_pkey PRIMARY KEY (id);
--
-- Name: monster_match_history monster_match_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monster_match_history
ADD CONSTRAINT monster_match_history_pkey PRIMARY KEY (id);
--
-- Name: monster_player_inventory monster_player_inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monster_player_inventory
ADD CONSTRAINT monster_player_inventory_pkey PRIMARY KEY (id);
--
-- Name: monster_player_match_performance monster_player_match_performance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monster_player_match_performance
ADD CONSTRAINT monster_player_match_performance_pkey PRIMARY KEY (id);
--
-- Name: monster_players monster_players_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monster_players
ADD CONSTRAINT monster_players_pkey PRIMARY KEY (id);
--
-- Name: oz_test_table oz_test_table_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.oz_test_table
ADD CONSTRAINT oz_test_table_pkey PRIMARY KEY (id);
--
-- Name: player_inventory player_inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_inventory
ADD CONSTRAINT player_inventory_pkey PRIMARY KEY (id);
--
-- Name: player_match_performance player_match_performance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_match_performance
ADD CONSTRAINT player_match_performance_pkey PRIMARY KEY (id);
--
-- Name: player_portal player_portal_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_portal
ADD CONSTRAINT player_portal_pkey PRIMARY KEY (id);
--
-- Name: players players_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.players
ADD CONSTRAINT players_pkey PRIMARY KEY (id);
--
-- Name: resources resources_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resources
ADD CONSTRAINT resources_pkey PRIMARY KEY (id);
--
-- Name: run_history run_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.run_history
ADD CONSTRAINT run_history_pkey PRIMARY KEY (id);
--
-- Name: run_variables run_variables_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.run_variables
ADD CONSTRAINT run_variables_pkey PRIMARY KEY (id);
--
-- Name: test12345 test123_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.test12345
ADD CONSTRAINT test123_pkey PRIMARY KEY (id);
--
-- Name: twitter_engagement_score twitter_engagement_score_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.twitter_engagement_score
ADD CONSTRAINT twitter_engagement_score_pkey PRIMARY KEY (id);
--
-- Name: twitter_followers twitter_followers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.twitter_followers
ADD CONSTRAINT twitter_followers_pkey PRIMARY KEY (id);
--
-- Name: twitter_mentions twitter_mentions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.twitter_mentions
ADD CONSTRAINT twitter_mentions_pkey PRIMARY KEY (id);
--
-- Name: twitter_tweets twitter_tweets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.twitter_tweets
ADD CONSTRAINT twitter_tweets_pkey PRIMARY KEY (id);
--
-- Name: twitter_engagement_score unique_profile_screen_name; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.twitter_engagement_score
ADD CONSTRAINT unique_profile_screen_name UNIQUE (profile_screen_name);
--
-- Name: twitter_followers unique_user_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.twitter_followers
ADD CONSTRAINT unique_user_id UNIQUE (user_id);
--
-- Name: dashboard_users users_password_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dashboard_users
ADD CONSTRAINT users_password_key UNIQUE (password);
--
-- Name: dashboard_users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dashboard_users
ADD CONSTRAINT users_pkey PRIMARY KEY (id);
--
-- Name: webhook_duplicate webhook_duplicate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.webhook_duplicate
ADD CONSTRAINT webhook_duplicate_pkey PRIMARY KEY (id);
--
-- Name: workflows workflows_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflows
ADD CONSTRAINT workflows_pkey PRIMARY KEY (id);
--
-- Name: mud_worlds mud_worlds_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mud_worlds
ADD CONSTRAINT mud_worlds_pkey PRIMARY KEY (id);
--
-- Name: wtf_dating_multiplier wtf_dating_multiplier_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_dating_multiplier
ADD CONSTRAINT wtf_dating_multiplier_pkey PRIMARY KEY (id);
--
-- Name: wtf_items wtf_items_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_items
ADD CONSTRAINT wtf_items_name_key UNIQUE (name);
--
-- Name: wtf_items wtf_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_items
ADD CONSTRAINT wtf_items_pkey PRIMARY KEY (id);
--
-- Name: wtf_match_history wtf_match_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_match_history
ADD CONSTRAINT wtf_match_history_pkey PRIMARY KEY (id);
--
-- Name: wtf_mini_items wtf_mini_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_mini_items
ADD CONSTRAINT wtf_mini_items_pkey PRIMARY KEY (id);
--
-- Name: wtf_mints wtf_mints_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_mints
ADD CONSTRAINT wtf_mints_pkey PRIMARY KEY (id);
--
-- Name: wtf_player_customizations_weapon wtf_player_customizations_weapon_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_player_customizations_weapon
ADD CONSTRAINT wtf_player_customizations_weapon_pkey PRIMARY KEY (id);
--
-- Name: wtf_player_inventory wtf_player_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_player_inventory
ADD CONSTRAINT wtf_player_items_pkey PRIMARY KEY (inventory_id);
--
-- Name: wtf_player_stats wtf_player_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_player_stats
ADD CONSTRAINT wtf_player_stats_pkey PRIMARY KEY (id);
--
-- Name: wtf_player_stats wtf_player_stats_player_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_player_stats
ADD CONSTRAINT wtf_player_stats_player_key UNIQUE (player);
--
-- Name: wtf_players_eth_denver wtf_players_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_players_eth_denver
ADD CONSTRAINT wtf_players_pkey PRIMARY KEY (id);
--
-- Name: wtf_players wtf_players_pkey1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_players
ADD CONSTRAINT wtf_players_pkey1 PRIMARY KEY (player);
--
-- Name: wtf_portal wtf_portal_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_portal
ADD CONSTRAINT wtf_portal_pkey PRIMARY KEY (id);
--
-- Name: wtf_subscribers wtf_subscribers_Email Address_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_subscribers
ADD CONSTRAINT "wtf_subscribers_Email Address_key" UNIQUE (id);
--
-- Name: wtf_subscribers wtf_subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_subscribers
ADD CONSTRAINT wtf_subscribers_pkey PRIMARY KEY (id);
--
-- Name: wtf_test wtf_test_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_test
ADD CONSTRAINT wtf_test_pkey PRIMARY KEY (id);
--
-- Name: wtf_transactions wtf_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_transactions
ADD CONSTRAINT wtf_transactions_pkey PRIMARY KEY (id);
--
-- Name: wtf_tx wtf_tx_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_tx
ADD CONSTRAINT wtf_tx_pkey PRIMARY KEY (id);
--
-- Name: wtf_users wtf_users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_users
ADD CONSTRAINT wtf_users_email_key UNIQUE (email);
--
-- Name: wtf_user_inventory wtf_users_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_user_inventory
ADD CONSTRAINT wtf_users_item_pkey PRIMARY KEY (id);
--
-- Name: wtf_users wtf_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_users
ADD CONSTRAINT wtf_users_pkey PRIMARY KEY (id);
--
-- Name: wtf_users_test wtf_users_test_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_users_test
ADD CONSTRAINT wtf_users_test_pkey PRIMARY KEY (id);
--
-- Name: IDX_51d76da512f3ec30dde240f44c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_51d76da512f3ec30dde240f44c" ON public.webhook USING btree ("webhookEndpoint");
--
-- Name: IDX_9432990165345460ab7315f806; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_9432990165345460ab7315f806" ON public.execution USING btree ("shortId");
--
-- Name: IDX_ccd13410968a7e1a4e132e0e0a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_ccd13410968a7e1a4e132e0e0a" ON public.credential USING btree ("nodeCredentialName");
--
-- Name: IDX_e59c6f999333af0fa6599dc0bd; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_e59c6f999333af0fa6599dc0bd" ON public.webhook USING btree ("httpMethod");
--
-- Name: idx_twitter_mentions_tweet_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_twitter_mentions_tweet_id ON public.twitter_mentions USING btree (tweet_id);
--
-- Name: idx_twitter_tweets_tweet_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_twitter_tweets_tweet_id ON public.twitter_tweets USING btree (tweet_id);
--
-- Name: idx_wtf_users_twitter_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_wtf_users_twitter_username ON public.wtf_users USING btree (twitter_username);
--
-- Name: cron_logs dp01pa3f; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER dp01pa3f
AFTER
INSERT ON public.cron_logs FOR EACH ROW EXECUTE FUNCTION public.notify_event();
--
-- Name: wtf_users omt6a5mx; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER omt6a5mx
AFTER
INSERT ON public.wtf_users FOR EACH ROW EXECUTE FUNCTION public.notify_event();
--
-- Name: twitter_engagement_score update_score_difference_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_score_difference_trigger BEFORE
UPDATE ON public.twitter_engagement_score FOR EACH ROW
    WHEN (
        (
            old.total_engagement_points IS DISTINCT
            FROM new.total_engagement_points
        )
    ) EXECUTE FUNCTION public.update_score_difference();
--
-- Name: alpha_keys alpha_keys_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alpha_keys
ADD CONSTRAINT alpha_keys_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id);
--
-- Name: wtf_player_inventory public_wtf_player_inventory_name_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_player_inventory
ADD CONSTRAINT public_wtf_player_inventory_name_fkey FOREIGN KEY (name) REFERENCES public.wtf_items(name) ON UPDATE CASCADE ON DELETE
SET NULL;
--
-- Name: wtf_player_inventory public_wtf_player_items_player_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_player_inventory
ADD CONSTRAINT public_wtf_player_items_player_fkey FOREIGN KEY (player) REFERENCES public.wtf_players(player);
--
-- Name: wtf_player_stats public_wtf_player_stats_player_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_player_stats
ADD CONSTRAINT public_wtf_player_stats_player_fkey FOREIGN KEY (player) REFERENCES public.wtf_players(player);
--
-- Name: auction_listings; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.auction_listings ENABLE ROW LEVEL SECURITY;
--
-- Name: cron_logs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.cron_logs ENABLE ROW LEVEL SECURITY;
--
-- Name: direct_listings; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.direct_listings ENABLE ROW LEVEL SECURITY;
--
-- Name: game_variables; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.game_variables ENABLE ROW LEVEL SECURITY;
--
-- Name: match_history; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.match_history ENABLE ROW LEVEL SECURITY;
--
-- Name: oz_test_table; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.oz_test_table ENABLE ROW LEVEL SECURITY;
--
-- Name: player_inventory; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.player_inventory ENABLE ROW LEVEL SECURITY;
--
-- Name: player_match_performance; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.player_match_performance ENABLE ROW LEVEL SECURITY;
--
-- Name: resources; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
--
-- Name: workflows; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
--
-- Name: mud_worlds; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.mud_worlds ENABLE ROW LEVEL SECURITY;
--
-- Name: wtf_dating_multiplier; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.wtf_dating_multiplier ENABLE ROW LEVEL SECURITY;
--
-- Name: wtf_mini_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.wtf_mini_items ENABLE ROW LEVEL SECURITY;
--
-- Name: wtf_subscribers; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.wtf_subscribers ENABLE ROW LEVEL SECURITY;
--
-- Name: wtf_test; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.wtf_test ENABLE ROW LEVEL SECURITY;
--
-- Name: wtf_tx; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.wtf_tx ENABLE ROW LEVEL SECURITY;
--
-- Name: wtf_user_inventory; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.wtf_user_inventory ENABLE ROW LEVEL SECURITY;
--
-- Name: wtf_users_test; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.wtf_users_test ENABLE ROW LEVEL SECURITY;
--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
GRANT ALL ON SEQUENCES TO postgres;
--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
GRANT ALL ON SEQUENCES TO postgres;
--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
GRANT ALL ON FUNCTIONS TO postgres;
--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
GRANT ALL ON FUNCTIONS TO postgres;
--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
GRANT ALL ON TABLES TO postgres;
--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
GRANT ALL ON TABLES TO postgres;

--
-- Data for Name: workflows; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workflows (id, created_at, name, nodes, edges, table_name, short_id, execution_count, type, cron_id) FROM stdin;
f9a80fa9-1840-4b6f-b028-cdc00bcc3b34	2024-06-05 16:12:50.834041+00	Wtf Mini Game New User Flow	{"{\\"id\\": \\"1\\", \\"data\\": {\\"table\\": \\"wtf_users\\", \\"method\\": \\"insert\\", \\"tables\\": [{\\"table_name\\": \\"alpha_keys\\"}, {\\"table_name\\": \\"auction_listings\\"}, {\\"table_name\\": \\"contract\\"}, {\\"table_name\\": \\"contract_duplicate\\"}, {\\"table_name\\": \\"credential\\"}, {\\"table_name\\": \\"credential_duplicate\\"}, {\\"table_name\\": \\"cron_logs\\"}, {\\"table_name\\": \\"dashboard_users\\"}, {\\"table_name\\": \\"direct_listings\\"}, {\\"table_name\\": \\"execution\\"}, {\\"table_name\\": \\"execution_duplicate\\"}, {\\"table_name\\": \\"game_variables\\"}, {\\"table_name\\": \\"kristof_test\\"}, {\\"table_name\\": \\"match_history\\"}, {\\"table_name\\": \\"matches\\"}, {\\"table_name\\": \\"monster_game_resources\\"}, {\\"table_name\\": \\"monster_game_variables\\"}, {\\"table_name\\": \\"monster_match_history\\"}, {\\"table_name\\": \\"monster_player_inventory\\"}, {\\"table_name\\": \\"monster_player_match_performance\\"}, {\\"table_name\\": \\"monster_players\\"}, {\\"table_name\\": \\"oz_test_table\\"}, {\\"table_name\\": \\"player_inventory\\"}, {\\"table_name\\": \\"player_match_performance\\"}, {\\"table_name\\": \\"player_portal\\"}, {\\"table_name\\": \\"players\\"}, {\\"table_name\\": \\"resources\\"}, {\\"table_name\\": \\"run_history\\"}, {\\"table_name\\": \\"run_variables\\"}, {\\"table_name\\": \\"test12345\\"}, {\\"table_name\\": \\"twitter_engagement_score\\"}, {\\"table_name\\": \\"twitter_followers\\"}, {\\"table_name\\": \\"twitter_mentions\\"}, {\\"table_name\\": \\"twitter_tweets\\"}, {\\"table_name\\": \\"view_engagement_leaderboard\\"}, {\\"table_name\\": \\"view_mention_stats\\"}, {\\"table_name\\": \\"view_tweet_stats\\"}, {\\"table_name\\": \\"webhook\\"}, {\\"table_name\\": \\"webhook_duplicate\\"}, {\\"table_name\\": \\"workflows\\"}, {\\"table_name\\": \\"wtf_dating_multiplier\\"}, {\\"table_name\\": \\"wtf_items\\"}, {\\"table_name\\": \\"wtf_match_history\\"}, {\\"table_name\\": \\"wtf_mini_items\\"}, {\\"table_name\\": \\"wtf_mints\\"}, {\\"table_name\\": \\"wtf_player_customizations_weapon\\"}, {\\"table_name\\": \\"wtf_player_inventory\\"}, {\\"table_name\\": \\"wtf_player_stats\\"}, {\\"table_name\\": \\"wtf_players\\"}, {\\"table_name\\": \\"wtf_players_eth_denver\\"}, {\\"table_name\\": \\"wtf_portal\\"}, {\\"table_name\\": \\"wtf_subscribers\\"}, {\\"table_name\\": \\"wtf_test\\"}, {\\"table_name\\": \\"wtf_transactions\\"}, {\\"table_name\\": \\"wtf_tx\\"}, {\\"table_name\\": \\"wtf_user_inventory\\"}, {\\"table_name\\": \\"wtf_users\\"}, {\\"table_name\\": \\"wtf_users_test\\"}]}, \\"type\\": \\"triggerNode\\", \\"width\\": 320, \\"height\\": 242, \\"dragging\\": false, \\"position\\": {\\"x\\": 1667.5763547084853, \\"y\\": 577.5922877732776}, \\"selected\\": false, \\"positionAbsolute\\": {\\"x\\": 1667.5763547084853, \\"y\\": 577.5922877732776}}","{\\"id\\": \\"101\\", \\"data\\": {\\"userId\\": \\".id\\"}, \\"type\\": \\"walletNode\\", \\"width\\": 320, \\"height\\": 110, \\"dragging\\": false, \\"position\\": {\\"x\\": 2119.2326151214506, \\"y\\": 633.9557518016178}, \\"selected\\": false, \\"positionAbsolute\\": {\\"x\\": 2119.2326151214506, \\"y\\": 633.9557518016178}}","{\\"id\\": \\"3\\", \\"data\\": {\\"label\\": \\"Update\\", \\"fields\\": [{\\"id\\": 0.11779276091718427, \\"label\\": \\"provisioned_wallet\\", \\"value\\": \\".address\\"}], \\"filters\\": {\\"key\\": \\"id\\", \\"value\\": \\".id\\", \\"condition\\": \\"=\\"}, \\"tableName\\": \\"wtf_users\\"}, \\"type\\": \\"tableNode\\", \\"width\\": 320, \\"height\\": 303, \\"dragging\\": false, \\"position\\": {\\"x\\": 2663.940586295565, \\"y\\": 375.2194654939135}, \\"selected\\": false, \\"positionAbsolute\\": {\\"x\\": 2663.940586295565, \\"y\\": 375.2194654939135}}","{\\"id\\": \\"103\\", \\"data\\": {\\"userId\\": \\"\\", \\"wallet\\": \\".address\\"}, \\"type\\": \\"transferPackNode\\", \\"width\\": 320, \\"height\\": 110, \\"dragging\\": false, \\"position\\": {\\"x\\": 2658.1044294615567, \\"y\\": 684.5357776963571}, \\"selected\\": false, \\"positionAbsolute\\": {\\"x\\": 2658.1044294615567, \\"y\\": 684.5357776963571}}","{\\"id\\": \\"104\\", \\"data\\": {\\"userId\\": \\"\\", \\"wallet\\": \\".address\\"}, \\"type\\": \\"topOffEthNode\\", \\"width\\": 320, \\"height\\": 110, \\"dragging\\": false, \\"position\\": {\\"x\\": 2656.1590438502208, \\"y\\": 801.2589143765243}, \\"selected\\": false, \\"positionAbsolute\\": {\\"x\\": 2656.1590438502208, \\"y\\": 801.2589143765243}}"}	{"{\\"id\\": \\"reactflow__edge-1b-101\\", \\"source\\": \\"1\\", \\"target\\": \\"101\\", \\"sourceHandle\\": \\"b\\", \\"targetHandle\\": null}","{\\"id\\": \\"reactflow__edge-101b-3\\", \\"source\\": \\"101\\", \\"target\\": \\"3\\", \\"sourceHandle\\": \\"b\\", \\"targetHandle\\": null}","{\\"id\\": \\"reactflow__edge-101b-103\\", \\"source\\": \\"101\\", \\"target\\": \\"103\\", \\"sourceHandle\\": \\"b\\", \\"targetHandle\\": null}","{\\"id\\": \\"reactflow__edge-101b-104\\", \\"source\\": \\"101\\", \\"target\\": \\"104\\", \\"sourceHandle\\": \\"b\\", \\"targetHandle\\": null}"}	wtf_users	omt6a5mx	30	trigger	\N
833d9c52-cfee-4c99-8535-5c6b7d627551	2024-05-23 09:55:23.788124+00	Trigger: Batch mint	{"{\\"id\\": \\"1\\", \\"data\\": {\\"table\\": \\"cron_logs\\", \\"method\\": \\"insert\\", \\"tables\\": [{\\"table_name\\": \\"alpha_keys\\"}, {\\"table_name\\": \\"auction_listings\\"}, {\\"table_name\\": \\"contract\\"}, {\\"table_name\\": \\"contract_duplicate\\"}, {\\"table_name\\": \\"credential\\"}, {\\"table_name\\": \\"credential_duplicate\\"}, {\\"table_name\\": \\"cron_logs\\"}, {\\"table_name\\": \\"dashboard_users\\"}, {\\"table_name\\": \\"direct_listings\\"}, {\\"table_name\\": \\"execution\\"}, {\\"table_name\\": \\"execution_duplicate\\"}, {\\"table_name\\": \\"game_variables\\"}, {\\"table_name\\": \\"kristof_test\\"}, {\\"table_name\\": \\"match_history\\"}, {\\"table_name\\": \\"matches\\"}, {\\"table_name\\": \\"monster_game_resources\\"}, {\\"table_name\\": \\"monster_game_variables\\"}, {\\"table_name\\": \\"monster_match_history\\"}, {\\"table_name\\": \\"monster_player_inventory\\"}, {\\"table_name\\": \\"monster_player_match_performance\\"}, {\\"table_name\\": \\"monster_players\\"}, {\\"table_name\\": \\"oz_test_table\\"}, {\\"table_name\\": \\"player_inventory\\"}, {\\"table_name\\": \\"player_match_performance\\"}, {\\"table_name\\": \\"player_portal\\"}, {\\"table_name\\": \\"players\\"}, {\\"table_name\\": \\"resources\\"}, {\\"table_name\\": \\"run_history\\"}, {\\"table_name\\": \\"run_variables\\"}, {\\"table_name\\": \\"test12345\\"}, {\\"table_name\\": \\"twitter_engagement_score\\"}, {\\"table_name\\": \\"twitter_followers\\"}, {\\"table_name\\": \\"twitter_mentions\\"}, {\\"table_name\\": \\"twitter_tweets\\"}, {\\"table_name\\": \\"view_engagement_leaderboard\\"}, {\\"table_name\\": \\"view_mention_stats\\"}, {\\"table_name\\": \\"view_tweet_stats\\"}, {\\"table_name\\": \\"webhook\\"}, {\\"table_name\\": \\"webhook_duplicate\\"}, {\\"table_name\\": \\"workflows\\"}, {\\"table_name\\": \\"wtf_items\\"}, {\\"table_name\\": \\"wtf_match_history\\"}, {\\"table_name\\": \\"wtf_mints\\"}, {\\"table_name\\": \\"wtf_player_customizations_weapon\\"}, {\\"table_name\\": \\"wtf_player_inventory\\"}, {\\"table_name\\": \\"wtf_player_stats\\"}, {\\"table_name\\": \\"wtf_players\\"}, {\\"table_name\\": \\"wtf_players_eth_denver\\"}, {\\"table_name\\": \\"wtf_portal\\"}, {\\"table_name\\": \\"wtf_subscribers\\"}, {\\"table_name\\": \\"wtf_test\\"}, {\\"table_name\\": \\"wtf_transactions\\"}, {\\"table_name\\": \\"wtf_tx\\"}, {\\"table_name\\": \\"wtf_users\\"}, {\\"table_name\\": \\"wtf_users_test\\"}]}, \\"type\\": \\"triggerNode\\", \\"width\\": 320, \\"height\\": 242, \\"dragging\\": false, \\"position\\": {\\"x\\": 1265.8238546179493, \\"y\\": 775.8224737929534}, \\"selected\\": false, \\"positionAbsolute\\": {\\"x\\": 1265.8238546179493, \\"y\\": 775.8224737929534}}","{\\"id\\": \\"101\\", \\"data\\": {\\"table\\": \\"twitter_engagement_score\\", \\"tables\\": [{\\"table_name\\": \\"alpha_keys\\"}, {\\"table_name\\": \\"auction_listings\\"}, {\\"table_name\\": \\"contract\\"}, {\\"table_name\\": \\"contract_duplicate\\"}, {\\"table_name\\": \\"credential\\"}, {\\"table_name\\": \\"credential_duplicate\\"}, {\\"table_name\\": \\"cron_logs\\"}, {\\"table_name\\": \\"dashboard_users\\"}, {\\"table_name\\": \\"direct_listings\\"}, {\\"table_name\\": \\"execution\\"}, {\\"table_name\\": \\"execution_duplicate\\"}, {\\"table_name\\": \\"game_variables\\"}, {\\"table_name\\": \\"kristof_test\\"}, {\\"table_name\\": \\"match_history\\"}, {\\"table_name\\": \\"matches\\"}, {\\"table_name\\": \\"monster_game_resources\\"}, {\\"table_name\\": \\"monster_game_variables\\"}, {\\"table_name\\": \\"monster_match_history\\"}, {\\"table_name\\": \\"monster_player_inventory\\"}, {\\"table_name\\": \\"monster_player_match_performance\\"}, {\\"table_name\\": \\"monster_players\\"}, {\\"table_name\\": \\"oz_test_table\\"}, {\\"table_name\\": \\"player_inventory\\"}, {\\"table_name\\": \\"player_match_performance\\"}, {\\"table_name\\": \\"player_portal\\"}, {\\"table_name\\": \\"players\\"}, {\\"table_name\\": \\"resources\\"}, {\\"table_name\\": \\"run_history\\"}, {\\"table_name\\": \\"run_variables\\"}, {\\"table_name\\": \\"test12345\\"}, {\\"table_name\\": \\"twitter_engagement_score\\"}, {\\"table_name\\": \\"twitter_followers\\"}, {\\"table_name\\": \\"twitter_mentions\\"}, {\\"table_name\\": \\"twitter_tweets\\"}, {\\"table_name\\": \\"view_engagement_leaderboard\\"}, {\\"table_name\\": \\"view_mention_stats\\"}, {\\"table_name\\": \\"view_tweet_stats\\"}, {\\"table_name\\": \\"webhook\\"}, {\\"table_name\\": \\"webhook_duplicate\\"}, {\\"table_name\\": \\"workflows\\"}, {\\"table_name\\": \\"wtf_items\\"}, {\\"table_name\\": \\"wtf_match_history\\"}, {\\"table_name\\": \\"wtf_mints\\"}, {\\"table_name\\": \\"wtf_player_customizations_weapon\\"}, {\\"table_name\\": \\"wtf_player_inventory\\"}, {\\"table_name\\": \\"wtf_player_stats\\"}, {\\"table_name\\": \\"wtf_players\\"}, {\\"table_name\\": \\"wtf_players_eth_denver\\"}, {\\"table_name\\": \\"wtf_portal\\"}, {\\"table_name\\": \\"wtf_subscribers\\"}, {\\"table_name\\": \\"wtf_test\\"}, {\\"table_name\\": \\"wtf_transactions\\"}, {\\"table_name\\": \\"wtf_tx\\"}, {\\"table_name\\": \\"wtf_users\\"}, {\\"table_name\\": \\"wtf_users_test\\"}], \\"transaction\\": {\\"amount\\": \\".score_difference\\", \\"minter\\": \\"0x08eEB885AfF95a31971ae323FB554ed397E5a63B\\", \\"chainId\\": \\"31929\\", \\"toAddress\\": \\".wallet\\", \\"contractAddress\\": \\"0xaEE4355fbC5d9011d3A68A91071D05D96C9dfD2B\\"}}, \\"type\\": \\"batchMintNode\\", \\"width\\": 320, \\"height\\": 418, \\"dragging\\": false, \\"position\\": {\\"x\\": 1612.4588623459476, \\"y\\": 683.4180013774102}, \\"selected\\": true, \\"positionAbsolute\\": {\\"x\\": 1612.4588623459476, \\"y\\": 683.4180013774102}}"}	{"{\\"id\\": \\"reactflow__edge-1b-101\\", \\"source\\": \\"1\\", \\"target\\": \\"101\\", \\"sourceHandle\\": \\"b\\", \\"targetHandle\\": null}"}	\N	ux0auyg8	89	trigger	\N
b1f7e0b3-9858-461e-83ec-b06ae707cec1	2024-05-23 09:04:39.395324+00	Cron: Update twitter engagement score	{"{\\"id\\": \\"100\\", \\"data\\": {\\"function\\": \\"update_engagement_scores_and_log\\", \\"schedule\\": \\"0 */4 * * *\\", \\"functions\\": [{\\"Type\\": \\"trigger\\", \\"Schema\\": \\"public\\", \\"Arguments\\": \\"\\", \\"Return Type\\": \\"trigger\\", \\"Function Name\\": \\"handle_new_user\\"}, {\\"Type\\": \\"trigger\\", \\"Schema\\": \\"public\\", \\"Arguments\\": \\"\\", \\"Return Type\\": \\"trigger\\", \\"Function Name\\": \\"notify_event\\"}, {\\"Type\\": \\"trigger\\", \\"Schema\\": \\"public\\", \\"Arguments\\": \\"\\", \\"Return Type\\": \\"trigger\\", \\"Function Name\\": \\"notify_event_v2\\"}, {\\"Type\\": \\"normal\\", \\"Schema\\": \\"public\\", \\"Arguments\\": \\"\\", \\"Return Type\\": \\"text\\", \\"Function Name\\": \\"update_engagement_scores_and_log\\"}, {\\"Type\\": \\"trigger\\", \\"Schema\\": \\"public\\", \\"Arguments\\": \\"\\", \\"Return Type\\": \\"trigger\\", \\"Function Name\\": \\"update_score_difference\\"}, {\\"Type\\": \\"normal\\", \\"Schema\\": \\"public\\", \\"Arguments\\": \\"\\", \\"Return Type\\": \\"text\\", \\"Function Name\\": \\"update_twitter_engagement_score\\"}]}, \\"type\\": \\"cronNode\\", \\"width\\": 320, \\"height\\": 210, \\"dragging\\": false, \\"position\\": {\\"x\\": 1750.5, \\"y\\": 853}, \\"selected\\": false, \\"positionAbsolute\\": {\\"x\\": 1750.5, \\"y\\": 853}}","{\\"id\\": \\"101\\", \\"data\\": {\\"text\\": \\"Updates twitter engagement score and logs it to cron_logs table every 4 hours.\\"}, \\"type\\": \\"stickyNote\\", \\"width\\": 225, \\"height\\": 122, \\"dragging\\": false, \\"position\\": {\\"x\\": 1918.5, \\"y\\": 697}, \\"selected\\": true, \\"className\\": \\"annotation\\", \\"positionAbsolute\\": {\\"x\\": 1918.5, \\"y\\": 697}}"}	{}	\N	dp01pa3f	9	cron	17
\.

--
-- Data for Name: mud_worlds; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mud_worlds (id, created_at, chain_id, address, name, abi) FROM stdin;
1156dd4a-72a9-46e1-9e77-0c77a88b3f7a	2024-07-20 15:58:54.023011+00	31337	0x8d8b6b8414e1e3dcfd4168561b9be6bd3bf6ec4b	test	{"{\\"name\\": \\"batchCall\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"systemCalls\\", \\"type\\": \\"tuple[]\\", \\"components\\": [{\\"name\\": \\"systemId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"callData\\", \\"type\\": \\"bytes\\", \\"internalType\\": \\"bytes\\"}], \\"internalType\\": \\"struct SystemCallData[]\\"}], \\"outputs\\": [{\\"name\\": \\"returnDatas\\", \\"type\\": \\"bytes[]\\", \\"internalType\\": \\"bytes[]\\"}], \\"stateMutability\\": \\"nonpayable\\"}","{\\"name\\": \\"batchCallFrom\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"systemCalls\\", \\"type\\": \\"tuple[]\\", \\"components\\": [{\\"name\\": \\"from\\", \\"type\\": \\"address\\", \\"internalType\\": \\"address\\"}, {\\"name\\": \\"systemId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"callData\\", \\"type\\": \\"bytes\\", \\"internalType\\": \\"bytes\\"}], \\"internalType\\": \\"struct SystemCallFromData[]\\"}], \\"outputs\\": [{\\"name\\": \\"returnDatas\\", \\"type\\": \\"bytes[]\\", \\"internalType\\": \\"bytes[]\\"}], \\"stateMutability\\": \\"nonpayable\\"}","{\\"name\\": \\"call\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"systemId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"callData\\", \\"type\\": \\"bytes\\", \\"internalType\\": \\"bytes\\"}], \\"outputs\\": [{\\"name\\": \\"\\", \\"type\\": \\"bytes\\", \\"internalType\\": \\"bytes\\"}], \\"stateMutability\\": \\"payable\\"}","{\\"name\\": \\"callFrom\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"delegator\\", \\"type\\": \\"address\\", \\"internalType\\": \\"address\\"}, {\\"name\\": \\"systemId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"callData\\", \\"type\\": \\"bytes\\", \\"internalType\\": \\"bytes\\"}], \\"outputs\\": [{\\"name\\": \\"\\", \\"type\\": \\"bytes\\", \\"internalType\\": \\"bytes\\"}], \\"stateMutability\\": \\"payable\\"}","{\\"name\\": \\"creator\\", \\"type\\": \\"function\\", \\"inputs\\": [], \\"outputs\\": [{\\"name\\": \\"\\", \\"type\\": \\"address\\", \\"internalType\\": \\"address\\"}], \\"stateMutability\\": \\"view\\"}","{\\"name\\": \\"deleteRecord\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"tableId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"keyTuple\\", \\"type\\": \\"bytes32[]\\", \\"internalType\\": \\"bytes32[]\\"}], \\"outputs\\": [], \\"stateMutability\\": \\"nonpayable\\"}","{\\"name\\": \\"getDynamicField\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"tableId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"keyTuple\\", \\"type\\": \\"bytes32[]\\", \\"internalType\\": \\"bytes32[]\\"}, {\\"name\\": \\"dynamicFieldIndex\\", \\"type\\": \\"uint8\\", \\"internalType\\": \\"uint8\\"}], \\"outputs\\": [{\\"name\\": \\"\\", \\"type\\": \\"bytes\\", \\"internalType\\": \\"bytes\\"}], \\"stateMutability\\": \\"view\\"}","{\\"name\\": \\"getDynamicFieldLength\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"tableId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"keyTuple\\", \\"type\\": \\"bytes32[]\\", \\"internalType\\": \\"bytes32[]\\"}, {\\"name\\": \\"dynamicFieldIndex\\", \\"type\\": \\"uint8\\", \\"internalType\\": \\"uint8\\"}], \\"outputs\\": [{\\"name\\": \\"\\", \\"type\\": \\"uint256\\", \\"internalType\\": \\"uint256\\"}], \\"stateMutability\\": \\"view\\"}","{\\"name\\": \\"getDynamicFieldSlice\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"tableId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"keyTuple\\", \\"type\\": \\"bytes32[]\\", \\"internalType\\": \\"bytes32[]\\"}, {\\"name\\": \\"dynamicFieldIndex\\", \\"type\\": \\"uint8\\", \\"internalType\\": \\"uint8\\"}, {\\"name\\": \\"start\\", \\"type\\": \\"uint256\\", \\"internalType\\": \\"uint256\\"}, {\\"name\\": \\"end\\", \\"type\\": \\"uint256\\", \\"internalType\\": \\"uint256\\"}], \\"outputs\\": [{\\"name\\": \\"data\\", \\"type\\": \\"bytes\\", \\"internalType\\": \\"bytes\\"}], \\"stateMutability\\": \\"view\\"}","{\\"name\\": \\"getField\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"tableId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"keyTuple\\", \\"type\\": \\"bytes32[]\\", \\"internalType\\": \\"bytes32[]\\"}, {\\"name\\": \\"fieldIndex\\", \\"type\\": \\"uint8\\", \\"internalType\\": \\"uint8\\"}, {\\"name\\": \\"fieldLayout\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"FieldLayout\\"}], \\"outputs\\": [{\\"name\\": \\"data\\", \\"type\\": \\"bytes\\", \\"internalType\\": \\"bytes\\"}], \\"stateMutability\\": \\"view\\"}","{\\"name\\": \\"getField\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"tableId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"keyTuple\\", \\"type\\": \\"bytes32[]\\", \\"internalType\\": \\"bytes32[]\\"}, {\\"name\\": \\"fieldIndex\\", \\"type\\": \\"uint8\\", \\"internalType\\": \\"uint8\\"}], \\"outputs\\": [{\\"name\\": \\"data\\", \\"type\\": \\"bytes\\", \\"internalType\\": \\"bytes\\"}], \\"stateMutability\\": \\"view\\"}","{\\"name\\": \\"getFieldLayout\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"tableId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}], \\"outputs\\": [{\\"name\\": \\"fieldLayout\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"FieldLayout\\"}], \\"stateMutability\\": \\"view\\"}","{\\"name\\": \\"getFieldLength\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"tableId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"keyTuple\\", \\"type\\": \\"bytes32[]\\", \\"internalType\\": \\"bytes32[]\\"}, {\\"name\\": \\"fieldIndex\\", \\"type\\": \\"uint8\\", \\"internalType\\": \\"uint8\\"}, {\\"name\\": \\"fieldLayout\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"FieldLayout\\"}], \\"outputs\\": [{\\"name\\": \\"\\", \\"type\\": \\"uint256\\", \\"internalType\\": \\"uint256\\"}], \\"stateMutability\\": \\"view\\"}","{\\"name\\": \\"getFieldLength\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"tableId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"keyTuple\\", \\"type\\": \\"bytes32[]\\", \\"internalType\\": \\"bytes32[]\\"}, {\\"name\\": \\"fieldIndex\\", \\"type\\": \\"uint8\\", \\"internalType\\": \\"uint8\\"}], \\"outputs\\": [{\\"name\\": \\"\\", \\"type\\": \\"uint256\\", \\"internalType\\": \\"uint256\\"}], \\"stateMutability\\": \\"view\\"}","{\\"name\\": \\"getKeySchema\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"tableId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}], \\"outputs\\": [{\\"name\\": \\"keySchema\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"Schema\\"}], \\"stateMutability\\": \\"view\\"}","{\\"name\\": \\"getRecord\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"tableId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"keyTuple\\", \\"type\\": \\"bytes32[]\\", \\"internalType\\": \\"bytes32[]\\"}, {\\"name\\": \\"fieldLayout\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"FieldLayout\\"}], \\"outputs\\": [{\\"name\\": \\"staticData\\", \\"type\\": \\"bytes\\", \\"internalType\\": \\"bytes\\"}, {\\"name\\": \\"encodedLengths\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"EncodedLengths\\"}, {\\"name\\": \\"dynamicData\\", \\"type\\": \\"bytes\\", \\"internalType\\": \\"bytes\\"}], \\"stateMutability\\": \\"view\\"}","{\\"name\\": \\"getRecord\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"tableId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"keyTuple\\", \\"type\\": \\"bytes32[]\\", \\"internalType\\": \\"bytes32[]\\"}], \\"outputs\\": [{\\"name\\": \\"staticData\\", \\"type\\": \\"bytes\\", \\"internalType\\": \\"bytes\\"}, {\\"name\\": \\"encodedLengths\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"EncodedLengths\\"}, {\\"name\\": \\"dynamicData\\", \\"type\\": \\"bytes\\", \\"internalType\\": \\"bytes\\"}], \\"stateMutability\\": \\"view\\"}","{\\"name\\": \\"getStaticField\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"tableId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"keyTuple\\", \\"type\\": \\"bytes32[]\\", \\"internalType\\": \\"bytes32[]\\"}, {\\"name\\": \\"fieldIndex\\", \\"type\\": \\"uint8\\", \\"internalType\\": \\"uint8\\"}, {\\"name\\": \\"fieldLayout\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"FieldLayout\\"}], \\"outputs\\": [{\\"name\\": \\"\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"bytes32\\"}], \\"stateMutability\\": \\"view\\"}","{\\"name\\": \\"getValueSchema\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"tableId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}], \\"outputs\\": [{\\"name\\": \\"valueSchema\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"Schema\\"}], \\"stateMutability\\": \\"view\\"}","{\\"name\\": \\"grantAccess\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"resourceId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"grantee\\", \\"type\\": \\"address\\", \\"internalType\\": \\"address\\"}], \\"outputs\\": [], \\"stateMutability\\": \\"nonpayable\\"}","{\\"name\\": \\"increment\\", \\"type\\": \\"function\\", \\"inputs\\": [], \\"outputs\\": [{\\"name\\": \\"\\", \\"type\\": \\"uint32\\", \\"internalType\\": \\"uint32\\"}], \\"stateMutability\\": \\"nonpayable\\"}","{\\"name\\": \\"initialize\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"initModule\\", \\"type\\": \\"address\\", \\"internalType\\": \\"contract IModule\\"}], \\"outputs\\": [], \\"stateMutability\\": \\"nonpayable\\"}","{\\"name\\": \\"installModule\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"module\\", \\"type\\": \\"address\\", \\"internalType\\": \\"contract IModule\\"}, {\\"name\\": \\"encodedArgs\\", \\"type\\": \\"bytes\\", \\"internalType\\": \\"bytes\\"}], \\"outputs\\": [], \\"stateMutability\\": \\"nonpayable\\"}","{\\"name\\": \\"installRootModule\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"module\\", \\"type\\": \\"address\\", \\"internalType\\": \\"contract IModule\\"}, {\\"name\\": \\"encodedArgs\\", \\"type\\": \\"bytes\\", \\"internalType\\": \\"bytes\\"}], \\"outputs\\": [], \\"stateMutability\\": \\"nonpayable\\"}","{\\"name\\": \\"popFromDynamicField\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"tableId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"keyTuple\\", \\"type\\": \\"bytes32[]\\", \\"internalType\\": \\"bytes32[]\\"}, {\\"name\\": \\"dynamicFieldIndex\\", \\"type\\": \\"uint8\\", \\"internalType\\": \\"uint8\\"}, {\\"name\\": \\"byteLengthToPop\\", \\"type\\": \\"uint256\\", \\"internalType\\": \\"uint256\\"}], \\"outputs\\": [], \\"stateMutability\\": \\"nonpayable\\"}","{\\"name\\": \\"pushToDynamicField\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"tableId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"keyTuple\\", \\"type\\": \\"bytes32[]\\", \\"internalType\\": \\"bytes32[]\\"}, {\\"name\\": \\"dynamicFieldIndex\\", \\"type\\": \\"uint8\\", \\"internalType\\": \\"uint8\\"}, {\\"name\\": \\"dataToPush\\", \\"type\\": \\"bytes\\", \\"internalType\\": \\"bytes\\"}], \\"outputs\\": [], \\"stateMutability\\": \\"nonpayable\\"}","{\\"name\\": \\"registerDelegation\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"delegatee\\", \\"type\\": \\"address\\", \\"internalType\\": \\"address\\"}, {\\"name\\": \\"delegationControlId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"initCallData\\", \\"type\\": \\"bytes\\", \\"internalType\\": \\"bytes\\"}], \\"outputs\\": [], \\"stateMutability\\": \\"nonpayable\\"}","{\\"name\\": \\"registerFunctionSelector\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"systemId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"systemFunctionSignature\\", \\"type\\": \\"string\\", \\"internalType\\": \\"string\\"}], \\"outputs\\": [{\\"name\\": \\"worldFunctionSelector\\", \\"type\\": \\"bytes4\\", \\"internalType\\": \\"bytes4\\"}], \\"stateMutability\\": \\"nonpayable\\"}","{\\"name\\": \\"registerNamespace\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"namespaceId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}], \\"outputs\\": [], \\"stateMutability\\": \\"nonpayable\\"}","{\\"name\\": \\"registerNamespaceDelegation\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"namespaceId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"delegationControlId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"initCallData\\", \\"type\\": \\"bytes\\", \\"internalType\\": \\"bytes\\"}], \\"outputs\\": [], \\"stateMutability\\": \\"nonpayable\\"}","{\\"name\\": \\"registerRootFunctionSelector\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"systemId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"worldFunctionSignature\\", \\"type\\": \\"string\\", \\"internalType\\": \\"string\\"}, {\\"name\\": \\"systemFunctionSignature\\", \\"type\\": \\"string\\", \\"internalType\\": \\"string\\"}], \\"outputs\\": [{\\"name\\": \\"worldFunctionSelector\\", \\"type\\": \\"bytes4\\", \\"internalType\\": \\"bytes4\\"}], \\"stateMutability\\": \\"nonpayable\\"}","{\\"name\\": \\"registerStoreHook\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"tableId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"hookAddress\\", \\"type\\": \\"address\\", \\"internalType\\": \\"contract IStoreHook\\"}, {\\"name\\": \\"enabledHooksBitmap\\", \\"type\\": \\"uint8\\", \\"internalType\\": \\"uint8\\"}], \\"outputs\\": [], \\"stateMutability\\": \\"nonpayable\\"}","{\\"name\\": \\"registerSystem\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"systemId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"system\\", \\"type\\": \\"address\\", \\"internalType\\": \\"contract System\\"}, {\\"name\\": \\"publicAccess\\", \\"type\\": \\"bool\\", \\"internalType\\": \\"bool\\"}], \\"outputs\\": [], \\"stateMutability\\": \\"nonpayable\\"}","{\\"name\\": \\"registerSystemHook\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"systemId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"hookAddress\\", \\"type\\": \\"address\\", \\"internalType\\": \\"contract ISystemHook\\"}, {\\"name\\": \\"enabledHooksBitmap\\", \\"type\\": \\"uint8\\", \\"internalType\\": \\"uint8\\"}], \\"outputs\\": [], \\"stateMutability\\": \\"nonpayable\\"}","{\\"name\\": \\"registerTable\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"tableId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"fieldLayout\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"FieldLayout\\"}, {\\"name\\": \\"keySchema\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"Schema\\"}, {\\"name\\": \\"valueSchema\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"Schema\\"}, {\\"name\\": \\"keyNames\\", \\"type\\": \\"string[]\\", \\"internalType\\": \\"string[]\\"}, {\\"name\\": \\"fieldNames\\", \\"type\\": \\"string[]\\", \\"internalType\\": \\"string[]\\"}], \\"outputs\\": [], \\"stateMutability\\": \\"nonpayable\\"}","{\\"name\\": \\"renounceOwnership\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"namespaceId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}], \\"outputs\\": [], \\"stateMutability\\": \\"nonpayable\\"}","{\\"name\\": \\"revokeAccess\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"resourceId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"grantee\\", \\"type\\": \\"address\\", \\"internalType\\": \\"address\\"}], \\"outputs\\": [], \\"stateMutability\\": \\"nonpayable\\"}","{\\"name\\": \\"setDynamicField\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"tableId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"keyTuple\\", \\"type\\": \\"bytes32[]\\", \\"internalType\\": \\"bytes32[]\\"}, {\\"name\\": \\"dynamicFieldIndex\\", \\"type\\": \\"uint8\\", \\"internalType\\": \\"uint8\\"}, {\\"name\\": \\"data\\", \\"type\\": \\"bytes\\", \\"internalType\\": \\"bytes\\"}], \\"outputs\\": [], \\"stateMutability\\": \\"nonpayable\\"}","{\\"name\\": \\"setField\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"tableId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"keyTuple\\", \\"type\\": \\"bytes32[]\\", \\"internalType\\": \\"bytes32[]\\"}, {\\"name\\": \\"fieldIndex\\", \\"type\\": \\"uint8\\", \\"internalType\\": \\"uint8\\"}, {\\"name\\": \\"data\\", \\"type\\": \\"bytes\\", \\"internalType\\": \\"bytes\\"}], \\"outputs\\": [], \\"stateMutability\\": \\"nonpayable\\"}","{\\"name\\": \\"setField\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"tableId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"keyTuple\\", \\"type\\": \\"bytes32[]\\", \\"internalType\\": \\"bytes32[]\\"}, {\\"name\\": \\"fieldIndex\\", \\"type\\": \\"uint8\\", \\"internalType\\": \\"uint8\\"}, {\\"name\\": \\"data\\", \\"type\\": \\"bytes\\", \\"internalType\\": \\"bytes\\"}, {\\"name\\": \\"fieldLayout\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"FieldLayout\\"}], \\"outputs\\": [], \\"stateMutability\\": \\"nonpayable\\"}","{\\"name\\": \\"setRecord\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"tableId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"keyTuple\\", \\"type\\": \\"bytes32[]\\", \\"internalType\\": \\"bytes32[]\\"}, {\\"name\\": \\"staticData\\", \\"type\\": \\"bytes\\", \\"internalType\\": \\"bytes\\"}, {\\"name\\": \\"encodedLengths\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"EncodedLengths\\"}, {\\"name\\": \\"dynamicData\\", \\"type\\": \\"bytes\\", \\"internalType\\": \\"bytes\\"}], \\"outputs\\": [], \\"stateMutability\\": \\"nonpayable\\"}","{\\"name\\": \\"setStaticField\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"tableId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"keyTuple\\", \\"type\\": \\"bytes32[]\\", \\"internalType\\": \\"bytes32[]\\"}, {\\"name\\": \\"fieldIndex\\", \\"type\\": \\"uint8\\", \\"internalType\\": \\"uint8\\"}, {\\"name\\": \\"data\\", \\"type\\": \\"bytes\\", \\"internalType\\": \\"bytes\\"}, {\\"name\\": \\"fieldLayout\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"FieldLayout\\"}], \\"outputs\\": [], \\"stateMutability\\": \\"nonpayable\\"}","{\\"name\\": \\"spliceDynamicData\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"tableId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"keyTuple\\", \\"type\\": \\"bytes32[]\\", \\"internalType\\": \\"bytes32[]\\"}, {\\"name\\": \\"dynamicFieldIndex\\", \\"type\\": \\"uint8\\", \\"internalType\\": \\"uint8\\"}, {\\"name\\": \\"startWithinField\\", \\"type\\": \\"uint40\\", \\"internalType\\": \\"uint40\\"}, {\\"name\\": \\"deleteCount\\", \\"type\\": \\"uint40\\", \\"internalType\\": \\"uint40\\"}, {\\"name\\": \\"data\\", \\"type\\": \\"bytes\\", \\"internalType\\": \\"bytes\\"}], \\"outputs\\": [], \\"stateMutability\\": \\"nonpayable\\"}","{\\"name\\": \\"spliceStaticData\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"tableId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"keyTuple\\", \\"type\\": \\"bytes32[]\\", \\"internalType\\": \\"bytes32[]\\"}, {\\"name\\": \\"start\\", \\"type\\": \\"uint48\\", \\"internalType\\": \\"uint48\\"}, {\\"name\\": \\"data\\", \\"type\\": \\"bytes\\", \\"internalType\\": \\"bytes\\"}], \\"outputs\\": [], \\"stateMutability\\": \\"nonpayable\\"}","{\\"name\\": \\"storeVersion\\", \\"type\\": \\"function\\", \\"inputs\\": [], \\"outputs\\": [{\\"name\\": \\"version\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"bytes32\\"}], \\"stateMutability\\": \\"view\\"}","{\\"name\\": \\"transferBalanceToAddress\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"fromNamespaceId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"toAddress\\", \\"type\\": \\"address\\", \\"internalType\\": \\"address\\"}, {\\"name\\": \\"amount\\", \\"type\\": \\"uint256\\", \\"internalType\\": \\"uint256\\"}], \\"outputs\\": [], \\"stateMutability\\": \\"nonpayable\\"}","{\\"name\\": \\"transferBalanceToNamespace\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"fromNamespaceId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"toNamespaceId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"amount\\", \\"type\\": \\"uint256\\", \\"internalType\\": \\"uint256\\"}], \\"outputs\\": [], \\"stateMutability\\": \\"nonpayable\\"}","{\\"name\\": \\"transferOwnership\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"namespaceId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"newOwner\\", \\"type\\": \\"address\\", \\"internalType\\": \\"address\\"}], \\"outputs\\": [], \\"stateMutability\\": \\"nonpayable\\"}","{\\"name\\": \\"unregisterDelegation\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"delegatee\\", \\"type\\": \\"address\\", \\"internalType\\": \\"address\\"}], \\"outputs\\": [], \\"stateMutability\\": \\"nonpayable\\"}","{\\"name\\": \\"unregisterNamespaceDelegation\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"namespaceId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}], \\"outputs\\": [], \\"stateMutability\\": \\"nonpayable\\"}","{\\"name\\": \\"unregisterStoreHook\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"tableId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"hookAddress\\", \\"type\\": \\"address\\", \\"internalType\\": \\"contract IStoreHook\\"}], \\"outputs\\": [], \\"stateMutability\\": \\"nonpayable\\"}","{\\"name\\": \\"unregisterSystemHook\\", \\"type\\": \\"function\\", \\"inputs\\": [{\\"name\\": \\"systemId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"hookAddress\\", \\"type\\": \\"address\\", \\"internalType\\": \\"contract ISystemHook\\"}], \\"outputs\\": [], \\"stateMutability\\": \\"nonpayable\\"}","{\\"name\\": \\"worldVersion\\", \\"type\\": \\"function\\", \\"inputs\\": [], \\"outputs\\": [{\\"name\\": \\"\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"bytes32\\"}], \\"stateMutability\\": \\"view\\"}","{\\"name\\": \\"HelloStore\\", \\"type\\": \\"event\\", \\"inputs\\": [{\\"name\\": \\"storeVersion\\", \\"type\\": \\"bytes32\\", \\"indexed\\": true, \\"internalType\\": \\"bytes32\\"}], \\"anonymous\\": false}","{\\"name\\": \\"HelloWorld\\", \\"type\\": \\"event\\", \\"inputs\\": [{\\"name\\": \\"worldVersion\\", \\"type\\": \\"bytes32\\", \\"indexed\\": true, \\"internalType\\": \\"bytes32\\"}], \\"anonymous\\": false}","{\\"name\\": \\"Store_DeleteRecord\\", \\"type\\": \\"event\\", \\"inputs\\": [{\\"name\\": \\"tableId\\", \\"type\\": \\"bytes32\\", \\"indexed\\": true, \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"keyTuple\\", \\"type\\": \\"bytes32[]\\", \\"indexed\\": false, \\"internalType\\": \\"bytes32[]\\"}], \\"anonymous\\": false}","{\\"name\\": \\"Store_SetRecord\\", \\"type\\": \\"event\\", \\"inputs\\": [{\\"name\\": \\"tableId\\", \\"type\\": \\"bytes32\\", \\"indexed\\": true, \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"keyTuple\\", \\"type\\": \\"bytes32[]\\", \\"indexed\\": false, \\"internalType\\": \\"bytes32[]\\"}, {\\"name\\": \\"staticData\\", \\"type\\": \\"bytes\\", \\"indexed\\": false, \\"internalType\\": \\"bytes\\"}, {\\"name\\": \\"encodedLengths\\", \\"type\\": \\"bytes32\\", \\"indexed\\": false, \\"internalType\\": \\"EncodedLengths\\"}, {\\"name\\": \\"dynamicData\\", \\"type\\": \\"bytes\\", \\"indexed\\": false, \\"internalType\\": \\"bytes\\"}], \\"anonymous\\": false}","{\\"name\\": \\"Store_SpliceDynamicData\\", \\"type\\": \\"event\\", \\"inputs\\": [{\\"name\\": \\"tableId\\", \\"type\\": \\"bytes32\\", \\"indexed\\": true, \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"keyTuple\\", \\"type\\": \\"bytes32[]\\", \\"indexed\\": false, \\"internalType\\": \\"bytes32[]\\"}, {\\"name\\": \\"dynamicFieldIndex\\", \\"type\\": \\"uint8\\", \\"indexed\\": false, \\"internalType\\": \\"uint8\\"}, {\\"name\\": \\"start\\", \\"type\\": \\"uint48\\", \\"indexed\\": false, \\"internalType\\": \\"uint48\\"}, {\\"name\\": \\"deleteCount\\", \\"type\\": \\"uint40\\", \\"indexed\\": false, \\"internalType\\": \\"uint40\\"}, {\\"name\\": \\"encodedLengths\\", \\"type\\": \\"bytes32\\", \\"indexed\\": false, \\"internalType\\": \\"EncodedLengths\\"}, {\\"name\\": \\"data\\", \\"type\\": \\"bytes\\", \\"indexed\\": false, \\"internalType\\": \\"bytes\\"}], \\"anonymous\\": false}","{\\"name\\": \\"Store_SpliceStaticData\\", \\"type\\": \\"event\\", \\"inputs\\": [{\\"name\\": \\"tableId\\", \\"type\\": \\"bytes32\\", \\"indexed\\": true, \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"keyTuple\\", \\"type\\": \\"bytes32[]\\", \\"indexed\\": false, \\"internalType\\": \\"bytes32[]\\"}, {\\"name\\": \\"start\\", \\"type\\": \\"uint48\\", \\"indexed\\": false, \\"internalType\\": \\"uint48\\"}, {\\"name\\": \\"data\\", \\"type\\": \\"bytes\\", \\"indexed\\": false, \\"internalType\\": \\"bytes\\"}], \\"anonymous\\": false}","{\\"name\\": \\"EncodedLengths_InvalidLength\\", \\"type\\": \\"error\\", \\"inputs\\": [{\\"name\\": \\"length\\", \\"type\\": \\"uint256\\", \\"internalType\\": \\"uint256\\"}]}","{\\"name\\": \\"FieldLayout_Empty\\", \\"type\\": \\"error\\", \\"inputs\\": []}","{\\"name\\": \\"FieldLayout_InvalidStaticDataLength\\", \\"type\\": \\"error\\", \\"inputs\\": [{\\"name\\": \\"staticDataLength\\", \\"type\\": \\"uint256\\", \\"internalType\\": \\"uint256\\"}, {\\"name\\": \\"computedStaticDataLength\\", \\"type\\": \\"uint256\\", \\"internalType\\": \\"uint256\\"}]}","{\\"name\\": \\"FieldLayout_StaticLengthDoesNotFitInAWord\\", \\"type\\": \\"error\\", \\"inputs\\": [{\\"name\\": \\"index\\", \\"type\\": \\"uint256\\", \\"internalType\\": \\"uint256\\"}]}","{\\"name\\": \\"FieldLayout_StaticLengthIsNotZero\\", \\"type\\": \\"error\\", \\"inputs\\": [{\\"name\\": \\"index\\", \\"type\\": \\"uint256\\", \\"internalType\\": \\"uint256\\"}]}","{\\"name\\": \\"FieldLayout_StaticLengthIsZero\\", \\"type\\": \\"error\\", \\"inputs\\": [{\\"name\\": \\"index\\", \\"type\\": \\"uint256\\", \\"internalType\\": \\"uint256\\"}]}","{\\"name\\": \\"FieldLayout_TooManyDynamicFields\\", \\"type\\": \\"error\\", \\"inputs\\": [{\\"name\\": \\"numFields\\", \\"type\\": \\"uint256\\", \\"internalType\\": \\"uint256\\"}, {\\"name\\": \\"maxFields\\", \\"type\\": \\"uint256\\", \\"internalType\\": \\"uint256\\"}]}","{\\"name\\": \\"FieldLayout_TooManyFields\\", \\"type\\": \\"error\\", \\"inputs\\": [{\\"name\\": \\"numFields\\", \\"type\\": \\"uint256\\", \\"internalType\\": \\"uint256\\"}, {\\"name\\": \\"maxFields\\", \\"type\\": \\"uint256\\", \\"internalType\\": \\"uint256\\"}]}","{\\"name\\": \\"Module_AlreadyInstalled\\", \\"type\\": \\"error\\", \\"inputs\\": []}","{\\"name\\": \\"Module_MissingDependency\\", \\"type\\": \\"error\\", \\"inputs\\": [{\\"name\\": \\"dependency\\", \\"type\\": \\"address\\", \\"internalType\\": \\"address\\"}]}","{\\"name\\": \\"Module_NonRootInstallNotSupported\\", \\"type\\": \\"error\\", \\"inputs\\": []}","{\\"name\\": \\"Module_RootInstallNotSupported\\", \\"type\\": \\"error\\", \\"inputs\\": []}","{\\"name\\": \\"Schema_InvalidLength\\", \\"type\\": \\"error\\", \\"inputs\\": [{\\"name\\": \\"length\\", \\"type\\": \\"uint256\\", \\"internalType\\": \\"uint256\\"}]}","{\\"name\\": \\"Schema_StaticTypeAfterDynamicType\\", \\"type\\": \\"error\\", \\"inputs\\": []}","{\\"name\\": \\"Slice_OutOfBounds\\", \\"type\\": \\"error\\", \\"inputs\\": [{\\"name\\": \\"data\\", \\"type\\": \\"bytes\\", \\"internalType\\": \\"bytes\\"}, {\\"name\\": \\"start\\", \\"type\\": \\"uint256\\", \\"internalType\\": \\"uint256\\"}, {\\"name\\": \\"end\\", \\"type\\": \\"uint256\\", \\"internalType\\": \\"uint256\\"}]}","{\\"name\\": \\"Store_IndexOutOfBounds\\", \\"type\\": \\"error\\", \\"inputs\\": [{\\"name\\": \\"length\\", \\"type\\": \\"uint256\\", \\"internalType\\": \\"uint256\\"}, {\\"name\\": \\"accessedIndex\\", \\"type\\": \\"uint256\\", \\"internalType\\": \\"uint256\\"}]}","{\\"name\\": \\"Store_InvalidBounds\\", \\"type\\": \\"error\\", \\"inputs\\": [{\\"name\\": \\"start\\", \\"type\\": \\"uint256\\", \\"internalType\\": \\"uint256\\"}, {\\"name\\": \\"end\\", \\"type\\": \\"uint256\\", \\"internalType\\": \\"uint256\\"}]}","{\\"name\\": \\"Store_InvalidFieldNamesLength\\", \\"type\\": \\"error\\", \\"inputs\\": [{\\"name\\": \\"expected\\", \\"type\\": \\"uint256\\", \\"internalType\\": \\"uint256\\"}, {\\"name\\": \\"received\\", \\"type\\": \\"uint256\\", \\"internalType\\": \\"uint256\\"}]}","{\\"name\\": \\"Store_InvalidKeyNamesLength\\", \\"type\\": \\"error\\", \\"inputs\\": [{\\"name\\": \\"expected\\", \\"type\\": \\"uint256\\", \\"internalType\\": \\"uint256\\"}, {\\"name\\": \\"received\\", \\"type\\": \\"uint256\\", \\"internalType\\": \\"uint256\\"}]}","{\\"name\\": \\"Store_InvalidResourceType\\", \\"type\\": \\"error\\", \\"inputs\\": [{\\"name\\": \\"expected\\", \\"type\\": \\"bytes2\\", \\"internalType\\": \\"bytes2\\"}, {\\"name\\": \\"resourceId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"resourceIdString\\", \\"type\\": \\"string\\", \\"internalType\\": \\"string\\"}]}","{\\"name\\": \\"Store_InvalidSplice\\", \\"type\\": \\"error\\", \\"inputs\\": [{\\"name\\": \\"startWithinField\\", \\"type\\": \\"uint40\\", \\"internalType\\": \\"uint40\\"}, {\\"name\\": \\"deleteCount\\", \\"type\\": \\"uint40\\", \\"internalType\\": \\"uint40\\"}, {\\"name\\": \\"fieldLength\\", \\"type\\": \\"uint40\\", \\"internalType\\": \\"uint40\\"}]}","{\\"name\\": \\"Store_InvalidStaticDataLength\\", \\"type\\": \\"error\\", \\"inputs\\": [{\\"name\\": \\"expected\\", \\"type\\": \\"uint256\\", \\"internalType\\": \\"uint256\\"}, {\\"name\\": \\"received\\", \\"type\\": \\"uint256\\", \\"internalType\\": \\"uint256\\"}]}","{\\"name\\": \\"Store_InvalidValueSchemaDynamicLength\\", \\"type\\": \\"error\\", \\"inputs\\": [{\\"name\\": \\"expected\\", \\"type\\": \\"uint256\\", \\"internalType\\": \\"uint256\\"}, {\\"name\\": \\"received\\", \\"type\\": \\"uint256\\", \\"internalType\\": \\"uint256\\"}]}","{\\"name\\": \\"Store_InvalidValueSchemaLength\\", \\"type\\": \\"error\\", \\"inputs\\": [{\\"name\\": \\"expected\\", \\"type\\": \\"uint256\\", \\"internalType\\": \\"uint256\\"}, {\\"name\\": \\"received\\", \\"type\\": \\"uint256\\", \\"internalType\\": \\"uint256\\"}]}","{\\"name\\": \\"Store_InvalidValueSchemaStaticLength\\", \\"type\\": \\"error\\", \\"inputs\\": [{\\"name\\": \\"expected\\", \\"type\\": \\"uint256\\", \\"internalType\\": \\"uint256\\"}, {\\"name\\": \\"received\\", \\"type\\": \\"uint256\\", \\"internalType\\": \\"uint256\\"}]}","{\\"name\\": \\"Store_TableAlreadyExists\\", \\"type\\": \\"error\\", \\"inputs\\": [{\\"name\\": \\"tableId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"tableIdString\\", \\"type\\": \\"string\\", \\"internalType\\": \\"string\\"}]}","{\\"name\\": \\"Store_TableNotFound\\", \\"type\\": \\"error\\", \\"inputs\\": [{\\"name\\": \\"tableId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"tableIdString\\", \\"type\\": \\"string\\", \\"internalType\\": \\"string\\"}]}","{\\"name\\": \\"World_AccessDenied\\", \\"type\\": \\"error\\", \\"inputs\\": [{\\"name\\": \\"resource\\", \\"type\\": \\"string\\", \\"internalType\\": \\"string\\"}, {\\"name\\": \\"caller\\", \\"type\\": \\"address\\", \\"internalType\\": \\"address\\"}]}","{\\"name\\": \\"World_AlreadyInitialized\\", \\"type\\": \\"error\\", \\"inputs\\": []}","{\\"name\\": \\"World_CallbackNotAllowed\\", \\"type\\": \\"error\\", \\"inputs\\": [{\\"name\\": \\"functionSelector\\", \\"type\\": \\"bytes4\\", \\"internalType\\": \\"bytes4\\"}]}","{\\"name\\": \\"World_DelegationNotFound\\", \\"type\\": \\"error\\", \\"inputs\\": [{\\"name\\": \\"delegator\\", \\"type\\": \\"address\\", \\"internalType\\": \\"address\\"}, {\\"name\\": \\"delegatee\\", \\"type\\": \\"address\\", \\"internalType\\": \\"address\\"}]}","{\\"name\\": \\"World_FunctionSelectorAlreadyExists\\", \\"type\\": \\"error\\", \\"inputs\\": [{\\"name\\": \\"functionSelector\\", \\"type\\": \\"bytes4\\", \\"internalType\\": \\"bytes4\\"}]}","{\\"name\\": \\"World_FunctionSelectorNotFound\\", \\"type\\": \\"error\\", \\"inputs\\": [{\\"name\\": \\"functionSelector\\", \\"type\\": \\"bytes4\\", \\"internalType\\": \\"bytes4\\"}]}","{\\"name\\": \\"World_InsufficientBalance\\", \\"type\\": \\"error\\", \\"inputs\\": [{\\"name\\": \\"balance\\", \\"type\\": \\"uint256\\", \\"internalType\\": \\"uint256\\"}, {\\"name\\": \\"amount\\", \\"type\\": \\"uint256\\", \\"internalType\\": \\"uint256\\"}]}","{\\"name\\": \\"World_InterfaceNotSupported\\", \\"type\\": \\"error\\", \\"inputs\\": [{\\"name\\": \\"contractAddress\\", \\"type\\": \\"address\\", \\"internalType\\": \\"address\\"}, {\\"name\\": \\"interfaceId\\", \\"type\\": \\"bytes4\\", \\"internalType\\": \\"bytes4\\"}]}","{\\"name\\": \\"World_InvalidNamespace\\", \\"type\\": \\"error\\", \\"inputs\\": [{\\"name\\": \\"namespace\\", \\"type\\": \\"bytes14\\", \\"internalType\\": \\"bytes14\\"}]}","{\\"name\\": \\"World_InvalidResourceId\\", \\"type\\": \\"error\\", \\"inputs\\": [{\\"name\\": \\"resourceId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"resourceIdString\\", \\"type\\": \\"string\\", \\"internalType\\": \\"string\\"}]}","{\\"name\\": \\"World_InvalidResourceType\\", \\"type\\": \\"error\\", \\"inputs\\": [{\\"name\\": \\"expected\\", \\"type\\": \\"bytes2\\", \\"internalType\\": \\"bytes2\\"}, {\\"name\\": \\"resourceId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"resourceIdString\\", \\"type\\": \\"string\\", \\"internalType\\": \\"string\\"}]}","{\\"name\\": \\"World_ResourceAlreadyExists\\", \\"type\\": \\"error\\", \\"inputs\\": [{\\"name\\": \\"resourceId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"resourceIdString\\", \\"type\\": \\"string\\", \\"internalType\\": \\"string\\"}]}","{\\"name\\": \\"World_ResourceNotFound\\", \\"type\\": \\"error\\", \\"inputs\\": [{\\"name\\": \\"resourceId\\", \\"type\\": \\"bytes32\\", \\"internalType\\": \\"ResourceId\\"}, {\\"name\\": \\"resourceIdString\\", \\"type\\": \\"string\\", \\"internalType\\": \\"string\\"}]}","{\\"name\\": \\"World_SystemAlreadyExists\\", \\"type\\": \\"error\\", \\"inputs\\": [{\\"name\\": \\"system\\", \\"type\\": \\"address\\", \\"internalType\\": \\"address\\"}]}","{\\"name\\": \\"World_UnlimitedDelegationNotAllowed\\", \\"type\\": \\"error\\", \\"inputs\\": []}"}
\.

--
-- PostgreSQL database dump complete
--
