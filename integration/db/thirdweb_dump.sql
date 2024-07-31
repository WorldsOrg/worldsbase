--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3 (Debian 16.3-1.pgdg120+1)
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

--
-- Name: notify_configuration_insert(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.notify_configuration_insert() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  PERFORM pg_notify('new_configuration_data', row_to_json(NEW)::text);
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.notify_configuration_insert() OWNER TO postgres;

--
-- Name: notify_configuration_update(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.notify_configuration_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  PERFORM pg_notify('updated_configuration_data', json_build_object(
      'id', NEW.id
  )::text);
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.notify_configuration_update() OWNER TO postgres;

--
-- Name: notify_transactions_insert(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.notify_transactions_insert() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  PERFORM pg_notify('new_transaction_data', json_build_object(
      'id', NEW.id
  )::text);
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.notify_transactions_insert() OWNER TO postgres;

--
-- Name: notify_transactions_update(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.notify_transactions_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  PERFORM pg_notify('updated_transaction_data', json_build_object(
      'id', NEW.id
  )::text);
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.notify_transactions_update() OWNER TO postgres;

--
-- Name: notify_webhooks_insert(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.notify_webhooks_insert() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  PERFORM pg_notify('new_webhook_data', row_to_json(NEW)::text);
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.notify_webhooks_insert() OWNER TO postgres;

--
-- Name: notify_webhooks_update(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.notify_webhooks_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  PERFORM pg_notify('updated_webhook_data', json_build_object(
      'id', NEW.id
  )::text);
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.notify_webhooks_update() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: chain_indexers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chain_indexers (
    "chainId" integer NOT NULL,
    "lastIndexedBlock" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.chain_indexers OWNER TO postgres;

--
-- Name: configuration; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.configuration (
    id text DEFAULT 'default'::text NOT NULL,
    "minTxsToProcess" integer NOT NULL,
    "maxTxsToProcess" integer NOT NULL,
    "minedTxsCronSchedule" text,
    "maxTxsToUpdate" integer NOT NULL,
    "retryTxsCronSchedule" text,
    "minEllapsedBlocksBeforeRetry" integer NOT NULL,
    "maxFeePerGasForRetries" text NOT NULL,
    "maxPriorityFeePerGasForRetries" text NOT NULL,
    "maxRetriesPerTx" integer NOT NULL,
    "awsAccessKeyId" text,
    "awsRegion" text,
    "awsSecretAccessKey" text,
    "gcpApplicationCredentialEmail" text,
    "gcpApplicationCredentialPrivateKey" text,
    "gcpApplicationProjectId" text,
    "gcpKmsKeyRingId" text,
    "gcpKmsLocationId" text,
    "chainOverrides" text,
    "webhookAuthBearerToken" text,
    "webhookUrl" text,
    "authDomain" text DEFAULT ''::text NOT NULL,
    "authWalletEncryptedJson" text DEFAULT ''::text NOT NULL,
    "minWalletBalance" text DEFAULT '20000000000000000'::text NOT NULL,
    "accessControlAllowOrigin" text DEFAULT 'https://thirdweb.com,https://embed.ipfscdn.io'::text NOT NULL,
    "clearCacheCronSchedule" text DEFAULT '*/30 * * * * *'::text NOT NULL,
    "cursorDelaySeconds" integer DEFAULT 2 NOT NULL,
    "indexerListenerCronSchedule" text,
    "maxBlocksToIndex" integer DEFAULT 25 NOT NULL,
    "contractSubscriptionsRetryDelaySeconds" text DEFAULT '10'::text NOT NULL
);


ALTER TABLE public.configuration OWNER TO postgres;

--
-- Name: contract_event_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contract_event_logs (
    "chainId" integer NOT NULL,
    "blockNumber" integer NOT NULL,
    "contractAddress" text NOT NULL,
    "transactionHash" text NOT NULL,
    topic0 text,
    topic1 text,
    topic2 text,
    topic3 text,
    data text NOT NULL,
    "eventName" text,
    "decodedLog" jsonb,
    "timestamp" timestamp(3) without time zone NOT NULL,
    "transactionIndex" integer NOT NULL,
    "logIndex" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.contract_event_logs OWNER TO postgres;

--
-- Name: contract_subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contract_subscriptions (
    id text NOT NULL,
    "chainId" integer NOT NULL,
    "contractAddress" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "webhookId" integer
);


ALTER TABLE public.contract_subscriptions OWNER TO postgres;

--
-- Name: contract_transaction_receipts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contract_transaction_receipts (
    "chainId" integer NOT NULL,
    "blockNumber" integer NOT NULL,
    "contractAddress" text NOT NULL,
    "contractId" text NOT NULL,
    "transactionHash" text NOT NULL,
    "blockHash" text NOT NULL,
    "timestamp" timestamp(3) without time zone NOT NULL,
    data text NOT NULL,
    "to" text NOT NULL,
    "from" text NOT NULL,
    value text NOT NULL,
    "transactionIndex" integer NOT NULL,
    "gasUsed" text NOT NULL,
    "effectiveGasPrice" text NOT NULL,
    status integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.contract_transaction_receipts OWNER TO postgres;

--
-- Name: keypairs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.keypairs (
    hash text NOT NULL,
    "publicKey" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    algorithm text NOT NULL,
    label text,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.keypairs OWNER TO postgres;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    "walletAddress" text NOT NULL,
    permissions text NOT NULL,
    label text
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: relayers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.relayers (
    id text NOT NULL,
    name text,
    "chainId" text NOT NULL,
    "backendWalletAddress" text NOT NULL,
    "allowedContracts" text,
    "allowedForwarders" text
);


ALTER TABLE public.relayers OWNER TO postgres;

--
-- Name: tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tokens (
    id text NOT NULL,
    "tokenMask" text NOT NULL,
    "walletAddress" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "revokedAt" timestamp(3) without time zone,
    "isAccessToken" boolean NOT NULL,
    label text
);


ALTER TABLE public.tokens OWNER TO postgres;

--
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id text NOT NULL,
    "chainId" text NOT NULL,
    "fromAddress" text,
    "toAddress" text,
    data text,
    value text,
    nonce integer,
    "gasLimit" text,
    "gasPrice" text,
    "maxFeePerGas" text,
    "maxPriorityFeePerGas" text,
    "transactionType" integer,
    "transactionHash" text,
    "functionName" text,
    "functionArgs" text,
    extension text,
    "deployedContractAddress" text,
    "deployedContractType" text,
    "queuedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "processedAt" timestamp(3) without time zone,
    "sentAt" timestamp(3) without time zone,
    "minedAt" timestamp(3) without time zone,
    "retryCount" integer DEFAULT 0 NOT NULL,
    "retryGasValues" boolean DEFAULT false,
    "retryMaxPriorityFeePerGas" text,
    "retryMaxFeePerGas" text,
    "errorMessage" text,
    "sentAtBlockNumber" integer,
    "blockNumber" integer,
    "accountAddress" text,
    "callData" text,
    "callGasLimit" text,
    "initCode" text,
    "paymasterAndData" text,
    "preVerificationGas" text,
    sender text,
    "signerAddress" text,
    target text,
    "userOpHash" text,
    "verificationGasLimit" text,
    "cancelledAt" timestamp(3) without time zone,
    "onChainTxStatus" integer,
    "groupId" text,
    "idempotencyKey" text DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- Name: wallet_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wallet_details (
    address text NOT NULL,
    type text NOT NULL,
    "awsKmsKeyId" text,
    "awsKmsArn" text,
    "gcpKmsKeyRingId" character varying(50),
    "gcpKmsKeyId" character varying(50),
    "gcpKmsKeyVersionId" character varying(20),
    "gcpKmsLocationId" character varying(20),
    "gcpKmsResourcePath" text,
    "encryptedJson" text,
    label text
);


ALTER TABLE public.wallet_details OWNER TO postgres;

--
-- Name: wallet_nonce; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wallet_nonce (
    address text NOT NULL,
    "chainId" text NOT NULL,
    nonce integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.wallet_nonce OWNER TO postgres;

--
-- Name: webhooks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.webhooks (
    id integer NOT NULL,
    name text,
    url text NOT NULL,
    secret text NOT NULL,
    "evenType" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "revokedAt" timestamp(3) without time zone
);


ALTER TABLE public.webhooks OWNER TO postgres;

--
-- Name: webhooks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.webhooks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.webhooks_id_seq OWNER TO postgres;

--
-- Name: webhooks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.webhooks_id_seq OWNED BY public.webhooks.id;


--
-- Name: webhooks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.webhooks ALTER COLUMN id SET DEFAULT nextval('public.webhooks_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
9717a56a-5471-42c6-9852-154639e9f28d	fb60ef05c2e1387218eb379f1edefe0713b94dc69a15cb6dd8e7dae558eb465e	2024-06-07 18:48:50.573224+00	20231018202048_auth	\N	\N	2024-06-07 18:48:50.567893+00	1
e7c6ff17-f31d-4ca2-93f3-9a631ca4bf52	a977d002c8f781f102fdc79d12bc96b1064de01e71a441d4abd74bdc010e17b3	2024-06-07 18:48:50.436375+00	20230913025746_init	\N	\N	2024-06-07 18:48:50.407594+00	1
bbf8ff8a-a206-47e7-9365-c4c64da916e3	bd09cae0cdea50a5ed8ac7de11c087a9c2adff3488f8a66bf5759a981c745e89	2024-06-07 18:48:50.444355+00	20230913061811_triggers	\N	\N	2024-06-07 18:48:50.438114+00	1
94606617-45e1-4855-b815-5976d7a054eb	8e01c285f0e9de828a808cb5e26c7fd2229ce167271e693eee43a971a1575309	2024-06-07 18:48:50.803811+00	20240323005129_add_idempotency_key_backward_compatible	\N	\N	2024-06-07 18:48:50.785807+00	1
9a7e1779-6cb2-44d6-b405-5773f500d231	79efbb67a4d3891e8d80d48017ea728c7eace3e0068886ea8b33d202acb2e4ad	2024-06-07 18:48:50.453031+00	20230922090743_user_ops	\N	\N	2024-06-07 18:48:50.446258+00	1
de1e9d50-fc76-477b-bc3e-2c3fcf80a1b5	2b1fc115240476ce93a8d340cf677c10159e2cf64a96b5dee60625eb5492434c	2024-06-07 18:48:50.584344+00	20231018202837_one_config	\N	\N	2024-06-07 18:48:50.574909+00	1
4fd85570-b247-4c9f-a26b-16730509bd68	237485c2107d79020460f68b58095afd4dbe0c5fe2ecd4c283a87f6ad7674fc9	2024-06-07 18:48:50.468271+00	20230926004337_update_user_ops	\N	\N	2024-06-07 18:48:50.45495+00	1
282c8b8e-be59-4ba2-b1e6-3d6b477e1853	6054bacdd6bdfa202e1d3ee70d3b0e7f6bad702b1008c1260cfef4019ed4b012	2024-06-07 18:48:50.474599+00	20230927004337_transactions_cancelled_at_added	\N	\N	2024-06-07 18:48:50.469829+00	1
c3fa895a-4f75-4d74-a7c8-c223dd28bfe9	96e128830850b33b0fe34851139b03843b6bc4c4e8a63c56e98f29a2c6cbd8a6	2024-06-07 18:48:50.679253+00	20231226100100_webhook_config_triggers	\N	\N	2024-06-07 18:48:50.670197+00	1
2a59ca10-af88-431d-8936-5f3587a19da6	2864c77304ab2d8900c216df7c51892cd24386dbd526c36790315a9d4f197eb7	2024-06-07 18:48:50.483872+00	20230927221952_trigger_upd	\N	\N	2024-06-07 18:48:50.476287+00	1
98190a53-45af-4ecb-962d-5f9603c32a82	38d5f7c4c8e12058cc7a92dfa746d30480745979673247f6e5f1e2ef9c40fe78	2024-06-07 18:48:50.605636+00	20231019225104_auth_tokens	\N	\N	2024-06-07 18:48:50.586191+00	1
a077dfd4-b540-4c20-ac8d-b382bf546a66	f53687278dda81b00f24a87a3ff5249c98120de2c70ff1ebe05324d635cb2aec	2024-06-07 18:48:50.497585+00	20230929175313_cancelled_tx_table	\N	\N	2024-06-07 18:48:50.485522+00	1
080dc961-a45e-494d-8243-2f016fbbc2c4	214a6e9e6c218acd80834d052bd3b6420b02c96f49746fb836842d00b6d48901	2024-06-07 18:48:50.506386+00	20231003223429_encrypted_json	\N	\N	2024-06-07 18:48:50.499242+00	1
53035e1b-1d24-4e5c-b345-b80096a0f70c	eef55d9be487c469b81900c9b568327ec6b13e3c5dbcca666343427c28ae0f10	2024-06-07 18:48:50.516319+00	20231010225604_remove_cancelled_txs	\N	\N	2024-06-07 18:48:50.50816+00	1
d1a6e768-1583-44b4-93bb-0b907432f642	fcafac8de912865d3f7d0535edf1ceee77941db4ea6dccf442b687d04a3da37e	2024-06-07 18:48:50.623484+00	20231021091418_webhooks_tbl_config_update	\N	\N	2024-06-07 18:48:50.607465+00	1
ebbf47a5-c782-4826-9e06-0c1170090498	eda5edec586e3f0f2a45681c0d0cb678f5d0490e324371306fe0cacef1115211	2024-06-07 18:48:50.530101+00	20231016220744_configuration	\N	\N	2024-06-07 18:48:50.518075+00	1
a585ef0e-4bb5-4c8c-a9db-4130fd2bef4c	8aec6c0ee003797ce13e301fe4b7fa29fbd39f7b5c2030ef5afd730997a2d626	2024-06-07 18:48:50.537472+00	20231016225111_wallets_configuration	\N	\N	2024-06-07 18:48:50.532133+00	1
5b43f188-e708-4f2c-ba83-40c519a070dd	dd6c56ba82bffca08c3b06f999b96ac092fef2021479b40bb72660a0b2f97da7	2024-06-07 18:48:50.559952+00	20231016235340_chain_id_string	\N	\N	2024-06-07 18:48:50.539161+00	1
232f2beb-74e8-4755-bc1e-68d8765c2df8	60cc317c06ae1f1d2eb3caf525713df7d61fbb9e447d470111be9eb54a7c0cd6	2024-06-07 18:48:50.631042+00	20231025193415_labels	\N	\N	2024-06-07 18:48:50.625309+00	1
91343b92-2d1e-4973-844a-4f7bfa915942	1b0f21b2db2ef6d98ff0595b48318e95b2fe8bb15603fc7025ab0bfe034a2e8e	2024-06-07 18:48:50.566311+00	20231017214123_webhook_config	\N	\N	2024-06-07 18:48:50.561402+00	1
42046e65-5799-4318-b8b0-b4330dcae532	6510972eff68e8123d4b3cdb0409c1146fca6ec719bf6bcee445b5d5107e3dff	2024-06-07 18:48:50.686513+00	20240110194551_cors_to_configurations	\N	\N	2024-06-07 18:48:50.681114+00	1
d9aceaa4-32cb-40e4-97f0-ffc2951f2ae3	32671130697452ea9ae877fa6597322913bae1da7cd466887488431f1c6aa0aa	2024-06-07 18:48:50.644605+00	20231105235957_relayers	\N	\N	2024-06-07 18:48:50.632857+00	1
e90221dd-6e26-48cc-b9cb-94c4f9e6b302	100aba24f403e30c5b01a8f0b0c8dcbeea875fd3e6498cc36f9c3e13ea3a1c61	2024-06-07 18:48:50.65162+00	20231114220310_relayer_forwarders	\N	\N	2024-06-07 18:48:50.64632+00	1
a2abe5eb-accf-4e47-b204-df5b77b32e7e	e528a9c774e847f40f155f099a392e5dee90bb23d4fe368643ec8c548ca471d8	2024-06-07 18:48:50.693181+00	20240116172315_clear_cache_cron_to_config	\N	\N	2024-06-07 18:48:50.688023+00	1
b1f9872c-a1f6-47d1-a57d-932151bf3be9	6ea0d3eabbecc8294e75be47e41d3901d0d8024e177eb93fd1a48125d34d9c71	2024-06-07 18:48:50.660758+00	20231123064817_added_onchain_status_flag_to_tx	\N	\N	2024-06-07 18:48:50.653217+00	1
c317dd61-4020-43d1-b16f-b61808ea270e	5d4c1c8ae05b6cbef460aabb620f240b9e3a28789e180d25985746d7d8425db9	2024-06-07 18:48:50.668226+00	20231203024522_groups	\N	\N	2024-06-07 18:48:50.662535+00	1
59890ca1-b3a1-484c-b88e-ad1520305d1a	8485deb2f280699e314915356147ef28d8a1e29e4a7364835f0a06f837383cb3	2024-06-07 18:48:50.820478+00	20240327202800_add_keypairs	\N	\N	2024-06-07 18:48:50.805839+00	1
d6268ad3-6bb8-4818-a0b9-57524112f758	a4d9e496ba62645bfbb70a00d053257fe4d7749a64185038e91036487ace30e3	2024-06-07 18:48:50.758152+00	20240229013311_add_contract_event_subscriptions	\N	\N	2024-06-07 18:48:50.694849+00	1
de52c5e0-6e63-40fb-b393-b8591d8fbb24	e9ccdba88e655cda9c38ffcae682e5820624294d6f2868e53ad07a988e4d5e7d	2024-06-07 18:48:50.783846+00	20240313203128_add_transaction_receipts	\N	\N	2024-06-07 18:48:50.760093+00	1
97c393f3-8368-4b79-85eb-03a52d3500d9	cef998b0aae3496eb6a5552d8ed6d1f161b34cd886579afaddacd40d404b0578	2024-06-07 18:48:50.843349+00	20240510023239_add_webhook_id	\N	\N	2024-06-07 18:48:50.837056+00	1
340c67dc-cddb-483e-9202-ed9c4d5fe211	a5f0892f15e237b31d8b4ff2efa6393e01d6d9b5f5792288e84186b898f4bdd3	2024-06-07 18:48:50.827746+00	20240410015450_add_keypair_algorithm	\N	\N	2024-06-07 18:48:50.822343+00	1
a58f3dcc-dcb7-41a5-aa7c-51ced5dab606	40638302043bd22a46516a29791cfaf44094c06c0b5c6f21d259d929d317fd55	2024-06-07 18:48:50.861913+00	20240513204722_add_contract_sub_retry_delay_to_config	\N	\N	2024-06-07 18:48:50.856126+00	1
3ce26e6c-c05e-4853-924a-99d9403b37de	c0361aa66d9f351d5fbbc8e97566a2d86db8b78063c4108ba8db4a50aa9c831a	2024-06-07 18:48:50.835149+00	20240411235927_add_keypair_label	\N	\N	2024-06-07 18:48:50.829497+00	1
9d8fd2e5-571c-45d4-a5b3-9f041eb05df4	7ace290fd9082e5c48f8c9809c7bce0dd77e877f9d133df65014a9328eeb40fe	2024-06-07 18:48:50.851909+00	20240511011737_set_on_delete_set_null	\N	\N	2024-06-07 18:48:50.845219+00	1
\.


--
-- Data for Name: chain_indexers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chain_indexers ("chainId", "lastIndexedBlock", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: configuration; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.configuration (id, "minTxsToProcess", "maxTxsToProcess", "minedTxsCronSchedule", "maxTxsToUpdate", "retryTxsCronSchedule", "minEllapsedBlocksBeforeRetry", "maxFeePerGasForRetries", "maxPriorityFeePerGasForRetries", "maxRetriesPerTx", "awsAccessKeyId", "awsRegion", "awsSecretAccessKey", "gcpApplicationCredentialEmail", "gcpApplicationCredentialPrivateKey", "gcpApplicationProjectId", "gcpKmsKeyRingId", "gcpKmsLocationId", "chainOverrides", "webhookAuthBearerToken", "webhookUrl", "authDomain", "authWalletEncryptedJson", "minWalletBalance", "accessControlAllowOrigin", "clearCacheCronSchedule", "cursorDelaySeconds", "indexerListenerCronSchedule", "maxBlocksToIndex", "contractSubscriptionsRetryDelaySeconds") FROM stdin;
default	1	30	*/5 * * * * *	50	*/15 * * * * *	12	10000000000000	10000000000000	3	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	thirdweb.com	{"address":"e4c45c6d1552818bc0541eac257cd6e6bcf1eac8","id":"f2c5a9e2-6b23-43bf-9526-6488e49123ad","version":3,"crypto":{"cipher":"aes-128-ctr","cipherparams":{"iv":"243b35bf9cfdba11e9b109efdef367dc"},"ciphertext":"88b3141c07577718b2039c148d5ada427fbee4ee85c7a9a5dc94e168bf0c874d","kdf":"scrypt","kdfparams":{"salt":"79dfcee933602456fd72cbd06465a6ef78d7e881ef35d41034d833fc866a5d86","n":1,"dklen":32,"p":1,"r":8},"mac":"1b4e331a1fc182fff85fbe67bab5a2e1ac3c9a1810b5c266555a87ed8fef8cf6"}}	20000000000000000	https://thirdweb.com,https://embed.ipfscdn.io	*/30 * * * * *	2	*/5 * * * * *	25	10
\.


--
-- Data for Name: contract_event_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contract_event_logs ("chainId", "blockNumber", "contractAddress", "transactionHash", topic0, topic1, topic2, topic3, data, "eventName", "decodedLog", "timestamp", "transactionIndex", "logIndex", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: contract_subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contract_subscriptions (id, "chainId", "contractAddress", "createdAt", "updatedAt", "deletedAt", "webhookId") FROM stdin;
\.


--
-- Data for Name: contract_transaction_receipts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contract_transaction_receipts ("chainId", "blockNumber", "contractAddress", "contractId", "transactionHash", "blockHash", "timestamp", data, "to", "from", value, "transactionIndex", "gasUsed", "effectiveGasPrice", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: keypairs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.keypairs (hash, "publicKey", "createdAt", algorithm, label, "updatedAt") FROM stdin;
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions ("walletAddress", permissions, label) FROM stdin;
0x08eeb885aff95a31971ae323fb554ed397e5a63b	ADMIN	\N
\.


--
-- Data for Name: relayers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.relayers (id, name, "chainId", "backendWalletAddress", "allowedContracts", "allowedForwarders") FROM stdin;
\.


--
-- Data for Name: tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tokens (id, "tokenMask", "walletAddress", "createdAt", "expiresAt", "revokedAt", "isAccessToken", label) FROM stdin;
f2abcf5e-28fc-4aa6-b0ad-50acd91d303a	eyJhbGciOi...E2MmJkMzFi	0x08eEB885AfF95a31971ae323FB554ed397E5a63B	2024-06-07 19:08:45.895	2124-05-14 19:08:45	\N	t	\N
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transactions (id, "chainId", "fromAddress", "toAddress", data, value, nonce, "gasLimit", "gasPrice", "maxFeePerGas", "maxPriorityFeePerGas", "transactionType", "transactionHash", "functionName", "functionArgs", extension, "deployedContractAddress", "deployedContractType", "queuedAt", "processedAt", "sentAt", "minedAt", "retryCount", "retryGasValues", "retryMaxPriorityFeePerGas", "retryMaxFeePerGas", "errorMessage", "sentAtBlockNumber", "blockNumber", "accountAddress", "callData", "callGasLimit", "initCode", "paymasterAndData", "preVerificationGas", sender, "signerAddress", target, "userOpHash", "verificationGasLimit", "cancelledAt", "onChainTxStatus", "groupId", "idempotencyKey") FROM stdin;
\.


--
-- Data for Name: wallet_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wallet_details (address, type, "awsKmsKeyId", "awsKmsArn", "gcpKmsKeyRingId", "gcpKmsKeyId", "gcpKmsKeyVersionId", "gcpKmsLocationId", "gcpKmsResourcePath", "encryptedJson", label) FROM stdin;
0x08eeb885aff95a31971ae323fb554ed397e5a63b	local	\N	\N	\N	\N	\N	\N	\N	{"address":"0x08eEB885AfF95a31971ae323FB554ed397E5a63B","data":"{\\"address\\":\\"08eeb885aff95a31971ae323fb554ed397e5a63b\\",\\"id\\":\\"aa4caeb8-b0e3-4e17-8f33-88202a37f216\\",\\"version\\":3,\\"crypto\\":{\\"cipher\\":\\"aes-128-ctr\\",\\"cipherparams\\":{\\"iv\\":\\"0108281d1be929fb6574eb348471ca83\\"},\\"ciphertext\\":\\"c491b2aeb3bb9002619d9e6c835a8af3df0461e4c0e1dddad6f2652236c62baa\\",\\"kdf\\":\\"scrypt\\",\\"kdfparams\\":{\\"salt\\":\\"071d45f5b3f427e833fadc21534f4e359d7588290d83b81a234ed16a432e7888\\",\\"n\\":1,\\"dklen\\":32,\\"p\\":1,\\"r\\":8},\\"mac\\":\\"5b4c37952cbd3d8abc326c8b483c6063a73ad099fbf53ad45fd28039df25da51\\"}}","strategy":"encryptedJson","isEncrypted":true}	\N
\.


--
-- Data for Name: wallet_nonce; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wallet_nonce (address, "chainId", nonce) FROM stdin;
\.


--
-- Data for Name: webhooks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.webhooks (id, name, url, secret, "evenType", "createdAt", "updatedAt", "revokedAt") FROM stdin;
\.


--
-- Name: webhooks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.webhooks_id_seq', 1, false);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: chain_indexers chain_indexers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chain_indexers
    ADD CONSTRAINT chain_indexers_pkey PRIMARY KEY ("chainId");


--
-- Name: configuration configuration_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuration
    ADD CONSTRAINT configuration_pkey PRIMARY KEY (id);


--
-- Name: contract_event_logs contract_event_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contract_event_logs
    ADD CONSTRAINT contract_event_logs_pkey PRIMARY KEY ("transactionHash", "logIndex");


--
-- Name: contract_subscriptions contract_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contract_subscriptions
    ADD CONSTRAINT contract_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: keypairs keypairs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.keypairs
    ADD CONSTRAINT keypairs_pkey PRIMARY KEY (hash);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY ("walletAddress");


--
-- Name: relayers relayers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.relayers
    ADD CONSTRAINT relayers_pkey PRIMARY KEY (id);


--
-- Name: tokens tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tokens
    ADD CONSTRAINT tokens_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: wallet_details wallet_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet_details
    ADD CONSTRAINT wallet_details_pkey PRIMARY KEY (address);


--
-- Name: wallet_nonce wallet_nonce_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet_nonce
    ADD CONSTRAINT wallet_nonce_pkey PRIMARY KEY (address, "chainId");


--
-- Name: webhooks webhooks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.webhooks
    ADD CONSTRAINT webhooks_pkey PRIMARY KEY (id);


--
-- Name: contract_event_logs_blockNumber_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "contract_event_logs_blockNumber_idx" ON public.contract_event_logs USING btree ("blockNumber");


--
-- Name: contract_event_logs_contractAddress_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "contract_event_logs_contractAddress_idx" ON public.contract_event_logs USING btree ("contractAddress");


--
-- Name: contract_event_logs_timestamp_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX contract_event_logs_timestamp_idx ON public.contract_event_logs USING btree ("timestamp");


--
-- Name: contract_event_logs_topic0_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX contract_event_logs_topic0_idx ON public.contract_event_logs USING btree (topic0);


--
-- Name: contract_event_logs_topic1_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX contract_event_logs_topic1_idx ON public.contract_event_logs USING btree (topic1);


--
-- Name: contract_event_logs_topic2_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX contract_event_logs_topic2_idx ON public.contract_event_logs USING btree (topic2);


--
-- Name: contract_event_logs_topic3_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX contract_event_logs_topic3_idx ON public.contract_event_logs USING btree (topic3);


--
-- Name: contract_subscriptions_chainId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "contract_subscriptions_chainId_idx" ON public.contract_subscriptions USING btree ("chainId");


--
-- Name: contract_transaction_receipts_chainId_transactionHash_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "contract_transaction_receipts_chainId_transactionHash_key" ON public.contract_transaction_receipts USING btree ("chainId", "transactionHash");


--
-- Name: contract_transaction_receipts_contractId_blockNumber_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "contract_transaction_receipts_contractId_blockNumber_idx" ON public.contract_transaction_receipts USING btree ("contractId", "blockNumber");


--
-- Name: contract_transaction_receipts_contractId_timestamp_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "contract_transaction_receipts_contractId_timestamp_idx" ON public.contract_transaction_receipts USING btree ("contractId", "timestamp");


--
-- Name: transactions_idempotencyKey_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "transactions_idempotencyKey_key" ON public.transactions USING btree ("idempotencyKey");


--
-- Name: configuration configuration_insert_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER configuration_insert_trigger AFTER INSERT ON public.configuration FOR EACH ROW EXECUTE FUNCTION public.notify_configuration_insert();


--
-- Name: configuration configuration_update_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER configuration_update_trigger AFTER UPDATE ON public.configuration FOR EACH ROW EXECUTE FUNCTION public.notify_configuration_update();


--
-- Name: transactions transactions_insert_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER transactions_insert_trigger AFTER INSERT ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.notify_transactions_insert();


--
-- Name: transactions transactions_update_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER transactions_update_trigger AFTER UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.notify_transactions_update();


--
-- Name: webhooks webhooks_insert_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER webhooks_insert_trigger AFTER INSERT ON public.webhooks FOR EACH ROW EXECUTE FUNCTION public.notify_webhooks_insert();


--
-- Name: webhooks webhooks_update_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER webhooks_update_trigger AFTER UPDATE ON public.webhooks FOR EACH ROW EXECUTE FUNCTION public.notify_webhooks_update();


--
-- Name: contract_subscriptions contract_subscriptions_webhookId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contract_subscriptions
    ADD CONSTRAINT "contract_subscriptions_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES public.webhooks(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

