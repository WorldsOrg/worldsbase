--
-- PostgreSQL database dump
--

-- Dumped from database version 15.1 (Ubuntu 15.1-1.pgdg20.04+1)
-- Dumped by pg_dump version 16.3 (Ubuntu 16.3-1.pgdg22.04+1)
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
-- Name: delete_twitter_followers_tmp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.delete_twitter_followers_tmp() RETURNS void LANGUAGE plpgsql AS $$ BEGIN -- This function is created to truncate `twitter_followers_tmp records` as it's not needed anymore
-- Unique followers are saved on `twitter_followers` table
-- This is used to save row records on database and save cost
DELETE FROM twitter_followers_tmp;
END;
$$;
ALTER FUNCTION public.delete_twitter_followers_tmp() OWNER TO postgres;
--
-- Name: end_match(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.end_match() RETURNS trigger LANGUAGE plpgsql AS $$BEGIN NEW.finished_at = NOW();
END;
$$;
ALTER FUNCTION public.end_match() OWNER TO postgres;
--
-- Name: generate_referral_code(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_referral_code() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE referral_code TEXT;
BEGIN referral_code := substr(
    encode(digest(new.id::text, 'sha256'), 'hex'),
    1,
    8
);
NEW.referral_code := referral_code;
RETURN NEW;
END;
$$;
ALTER FUNCTION public.generate_referral_code() OWNER TO postgres;
--
-- Name: generate_referral_code_bulk(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_referral_code_bulk(uuid uuid) RETURNS text LANGUAGE plpgsql AS $$ BEGIN RETURN substr(
    encode(digest(uuid::TEXT, 'sha256'), 'hex'),
    1,
    8
);
END;
$$;
ALTER FUNCTION public.generate_referral_code_bulk(uuid uuid) OWNER TO postgres;
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
-- Name: run_all_twitter_likes_scoring_updates(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.run_all_twitter_likes_scoring_updates() RETURNS text LANGUAGE plpgsql AS $$ BEGIN -- Debug message
RAISE NOTICE 'Running Twitter Likes updates. Sleeping for 5 seconds...';
-- Sleep for 5 seconds
PERFORM pg_sleep(5);
-- Call the first function
PERFORM public.update_liked_tweets_engagement_tbl();
-- Debug message
RAISE NOTICE 'Liked Tweets Engagement table updated. Sleeping for 10 seconds...';
-- Sleep for 10 seconds
PERFORM pg_sleep(10);
-- Call the second function
PERFORM public.send_discord_notif_our_likes_stats();
-- Debug message
RAISE NOTICE 'Discord notification sent.';
RETURN 'Success. Twitter Likes table updates successful.' as result;
END;
$$;
ALTER FUNCTION public.run_all_twitter_likes_scoring_updates() OWNER TO postgres;
--
-- Name: send_discord_notif_evan_likes_stats(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.send_discord_notif_evan_likes_stats() RETURNS text LANGUAGE plpgsql AS $$
DECLARE discord_message TEXT;
webhook_url TEXT := 'https://discord.com/api/webhooks/1254430955746234495/wk4LZo9gFi-rjEPDLPXovGR60hNIT2tURdtx1XdxJIXGV7wYFEpbEHBMKVQN-CQQEKlK';
webhook_url_test TEXT := 'https://discord.com/api/webhooks/1253601597192405015/1EndVBgcTqwTf8jtQv1OA_fc6FPvAqS5YU8Bq0tg9UEqyPVPlwYvUzLEYxUARVXb03Co';
table_content TEXT := '';
BEGIN -- Query to fetch last 3 days' data from liked_tweets_engagement
SELECT STRING_AGG(
        '| ' || LPAD(tweet_id::TEXT, 21) || ' | ' || LPAD(COALESCE(current_like_count::TEXT, ''), 11) || ' | ' || LPAD(
            COALESCE(coalesce(new_organic_like_count, 0)::TEXT, ''),
            18
        ) || ' |',
        E'\n'
    ) INTO table_content
FROM (
        SELECT *
        FROM liked_tweets_engagement
        WHERE tweeted_at >= NOW() - INTERVAL '3 days' --         AND (COALESCE(new_organic_like_count, 0) > 0 
            --         or COALESCE(td_like_count, 0) = 0) 
            --         AND account = 'evan' -- filter by EVAN
            --         AND coalesce(new_organic_like_count,0) >= 0 
            AND boost = true
        ORDER BY tweeted_at desc,
            new_organic_like_count DESC
        LIMIT 10
    ) AS subquery_alias;
-- Check if table_content is not empty
IF table_content IS NOT NULL THEN -- Format current timestamp to Philippine Time (PHT)
discord_message := 'Likes stats of tweets liked by `@EvanHatch` that require TD likes matching (tweet age: 3 days) as of  **' || TO_CHAR(
    NOW() AT TIME ZONE 'Asia/Manila',
    'Dy, Mon DD, YYYY HH:MI AM TZ PHT**'
) || CHR(10) || CHR(10) || '```markdown' || CHR(10) || '  TweetID (liked tweet) | Total Likes | New Organic Likes  ' || CHR(10) || '  --------------------- | ----------- | -------------------' || CHR(10) || table_content || CHR(10) || '```' || CHR(10) || 'Please check Appsmith for the full list.' || CHR(10) || CHR(10);
-- Debug message
RAISE NOTICE 'Discord message generated: %',
discord_message;
-- Send the message
PERFORM net.http_post(
    url := webhook_url,
    body := jsonb_build_object('content', discord_message),
    headers := '{"Content-Type": "application/json"}'::JSONB
);
-- Debug message
RAISE NOTICE 'Discord message sent successfully.';
-- Return success message
RETURN discord_message;
ELSE PERFORM -- send to TEST channel only
net.http_post(
    url := webhook_url_test,
    body := jsonb_build_object(
        'content',
        'No new likes data available to send.'
    ),
    headers := '{"Content-Type": "application/json"}'::JSONB
);
-- Return message indicating no data
RETURN 'No new likes data available to send.';
END IF;
-------
END;
$$;
ALTER FUNCTION public.send_discord_notif_evan_likes_stats() OWNER TO postgres;
--
-- Name: send_discord_notif_our_likes_stats(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.send_discord_notif_our_likes_stats() RETURNS text LANGUAGE plpgsql AS $$
DECLARE discord_message TEXT;
webhook_url TEXT := 'https://discord.com/api/webhooks/1254430955746234495/wk4LZo9gFi-rjEPDLPXovGR60hNIT2tURdtx1XdxJIXGV7wYFEpbEHBMKVQN-CQQEKlK';
webhook_url_test TEXT := 'https://discord.com/api/webhooks/1253601597192405015/1EndVBgcTqwTf8jtQv1OA_fc6FPvAqS5YU8Bq0tg9UEqyPVPlwYvUzLEYxUARVXb03Co';
table_content TEXT := '';
BEGIN -- Query to fetch last 3 days' data from liked_tweets_engagement
SELECT STRING_AGG(
        '| ' || LPAD(tweet_id::TEXT, 21) || ' | ' || LPAD(COALESCE(current_like_count::TEXT, ''), 11) || ' | ' || LPAD(
            COALESCE(coalesce(new_organic_like_count, 0)::TEXT, ''),
            18
        ) || ' |',
        E'\n'
    ) INTO table_content
FROM (
        SELECT *
        FROM liked_tweets_engagement
        WHERE tweeted_at >= NOW() - INTERVAL '3 days' -- AND (COALESCE(new_organic_like_count, 0) > 0 
            -- or COALESCE(td_like_count, 0) = 0) 
            AND account = 'waifu' -- filter by WAIFU
            AND coalesce(new_organic_like_count, 0) > 0 -- only if organic like is greater than 1
            AND boost = true
        ORDER BY tweeted_at desc,
            new_organic_like_count DESC
        LIMIT 10
    ) AS subquery_alias;
-- Check if table_content is not empty
IF table_content IS NOT NULL THEN -- Format current timestamp to Philippine Time (PHT)
discord_message := 'Likes stats of tweets liked by `@WaifuWTF` that require TD likes matching (tweet age: 3 days) as of  **' || TO_CHAR(
    NOW() AT TIME ZONE 'Asia/Manila',
    'Dy, Mon DD, YYYY HH:MI AM TZ PHT**'
) || CHR(10) || CHR(10) || '```markdown' || CHR(10) || '  TweetID (liked tweet) | Total Likes | New Organic Likes  ' || CHR(10) || '  --------------------- | ----------- | -------------------' || CHR(10) || table_content || CHR(10) || '```' || CHR(10) || 'Please check Appsmith for the full list.' || CHR(10) || CHR(10);
-- Debug message
RAISE NOTICE 'Discord message generated: %',
discord_message;
-- Send the message
PERFORM net.http_post(
    url := webhook_url,
    body := jsonb_build_object('content', discord_message),
    headers := '{"Content-Type": "application/json"}'::JSONB
);
--     	PERFORM -- send to TEST channel 
--             net.http_post(
--                 url := webhook_url_test,
--                 body := jsonb_build_object('content', discord_message),
--                 headers := '{"Content-Type": "application/json"}'::JSONB
--             );
-- Debug message
RAISE NOTICE 'Discord message sent successfully.';
-- Return success message
RETURN discord_message;
ELSE --     	PERFORM -- send to TEST channel only
--             net.http_post(
--                 url := webhook_url_test,
--                 body := jsonb_build_object('content', 'No new likes data available to send.' ),
--                 headers := '{"Content-Type": "application/json"}'::JSONB
--             );
-- Return message indicating no data
RETURN 'No new likes data available to send.';
END IF;
-------
END;
$$;
ALTER FUNCTION public.send_discord_notif_our_likes_stats() OWNER TO postgres;
--
-- Name: update_engagement_scores_and_log(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_engagement_scores_and_log() RETURNS text LANGUAGE plpgsql AS $$
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
    updated_at = CASE
        WHEN twitter_engagement_score.total_engagement_points::numeric <> EXCLUDED.total_engagement_points::numeric THEN NOW()
        ELSE twitter_engagement_score.updated_at
    END
WHERE twitter_engagement_score.profile_screen_name = EXCLUDED.profile_screen_name;
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
ALTER FUNCTION public.update_engagement_scores_and_log() OWNER TO postgres;
--
-- Name: update_liked_tweets_engagement_score(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_liked_tweets_engagement_score() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN -- Update all fields when TD scraping team already made their change (indicator: td_like_count > 0)
IF coalesce(OLD.td_like_count, 0) > 0 THEN NEW.previous_like_count = OLD.current_like_count;
NEW.likes_difference = NEW.current_like_count - OLD.current_like_count;
-- removed absolute because sometimes likes are removed
NEW.new_organic_like_count = coalesce(
    coalesce(NEW.likes_difference, 0) - coalesce(OLD.td_like_count, 0),
    0
);
NEW.previous_td_like_count = coalesce(OLD.td_like_count, 0);
NEW.td_like_count = NULL;
-- reset
END IF;
-- Update all fields when TD scraping team already made their change (indicator: td_retweet_count > 0)
IF coalesce(OLD.td_retweet_count, 0) > 0 THEN NEW.previous_retweet_count = OLD.current_retweet_count;
NEW.retweet_difference = NEW.current_retweet_count - OLD.current_retweet_count;
-- removed absolute because sometimes likes are removed
NEW.new_organic_retweet_count = coalesce(
    coalesce(NEW.retweet_difference, 0) - coalesce(OLD.td_retweet_count, 0),
    0
);
NEW.previous_td_retweet_count = coalesce(OLD.td_retweet_count, 0);
NEW.td_retweet_count = NULL;
-- reset
END IF;
-- When TD scraping team have not made any change yet (e.g. still processing likes; skipped this batch)
-- LIKES
IF coalesce(OLD.td_like_count, 0) = 0 THEN NEW.previous_like_count = OLD.current_like_count;
NEW.likes_difference = NEW.current_like_count - OLD.current_like_count;
-- removed absolute because sometimes likes are removed
NEW.new_organic_like_count = coalesce(
    NEW.current_like_count - OLD.current_like_count - coalesce(OLD.td_like_count, 0) + COALESCE(OLD.new_organic_like_count, 0),
    0
);
END IF;
-- RETWEETS
IF coalesce(OLD.td_retweet_count, 0) = 0 THEN NEW.previous_retweet_count = OLD.current_retweet_count;
NEW.retweet_difference = NEW.current_retweet_count - OLD.current_retweet_count;
-- removed absolute because sometimes retweets are removed
NEW.new_organic_retweet_count = coalesce(
    NEW.current_retweet_count - OLD.current_retweet_count - coalesce(OLD.td_retweet_count, 0) + COALESCE(OLD.new_organic_retweet_count, 0),
    0
);
END IF;
-- Update the updated_at column only if the current_like_count and/or current_retweet_count has changed
IF NEW.current_like_count <> OLD.current_like_count
OR NEW.current_retweet_count <> OLD.current_retweet_count THEN NEW.updated_at = NOW();
END IF;
RETURN NEW;
END;
$$;
ALTER FUNCTION public.update_liked_tweets_engagement_score() OWNER TO postgres;
--
-- Name: update_liked_tweets_engagement_tbl(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_liked_tweets_engagement_tbl() RETURNS text LANGUAGE plpgsql AS $$
DECLARE tweet RECORD;
BEGIN FOR tweet IN
SELECT tweet_id,
    author_username,
    text,
    like_count,
    created_at,
    account,
    retweet_count
FROM view_our_twitter_likes
where tweet_id is not null LOOP
INSERT INTO public.liked_tweets_engagement (
        tweet_id,
        username,
        tweet,
        current_like_count,
        updated_at,
        tweeted_at,
        account,
        new_organic_like_count,
        current_retweet_count,
        new_organic_retweet_count
    )
VALUES (
        tweet.tweet_id,
        tweet.author_username,
        tweet.text,
        tweet.like_count,
        NOW(),
        tweet.created_at,
        tweet.account,
        tweet.like_count -1,
        tweet.retweet_count,
        tweet.retweet_count
    ) ON CONFLICT (tweet_id) DO
UPDATE
SET current_like_count = EXCLUDED.current_like_count,
    current_retweet_count = EXCLUDED.current_retweet_count,
    updated_at = CASE
        WHEN liked_tweets_engagement.current_like_count <> EXCLUDED.current_like_count
        or liked_tweets_engagement.current_retweet_count <> EXCLUDED.current_retweet_count THEN NOW()
        ELSE liked_tweets_engagement.updated_at
    END;
END LOOP;
RETURN 'Success. Twitter Liked Tweets Engagement Scores updated.';
END;
$$;
ALTER FUNCTION public.update_liked_tweets_engagement_tbl() OWNER TO postgres;
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
VALUES(
        profile.username,
        profile.provisioned_wallet,
        profile.total_engagement_score,
        NOW()
    ) ON CONFLICT (profile_screen_name) DO
UPDATE
SET total_engagement_points = EXCLUDED.total_engagement_points,
    wallet = EXCLUDED.wallet,
    updated_at = CASE
        WHEN twitter_engagement_score.total_engagement_points::numeric <> EXCLUDED.total_engagement_points::numeric THEN NOW()
        ELSE twitter_engagement_score.updated_at
    END
WHERE twitter_engagement_score.profile_screen_name = EXCLUDED.profile_screen_name;
END LOOP;
RETURN 'Success. Twitter Engagement Scores updated.';
END;
$$;
ALTER FUNCTION public.update_twitter_engagement_score() OWNER TO postgres;
--
-- Name: upsert_twitter_follower(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.upsert_twitter_follower() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF EXISTS (
    SELECT 1
    FROM twitter_followers
    WHERE user_id = NEW.user_id
) THEN
UPDATE twitter_followers
SET screenname = NEW.screenname,
    url = NEW.url,
    name = NEW.name,
    location = NEW.location,
    description = NEW.description,
    profile_url = NEW.profile_url,
    followers_count = NEW.followers_count,
    friends_count = NEW.friends_count,
    statuses_count = NEW.statuses_count,
    urls = NEW.urls,
    restricted_access = NEW.restricted_access,
    banned = NEW.banned,
    created_date = NEW.created_date,
    updated_at = NOW()
WHERE user_id = NEW.user_id;
ELSE
INSERT INTO twitter_followers (
        user_id,
        screenname,
        url,
        name,
        location,
        description,
        profile_url,
        followers_count,
        friends_count,
        statuses_count,
        urls,
        restricted_access,
        banned,
        created_date,
        follower_since
    )
VALUES (
        NEW.user_id,
        NEW.screenname,
        NEW.url,
        NEW.name,
        NEW.location,
        NEW.description,
        NEW.profile_url,
        NEW.followers_count,
        NEW.friends_count,
        NEW.statuses_count,
        NEW.urls,
        NEW.restricted_access,
        NEW.banned,
        NEW.created_date,
        NOW()
    );
-- Update wtf_users table if twitter_id matches
UPDATE wtf_users
SET is_follower = TRUE
WHERE twitter_id = NEW.user_id;
END IF;
RETURN NEW;
END;
$$;
ALTER FUNCTION public.upsert_twitter_follower() OWNER TO postgres;
SET default_tablespace = '';
SET default_table_access_method = heap;
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
ALTER SEQUENCE public.wtf_match_history_id_seq OWNER TO postgres;
--
-- Name: wtf_match_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.wtf_match_history_id_seq OWNED BY public.wtf_match_history.id;
--
-- Name: _wtf_match_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._wtf_match_history (
    id integer DEFAULT nextval('public.wtf_match_history_id_seq'::regclass) NOT NULL,
    started_at timestamp with time zone DEFAULT now(),
    finished_at timestamp with time zone,
    mode text,
    total_players integer,
    time_limit integer,
    target_score integer,
    map text
);
ALTER TABLE public._wtf_match_history OWNER TO postgres;
--
-- Name: TABLE _wtf_match_history; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public._wtf_match_history IS 'This is a duplicate of wtf_match_history_old';
--
-- Name: _wtf_player_match_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._wtf_player_match_history (
    player_id text NOT NULL,
    match_history_id integer NOT NULL,
    xp integer,
    kills integer,
    deaths integer,
    assists integer,
    round_wins integer,
    round_losses integer,
    winner boolean
);
ALTER TABLE public._wtf_player_match_history OWNER TO postgres;
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
ALTER SEQUENCE public.wtf_player_stats_id_seq OWNER TO postgres;
--
-- Name: wtf_player_stats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.wtf_player_stats_id_seq OWNED BY public.wtf_player_stats.id;
--
-- Name: _wtf_player_total_stats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._wtf_player_total_stats (
    id integer DEFAULT nextval('public.wtf_player_stats_id_seq'::regclass) NOT NULL,
    player_id text NOT NULL,
    xp integer,
    match_losses integer,
    kills integer,
    round_wins integer,
    round_losses integer,
    deaths integer,
    match_wins integer,
    level integer,
    assists integer
);
ALTER TABLE public._wtf_player_total_stats OWNER TO postgres;
--
-- Name: TABLE _wtf_player_total_stats; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public._wtf_player_total_stats IS 'This is a duplicate of wtf_player_stats';
--
-- Name: _wtf_players; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._wtf_players (
    player text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    id text NOT NULL
);
ALTER TABLE public._wtf_players OWNER TO postgres;
--
-- Name: TABLE _wtf_players; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public._wtf_players IS 'This is a duplicate of wtf_players_old';
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
-- Name: clicker-signup-users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."clicker-signup-users" (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    twitter_id text,
    twitter_username text,
    tg_id text,
    tg_username text
);
ALTER TABLE public."clicker-signup-users" OWNER TO postgres;
--
-- Name: clicker-signup-users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."clicker-signup-users"
ALTER COLUMN id
ADD GENERATED BY DEFAULT AS IDENTITY (
        SEQUENCE NAME public."clicker-signup-users_id_seq" START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1
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
ALTER SEQUENCE public.kristof_test_id_seq OWNER TO postgres;
--
-- Name: kristof_test_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.kristof_test_id_seq OWNED BY public.kristof_test.id;
--
-- Name: liked_tweets_engagement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.liked_tweets_engagement (
    id integer NOT NULL,
    tweet_id text,
    tweet text,
    username text,
    current_like_count bigint,
    previous_like_count bigint,
    likes_difference bigint DEFAULT '0'::bigint,
    updated_at timestamp with time zone DEFAULT now(),
    last_td_like_at timestamp with time zone,
    td_like_count integer,
    previous_td_like_count integer,
    new_organic_like_count integer,
    tweeted_at timestamp with time zone,
    account text,
    boost boolean DEFAULT true,
    current_retweet_count bigint,
    previous_retweet_count bigint,
    retweet_difference bigint DEFAULT '0'::bigint,
    td_retweet_count bigint,
    previous_td_retweet_count bigint,
    new_organic_retweet_count bigint
);
ALTER TABLE public.liked_tweets_engagement OWNER TO postgres;
--
-- Name: COLUMN liked_tweets_engagement.account; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.liked_tweets_engagement.account IS 'waifu | evan';
--
-- Name: COLUMN liked_tweets_engagement.boost; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.liked_tweets_engagement.boost IS 'true - do TD likes';
--
-- Name: liked_tweets_engagement_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.liked_tweets_engagement_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.liked_tweets_engagement_id_seq OWNER TO postgres;
--
-- Name: liked_tweets_engagement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.liked_tweets_engagement_id_seq OWNED BY public.liked_tweets_engagement.id;
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
ALTER SEQUENCE public.matches_id_seq OWNER TO postgres;
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
ALTER SEQUENCE public.monster_game_resources_id_seq OWNER TO postgres;
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
ALTER SEQUENCE public.monster_game_variables_id_seq OWNER TO postgres;
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
ALTER SEQUENCE public.monster_match_history_id_seq OWNER TO postgres;
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
ALTER SEQUENCE public.monster_player_inventory_id_seq OWNER TO postgres;
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
ALTER SEQUENCE public.monster_player_match_performance_id_seq OWNER TO postgres;
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
ALTER SEQUENCE public.monster_players_id_seq OWNER TO postgres;
--
-- Name: monster_players_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.monster_players_id_seq OWNED BY public.monster_players.id;
--
-- Name: mud_worlds; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mud_worlds (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    chain_id text,
    address text,
    name text,
    abi jsonb []
);
ALTER TABLE public.mud_worlds OWNER TO postgres;
--
-- Name: our_twitter_likes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.our_twitter_likes (
    id integer NOT NULL,
    tweet_id text,
    text text,
    lang character varying(10),
    retweet_count integer,
    reply_count integer,
    like_count integer,
    quote_count integer,
    bookmark_count integer,
    impression_count integer,
    reply_settings character varying(50),
    possibly_sensitive boolean,
    author_id bigint,
    author_name character varying(255),
    author_username character varying(255),
    created_at timestamp with time zone,
    uploaded_at timestamp with time zone DEFAULT now(),
    account text
);
ALTER TABLE public.our_twitter_likes OWNER TO postgres;
--
-- Name: COLUMN our_twitter_likes.author_name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.our_twitter_likes.author_name IS 'not returned by the API anymore';
--
-- Name: COLUMN our_twitter_likes.account; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.our_twitter_likes.account IS 'waifu | evan';
--
-- Name: our_twitter_likes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.our_twitter_likes_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.our_twitter_likes_id_seq OWNER TO postgres;
--
-- Name: our_twitter_likes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.our_twitter_likes_id_seq OWNED BY public.our_twitter_likes.id;
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
ALTER SEQUENCE public.player_portal_id_seq OWNER TO postgres;
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
ALTER SEQUENCE public.run_history_id_seq OWNER TO postgres;
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
ALTER SEQUENCE public.run_variables_id_seq OWNER TO postgres;
--
-- Name: run_variables_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.run_variables_id_seq OWNED BY public.run_variables.id;
--
-- Name: wtf_steam_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wtf_steam_templates (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    model_url text,
    thumbnail_url text,
    name text
);
ALTER TABLE public.wtf_steam_templates OWNER TO postgres;
--
-- Name: wtf_steam_user_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wtf_steam_user_item (
    level bigint,
    upgrades jsonb,
    item_id bigint NOT NULL,
    steam_id text NOT NULL,
    template_id bigint
);
ALTER TABLE public.wtf_steam_user_item OWNER TO postgres;
--
-- Name: steamwaifudetails; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.steamwaifudetails AS
SELECT w.id AS waifu_id,
    w.model_url AS modal_url,
    w.thumbnail_url,
    w.name,
    u.steam_id,
    u.upgrades,
    u.level
FROM (
        public.wtf_steam_templates w
        JOIN public.wtf_steam_user_item u ON ((w.id = u.template_id))
    );
ALTER VIEW public.steamwaifudetails OWNER TO postgres;
--
-- Name: table_content; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.table_content (string_agg text);
ALTER TABLE public.table_content OWNER TO postgres;
--
-- Name: triggers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.triggers_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.triggers_id_seq OWNER TO postgres;
--
-- Name: trigger_functions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trigger_functions (
    id integer DEFAULT nextval('public.triggers_id_seq'::regclass) NOT NULL,
    triggers jsonb []
);
ALTER TABLE public.trigger_functions OWNER TO postgres;
--
-- Name: triggers_id_seq1; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.triggers_id_seq1 START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.triggers_id_seq1 OWNER TO postgres;
--
-- Name: triggers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.triggers (
    id integer DEFAULT nextval('public.triggers_id_seq1'::regclass) NOT NULL,
    aaa text
);
ALTER TABLE public.triggers OWNER TO postgres;
--
-- Name: twitter_engagement_score_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.twitter_engagement_score_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.twitter_engagement_score_id_seq OWNER TO postgres;
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
ALTER SEQUENCE public.twitter_engagement_score_wip_id_seq OWNER TO postgres;
--
-- Name: twitter_follower_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.twitter_follower_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.twitter_follower_id_seq OWNER TO postgres;
--
-- Name: twitter_follower_temp_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.twitter_follower_temp_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.twitter_follower_temp_id_seq OWNER TO postgres;
--
-- Name: twitter_followers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.twitter_followers (
    id integer DEFAULT nextval('public.twitter_follower_id_seq'::regclass) NOT NULL,
    user_id text,
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
    follower_since timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.twitter_followers OWNER TO postgres;
--
-- Name: twitter_followers_tmp; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.twitter_followers_tmp (
    id integer DEFAULT nextval('public.twitter_follower_temp_id_seq'::regclass) NOT NULL,
    user_id text,
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
ALTER TABLE public.twitter_followers_tmp OWNER TO postgres;
--
-- Name: twitter_mention_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.twitter_mention_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.twitter_mention_id_seq OWNER TO postgres;
--
-- Name: twitter_mentions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.twitter_mentions (
    id integer DEFAULT nextval('public.twitter_mention_id_seq'::regclass) NOT NULL,
    tweet_url text,
    tweet_id text,
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
ALTER SEQUENCE public.twitter_scores_id_seq OWNER TO postgres;
--
-- Name: twitter_scrape_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.twitter_scrape_log_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.twitter_scrape_log_id_seq OWNER TO postgres;
--
-- Name: twitter_tweet_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.twitter_tweet_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.twitter_tweet_id_seq OWNER TO postgres;
--
-- Name: twitter_tweets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.twitter_tweets (
    id integer DEFAULT nextval('public.twitter_tweet_id_seq'::regclass) NOT NULL,
    tweet_url text,
    tweet_id text,
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
-- Name: user_inventory_summary; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.user_inventory_summary AS
SELECT NULL::uuid AS user_id,
    NULL::text AS provisioned_wallet,
    NULL::numeric AS item_1_quantity,
    NULL::numeric AS item_2_quantity,
    NULL::numeric AS item_3_quantity,
    NULL::numeric AS item_4_quantity,
    NULL::numeric AS item_5_quantity,
    NULL::numeric AS item_6_quantity;
ALTER VIEW public.user_inventory_summary OWNER TO postgres;
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
ALTER VIEW public.view_engagement_leaderboard OWNER TO postgres;
--
-- Name: view_evan_twitter_likes; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.view_evan_twitter_likes AS WITH ranked_likes AS (
    SELECT our_twitter_likes.tweet_id,
        our_twitter_likes.text,
        our_twitter_likes.retweet_count,
        our_twitter_likes.reply_count,
        our_twitter_likes.like_count,
        our_twitter_likes.quote_count,
        our_twitter_likes.bookmark_count,
        our_twitter_likes.impression_count,
        our_twitter_likes.author_id,
        our_twitter_likes.author_username,
        our_twitter_likes.account,
        our_twitter_likes.created_at,
        our_twitter_likes.uploaded_at,
        row_number() OVER (
            PARTITION BY our_twitter_likes.tweet_id
            ORDER BY our_twitter_likes.id DESC
        ) AS rn
    FROM public.our_twitter_likes
    WHERE (
            (our_twitter_likes.tweet_id IS NOT NULL)
            AND (our_twitter_likes.account = 'evan'::text)
        )
)
SELECT ranked_likes.tweet_id,
    ranked_likes.text,
    ranked_likes.retweet_count,
    ranked_likes.reply_count,
    ranked_likes.like_count,
    ranked_likes.quote_count,
    ranked_likes.bookmark_count,
    ranked_likes.impression_count,
    ranked_likes.author_id,
    ranked_likes.author_username,
    ranked_likes.account,
    ranked_likes.created_at,
    ranked_likes.uploaded_at
FROM ranked_likes
WHERE (ranked_likes.rn = 1);
ALTER VIEW public.view_evan_twitter_likes OWNER TO postgres;
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
    score bigint DEFAULT '0'::bigint,
    provisioned_wallet text,
    energy_timestamp timestamp with time zone,
    telegram_id text,
    points_per_tap smallint DEFAULT '1'::smallint,
    max_energy bigint DEFAULT '2500'::bigint,
    energy_left bigint DEFAULT '2500'::bigint,
    connected_time timestamp with time zone,
    points_per_hour bigint DEFAULT '0'::bigint,
    tap_upgrades jsonb [],
    energy_upgrades jsonb [],
    hourly_upgrades jsonb [],
    is_follower boolean DEFAULT false,
    referral boolean DEFAULT false,
    referral_code text,
    telegram_username text
);
ALTER TABLE public.wtf_users OWNER TO postgres;
--
-- Name: view_leaderboard; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.view_leaderboard AS WITH latest_tweets AS (
    SELECT DISTINCT ON (tm.tweet_id) tm.id,
        tm.tweet_url,
        tm.tweet_id,
        tm.profile_screen_name,
        tm.retweet_count,
        tm.like_count,
        tm.reply_count,
        tm.view_count
    FROM public.twitter_mentions tm
    WHERE (tm.profile_screen_name <> 'WaifuWTF'::text)
    ORDER BY tm.tweet_id,
        tm.id DESC
),
aggregated_scores AS (
    SELECT lt.profile_screen_name AS twitter_username,
        sum(
            (
                (
                    (lt.retweet_count + lt.like_count) + lt.reply_count
                ) + lt.view_count
            )
        ) AS total_twitter_engagement_score,
        sum(lt.retweet_count) AS total_retweets,
        sum(lt.like_count) AS total_likes,
        sum(lt.reply_count) AS total_replies,
        sum(lt.view_count) AS total_views
    FROM latest_tweets lt
    GROUP BY lt.profile_screen_name
)
SELECT row_number() OVER (
        ORDER BY (
                COALESCE(e.total_twitter_engagement_score, (0)::numeric) + (COALESCE(u.score, (0)::bigint))::numeric
            ) DESC NULLS LAST
    ) AS rank,
    u.id AS wtf_id,
    u.wallet,
    u.twitter_id,
    COALESCE(u.twitter_username, e.twitter_username) AS twitter_username,
    u.telegram_id,
    u.telegram_username,
    u.provisioned_wallet,
    u.email,
    COALESCE(u.score, (0)::bigint) AS affection_score,
    COALESCE(e.total_twitter_engagement_score, (0)::numeric) AS social_score,
    (
        COALESCE(e.total_twitter_engagement_score, (0)::numeric) + (COALESCE(u.score, (0)::bigint))::numeric
    ) AS total_score,
    COALESCE(u.is_follower, false) AS is_twitter_follower,
    u.points_per_tap,
    u.points_per_hour,
    u.max_energy,
    u.energy_left,
    u.tap_upgrades,
    u.energy_upgrades,
    u.hourly_upgrades,
    u.referral,
    u.referral_code,
    u.energy_timestamp,
    u.connected_time,
    u.created_at
FROM (
        public.wtf_users u
        FULL JOIN aggregated_scores e ON (
            (
                lower(u.twitter_username) = lower(e.twitter_username)
            )
        )
    )
ORDER BY (
        COALESCE(e.total_twitter_engagement_score, (0)::numeric) + (COALESCE(u.score, (0)::bigint))::numeric
    ) DESC NULLS LAST;
ALTER VIEW public.view_leaderboard OWNER TO postgres;
--
-- Name: view_mention_stats; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.view_mention_stats AS WITH latest_stats AS (
    SELECT tweets.tweet_id,
        max(tweets.id) AS max_id
    FROM public.twitter_mentions tweets
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
            public.twitter_mentions tt_1
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
            public.twitter_mentions tt
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
ALTER VIEW public.view_mention_stats OWNER TO postgres;
--
-- Name: view_our_twitter_likes; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.view_our_twitter_likes AS WITH ranked_likes AS (
    SELECT our_twitter_likes.tweet_id,
        our_twitter_likes.text,
        our_twitter_likes.retweet_count,
        our_twitter_likes.reply_count,
        our_twitter_likes.like_count,
        our_twitter_likes.quote_count,
        our_twitter_likes.bookmark_count,
        our_twitter_likes.impression_count,
        our_twitter_likes.author_id,
        our_twitter_likes.author_username,
        our_twitter_likes.account,
        our_twitter_likes.created_at,
        our_twitter_likes.uploaded_at,
        row_number() OVER (
            PARTITION BY our_twitter_likes.tweet_id
            ORDER BY our_twitter_likes.id DESC
        ) AS rn
    FROM public.our_twitter_likes
    WHERE (
            (our_twitter_likes.tweet_id IS NOT NULL)
            AND (
                our_twitter_likes.account = ANY (ARRAY ['waifu'::text, 'jen'::text])
            )
        )
)
SELECT ranked_likes.tweet_id,
    ranked_likes.text,
    ranked_likes.retweet_count,
    ranked_likes.reply_count,
    ranked_likes.like_count,
    ranked_likes.quote_count,
    ranked_likes.bookmark_count,
    ranked_likes.impression_count,
    ranked_likes.author_id,
    ranked_likes.author_username,
    ranked_likes.account,
    ranked_likes.created_at,
    ranked_likes.uploaded_at
FROM ranked_likes
WHERE (ranked_likes.rn = 1);
ALTER VIEW public.view_our_twitter_likes OWNER TO postgres;
--
-- Name: view_total_social_and_affection_score; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.view_total_social_and_affection_score AS
SELECT u.id,
    u.wallet,
    u.twitter_id,
    u.twitter_username,
    u.telegram_id,
    u.telegram_username,
    u.provisioned_wallet,
    u.email,
    COALESCE(u.score, (0)::bigint) AS affection_score,
    COALESCE(e.total_engagement_points, 0) AS social_score,
    (COALESCE(e.total_engagement_points, 0) + u.score) AS total_score,
    u.points_per_tap,
    u.points_per_hour,
    u.tap_upgrades,
    u.energy_upgrades,
    u.hourly_upgrades,
    u.max_energy,
    u.energy_left,
    u.referral,
    u.referral_code,
    u.energy_timestamp,
    u.connected_time,
    u.created_at
FROM (
        public.wtf_users u
        LEFT JOIN public.twitter_engagement_score e ON (
            (
                lower(u.twitter_username) = lower(e.profile_screen_name)
            )
        )
    )
ORDER BY (COALESCE(e.total_engagement_points, 0) + u.score) DESC NULLS LAST;
ALTER VIEW public.view_total_social_and_affection_score OWNER TO postgres;
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
ALTER VIEW public.view_tweet_stats OWNER TO postgres;
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
-- Name: workflow_duplicate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workflow_duplicate (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    "flowData" text,
    deployed boolean,
    "shortId" character varying,
    "createdDate" timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text),
    "updatedDate" timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text)
);
ALTER TABLE public.workflow_duplicate OWNER TO postgres;
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
    cron_id text,
    locked boolean DEFAULT false
);
ALTER TABLE public.workflows OWNER TO postgres;
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
-- Name: wtf_mini_date_upgrades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wtf_mini_date_upgrades (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid,
    date1 smallint DEFAULT '0'::smallint,
    date2 smallint DEFAULT '0'::smallint,
    date3 smallint DEFAULT '0'::smallint,
    date4 smallint DEFAULT '0'::smallint,
    date5 smallint DEFAULT '0'::smallint,
    date6 smallint DEFAULT '0'::smallint
);
ALTER TABLE public.wtf_mini_date_upgrades OWNER TO postgres;
--
-- Name: wtf_mini_date_upgrades_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.wtf_mini_date_upgrades
ALTER COLUMN id
ADD GENERATED BY DEFAULT AS IDENTITY (
        SEQUENCE NAME public.wtf_mini_date_upgrades_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1
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
ALTER SEQUENCE public.wtf_player_customizations_weapon_id_seq OWNER TO postgres;
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
ALTER SEQUENCE public.wtf_players_id_seq OWNER TO postgres;
--
-- Name: wtf_players_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.wtf_players_id_seq OWNED BY public.wtf_players_eth_denver.id;
--
-- Name: wtf_portal_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.wtf_portal_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.wtf_portal_id_seq OWNER TO postgres;
--
-- Name: wtf_portal; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wtf_portal (
    id integer DEFAULT nextval('public.wtf_portal_id_seq'::regclass) NOT NULL,
    wallet_address text,
    created_at date
);
ALTER TABLE public.wtf_portal OWNER TO postgres;
--
-- Name: wtf_referral; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wtf_referral (
    telegram_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    referral text,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);
ALTER TABLE public.wtf_referral OWNER TO postgres;
--
-- Name: wtf_steam_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wtf_steam_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    last_login timestamp with time zone,
    steam_id text NOT NULL,
    steam_username text,
    num_clicks bigint DEFAULT '0'::bigint,
    selected_item_template_id bigint,
    provisioned_wallet text
);
ALTER TABLE public.wtf_steam_users OWNER TO postgres;
--
-- Name: wtf_steam_waifus_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.wtf_steam_templates
ALTER COLUMN id
ADD GENERATED BY DEFAULT AS IDENTITY (
        SEQUENCE NAME public.wtf_steam_waifus_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1
    );
--
-- Name: wtf_subscribers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wtf_subscribers (
    email text NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created timestamp with time zone DEFAULT now(),
    wallet text,
    twitter text
);
ALTER TABLE public.wtf_subscribers OWNER TO postgres;
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
ALTER SEQUENCE public.wtf_transactions_id_seq OWNER TO postgres;
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
-- Name: kristof_test id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kristof_test
ALTER COLUMN id
SET DEFAULT nextval('public.kristof_test_id_seq'::regclass);
--
-- Name: liked_tweets_engagement id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.liked_tweets_engagement
ALTER COLUMN id
SET DEFAULT nextval(
        'public.liked_tweets_engagement_id_seq'::regclass
    );
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
-- Name: our_twitter_likes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.our_twitter_likes
ALTER COLUMN id
SET DEFAULT nextval('public.our_twitter_likes_id_seq'::regclass);
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
-- Name: _wtf_player_match_history _wtf_player_match_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._wtf_player_match_history
ADD CONSTRAINT _wtf_player_match_history_pkey PRIMARY KEY (player_id, match_history_id);
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
-- Name: clicker-signup-users clicker-signup-users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."clicker-signup-users"
ADD CONSTRAINT "clicker-signup-users_pkey" PRIMARY KEY (id);
--
-- Name: clicker-signup-users clicker-signup-users_tg_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."clicker-signup-users"
ADD CONSTRAINT "clicker-signup-users_tg_id_key" UNIQUE (tg_id);
--
-- Name: clicker-signup-users clicker-signup-users_twitter_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."clicker-signup-users"
ADD CONSTRAINT "clicker-signup-users_twitter_id_key" UNIQUE (twitter_id);
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
-- Name: liked_tweets_engagement liked_tweets_engagement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.liked_tweets_engagement
ADD CONSTRAINT liked_tweets_engagement_pkey PRIMARY KEY (id);
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
-- Name: mud_worlds mud_worlds_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mud_worlds
ADD CONSTRAINT mud_worlds_pkey PRIMARY KEY (id);
--
-- Name: our_twitter_likes our_twitter_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.our_twitter_likes
ADD CONSTRAINT our_twitter_likes_pkey PRIMARY KEY (id);
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
-- Name: trigger_functions trigger_functions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trigger_functions
ADD CONSTRAINT trigger_functions_pkey PRIMARY KEY (id);
--
-- Name: triggers triggers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.triggers
ADD CONSTRAINT triggers_pkey PRIMARY KEY (id);
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
-- Name: twitter_followers_tmp twitter_followers_tmp_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.twitter_followers_tmp
ADD CONSTRAINT twitter_followers_tmp_pkey PRIMARY KEY (id);
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
-- Name: liked_tweets_engagement unique_tweet_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.liked_tweets_engagement
ADD CONSTRAINT unique_tweet_id UNIQUE (tweet_id);
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
-- Name: workflow_duplicate workflow_duplicate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflow_duplicate
ADD CONSTRAINT workflow_duplicate_pkey PRIMARY KEY (id);
--
-- Name: workflows workflows_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workflows
ADD CONSTRAINT workflows_pkey PRIMARY KEY (id);
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
-- Name: _wtf_match_history wtf_match_history_pkey1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._wtf_match_history
ADD CONSTRAINT wtf_match_history_pkey1 PRIMARY KEY (id);
--
-- Name: wtf_mini_date_upgrades wtf_mini_date_upgrades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_mini_date_upgrades
ADD CONSTRAINT wtf_mini_date_upgrades_pkey PRIMARY KEY (id);
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
-- Name: _wtf_player_total_stats wtf_player_total_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._wtf_player_total_stats
ADD CONSTRAINT wtf_player_total_stats_pkey PRIMARY KEY (id);
--
-- Name: _wtf_player_total_stats wtf_player_total_stats_player_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._wtf_player_total_stats
ADD CONSTRAINT wtf_player_total_stats_player_key UNIQUE (player_id);
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
-- Name: _wtf_players wtf_players_pkey2; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._wtf_players
ADD CONSTRAINT wtf_players_pkey2 PRIMARY KEY (id);
--
-- Name: wtf_portal wtf_portal_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_portal
ADD CONSTRAINT wtf_portal_pkey PRIMARY KEY (id);
--
-- Name: wtf_referral wtf_referral_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_referral
ADD CONSTRAINT wtf_referral_pkey PRIMARY KEY (id);
--
-- Name: wtf_steam_user_item wtf_steam_user_item_item_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_steam_user_item
ADD CONSTRAINT wtf_steam_user_item_item_id_key UNIQUE (item_id);
--
-- Name: wtf_steam_user_item wtf_steam_user_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_steam_user_item
ADD CONSTRAINT wtf_steam_user_item_pkey PRIMARY KEY (item_id, steam_id);
--
-- Name: wtf_steam_users wtf_steam_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_steam_users
ADD CONSTRAINT wtf_steam_users_pkey PRIMARY KEY (id);
--
-- Name: wtf_steam_users wtf_steam_users_steam_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_steam_users
ADD CONSTRAINT wtf_steam_users_steam_id_key UNIQUE (steam_id);
--
-- Name: wtf_steam_templates wtf_steam_waifus_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_steam_templates
ADD CONSTRAINT wtf_steam_waifus_pkey PRIMARY KEY (id);
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
-- Name: idx_liked_tweets_engagement_account; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_liked_tweets_engagement_account ON public.liked_tweets_engagement USING btree (account);
--
-- Name: idx_our_twitter_likes_author_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_our_twitter_likes_author_id ON public.our_twitter_likes USING btree (author_id);
--
-- Name: idx_our_twitter_likes_tweet_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_our_twitter_likes_tweet_id ON public.our_twitter_likes USING btree (tweet_id);
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
-- Name: ix_our_twitter_likes_account; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_our_twitter_likes_account ON public.our_twitter_likes USING btree (account);
--
-- Name: user_inventory_summary _RETURN; Type: RULE; Schema: public; Owner: postgres
--

CREATE OR REPLACE VIEW public.user_inventory_summary AS
SELECT u.id AS user_id,
    u.provisioned_wallet,
    sum(
        CASE
            WHEN (
                (i.item_id = 1)
                AND i.status
            ) THEN i.quantity
            ELSE (0)::bigint
        END
    ) AS item_1_quantity,
    sum(
        CASE
            WHEN (
                (i.item_id = 2)
                AND i.status
            ) THEN i.quantity
            ELSE (0)::bigint
        END
    ) AS item_2_quantity,
    sum(
        CASE
            WHEN (
                (i.item_id = 3)
                AND i.status
            ) THEN i.quantity
            ELSE (0)::bigint
        END
    ) AS item_3_quantity,
    sum(
        CASE
            WHEN (
                (i.item_id = 4)
                AND i.status
            ) THEN i.quantity
            ELSE (0)::bigint
        END
    ) AS item_4_quantity,
    sum(
        CASE
            WHEN (
                (i.item_id = 5)
                AND i.status
            ) THEN i.quantity
            ELSE (0)::bigint
        END
    ) AS item_5_quantity,
    sum(
        CASE
            WHEN (
                (i.item_id = 6)
                AND i.status
            ) THEN i.quantity
            ELSE (0)::bigint
        END
    ) AS item_6_quantity
FROM (
        public.wtf_users u
        JOIN public.wtf_user_inventory i ON ((u.id = i.user_id))
    )
GROUP BY u.id;
--
-- Name: cron_logs dp01pa3f; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER dp01pa3f
AFTER
INSERT ON public.cron_logs FOR EACH ROW EXECUTE FUNCTION public.notify_event();
--
-- Name: _wtf_match_history end_match; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER end_match BEFORE
UPDATE ON public._wtf_match_history FOR EACH STATEMENT EXECUTE FUNCTION public.end_match();
--
-- Name: wtf_users omt6a5mx; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER omt6a5mx
AFTER
INSERT ON public.wtf_users FOR EACH ROW EXECUTE FUNCTION public.notify_event();
--
-- Name: wtf_users set_referral_code; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_referral_code BEFORE
INSERT ON public.wtf_users FOR EACH ROW EXECUTE FUNCTION public.generate_referral_code();
--
-- Name: liked_tweets_engagement update_liked_tweets_engagement_score_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_liked_tweets_engagement_score_trigger BEFORE
UPDATE ON public.liked_tweets_engagement FOR EACH ROW
    WHEN (
        (
            (
                old.current_like_count IS DISTINCT
                FROM new.current_like_count
            )
            OR (
                old.current_retweet_count IS DISTINCT
                FROM new.current_retweet_count
            )
        )
    ) EXECUTE FUNCTION public.update_liked_tweets_engagement_score();
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
-- Name: twitter_followers_tmp upsert_twitter_follower_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER upsert_twitter_follower_trigger
AFTER
INSERT ON public.twitter_followers_tmp FOR EACH ROW EXECUTE FUNCTION public.upsert_twitter_follower();
--
-- Name: _wtf_player_match_history _wtf_player_match_history_match_history_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._wtf_player_match_history
ADD CONSTRAINT _wtf_player_match_history_match_history_id_fkey FOREIGN KEY (match_history_id) REFERENCES public._wtf_match_history(id);
--
-- Name: _wtf_player_match_history _wtf_player_match_history_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._wtf_player_match_history
ADD CONSTRAINT _wtf_player_match_history_player_id_fkey FOREIGN KEY (player_id) REFERENCES public._wtf_players(id);
--
-- Name: _wtf_player_total_stats _wtf_player_total_stats_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._wtf_player_total_stats
ADD CONSTRAINT _wtf_player_total_stats_player_id_fkey FOREIGN KEY (player_id) REFERENCES public._wtf_players(id);
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
-- Name: wtf_steam_user_item wtf_steam_user_item_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_steam_user_item
ADD CONSTRAINT wtf_steam_user_item_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.wtf_steam_templates(id);
--
-- Name: wtf_steam_users wtf_steam_users_selected_waifu_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_steam_users
ADD CONSTRAINT wtf_steam_users_selected_waifu_id_fkey1 FOREIGN KEY (selected_item_template_id) REFERENCES public.wtf_steam_templates(id);
--
-- Name: wtf_steam_user_item wtf_steam_users_waifu_steam_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wtf_steam_user_item
ADD CONSTRAINT wtf_steam_users_waifu_steam_id_fkey FOREIGN KEY (steam_id) REFERENCES public.wtf_steam_users(steam_id) ON UPDATE CASCADE ON DELETE CASCADE;
--
-- Name: auction_listings Enable read access for all users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable read access for all users" ON public.auction_listings FOR
SELECT USING (true);
--
-- Name: _wtf_player_match_history; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public._wtf_player_match_history ENABLE ROW LEVEL SECURITY;
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
-- Name: mud_worlds; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.mud_worlds ENABLE ROW LEVEL SECURITY;
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
-- Name: wtf_mini_date_upgrades; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.wtf_mini_date_upgrades ENABLE ROW LEVEL SECURITY;
--
-- Name: wtf_steam_templates; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.wtf_steam_templates ENABLE ROW LEVEL SECURITY;
--
-- Name: wtf_steam_user_item; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.wtf_steam_user_item ENABLE ROW LEVEL SECURITY;
--
-- Name: wtf_subscribers; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.wtf_subscribers ENABLE ROW LEVEL SECURITY;
--
-- Name: wtf_tx; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.wtf_tx ENABLE ROW LEVEL SECURITY;
--
-- Name: wtf_user_inventory; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.wtf_user_inventory ENABLE ROW LEVEL SECURITY;
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
-- Data for Name: wtf_steam_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--
COPY public.wtf_steam_templates (id, created_at, model_url, thumbnail_url, name) FROM stdin;
1	2024-07-24 12:15:44.941696+00	koko.vrm	https://dlbdmxiemnqhmmtcdcxw.supabase.co/storage/v1/object/sign/waifu_thumbnails/koko.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJ3YWlmdV90aHVtYm5haWxzL2tva28ucG5nIiwiaWF0IjoxNzIxODIzMjQ3LCJleHAiOjE3NTMzNTkyNDd9.sybWMAWGzAywBNugWCauxd4imfPhC2HBH3MadDQ2J4g&t=2024-07-24T12%3A14%3A07.262Z	koko
2	2024-07-24 12:16:15.164655+00	stacy.vrm	https://dlbdmxiemnqhmmtcdcxw.supabase.co/storage/v1/object/sign/waifu_thumbnails/stacy.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJ3YWlmdV90aHVtYm5haWxzL3N0YWN5LnBuZyIsImlhdCI6MTcyMTgyMzM2MywiZXhwIjoxNzUzMzU5MzYzfQ.KQFpKqFOXyZqOxz9On3EB2_uEPuw0N01f7VlTnXj9Bc&t=2024-07-24T12%3A16%3A03.690Z	stacy
\.

--
-- PostgreSQL database dump complete
--