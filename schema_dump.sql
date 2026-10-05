--
-- PostgreSQL database dump
--

\restrict eYa2OTiiIQryU9sG7l8NR5nDxx5KnqMbUGfrNw6R2zhI4dqmwDwV06CRx3KV8lX

-- Dumped from database version 18.6 (Homebrew)
-- Dumped by pg_dump version 18.6 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: report_status; Type: TYPE; Schema: public; Owner: namanmittal
--

CREATE TYPE public.report_status AS ENUM (
    'OPEN',
    'REVIEWING',
    'RESOLVED',
    'DISMISSED'
);


ALTER TYPE public.report_status OWNER TO namanmittal;

--
-- Name: request_status; Type: TYPE; Schema: public; Owner: namanmittal
--

CREATE TYPE public.request_status AS ENUM (
    'PENDING',
    'ACCEPTED',
    'PURCHASING',
    'PAYMENT_PENDING',
    'PAID',
    'COMPLETED',
    'RATED',
    'CANCELLED',
    'EXPIRED',
    'COST_SUBMITTED'
);


ALTER TYPE public.request_status OWNER TO namanmittal;

--
-- Name: runner_status; Type: TYPE; Schema: public; Owner: namanmittal
--

CREATE TYPE public.runner_status AS ENUM (
    'AVAILABLE',
    'BUSY',
    'OFFLINE'
);


ALTER TYPE public.runner_status OWNER TO namanmittal;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: namanmittal
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    request_id integer NOT NULL,
    declared_amount numeric(10,2) NOT NULL,
    requester_confirmed_at timestamp with time zone,
    runner_confirmed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT payments_declared_amount_check CHECK ((declared_amount >= (0)::numeric))
);


ALTER TABLE public.payments OWNER TO namanmittal;

--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: namanmittal
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_id_seq OWNER TO namanmittal;

--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: namanmittal
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: pickup_requests; Type: TABLE; Schema: public; Owner: namanmittal
--

CREATE TABLE public.pickup_requests (
    id integer NOT NULL,
    requester_id integer NOT NULL,
    runner_id integer,
    store_id integer NOT NULL,
    items text NOT NULL,
    pickup_location character varying(200) NOT NULL,
    notes text,
    status public.request_status DEFAULT 'PENDING'::public.request_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    accepted_at timestamp with time zone,
    completed_at timestamp with time zone,
    commission_type character varying(20) DEFAULT 'FLAT'::character varying,
    commission_amount numeric(10,2) DEFAULT 0.00,
    cost_of_goods numeric(10,2),
    CONSTRAINT pickup_requests_check CHECK ((requester_id <> runner_id))
);


ALTER TABLE public.pickup_requests OWNER TO namanmittal;

--
-- Name: pickup_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: namanmittal
--

CREATE SEQUENCE public.pickup_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pickup_requests_id_seq OWNER TO namanmittal;

--
-- Name: pickup_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: namanmittal
--

ALTER SEQUENCE public.pickup_requests_id_seq OWNED BY public.pickup_requests.id;


--
-- Name: ratings; Type: TABLE; Schema: public; Owner: namanmittal
--

CREATE TABLE public.ratings (
    id integer NOT NULL,
    request_id integer NOT NULL,
    from_user_id integer NOT NULL,
    to_user_id integer NOT NULL,
    score smallint NOT NULL,
    comment text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ratings_score_check CHECK (((score >= 1) AND (score <= 5)))
);


ALTER TABLE public.ratings OWNER TO namanmittal;

--
-- Name: ratings_id_seq; Type: SEQUENCE; Schema: public; Owner: namanmittal
--

CREATE SEQUENCE public.ratings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ratings_id_seq OWNER TO namanmittal;

--
-- Name: ratings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: namanmittal
--

ALTER SEQUENCE public.ratings_id_seq OWNED BY public.ratings.id;


--
-- Name: reports; Type: TABLE; Schema: public; Owner: namanmittal
--

CREATE TABLE public.reports (
    id integer NOT NULL,
    request_id integer,
    reporter_id integer NOT NULL,
    target_user_id integer NOT NULL,
    reason character varying(100) NOT NULL,
    description text,
    status public.report_status DEFAULT 'OPEN'::public.report_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.reports OWNER TO namanmittal;

--
-- Name: reports_id_seq; Type: SEQUENCE; Schema: public; Owner: namanmittal
--

CREATE SEQUENCE public.reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reports_id_seq OWNER TO namanmittal;

--
-- Name: reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: namanmittal
--

ALTER SEQUENCE public.reports_id_seq OWNED BY public.reports.id;


--
-- Name: runner_sessions; Type: TABLE; Schema: public; Owner: namanmittal
--

CREATE TABLE public.runner_sessions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    store_id integer NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    status public.runner_status DEFAULT 'AVAILABLE'::public.runner_status NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    last_location_update timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL
);


ALTER TABLE public.runner_sessions OWNER TO namanmittal;

--
-- Name: runner_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: namanmittal
--

CREATE SEQUENCE public.runner_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.runner_sessions_id_seq OWNER TO namanmittal;

--
-- Name: runner_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: namanmittal
--

ALTER SEQUENCE public.runner_sessions_id_seq OWNED BY public.runner_sessions.id;


--
-- Name: stores; Type: TABLE; Schema: public; Owner: namanmittal
--

CREATE TABLE public.stores (
    id integer NOT NULL,
    name character varying(150) NOT NULL,
    category character varying(80),
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.stores OWNER TO namanmittal;

--
-- Name: stores_id_seq; Type: SEQUENCE; Schema: public; Owner: namanmittal
--

CREATE SEQUENCE public.stores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stores_id_seq OWNER TO namanmittal;

--
-- Name: stores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: namanmittal
--

ALTER SEQUENCE public.stores_id_seq OWNED BY public.stores.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: namanmittal
--

CREATE TABLE public.users (
    id integer NOT NULL,
    firebase_uid character varying(128) NOT NULL,
    name character varying(120) NOT NULL,
    email character varying(255) NOT NULL,
    avatar_url text,
    rating_average numeric(3,2) DEFAULT 0 NOT NULL,
    rating_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    phone_number character varying(20)
);


ALTER TABLE public.users OWNER TO namanmittal;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: namanmittal
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO namanmittal;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: namanmittal
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: namanmittal
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: pickup_requests id; Type: DEFAULT; Schema: public; Owner: namanmittal
--

ALTER TABLE ONLY public.pickup_requests ALTER COLUMN id SET DEFAULT nextval('public.pickup_requests_id_seq'::regclass);


--
-- Name: ratings id; Type: DEFAULT; Schema: public; Owner: namanmittal
--

ALTER TABLE ONLY public.ratings ALTER COLUMN id SET DEFAULT nextval('public.ratings_id_seq'::regclass);


--
-- Name: reports id; Type: DEFAULT; Schema: public; Owner: namanmittal
--

ALTER TABLE ONLY public.reports ALTER COLUMN id SET DEFAULT nextval('public.reports_id_seq'::regclass);


--
-- Name: runner_sessions id; Type: DEFAULT; Schema: public; Owner: namanmittal
--

ALTER TABLE ONLY public.runner_sessions ALTER COLUMN id SET DEFAULT nextval('public.runner_sessions_id_seq'::regclass);


--
-- Name: stores id; Type: DEFAULT; Schema: public; Owner: namanmittal
--

ALTER TABLE ONLY public.stores ALTER COLUMN id SET DEFAULT nextval('public.stores_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: namanmittal
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: namanmittal
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: pickup_requests pickup_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: namanmittal
--

ALTER TABLE ONLY public.pickup_requests
    ADD CONSTRAINT pickup_requests_pkey PRIMARY KEY (id);


--
-- Name: ratings ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: namanmittal
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_pkey PRIMARY KEY (id);


--
-- Name: ratings ratings_request_id_from_user_id_key; Type: CONSTRAINT; Schema: public; Owner: namanmittal
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_request_id_from_user_id_key UNIQUE (request_id, from_user_id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: namanmittal
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: runner_sessions runner_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: namanmittal
--

ALTER TABLE ONLY public.runner_sessions
    ADD CONSTRAINT runner_sessions_pkey PRIMARY KEY (id);


--
-- Name: stores stores_pkey; Type: CONSTRAINT; Schema: public; Owner: namanmittal
--

ALTER TABLE ONLY public.stores
    ADD CONSTRAINT stores_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: namanmittal
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_firebase_uid_key; Type: CONSTRAINT; Schema: public; Owner: namanmittal
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_firebase_uid_key UNIQUE (firebase_uid);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: namanmittal
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_pickup_requests_requester; Type: INDEX; Schema: public; Owner: namanmittal
--

CREATE INDEX idx_pickup_requests_requester ON public.pickup_requests USING btree (requester_id);


--
-- Name: idx_pickup_requests_runner; Type: INDEX; Schema: public; Owner: namanmittal
--

CREATE INDEX idx_pickup_requests_runner ON public.pickup_requests USING btree (runner_id);


--
-- Name: idx_pickup_requests_status; Type: INDEX; Schema: public; Owner: namanmittal
--

CREATE INDEX idx_pickup_requests_status ON public.pickup_requests USING btree (status);


--
-- Name: idx_runner_sessions_one_active_per_user; Type: INDEX; Schema: public; Owner: namanmittal
--

CREATE UNIQUE INDEX idx_runner_sessions_one_active_per_user ON public.runner_sessions USING btree (user_id) WHERE (status <> 'OFFLINE'::public.runner_status);


--
-- Name: idx_runner_sessions_store_status; Type: INDEX; Schema: public; Owner: namanmittal
--

CREATE INDEX idx_runner_sessions_store_status ON public.runner_sessions USING btree (store_id, status);


--
-- Name: payments payments_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: namanmittal
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.pickup_requests(id) ON DELETE CASCADE;


--
-- Name: pickup_requests pickup_requests_requester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: namanmittal
--

ALTER TABLE ONLY public.pickup_requests
    ADD CONSTRAINT pickup_requests_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.users(id);


--
-- Name: pickup_requests pickup_requests_runner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: namanmittal
--

ALTER TABLE ONLY public.pickup_requests
    ADD CONSTRAINT pickup_requests_runner_id_fkey FOREIGN KEY (runner_id) REFERENCES public.users(id);


--
-- Name: pickup_requests pickup_requests_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: namanmittal
--

ALTER TABLE ONLY public.pickup_requests
    ADD CONSTRAINT pickup_requests_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- Name: ratings ratings_from_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: namanmittal
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_from_user_id_fkey FOREIGN KEY (from_user_id) REFERENCES public.users(id);


--
-- Name: ratings ratings_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: namanmittal
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.pickup_requests(id) ON DELETE CASCADE;


--
-- Name: ratings ratings_to_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: namanmittal
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_to_user_id_fkey FOREIGN KEY (to_user_id) REFERENCES public.users(id);


--
-- Name: reports reports_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: namanmittal
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(id);


--
-- Name: reports reports_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: namanmittal
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.pickup_requests(id);


--
-- Name: reports reports_target_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: namanmittal
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_target_user_id_fkey FOREIGN KEY (target_user_id) REFERENCES public.users(id);


--
-- Name: runner_sessions runner_sessions_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: namanmittal
--

ALTER TABLE ONLY public.runner_sessions
    ADD CONSTRAINT runner_sessions_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- Name: runner_sessions runner_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: namanmittal
--

ALTER TABLE ONLY public.runner_sessions
    ADD CONSTRAINT runner_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict eYa2OTiiIQryU9sG7l8NR5nDxx5KnqMbUGfrNw6R2zhI4dqmwDwV06CRx3KV8lX

