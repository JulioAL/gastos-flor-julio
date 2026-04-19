--
-- PostgreSQL database dump
--

\restrict nE3BbWszIDxdo6ToJc7xUjIufzcU6lBELT0DuuMGgK2N3l36HJSQFkFT8LkIZTk

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.3

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
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
\.


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.custom_oauth_providers (id, provider_type, identifier, name, client_id, client_secret, acceptable_client_ids, scopes, pkce_enabled, attribute_mapping, authorization_params, enabled, email_optional, issuer, discovery_url, skip_nonce_check, cached_discovery, discovery_cached_at, authorization_url, token_url, userinfo_url, jwks_uri, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at, invite_token, referrer, oauth_client_state_id, linking_target_id, email_optional) FROM stdin;
dbf6e981-fb81-4ddb-8c02-d41485c9250a	\N	b92a555c-aa83-4fb8-a172-3901d7cbf43a	s256	haUUCOrealmD0NDcMBxoj5Yn5QuNhMgkfOZbd413qP8	google			2026-04-16 00:38:54.953788+00	2026-04-16 00:38:54.953788+00	oauth	\N	\N	http://localhost:3000/auth/callback	\N	\N	f
d4e233e8-5dce-4f89-aaaf-27f2e324fde6	\N	8f7a4b32-505a-4b90-87ab-4d0d12760fb3	s256	X_F6Nrmm5r2pYIIRs4j84mBR5rJYw1iegE0AUziww68	google			2026-04-18 19:13:27.858616+00	2026-04-18 19:13:27.858616+00	oauth	\N	\N	http://localhost:3000/auth/callback	\N	\N	f
69c0bfbc-34e0-42c2-9387-a336ac157928	\N	bb9522b1-1175-4af3-9c57-fa8aa4ee024c	s256	X_F6Nrmm5r2pYIIRs4j84mBR5rJYw1iegE0AUziww68	google			2026-04-18 19:13:36.908387+00	2026-04-18 19:13:36.908387+00	oauth	\N	\N	http://localhost:3000/auth/callback	\N	\N	f
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	adcac57e-d415-4d34-b3fe-fb500fea3d59	authenticated	authenticated	flor@test.com	$2a$10$bS70sfvYt8Td5wKxLdaiVeCzX2oZUiF.gVn5k/aulkTYbLZRENlme	2026-04-18 20:18:07.078158+00	\N		\N		\N			\N	2026-04-18 20:25:22.566096+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-04-18 20:18:07.049515+00	2026-04-19 00:28:37.775889+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	7075dbbd-c539-49a4-a20c-ebd750505b81	authenticated	authenticated	julio.t3c@gmail.com	\N	2026-04-13 04:43:37.564029+00	\N		\N		\N			\N	2026-04-18 19:13:31.499533+00	{"provider": "google", "providers": ["google"]}	{"iss": "https://accounts.google.com", "sub": "114632464987918828069", "name": "Julio Alva Linares", "email": "julio.t3c@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocIyjnFKYnI-brzxAGIP7EK5YikL3myowyOk66dmLDXtXpmzbMtK1w=s96-c", "full_name": "Julio Alva Linares", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocIyjnFKYnI-brzxAGIP7EK5YikL3myowyOk66dmLDXtXpmzbMtK1w=s96-c", "provider_id": "114632464987918828069", "email_verified": true, "phone_verified": false}	\N	2026-04-13 04:43:37.531225+00	2026-04-19 00:28:32.736215+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
114632464987918828069	7075dbbd-c539-49a4-a20c-ebd750505b81	{"iss": "https://accounts.google.com", "sub": "114632464987918828069", "name": "Julio Alva Linares", "email": "julio.t3c@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocIyjnFKYnI-brzxAGIP7EK5YikL3myowyOk66dmLDXtXpmzbMtK1w=s96-c", "full_name": "Julio Alva Linares", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocIyjnFKYnI-brzxAGIP7EK5YikL3myowyOk66dmLDXtXpmzbMtK1w=s96-c", "provider_id": "114632464987918828069", "email_verified": true, "phone_verified": false}	google	2026-04-13 04:43:37.557816+00	2026-04-13 04:43:37.557869+00	2026-04-18 19:13:29.545387+00	6f828b41-e22b-4896-8cf2-75380b9f7dda
adcac57e-d415-4d34-b3fe-fb500fea3d59	adcac57e-d415-4d34-b3fe-fb500fea3d59	{"sub": "adcac57e-d415-4d34-b3fe-fb500fea3d59", "email": "flor@test.com", "email_verified": false, "phone_verified": false}	email	2026-04-18 20:18:07.073844+00	2026-04-18 20:18:07.073913+00	2026-04-18 20:18:07.073913+00	a0ea564f-4964-4d16-8c92-9f0741363d74
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type, token_endpoint_auth_method) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id, refresh_token_hmac_key, refresh_token_counter, scopes) FROM stdin;
33409b8e-7778-4870-9b5a-43c35112f866	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-04-16 00:39:32.711533+00	2026-04-18 18:30:45.565343+00	\N	aal1	\N	2026-04-18 18:30:45.565246	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Safari/605.1.15	181.67.136.93	\N	\N	\N	\N	\N
099d918f-dff7-41c7-864b-5c2f5758ac1a	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-04-18 19:13:31.503131+00	2026-04-19 00:28:32.747955+00	\N	aal1	\N	2026-04-19 00:28:32.747851	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Safari/605.1.15	181.67.136.93	\N	\N	\N	\N	\N
d51229d7-33ca-4b68-bfa3-ecc98ebe2b3d	adcac57e-d415-4d34-b3fe-fb500fea3d59	2026-04-18 20:25:22.567437+00	2026-04-19 00:28:37.777113+00	\N	aal1	\N	2026-04-19 00:28:37.777025	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	181.67.136.93	\N	\N	\N	\N	\N
9816d5ad-9d3f-41d7-8c5f-e136a03c9376	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-04-15 05:56:49.250626+00	2026-04-16 00:14:49.639755+00	\N	aal1	\N	2026-04-16 00:14:49.639644	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Safari/605.1.15	181.67.136.93	\N	\N	\N	\N	\N
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
9816d5ad-9d3f-41d7-8c5f-e136a03c9376	2026-04-15 05:56:49.260873+00	2026-04-15 05:56:49.260873+00	oauth	de48897b-b274-4231-8835-d80545fe7bdf
33409b8e-7778-4870-9b5a-43c35112f866	2026-04-16 00:39:32.737856+00	2026-04-16 00:39:32.737856+00	oauth	32b9f741-bd97-4b9d-ba5c-c605ef4b1ec8
099d918f-dff7-41c7-864b-5c2f5758ac1a	2026-04-18 19:13:31.550668+00	2026-04-18 19:13:31.550668+00	oauth	76ebb2d2-4645-4269-b050-0aed96b2ee93
d51229d7-33ca-4b68-bfa3-ecc98ebe2b3d	2026-04-18 20:25:22.607422+00	2026-04-18 20:25:22.607422+00	password	ee5fc795-37e0-4825-b276-a8993549ced1
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid, last_webauthn_challenge_data) FROM stdin;
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at, nonce) FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_client_states (id, provider_type, code_verifier, created_at) FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
00000000-0000-0000-0000-000000000000	32	owhtfxwv57m2	7075dbbd-c539-49a4-a20c-ebd750505b81	t	2026-04-15 23:16:22.983378+00	2026-04-16 00:14:49.597022+00	fpoogyfd5wpy	9816d5ad-9d3f-41d7-8c5f-e136a03c9376
00000000-0000-0000-0000-000000000000	33	quulbr2tll4p	7075dbbd-c539-49a4-a20c-ebd750505b81	f	2026-04-16 00:14:49.608304+00	2026-04-16 00:14:49.608304+00	owhtfxwv57m2	9816d5ad-9d3f-41d7-8c5f-e136a03c9376
00000000-0000-0000-0000-000000000000	34	7g5t7ao62kv3	7075dbbd-c539-49a4-a20c-ebd750505b81	t	2026-04-16 00:39:32.716721+00	2026-04-16 01:49:34.727626+00	\N	33409b8e-7778-4870-9b5a-43c35112f866
00000000-0000-0000-0000-000000000000	35	44pxm3rz5gnn	7075dbbd-c539-49a4-a20c-ebd750505b81	t	2026-04-16 01:49:34.735526+00	2026-04-16 02:52:04.738238+00	7g5t7ao62kv3	33409b8e-7778-4870-9b5a-43c35112f866
00000000-0000-0000-0000-000000000000	36	okn2iimq24ev	7075dbbd-c539-49a4-a20c-ebd750505b81	t	2026-04-16 02:52:04.753084+00	2026-04-16 03:50:11.577738+00	44pxm3rz5gnn	33409b8e-7778-4870-9b5a-43c35112f866
00000000-0000-0000-0000-000000000000	37	j2yqg4s2k2fs	7075dbbd-c539-49a4-a20c-ebd750505b81	t	2026-04-16 03:50:11.58878+00	2026-04-16 04:48:18.890949+00	okn2iimq24ev	33409b8e-7778-4870-9b5a-43c35112f866
00000000-0000-0000-0000-000000000000	38	x2xtgz4226iu	7075dbbd-c539-49a4-a20c-ebd750505b81	t	2026-04-16 04:48:18.905203+00	2026-04-17 22:27:41.196299+00	j2yqg4s2k2fs	33409b8e-7778-4870-9b5a-43c35112f866
00000000-0000-0000-0000-000000000000	39	evzm752to6si	7075dbbd-c539-49a4-a20c-ebd750505b81	t	2026-04-17 22:27:41.212739+00	2026-04-18 03:47:54.702327+00	x2xtgz4226iu	33409b8e-7778-4870-9b5a-43c35112f866
00000000-0000-0000-0000-000000000000	40	no4iuuig47vk	7075dbbd-c539-49a4-a20c-ebd750505b81	t	2026-04-18 03:47:54.714644+00	2026-04-18 05:04:17.050411+00	evzm752to6si	33409b8e-7778-4870-9b5a-43c35112f866
00000000-0000-0000-0000-000000000000	41	qnnae3eigngb	7075dbbd-c539-49a4-a20c-ebd750505b81	t	2026-04-18 05:04:17.062373+00	2026-04-18 12:33:01.875925+00	no4iuuig47vk	33409b8e-7778-4870-9b5a-43c35112f866
00000000-0000-0000-0000-000000000000	42	xh7qflxwjupk	7075dbbd-c539-49a4-a20c-ebd750505b81	t	2026-04-18 12:33:01.887171+00	2026-04-18 13:31:14.746925+00	qnnae3eigngb	33409b8e-7778-4870-9b5a-43c35112f866
00000000-0000-0000-0000-000000000000	43	tzhhmvs4qaug	7075dbbd-c539-49a4-a20c-ebd750505b81	t	2026-04-18 13:31:14.759694+00	2026-04-18 14:29:38.87486+00	xh7qflxwjupk	33409b8e-7778-4870-9b5a-43c35112f866
00000000-0000-0000-0000-000000000000	44	3qpot6yqchnl	7075dbbd-c539-49a4-a20c-ebd750505b81	t	2026-04-18 14:29:38.886344+00	2026-04-18 15:29:00.727585+00	tzhhmvs4qaug	33409b8e-7778-4870-9b5a-43c35112f866
00000000-0000-0000-0000-000000000000	45	d6rzxjyexypw	7075dbbd-c539-49a4-a20c-ebd750505b81	t	2026-04-18 15:29:00.742724+00	2026-04-18 16:34:03.093178+00	3qpot6yqchnl	33409b8e-7778-4870-9b5a-43c35112f866
00000000-0000-0000-0000-000000000000	46	fwlbdzdepb56	7075dbbd-c539-49a4-a20c-ebd750505b81	t	2026-04-18 16:34:03.103746+00	2026-04-18 17:32:33.086157+00	d6rzxjyexypw	33409b8e-7778-4870-9b5a-43c35112f866
00000000-0000-0000-0000-000000000000	47	2oxf445oxeod	7075dbbd-c539-49a4-a20c-ebd750505b81	t	2026-04-18 17:32:33.1008+00	2026-04-18 18:30:45.540329+00	fwlbdzdepb56	33409b8e-7778-4870-9b5a-43c35112f866
00000000-0000-0000-0000-000000000000	48	gswzxnkiblhx	7075dbbd-c539-49a4-a20c-ebd750505b81	f	2026-04-18 18:30:45.550999+00	2026-04-18 18:30:45.550999+00	2oxf445oxeod	33409b8e-7778-4870-9b5a-43c35112f866
00000000-0000-0000-0000-000000000000	49	iosfo7apgat3	7075dbbd-c539-49a4-a20c-ebd750505b81	t	2026-04-18 19:13:31.522497+00	2026-04-18 20:11:52.04382+00	\N	099d918f-dff7-41c7-864b-5c2f5758ac1a
00000000-0000-0000-0000-000000000000	50	mu2bfoer4gqx	7075dbbd-c539-49a4-a20c-ebd750505b81	t	2026-04-18 20:11:52.059477+00	2026-04-18 21:10:15.758886+00	iosfo7apgat3	099d918f-dff7-41c7-864b-5c2f5758ac1a
00000000-0000-0000-0000-000000000000	51	ldcs6em6l2s4	adcac57e-d415-4d34-b3fe-fb500fea3d59	t	2026-04-18 20:25:22.587114+00	2026-04-18 21:23:45.808624+00	\N	d51229d7-33ca-4b68-bfa3-ecc98ebe2b3d
00000000-0000-0000-0000-000000000000	53	xmhwmdf6ajb7	adcac57e-d415-4d34-b3fe-fb500fea3d59	t	2026-04-18 21:23:45.814071+00	2026-04-18 22:32:09.551321+00	ldcs6em6l2s4	d51229d7-33ca-4b68-bfa3-ecc98ebe2b3d
00000000-0000-0000-0000-000000000000	52	siqa7t3vy6fq	7075dbbd-c539-49a4-a20c-ebd750505b81	t	2026-04-18 21:10:15.770115+00	2026-04-18 22:32:11.660676+00	mu2bfoer4gqx	099d918f-dff7-41c7-864b-5c2f5758ac1a
00000000-0000-0000-0000-000000000000	55	awqh2trabssl	7075dbbd-c539-49a4-a20c-ebd750505b81	t	2026-04-18 22:32:11.661078+00	2026-04-18 23:30:32.823728+00	siqa7t3vy6fq	099d918f-dff7-41c7-864b-5c2f5758ac1a
00000000-0000-0000-0000-000000000000	54	wxngj7g4lewn	adcac57e-d415-4d34-b3fe-fb500fea3d59	t	2026-04-18 22:32:09.563078+00	2026-04-18 23:30:37.800886+00	xmhwmdf6ajb7	d51229d7-33ca-4b68-bfa3-ecc98ebe2b3d
00000000-0000-0000-0000-000000000000	56	aj2ajdcagolb	7075dbbd-c539-49a4-a20c-ebd750505b81	t	2026-04-18 23:30:32.839967+00	2026-04-19 00:28:32.699762+00	awqh2trabssl	099d918f-dff7-41c7-864b-5c2f5758ac1a
00000000-0000-0000-0000-000000000000	58	7gl6y56ikb42	7075dbbd-c539-49a4-a20c-ebd750505b81	f	2026-04-19 00:28:32.721491+00	2026-04-19 00:28:32.721491+00	aj2ajdcagolb	099d918f-dff7-41c7-864b-5c2f5758ac1a
00000000-0000-0000-0000-000000000000	29	fcqqflpp72hh	7075dbbd-c539-49a4-a20c-ebd750505b81	t	2026-04-15 05:56:49.254761+00	2026-04-15 20:30:48.877701+00	\N	9816d5ad-9d3f-41d7-8c5f-e136a03c9376
00000000-0000-0000-0000-000000000000	57	te5xrsqlpuqw	adcac57e-d415-4d34-b3fe-fb500fea3d59	t	2026-04-18 23:30:37.801772+00	2026-04-19 00:28:37.773647+00	wxngj7g4lewn	d51229d7-33ca-4b68-bfa3-ecc98ebe2b3d
00000000-0000-0000-0000-000000000000	30	4nqtw233zpyq	7075dbbd-c539-49a4-a20c-ebd750505b81	t	2026-04-15 20:30:48.894113+00	2026-04-15 21:29:05.372807+00	fcqqflpp72hh	9816d5ad-9d3f-41d7-8c5f-e136a03c9376
00000000-0000-0000-0000-000000000000	59	zohwvq6rd3wj	adcac57e-d415-4d34-b3fe-fb500fea3d59	f	2026-04-19 00:28:37.774285+00	2026-04-19 00:28:37.774285+00	te5xrsqlpuqw	d51229d7-33ca-4b68-bfa3-ecc98ebe2b3d
00000000-0000-0000-0000-000000000000	31	fpoogyfd5wpy	7075dbbd-c539-49a4-a20c-ebd750505b81	t	2026-04-15 21:29:05.396018+00	2026-04-15 23:16:22.975657+00	4nqtw233zpyq	9816d5ad-9d3f-41d7-8c5f-e136a03c9376
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
20250925093508
20251007112900
20251104100000
20251111201300
20251201000000
20260115000000
20260121000000
20260219120000
20260302000000
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.webauthn_challenges (id, user_id, challenge_type, session_data, created_at, expires_at) FROM stdin;
\.


--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.webauthn_credentials (id, user_id, credential_id, public_key, attestation_type, aaguid, sign_count, transports, backup_eligible, backed_up, friendly_name, created_at, updated_at, last_used_at) FROM stdin;
\.


--
-- Data for Name: budget_months; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.budget_months (id, year, month, tab_name, created_at, locked) FROM stdin;
99cfd894-8c71-4b28-9592-fc43d2fc71da	2026	4	2026 - Abril	2026-04-13 06:26:24.585647+00	f
47efb61c-4011-41b8-b5e1-4f0330882c75	2026	5	Mayo 2026	2026-04-18 16:52:43.795179+00	f
d5b355c3-3c54-49df-9076-551c1375075c	2026	3	2026 - Marzo	2026-04-13 06:26:23.733127+00	t
d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	2026	2	2026 - Febrero	2026-04-13 06:26:22.905074+00	t
108c39a4-a0bd-4daa-b7d1-663f0a187f29	2026	1	2026 - Enero	2026-04-13 06:26:21.604693+00	t
\.


--
-- Data for Name: budget_entertainment_detail; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.budget_entertainment_detail (id, budget_month_id, service, description, amount) FROM stdin;
495323f1-5ae5-4b85-953d-8697750644bd	108c39a4-a0bd-4daa-b7d1-663f0a187f29	netflix	\N	71.97
46bbe163-6542-4efe-a286-aff0d9f43444	108c39a4-a0bd-4daa-b7d1-663f0a187f29	youtube	\N	60.48
722e586b-3978-42c1-bfc0-96a0e607edea	108c39a4-a0bd-4daa-b7d1-663f0a187f29	mantenimiento latam julio	\N	6.00
24060d6f-9e12-486b-a07e-d342b499bae8	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	netflix	\N	79.80
f9b62b62-07a4-48dc-a5f2-fd49ecc8198c	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	iCloud	\N	42.15
41a7cac1-ce33-4e83-bc86-e7033039c976	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	youtube	\N	59.66
dd4654b3-0db9-4015-a7ed-eccae833285d	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	mantenimiento latam julio	\N	6.00
cb8aaef1-3485-4d01-91c1-ac2e3d6a36ff	d5b355c3-3c54-49df-9076-551c1375075c	70.7	\N	20.85
0ac9af60-dc53-4eb6-98bb-a00dac847a68	d5b355c3-3c54-49df-9076-551c1375075c	42	\N	7460.00
ab292eac-92f3-48f3-87c3-8e298fcecc72	d5b355c3-3c54-49df-9076-551c1375075c	118.7	\N	187.61
34c89259-45b4-45c2-abdc-be50904c42c2	99cfd894-8c71-4b28-9592-fc43d2fc71da	70.7	\N	20.85
441d8fb4-a7f1-411a-a519-67f4812441c3	99cfd894-8c71-4b28-9592-fc43d2fc71da	42	\N	7460.00
448b2652-0728-4f1e-869c-bf33533278fc	99cfd894-8c71-4b28-9592-fc43d2fc71da	118.7	\N	187.61
\.


--
-- Data for Name: budget_expenses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.budget_expenses (id, budget_month_id, category, amount, responsible, account) FROM stdin;
e74937d3-ac20-4bd1-8636-bd487d778314	108c39a4-a0bd-4daa-b7d1-663f0a187f29	mantenimiento	220.00	julio	casita
fc2e8475-9c7a-4452-a0ec-fac307a139fb	108c39a4-a0bd-4daa-b7d1-663f0a187f29	energia_electrica	139.90	flor	casita
82f3c68b-2857-4127-96d7-84faf45cf74c	108c39a4-a0bd-4daa-b7d1-663f0a187f29	telefono_casa_internet	100.00	flor	casita
f817d365-622f-42ee-af36-853809d8d05a	108c39a4-a0bd-4daa-b7d1-663f0a187f29	telefono_celular	3004.80	ambos	casita
8abfda5b-816b-407d-9f0e-b25ee59e892a	108c39a4-a0bd-4daa-b7d1-663f0a187f29	alquiler_casa	50.00	julio	casita
f68166f5-e1c5-480e-bf32-438e97a0b376	108c39a4-a0bd-4daa-b7d1-663f0a187f29	transporte_personal	400.00	ambos	flor_julio
c8a4dc9e-3e58-4e28-9134-3c7d96f7111b	108c39a4-a0bd-4daa-b7d1-663f0a187f29	combustible	600.00	ambos	gaso
d0af3ab0-3056-47a8-a888-2e9b214e1ce8	108c39a4-a0bd-4daa-b7d1-663f0a187f29	alimentos_hogar	500.00	ambos	casita
e83a5410-1d75-4187-835e-0f54889d4039	108c39a4-a0bd-4daa-b7d1-663f0a187f29	limpieza_cuidado_personal	150.00	ambos	casita
5822365c-4888-43ce-aac9-2a3f5223d18e	108c39a4-a0bd-4daa-b7d1-663f0a187f29	salud	400.00	ambos	power
ef13379b-553f-4420-a8b3-cdf48bd33313	108c39a4-a0bd-4daa-b7d1-663f0a187f29	ofrenda	160.00	flor	casita
204677e8-7379-4326-a4b5-516922dbadb1	108c39a4-a0bd-4daa-b7d1-663f0a187f29	limpieza_casa_servicio	400.00	ambos	limpieza_regalos
78eb758a-c6a8-4cde-9fe0-9146ca9665c0	108c39a4-a0bd-4daa-b7d1-663f0a187f29	ropa_calzado	136.92	ambos	flor_julio
05c77092-960a-4c7b-a3d6-f600f1fba426	108c39a4-a0bd-4daa-b7d1-663f0a187f29	seguro_carro	100.00	ambos	power
30f7e064-16e7-4668-913c-fcaec14c274e	108c39a4-a0bd-4daa-b7d1-663f0a187f29	regalos_celebraciones	50.00	ambos	limpieza_regalos
5cb5deb5-9519-4b56-bc51-750dd8c4b877	108c39a4-a0bd-4daa-b7d1-663f0a187f29	baby	800.00	ambos	power
615681b7-afc4-4b2a-861a-88b220dc6306	108c39a4-a0bd-4daa-b7d1-663f0a187f29	familias	3000.00	ambos	limpieza_regalos
dfa87fad-d7d5-4afa-92d8-f852202b0cab	108c39a4-a0bd-4daa-b7d1-663f0a187f29	otros_julio_flor	700.00	ambos	flor_julio
5d7129a6-f46d-448f-b719-e4607a42156d	108c39a4-a0bd-4daa-b7d1-663f0a187f29	ahorro_casa	500.00	ambos	power
2b87b020-9ea0-4106-ab06-cca48839c86f	108c39a4-a0bd-4daa-b7d1-663f0a187f29	emergencia	-11821.62	ambos	power
8a97f2b1-5cc3-4c25-b734-c2371f84cda5	99cfd894-8c71-4b28-9592-fc43d2fc71da	power	0.00	\N	power
49bfe168-ca79-47f9-873d-b23abfba37f4	99cfd894-8c71-4b28-9592-fc43d2fc71da	Energía eléctrica	200.00	\N	presupuesto
2d995177-24ce-4729-a656-54046ad9739d	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	Mantenimiento	450.00	\N	presupuesto
15b65f47-29c9-4542-afb6-8b9715854e92	99cfd894-8c71-4b28-9592-fc43d2fc71da	gaso	97.50	\N	gaso
3413cad9-b2a6-4baf-bd71-9c33b723df46	99cfd894-8c71-4b28-9592-fc43d2fc71da	entretenimiento	200.85	\N	entretenimiento
3c1e3b61-77c1-44bd-a0ef-38dfc7ae4389	99cfd894-8c71-4b28-9592-fc43d2fc71da	flor_julio	42.25	\N	flor_julio
6eb9926d-7b4e-483c-b59a-80652502f8b7	99cfd894-8c71-4b28-9592-fc43d2fc71da	casita	1406.60	\N	casita
16a83622-a15c-4e92-8d3a-18ceac328c0e	d5b355c3-3c54-49df-9076-551c1375075c	Mantenimiento	450.00	\N	presupuesto
888e5170-be08-4584-bbca-38420ea21952	99cfd894-8c71-4b28-9592-fc43d2fc71da	navidad	200.08	\N	navidad
aa297b5b-4498-4b04-af94-e08a3e15eddf	99cfd894-8c71-4b28-9592-fc43d2fc71da	limpieza_regalos	906.06	\N	limpieza_regalos
70c9bd84-8577-4771-a57d-180f48b218ba	99cfd894-8c71-4b28-9592-fc43d2fc71da	Mantenimiento	450.00	\N	presupuesto
51c4eedd-6556-442f-ab74-7773eda6b19c	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	Energía eléctrica	220.00	\N	presupuesto
433f1668-a494-40f0-84c9-e581dcd809f9	d5b355c3-3c54-49df-9076-551c1375075c	Energía eléctrica	220.00	\N	presupuesto
5d9a448f-ca54-4592-8718-ba3639acc14b	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	Internet & Cable	147.90	\N	presupuesto
6ba3a196-1e51-4ffc-a89a-efad37f93e58	d5b355c3-3c54-49df-9076-551c1375075c	Internet & Cable	147.90	\N	presupuesto
80272624-f3a7-4d1a-bd38-4a82531240c3	99cfd894-8c71-4b28-9592-fc43d2fc71da	Internet & Cable	147.90	\N	presupuesto
f13c7053-ada6-4204-9848-15d9a85a0435	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	Teléfonos celulares	100.00	\N	presupuesto
3777fe6f-4893-40f7-8050-f3adeaaf9cd7	d5b355c3-3c54-49df-9076-551c1375075c	Teléfonos celulares	100.00	\N	presupuesto
59d0a4ef-38fb-47c6-9cdd-a29f9adca3d9	99cfd894-8c71-4b28-9592-fc43d2fc71da	Teléfonos celulares	100.00	\N	presupuesto
41a1966d-1ffd-4985-9f90-c9ecda964656	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	Alquiler casa	3004.80	\N	presupuesto
e953be8a-9c58-479c-b9c0-1c5c6990b80f	d5b355c3-3c54-49df-9076-551c1375075c	Alquiler casa	3004.80	\N	presupuesto
6c4b1b58-601e-4f2e-9c70-759aa572569c	99cfd894-8c71-4b28-9592-fc43d2fc71da	Alquiler casa	3154.80	\N	presupuesto
724b8a7c-1592-4d95-b98d-c0355a1a1a28	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	Combustible	400.00	\N	presupuesto
5fef7cdf-a747-4b36-af23-232d1da74086	d5b355c3-3c54-49df-9076-551c1375075c	Combustible	400.00	\N	presupuesto
c99300af-973f-4eb0-b5d1-c1bd98ebb37e	99cfd894-8c71-4b28-9592-fc43d2fc71da	Combustible	400.00	\N	presupuesto
9d1d040f-cd8d-4101-926b-f8bdda0bdf3a	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	Alimentos hogar	600.00	\N	presupuesto
38bb1a3a-1737-4cd9-a9ea-92af681cd6ba	d5b355c3-3c54-49df-9076-551c1375075c	Alimentos hogar	600.00	\N	presupuesto
ea3085d0-0a3d-49cd-942b-58125b5a20b4	99cfd894-8c71-4b28-9592-fc43d2fc71da	Alimentos hogar	600.00	\N	presupuesto
eb2c274c-8151-4af3-a232-0c1792bc3dbd	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	Limpieza y Cuidado personal	500.00	\N	presupuesto
4c477293-5887-464d-a120-120f0455a9b2	d5b355c3-3c54-49df-9076-551c1375075c	Limpieza y Cuidado personal	500.00	\N	presupuesto
13c1e27d-ae0d-4865-8d27-0a9d2967fa53	99cfd894-8c71-4b28-9592-fc43d2fc71da	Limpieza y Cuidado personal	500.00	\N	presupuesto
f787a0a6-306d-479e-bd5f-555e13895206	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	Salud	110.00	\N	presupuesto
8fdee26a-17da-438c-8ed6-e829a4058538	d5b355c3-3c54-49df-9076-551c1375075c	Salud	110.00	\N	presupuesto
2b3a8bc6-ee5d-43c1-a95b-e8164e463c45	99cfd894-8c71-4b28-9592-fc43d2fc71da	Salud	200.00	\N	presupuesto
630980d1-d4fe-4059-a3b8-dd61a78a44ec	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	Ofrenda	400.00	\N	presupuesto
19884bb6-79b1-4332-b9e7-e3ecbedb6ea9	d5b355c3-3c54-49df-9076-551c1375075c	Ofrenda	400.00	\N	presupuesto
1d8b5233-3b52-4377-8350-bcc44e030131	99cfd894-8c71-4b28-9592-fc43d2fc71da	Ofrenda	400.00	\N	presupuesto
ee6cce1d-b608-45c2-950d-ae762ceabd3c	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	Limpieza Casa (servicio)	100.00	\N	presupuesto
98b140fa-ea8c-402e-b8bc-a51c56252e7d	d5b355c3-3c54-49df-9076-551c1375075c	Limpieza Casa (servicio)	100.00	\N	presupuesto
c9dba5c3-34a5-4244-881d-24bc988493b6	99cfd894-8c71-4b28-9592-fc43d2fc71da	Limpieza Casa (servicio)	800.00	\N	presupuesto
04f5f19b-1d0e-493d-8cb4-abb81e290338	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	Gastos: comida/salidas/compras	1400.00	\N	presupuesto
6fb977fa-d383-4d8d-b8d1-1580d1c7a9dd	d5b355c3-3c54-49df-9076-551c1375075c	Gastos: comida/salidas/compras	1400.00	\N	presupuesto
a0532f7a-3c18-4b4f-82f3-48e24a35d8ba	99cfd894-8c71-4b28-9592-fc43d2fc71da	Gastos: comida/salidas/compras	1200.00	\N	presupuesto
b6c1a3ce-5ef2-45c3-a7a8-706f470ff2e7	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	Entretenimiento	187.60	\N	presupuesto
74825296-b95f-4776-9347-28c552be3442	d5b355c3-3c54-49df-9076-551c1375075c	Entretenimiento	200.00	\N	presupuesto
fccf5cee-f524-42a9-9c93-f8e392a0d16c	99cfd894-8c71-4b28-9592-fc43d2fc71da	Entretenimiento	200.00	\N	presupuesto
45573820-b4b1-40b7-b0dc-5ba338f4caa4	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	Seguro carro	234.53	\N	presupuesto
558cdca1-2076-4412-8b92-cb884628a88d	d5b355c3-3c54-49df-9076-551c1375075c	Seguro carro	234.53	\N	presupuesto
c980c3b7-7657-4a22-b0ef-10aecf0581e1	99cfd894-8c71-4b28-9592-fc43d2fc71da	Seguro carro	240.00	\N	presupuesto
2637ef2b-7af1-4445-9331-dd36121797ff	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	Regalos y celebraciones	100.00	\N	presupuesto
bea158af-705c-413b-a65a-07d5404f8cf7	99cfd894-8c71-4b28-9592-fc43d2fc71da	Regalos y celebraciones	100.00	\N	presupuesto
7cf85f5b-7cf3-4b16-aaba-07ff3a3b007f	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	Regalos de Navidad	50.00	\N	presupuesto
816e960d-879e-4809-b611-473b1332381d	d5b355c3-3c54-49df-9076-551c1375075c	Regalos de Navidad	50.00	\N	presupuesto
9c1846c6-ac9e-49d6-999b-df6df1ddb5fa	99cfd894-8c71-4b28-9592-fc43d2fc71da	Regalos de Navidad	50.00	\N	presupuesto
210aa42b-46d9-4b95-aea9-4a1c08a25054	99cfd894-8c71-4b28-9592-fc43d2fc71da	Baby	200.00	\N	presupuesto
b84df1df-98b8-49b2-a0f6-d334d7758b17	99cfd894-8c71-4b28-9592-fc43d2fc71da	Familias	800.00	\N	presupuesto
44c88cee-0cde-4321-a093-da87c952dde5	99cfd894-8c71-4b28-9592-fc43d2fc71da	Otros (Julio & Flor)	3000.00	\N	presupuesto
d89b31fb-9c32-4f30-98ed-6906eac365b0	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	Baby	200.00	\N	presupuesto
d34923f2-2a72-4f67-86a1-c253347f1a90	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	Familias	800.00	\N	presupuesto
80cb1cfa-1b1f-477a-a311-4eb80ec76453	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	Otros (Julio & Flor)	3000.00	\N	presupuesto
1dd4c611-98e9-4336-9171-0bc9e99e65c5	d5b355c3-3c54-49df-9076-551c1375075c	Baby	200.00	\N	presupuesto
fbe0a2a7-5fb8-4da1-9123-3f29f92beb50	d5b355c3-3c54-49df-9076-551c1375075c	Familias	800.00	\N	presupuesto
39f9f9c1-6b49-4847-8b48-c96a4ba18784	d5b355c3-3c54-49df-9076-551c1375075c	Otros (Julio & Flor)	3000.00	\N	presupuesto
32f29593-7cc6-44fe-9214-1a121925740f	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	Ahorro Casa	1000.00	\N	presupuesto
75046c8b-9f24-48a8-942b-97b17a7b2daa	d5b355c3-3c54-49df-9076-551c1375075c	Ahorro Casa	1000.00	\N	presupuesto
471527a3-f20a-4f0c-85a8-35b53b257995	99cfd894-8c71-4b28-9592-fc43d2fc71da	Ahorro Casa	1000.00	\N	presupuesto
037f50e3-a238-410a-b763-52b2c9b85f7f	47efb61c-4011-41b8-b5e1-4f0330882c75	Otros (Julio & Flor)	0.00	\N	presupuesto
7abc6c05-e094-4fb6-8ed4-b2f2b323ba57	47efb61c-4011-41b8-b5e1-4f0330882c75	Familias	0.00	\N	presupuesto
35b6854c-c317-44ce-a51a-3c67d1706bf8	47efb61c-4011-41b8-b5e1-4f0330882c75	Ahorro Casa	0.00	\N	presupuesto
a89a11f9-c300-4f7d-aa6f-21437a3cfb99	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	Emergencia	500.00	\N	presupuesto
18c672de-11c5-46e1-be2c-c6624d06a1e5	d5b355c3-3c54-49df-9076-551c1375075c	Emergencia	500.00	\N	presupuesto
955f67ca-f0ca-49b4-a93e-f4aa8caf46a0	d5b355c3-3c54-49df-9076-551c1375075c	Préstamo carro	724.25	\N	deuda
c6e2fab4-d4be-4bd4-ad16-7a1b27902f32	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	Préstamo carro	724.25	\N	deuda
acde9db5-a75e-473b-8aef-fc38d5fa7ce0	99cfd894-8c71-4b28-9592-fc43d2fc71da	Préstamo carro	0.00	\N	deuda
2648e4c9-cf9b-4f21-8f69-9e81e5ba6e5c	47efb61c-4011-41b8-b5e1-4f0330882c75	Emergencia	0.00	\N	presupuesto
701900db-53be-4c97-9bc9-de73fd436ec1	47efb61c-4011-41b8-b5e1-4f0330882c75	limpieza_regalos	0.00	\N	limpieza_regalos
65523620-c585-4a5a-b0ed-295b401cbd3c	47efb61c-4011-41b8-b5e1-4f0330882c75	entretenimiento	0.00	\N	entretenimiento
4fd2be19-aab4-4c03-8ff1-f74aa9050290	99cfd894-8c71-4b28-9592-fc43d2fc71da	Emergencia	500.00	\N	presupuesto
74a769d0-814c-4486-80f7-c0c16e3e0265	108c39a4-a0bd-4daa-b7d1-663f0a187f29	Seguro carro	0.00	\N	presupuesto
9d088e36-c50d-44e5-8796-2c9c4ddd654b	108c39a4-a0bd-4daa-b7d1-663f0a187f29	Alquiler casa	0.00	\N	presupuesto
7238ca20-0657-49e0-aeed-cb6a91f68a86	108c39a4-a0bd-4daa-b7d1-663f0a187f29	Baby	0.00	\N	presupuesto
2fe2508f-4537-47a2-abeb-8768f54e46c5	d5b355c3-3c54-49df-9076-551c1375075c	limpieza_regalos	0.00	\N	limpieza_regalos
e6503d97-9bd8-414f-940f-14e0cf459f35	d5b355c3-3c54-49df-9076-551c1375075c	navidad	0.00	\N	navidad
963fa468-3745-4a63-9c78-f728a48987cc	47efb61c-4011-41b8-b5e1-4f0330882c75	Préstamo carro	0.00	\N	deuda
f74b9655-62f8-410e-b7c1-42fd3a0e555a	47efb61c-4011-41b8-b5e1-4f0330882c75	casita	0.00	\N	casita
aca0c215-4fa8-44e4-b717-744d4b301615	47efb61c-4011-41b8-b5e1-4f0330882c75	Mantenimiento	0.00	\N	presupuesto
abe74596-ff42-4e92-8fa4-f4676bee357d	47efb61c-4011-41b8-b5e1-4f0330882c75	Energía eléctrica	0.00	\N	presupuesto
8e326476-0cc5-4acd-bda8-e55fd9d67c66	47efb61c-4011-41b8-b5e1-4f0330882c75	Internet & Cable	0.00	\N	presupuesto
cf102f66-c48a-4510-926d-92da83838913	47efb61c-4011-41b8-b5e1-4f0330882c75	Teléfonos celulares	0.00	\N	presupuesto
2a9590f1-5778-4991-9612-7f0e612c8bfa	47efb61c-4011-41b8-b5e1-4f0330882c75	Alquiler casa	0.00	\N	presupuesto
bdfbe2e1-7e69-4b96-afe7-f9018587354d	47efb61c-4011-41b8-b5e1-4f0330882c75	Combustible	0.00	\N	presupuesto
a1cd23cf-30a4-499c-a6d8-e862e8f5b4ab	47efb61c-4011-41b8-b5e1-4f0330882c75	Alimentos hogar	0.00	\N	presupuesto
70a61708-71e2-4ece-8ce9-45aa4306861f	47efb61c-4011-41b8-b5e1-4f0330882c75	Limpieza y Cuidado personal	0.00	\N	presupuesto
f3ee13c4-87cd-482d-a961-6293ff658be2	47efb61c-4011-41b8-b5e1-4f0330882c75	Salud	0.00	\N	presupuesto
f9ab2a20-70ee-461e-937d-1cb24022a1df	47efb61c-4011-41b8-b5e1-4f0330882c75	Ofrenda	0.00	\N	presupuesto
2ef67007-c179-4d2a-8e4a-bc6360896c24	47efb61c-4011-41b8-b5e1-4f0330882c75	Limpieza Casa (servicio)	0.00	\N	presupuesto
baedd6a9-f625-4e93-a9a0-7c384213424e	47efb61c-4011-41b8-b5e1-4f0330882c75	Gastos: comida/salidas/compras	0.00	\N	presupuesto
fe684655-5b02-46b7-a251-a14c9cfade0d	47efb61c-4011-41b8-b5e1-4f0330882c75	Entretenimiento	0.00	\N	presupuesto
0c034a2d-a4fc-4912-94da-68d2019eb794	47efb61c-4011-41b8-b5e1-4f0330882c75	Seguro carro	0.00	\N	presupuesto
9ef07df3-470b-4e21-a6e6-59f432c57499	47efb61c-4011-41b8-b5e1-4f0330882c75	Baby	0.00	\N	presupuesto
77d78b9e-872c-4e9e-b900-c89a7533836a	47efb61c-4011-41b8-b5e1-4f0330882c75	Regalos y celebraciones	0.00	\N	presupuesto
afef7056-a28b-471c-ad70-2d0ebc8549b3	47efb61c-4011-41b8-b5e1-4f0330882c75	Regalos de Navidad	0.00	\N	presupuesto
064cf325-d5cb-430c-80a4-707acd34f25a	47efb61c-4011-41b8-b5e1-4f0330882c75	gaso	0.00	\N	gaso
780c97b4-4898-4bad-be4e-734649146bd7	47efb61c-4011-41b8-b5e1-4f0330882c75	navidad	0.00	\N	navidad
2a3aafff-1b45-47a5-95c4-231793a8df7a	47efb61c-4011-41b8-b5e1-4f0330882c75	flor_julio	0.00	\N	flor_julio
\.


--
-- Data for Name: budget_income; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.budget_income (id, budget_month_id, source, description, amount, included_in_budget) FROM stdin;
0d516097-ad00-4b6a-9338-acd544ba8063	108c39a4-a0bd-4daa-b7d1-663f0a187f29	julio_salary	Sueldo Julio	8402.26	t
34ad66ec-0bc8-49b6-909f-2d5152bbbfff	108c39a4-a0bd-4daa-b7d1-663f0a187f29	flor_salary	Sueldo Flor	5509.61	t
40932cf4-438d-43a6-a6a8-c177860a6a4b	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	julio_salary	Sueldo Julio	8588.97	t
33ec875e-e60f-4cff-b918-a4ab1a6f2e5a	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	flor_salary	Sueldo Flor	5845.05	t
a94d036c-b577-40fa-ba91-088961d74ea0	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	other	Otros Ingresos	7666.00	f
077f5d3d-de61-44b1-a5f9-a44cfb60a644	d5b355c3-3c54-49df-9076-551c1375075c	julio_salary	Sueldo Julio	8692.89	t
b5f65880-9633-4aed-b31e-09eb1d1046c7	d5b355c3-3c54-49df-9076-551c1375075c	flor_salary	Sueldo Flor	6220.05	t
20408f6e-b7c9-45c7-9984-a57b2a83c80f	d5b355c3-3c54-49df-9076-551c1375075c	other	Otros Ingresos	10040.03	f
990bde69-b41c-432f-8c23-eebde6a09d2a	99cfd894-8c71-4b28-9592-fc43d2fc71da	julio_salary	Sueldo Julio	8692.89	t
8c20c917-27de-4c22-818f-7d6dfffc63b2	99cfd894-8c71-4b28-9592-fc43d2fc71da	flor_salary	Sueldo Flor	6162.42	t
c3e73e85-4c27-4f74-baef-d9de462bfae3	99cfd894-8c71-4b28-9592-fc43d2fc71da	other	Otros Ingresos	16109.60	f
4d5fd0df-9cd9-43bf-8032-e191dcb4d0f7	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	julio	\N	8692.89	t
d50559ec-30a4-4991-ad57-7ac713436b82	d5b355c3-3c54-49df-9076-551c1375075c	julio	\N	8692.89	t
a193d969-2602-4fe9-ae7e-5f1c058f9421	99cfd894-8c71-4b28-9592-fc43d2fc71da	julio	\N	8692.89	t
57f03795-cf75-4cb5-98e1-6a151ed562ff	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	flor	\N	5921.95	t
c42aa253-0942-4b8c-a0d3-cf9e9da0f742	d5b355c3-3c54-49df-9076-551c1375075c	flor	\N	6220.05	t
f2d63a13-ff0d-4c20-ab71-def25cda0475	99cfd894-8c71-4b28-9592-fc43d2fc71da	flor	\N	6162.42	t
3f0aa561-a34a-4b6f-aa62-35734b56a007	99cfd894-8c71-4b28-9592-fc43d2fc71da	otros_ingresos	Bono Julio	16109.60	t
02c41d05-9f3b-4997-97a3-8d8d84aeaab0	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	otros_ingresos	\N	0.00	t
0d59435c-59aa-4b6d-a22e-248d54711e01	d5b355c3-3c54-49df-9076-551c1375075c	otros_ingresos	utilidades Flor	10040.02	t
caea4241-f3f4-417e-a48c-4d5be463535c	108c39a4-a0bd-4daa-b7d1-663f0a187f29	julio	\N	0.00	t
dc48ad8c-48b1-464e-8493-bf7566203df8	47efb61c-4011-41b8-b5e1-4f0330882c75	julio	\N	0.00	t
90054876-b562-4624-87f2-ee65e320f8b7	47efb61c-4011-41b8-b5e1-4f0330882c75	flor	\N	0.00	t
1027132c-4f41-4a13-8e39-8703564f155f	47efb61c-4011-41b8-b5e1-4f0330882c75	otros_ingresos	\N	0.00	t
\.


--
-- Data for Name: budget_transfers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.budget_transfers (id, budget_month_id, concept, account, julio_amount, flor_amount, notes) FROM stdin;
f70b5ec3-dab8-41f1-b6a8-f6dc74dac117	108c39a4-a0bd-4daa-b7d1-663f0a187f29	Julio total	\N	4919.80	\N	\N
7d06a355-bfca-4b26-9e71-7d2d4fc38e7b	108c39a4-a0bd-4daa-b7d1-663f0a187f29	Flor total	\N	\N	2315.00	\N
774245ff-e6fd-4460-8f43-2c6a7e907209	108c39a4-a0bd-4daa-b7d1-663f0a187f29	casita	casita	2017.90	\N	\N
d35d7b67-6c99-4ea3-bd34-7f29900c1ad8	108c39a4-a0bd-4daa-b7d1-663f0a187f29	power	power	3012.87	\N	\N
a4acbd51-bf94-4033-9245-a3f69470a8f1	108c39a4-a0bd-4daa-b7d1-663f0a187f29	limpieza_regalos	limpieza_regalos	318.45	\N	\N
bf828b05-9009-40e3-9ccf-aeeef78b6a47	108c39a4-a0bd-4daa-b7d1-663f0a187f29	flor_julio	flor_julio	1400.00	\N	\N
a643396d-03fe-4050-b796-392689567228	108c39a4-a0bd-4daa-b7d1-663f0a187f29	navidad	navidad	50.00	\N	\N
a822a7ec-3243-4fa8-93fb-e78befa16054	108c39a4-a0bd-4daa-b7d1-663f0a187f29	gaso	gaso	400.00	\N	\N
f70e2b89-6e3a-45e9-9209-2f804da0d76f	99cfd894-8c71-4b28-9592-fc43d2fc71da	Julio total	\N	14855.31	\N	\N
\.


--
-- Data for Name: cortes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cortes (id, settled_date, year, month, notes, created_by, created_at) FROM stdin;
60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	2026-04-15	2026	4	\N	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-04-15 01:31:59.513247+00
ea12e391-9867-4fb3-a265-52320bfac699	2026-04-18	2026	4	corte 18 abril	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-04-19 00:19:58.860074+00
\.


--
-- Data for Name: corte_account_totals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.corte_account_totals (id, corte_id, account_key, total_amount) FROM stdin;
dd0b60cd-18de-4506-8260-bcde7f0706eb	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	casita	2033.07
eacb1490-3853-48a6-ba57-5b81244e98a6	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	flor_julio	3562.90
edc9dd14-ab81-451b-9923-7370a952b2c0	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	power	6572.00
6b426481-d376-4ae1-b273-2defd1378025	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	gaso	1034.76
3e591d0e-be3e-438f-a738-630667e09f62	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	limpieza_regalos	100.00
cace083a-1b9e-4016-902d-a1126107eea1	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	entretenimiento	308.90
3ff54f93-a40e-46c3-bacb-ee9ebf8718cb	ea12e391-9867-4fb3-a265-52320bfac699	casita	116.37
18681774-4264-4279-8500-bb29f09f5441	ea12e391-9867-4fb3-a265-52320bfac699	flor_julio	1080.10
b85a879d-5677-4baf-902c-d9429f621784	ea12e391-9867-4fb3-a265-52320bfac699	power	215.89
2cb1b792-282f-4512-ba9f-fc7f331f5dcc	ea12e391-9867-4fb3-a265-52320bfac699	gaso	303.53
05124f38-729b-4dcc-a55f-74d66f8870f7	ea12e391-9867-4fb3-a265-52320bfac699	entretenimiento	70.70
\.


--
-- Data for Name: payment_distribution; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_distribution (id, gasto_egreso, julio, flor, casita, power, limpieza, regalos, flor_y_julio, navidad, gasolina, entretenimiento, sort_order, created_at, budget_month_id, hidden) FROM stdin;
d20e07f9-efa7-4235-b6d9-bb21e78a948e	Limpieza y Cuidado personal	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	7	2026-04-18 14:01:11.915263+00	d5b355c3-3c54-49df-9076-551c1375075c	f
5ecee55c-4913-4441-8425-e4cdb2ba5405	Mantenimiento	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	2026-04-17 23:06:50.442157+00	\N	f
dc0d3d7c-3346-4401-86d3-892d9aa753d6	Alquiler casa	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	4	2026-04-17 23:06:50.442157+00	\N	f
f7220bed-7460-46d0-acc6-084a36005990	Combustible	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	5	2026-04-17 23:06:50.442157+00	\N	f
5d845118-db12-4cdb-b9cf-231ac1f1f023	Alimentos hogar	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	6	2026-04-17 23:06:50.442157+00	\N	f
7e84d46a-0dc2-41d5-a138-174be0a02a51	Limpieza y Cuidado personal	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	7	2026-04-17 23:06:50.442157+00	\N	f
d18bb8ba-72f2-4e94-824d-e091b6d155ad	Salud	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	8	2026-04-17 23:06:50.442157+00	\N	f
44dd10ff-071b-4954-ae51-350a489ada93	Gastos: comida/salidas/compras	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	11	2026-04-17 23:06:50.442157+00	\N	f
75b844c5-7650-421a-bd64-a308f428e998	Regalos y celebraciones	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	14	2026-04-17 23:06:50.442157+00	\N	f
e1235368-fc2d-429e-b2f2-ae417585ccb5	Regalos de Navidad	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	15	2026-04-17 23:06:50.442157+00	\N	f
394c6734-6104-44fe-838e-7ef1c1701ab9	Baby	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	16	2026-04-17 23:06:50.442157+00	\N	f
ff8f3402-e233-4d90-8b24-aa15d9208842	Familias	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	17	2026-04-17 23:06:50.442157+00	\N	f
44b0ad12-e788-460b-99be-3a236b2d3e58	Otros (Julio & Flor)	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	18	2026-04-17 23:06:50.442157+00	\N	f
c9552dab-1b51-4871-b874-4adcf77d3d58	Emergencia	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	20	2026-04-17 23:06:50.442157+00	\N	f
8b554acc-70c3-4289-81b0-31a95c3f5258	Préstamo carro	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	21	2026-04-17 23:06:50.442157+00	\N	f
7848dac0-7938-46e1-822e-56bdcf65505c	Salud	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	8	2026-04-18 14:01:11.915263+00	d5b355c3-3c54-49df-9076-551c1375075c	f
6172e7c1-7ade-4d07-8a52-606af7502c84	Ahorro Casa	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	19	2026-04-18 14:01:11.915263+00	d5b355c3-3c54-49df-9076-551c1375075c	f
9ef5faed-8fea-457f-aa97-50ef78f24b41	Internet & Cable	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2	2026-04-17 23:06:50.442157+00	\N	f
03dc4501-17f3-46a5-9999-53101d61bf95	Teléfonos celulares	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	3	2026-04-17 23:06:50.442157+00	\N	f
20d22376-d681-4b3c-a395-2c38f8c70299	Limpieza Casa (servicio)	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	10	2026-04-17 23:06:50.442157+00	\N	f
dc74f4a0-e98c-41ea-97b0-2454cf506f58	Ahorro Casa	\N	\N	0.00	\N	\N	\N	\N	\N	\N	\N	19	2026-04-17 23:06:50.442157+00	\N	f
c6a06df5-5282-4e08-af95-53b99b28ac7d	Entretenimiento	0.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	12	2026-04-17 23:06:50.442157+00	\N	f
04eaf42c-faf3-4155-b9d7-51f6c7e61992	Seguro carro	\N	\N	0.00	240.00	\N	\N	\N	\N	\N	\N	13	2026-04-17 23:06:50.442157+00	\N	f
2d2beb7e-9fd6-4325-998b-9f4f18614c31	Ofrenda	0.00	400.00	0.00	\N	\N	\N	\N	\N	\N	\N	9	2026-04-17 23:06:50.442157+00	\N	f
12dc6974-c485-4042-a34b-ff3e84cfbfd1	Energía eléctrica	\N	0.00	200.00	0.00	0.00	\N	\N	\N	\N	\N	0	2026-04-17 23:03:03.089325+00	\N	f
85842cc2-15ef-4ddc-beea-58ea8df16244	Mantenimiento	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	2026-04-18 14:00:58.78649+00	99cfd894-8c71-4b28-9592-fc43d2fc71da	f
5d5c0a7c-a3c0-41fb-a7a3-265360c5059e	Energía eléctrica	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	2026-04-18 14:00:58.78649+00	99cfd894-8c71-4b28-9592-fc43d2fc71da	f
f1b7dc0d-afe7-4483-9699-c42f0c2f5b9f	Internet & Cable	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2	2026-04-18 14:00:58.78649+00	99cfd894-8c71-4b28-9592-fc43d2fc71da	f
268d092a-80b6-42d3-949a-f2b06cc684fb	Teléfonos celulares	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	3	2026-04-18 14:00:58.78649+00	99cfd894-8c71-4b28-9592-fc43d2fc71da	f
1006cf06-bd0f-41c1-9a0c-41347d378347	Alquiler casa	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	4	2026-04-18 14:00:58.78649+00	99cfd894-8c71-4b28-9592-fc43d2fc71da	f
dde4b018-505f-4dec-a7f4-ec89145770e8	Combustible	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	5	2026-04-18 14:00:58.78649+00	99cfd894-8c71-4b28-9592-fc43d2fc71da	f
49ab25c4-b3a2-4c45-b7fb-9f9c5de4e42f	Alimentos hogar	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	6	2026-04-18 14:00:58.78649+00	99cfd894-8c71-4b28-9592-fc43d2fc71da	f
573c4561-fbcd-4b25-9343-d3d0dd44b0b4	Limpieza y Cuidado personal	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	7	2026-04-18 14:00:58.78649+00	99cfd894-8c71-4b28-9592-fc43d2fc71da	f
d0b700bc-b89b-4028-88f5-9957b4cb3eaf	Salud	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	8	2026-04-18 14:00:58.78649+00	99cfd894-8c71-4b28-9592-fc43d2fc71da	f
9de55103-a67a-44c1-b336-d62d44f45a35	Ofrenda	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	9	2026-04-18 14:00:58.78649+00	99cfd894-8c71-4b28-9592-fc43d2fc71da	f
cf4dbb87-d891-43e0-8479-9c6bed9c16a0	Limpieza Casa (servicio)	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	10	2026-04-18 14:00:58.78649+00	99cfd894-8c71-4b28-9592-fc43d2fc71da	f
06075456-d437-4da1-8e12-04b7b9ef8c28	Gastos: comida/salidas/compras	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	11	2026-04-18 14:00:58.78649+00	99cfd894-8c71-4b28-9592-fc43d2fc71da	f
55fe3efc-3060-409d-bbe7-bae824fb586e	Entretenimiento	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	12	2026-04-18 14:00:58.78649+00	99cfd894-8c71-4b28-9592-fc43d2fc71da	f
360ac17e-99e5-4bc3-b159-80f4ea9a78fc	Seguro carro	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	13	2026-04-18 14:00:58.78649+00	99cfd894-8c71-4b28-9592-fc43d2fc71da	f
f31f43ff-245c-4222-89b7-c0f1a69b8bf0	Regalos y celebraciones	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	14	2026-04-18 14:00:58.78649+00	99cfd894-8c71-4b28-9592-fc43d2fc71da	f
958b5e96-d40d-414d-a8f6-3b3b39379762	Regalos de Navidad	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	15	2026-04-18 14:00:58.78649+00	99cfd894-8c71-4b28-9592-fc43d2fc71da	f
3a375aaf-b83d-498f-b02f-9e70ebc2e66c	Baby	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	16	2026-04-18 14:00:58.78649+00	99cfd894-8c71-4b28-9592-fc43d2fc71da	f
d6b4bf1b-4aa4-40ca-bb41-531b974d6266	Familias	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	17	2026-04-18 14:00:58.78649+00	99cfd894-8c71-4b28-9592-fc43d2fc71da	f
531ff3a6-28fb-44db-a8a5-ee6349047f2c	Otros (Julio & Flor)	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	18	2026-04-18 14:00:58.78649+00	99cfd894-8c71-4b28-9592-fc43d2fc71da	f
09fc714e-f954-45d1-8864-00e3e29838a1	Ahorro Casa	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	19	2026-04-18 14:00:58.78649+00	99cfd894-8c71-4b28-9592-fc43d2fc71da	f
37259375-ab90-48de-8673-c75a2c1cfaf8	Emergencia	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	20	2026-04-18 14:00:58.78649+00	99cfd894-8c71-4b28-9592-fc43d2fc71da	f
97cebd01-adbf-4b85-99e6-348f30378da9	Carro	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	21	2026-04-18 14:00:58.78649+00	99cfd894-8c71-4b28-9592-fc43d2fc71da	f
281aa1bd-6923-4077-a996-bf2e68172e65	Mantenimiento	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	2026-04-18 14:01:11.915263+00	d5b355c3-3c54-49df-9076-551c1375075c	f
b54d8a29-dd1e-44b6-9d17-6b1b7b34de2f	Energía eléctrica	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	2026-04-18 14:01:11.915263+00	d5b355c3-3c54-49df-9076-551c1375075c	f
1a2995cf-38c6-4c9d-a1d0-7e691f144105	Internet & Cable	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2	2026-04-18 14:01:11.915263+00	d5b355c3-3c54-49df-9076-551c1375075c	f
50b2c612-b8c7-49b4-9b46-082638cb7391	Teléfonos celulares	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	3	2026-04-18 14:01:11.915263+00	d5b355c3-3c54-49df-9076-551c1375075c	f
a074d3f9-266c-411d-8688-73d1b855d2c1	Alquiler casa	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	4	2026-04-18 14:01:11.915263+00	d5b355c3-3c54-49df-9076-551c1375075c	f
fb5459ee-5cf6-4033-92b1-9846236ca265	Combustible	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	5	2026-04-18 14:01:11.915263+00	d5b355c3-3c54-49df-9076-551c1375075c	f
cd02811f-c331-41e7-b32b-95bc7ef0f982	Alimentos hogar	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	6	2026-04-18 14:01:11.915263+00	d5b355c3-3c54-49df-9076-551c1375075c	f
fd8d92c1-c68c-40a7-a1b9-3b5f102dd2be	Ofrenda	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	9	2026-04-18 14:01:11.915263+00	d5b355c3-3c54-49df-9076-551c1375075c	f
388f9ff9-57e4-4e64-a5ce-32676fc60f00	Limpieza Casa (servicio)	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	10	2026-04-18 14:01:11.915263+00	d5b355c3-3c54-49df-9076-551c1375075c	f
f026cca3-095b-4015-b413-d41efa78c87a	Gastos: comida/salidas/compras	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	11	2026-04-18 14:01:11.915263+00	d5b355c3-3c54-49df-9076-551c1375075c	f
4b5e04fc-762a-41b6-939d-7022e37c2ca0	Entretenimiento	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	12	2026-04-18 14:01:11.915263+00	d5b355c3-3c54-49df-9076-551c1375075c	f
443e6d3b-13a3-49ba-a4fa-3bf519c2f487	Seguro carro	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	13	2026-04-18 14:01:11.915263+00	d5b355c3-3c54-49df-9076-551c1375075c	f
64ad61da-fda9-4959-97ee-d5b5ecb8b633	Regalos y celebraciones	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	14	2026-04-18 14:01:11.915263+00	d5b355c3-3c54-49df-9076-551c1375075c	f
e786a058-3eb0-4c76-a754-db6611c4b614	Regalos de Navidad	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	15	2026-04-18 14:01:11.915263+00	d5b355c3-3c54-49df-9076-551c1375075c	f
8fcb6f08-cf9c-479f-a4c1-8bf4eafd8bb6	Baby	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	16	2026-04-18 14:01:11.915263+00	d5b355c3-3c54-49df-9076-551c1375075c	f
d6a862f8-16ff-4d24-a487-1b3228578027	Familias	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	17	2026-04-18 14:01:11.915263+00	d5b355c3-3c54-49df-9076-551c1375075c	f
13e3627a-4ef2-465d-848e-66cb80772d0b	Otros (Julio & Flor)	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	18	2026-04-18 14:01:11.915263+00	d5b355c3-3c54-49df-9076-551c1375075c	f
b94be022-6bbd-413e-9c43-57547a03420f	Emergencia	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	20	2026-04-18 14:01:11.915263+00	d5b355c3-3c54-49df-9076-551c1375075c	f
29ca0598-2356-410d-919d-fafcf3c962e2	Carro	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	21	2026-04-18 14:01:11.915263+00	d5b355c3-3c54-49df-9076-551c1375075c	f
4ea33801-0611-409d-bfbb-8282c7993b8a	Mantenimiento	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	2026-04-18 14:03:57.555929+00	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	f
74e5e121-eddb-4264-8918-0f008be9b6f4	Energía eléctrica	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	2026-04-18 14:03:57.555929+00	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	f
be0b7c11-b8ff-4617-aac9-02c095190031	Internet & Cable	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2	2026-04-18 14:03:57.555929+00	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	f
2f2dbb4d-814b-458d-aa1f-512d7ec58aa7	Teléfonos celulares	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	3	2026-04-18 14:03:57.555929+00	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	f
934ff64d-3010-4617-b6b0-86b65088fd08	Alquiler casa	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	4	2026-04-18 14:03:57.555929+00	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	f
35a0905a-750a-4a47-ae1c-aa5b7b89933b	Combustible	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	5	2026-04-18 14:03:57.555929+00	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	f
e5763abe-275e-49ee-972b-167a0fb7e984	Alimentos hogar	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	6	2026-04-18 14:03:57.555929+00	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	f
13fcdde2-09c6-44f7-a6dc-d06999d7b12d	Salud	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	8	2026-04-18 14:03:57.555929+00	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	f
bf93764b-8204-4369-9317-d08331232347	Ofrenda	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	9	2026-04-18 14:03:57.555929+00	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	f
8819584c-38d8-457c-80f1-195f4808d4dd	Limpieza Casa (servicio)	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	10	2026-04-18 14:03:57.555929+00	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	f
e7f779ce-7f77-4794-bc5f-4f10d3eb4ade	Gastos: comida/salidas/compras	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	11	2026-04-18 14:03:57.555929+00	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	f
9badf752-7b9a-4acb-9f3f-6d8373ee24b6	Entretenimiento	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	12	2026-04-18 14:03:57.555929+00	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	f
6b255f7c-4155-4ecd-89f2-35af88c4a2e5	Seguro carro	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	13	2026-04-18 14:03:57.555929+00	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	f
09706061-9fdf-4e49-bbef-e2d2f68b3025	Regalos y celebraciones	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	14	2026-04-18 14:03:57.555929+00	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	f
47984b15-14c6-47d9-9b1e-746a40610e62	Regalos de Navidad	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	15	2026-04-18 14:03:57.555929+00	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	f
ebd6d47c-4334-4ea6-ae51-2c97c72d34f0	Baby	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	16	2026-04-18 14:03:57.555929+00	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	f
3e733778-8d33-4626-8467-0367155c85dd	Familias	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	17	2026-04-18 14:03:57.555929+00	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	f
31f9ff3c-a0a3-43e8-8abe-c89d145f518c	Otros (Julio & Flor)	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	18	2026-04-18 14:03:57.555929+00	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	f
5d0e64f5-cda3-46df-a44e-576b0b1753ae	Ahorro Casa	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	19	2026-04-18 14:03:57.555929+00	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	f
4abe0eef-173a-42f1-a5e6-2b64f260362c	Emergencia	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	20	2026-04-18 14:03:57.555929+00	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	f
8926d81f-2ff3-4757-8324-96878e8938b4	Carro	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	21	2026-04-18 14:03:57.555929+00	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	f
aae76698-cf49-4aa4-af48-bc710a9cba02	Préstamo carro	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	2026-04-18 14:06:22.485158+00	99cfd894-8c71-4b28-9592-fc43d2fc71da	f
2668a018-07bb-48cf-832a-b243c973130d	Préstamo carro	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	22	2026-04-18 14:10:37.602764+00	d5b355c3-3c54-49df-9076-551c1375075c	f
8fdcfc4b-53bd-4ea6-b755-4912ac4e77d8	Préstamo carro	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	22	2026-04-18 14:11:00.73678+00	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	f
5dfb7422-d0be-4091-8201-b78a874caf0f	Mantenimiento	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	2026-04-18 14:11:07.077858+00	108c39a4-a0bd-4daa-b7d1-663f0a187f29	f
4cee9238-557b-4cfb-998b-1e367852e6d6	Energía eléctrica	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	2026-04-18 14:11:07.077858+00	108c39a4-a0bd-4daa-b7d1-663f0a187f29	f
288876e1-10b8-493d-813d-5c8426b4525f	Internet & Cable	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2	2026-04-18 14:11:07.077858+00	108c39a4-a0bd-4daa-b7d1-663f0a187f29	f
024afabc-a59d-4a26-b26e-7c16ec7d9055	Teléfonos celulares	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	3	2026-04-18 14:11:07.077858+00	108c39a4-a0bd-4daa-b7d1-663f0a187f29	f
68db0535-a37e-4d17-97c4-43c07cdc2bec	Alquiler casa	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	4	2026-04-18 14:11:07.077858+00	108c39a4-a0bd-4daa-b7d1-663f0a187f29	f
da2ddbbc-91af-4558-8db6-8b60256d9b19	Combustible	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	5	2026-04-18 14:11:07.077858+00	108c39a4-a0bd-4daa-b7d1-663f0a187f29	f
d7b3946e-31c8-4d29-9676-981cc2b5e661	Alimentos hogar	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	6	2026-04-18 14:11:07.077858+00	108c39a4-a0bd-4daa-b7d1-663f0a187f29	f
58989967-53c6-45bb-acd0-edfd2f4e7f36	Limpieza y Cuidado personal	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	7	2026-04-18 14:11:07.077858+00	108c39a4-a0bd-4daa-b7d1-663f0a187f29	f
7f0d75f4-bbd8-467a-a294-77a3e572b3ac	Salud	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	8	2026-04-18 14:11:07.077858+00	108c39a4-a0bd-4daa-b7d1-663f0a187f29	f
c7190f06-7790-4e67-8362-094195bdb302	Ofrenda	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	9	2026-04-18 14:11:07.077858+00	108c39a4-a0bd-4daa-b7d1-663f0a187f29	f
0fb83e05-c78c-4488-a3dd-af0f4ea48c16	Limpieza Casa (servicio)	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	10	2026-04-18 14:11:07.077858+00	108c39a4-a0bd-4daa-b7d1-663f0a187f29	f
79d19330-4acf-450c-9bb6-d140b7c359ad	Gastos: comida/salidas/compras	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	11	2026-04-18 14:11:07.077858+00	108c39a4-a0bd-4daa-b7d1-663f0a187f29	f
e18463ce-95da-48f0-8056-21a3288bc043	Entretenimiento	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	12	2026-04-18 14:11:07.077858+00	108c39a4-a0bd-4daa-b7d1-663f0a187f29	f
13142b70-b364-42f7-a90e-d79a72f2e799	Seguro carro	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	13	2026-04-18 14:11:07.077858+00	108c39a4-a0bd-4daa-b7d1-663f0a187f29	f
aa56c329-160a-4460-8867-ba7ecc7bc6c7	Regalos y celebraciones	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	14	2026-04-18 14:11:07.077858+00	108c39a4-a0bd-4daa-b7d1-663f0a187f29	f
c9c58db0-081f-43e9-be01-8f3980bc7503	Regalos de Navidad	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	15	2026-04-18 14:11:07.077858+00	108c39a4-a0bd-4daa-b7d1-663f0a187f29	f
ff1bf739-12d8-49aa-a92b-7a34872c128f	Baby	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	16	2026-04-18 14:11:07.077858+00	108c39a4-a0bd-4daa-b7d1-663f0a187f29	f
b9102eda-384b-46b4-89d3-83c7faace593	Familias	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	17	2026-04-18 14:11:07.077858+00	108c39a4-a0bd-4daa-b7d1-663f0a187f29	f
cd929d5c-51af-48e8-abf4-a507781cc446	Otros (Julio & Flor)	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	18	2026-04-18 14:11:07.077858+00	108c39a4-a0bd-4daa-b7d1-663f0a187f29	f
7a5e6752-9fc8-49cc-bd37-3b5bc40856f0	Ahorro Casa	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	19	2026-04-18 14:11:07.077858+00	108c39a4-a0bd-4daa-b7d1-663f0a187f29	f
f9bffd1e-e39b-499f-afd4-8027d72bb80d	Emergencia	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	20	2026-04-18 14:11:07.077858+00	108c39a4-a0bd-4daa-b7d1-663f0a187f29	f
87b4c85f-58e2-4c26-848c-827a09b82ac5	Mantenimiento	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	2026-04-18 16:52:44.719348+00	47efb61c-4011-41b8-b5e1-4f0330882c75	f
535d1490-d8cd-4d07-80f4-dd753b424acd	Energía eléctrica	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	2026-04-18 16:52:44.719348+00	47efb61c-4011-41b8-b5e1-4f0330882c75	f
f3745579-7c65-44d4-8716-fbc594e39058	Internet & Cable	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2	2026-04-18 16:52:44.719348+00	47efb61c-4011-41b8-b5e1-4f0330882c75	f
5b9c2118-e3ef-46c6-82b7-1cec720e339a	Teléfonos celulares	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	3	2026-04-18 16:52:44.719348+00	47efb61c-4011-41b8-b5e1-4f0330882c75	f
f21a20de-b9ad-44e4-9672-0c617fafd0bc	Alquiler casa	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	4	2026-04-18 16:52:44.719348+00	47efb61c-4011-41b8-b5e1-4f0330882c75	f
1f0c3a7a-fca6-4f25-9cb8-90560ea1648c	Combustible	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	5	2026-04-18 16:52:44.719348+00	47efb61c-4011-41b8-b5e1-4f0330882c75	f
90368040-97b7-4dd3-a60d-75464ff11e3e	Alimentos hogar	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	6	2026-04-18 16:52:44.719348+00	47efb61c-4011-41b8-b5e1-4f0330882c75	f
0c18a988-77cf-4272-9dd0-f0e72b27487d	Limpieza y Cuidado personal	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	7	2026-04-18 16:52:44.719348+00	47efb61c-4011-41b8-b5e1-4f0330882c75	f
d94b859b-90e4-4bc9-b603-51aec2c659fd	Salud	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	8	2026-04-18 16:52:44.719348+00	47efb61c-4011-41b8-b5e1-4f0330882c75	f
f92882bd-ff94-46d5-947e-1640a1450472	Ofrenda	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	9	2026-04-18 16:52:44.719348+00	47efb61c-4011-41b8-b5e1-4f0330882c75	f
79d4ae05-084f-4872-a003-bd14907a2947	Limpieza Casa (servicio)	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	10	2026-04-18 16:52:44.719348+00	47efb61c-4011-41b8-b5e1-4f0330882c75	f
f7e7a056-f1f7-4a49-86ca-52bf43e05596	Gastos: comida/salidas/compras	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	11	2026-04-18 16:52:44.719348+00	47efb61c-4011-41b8-b5e1-4f0330882c75	f
9e9906a5-80d4-4aab-94ec-97fdfebff0c9	Entretenimiento	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	12	2026-04-18 16:52:44.719348+00	47efb61c-4011-41b8-b5e1-4f0330882c75	f
3ff4665b-4dbc-48d6-aef9-0e4421bbc9e1	Seguro carro	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	13	2026-04-18 16:52:44.719348+00	47efb61c-4011-41b8-b5e1-4f0330882c75	f
966fffca-36f9-4299-8822-40a859c4501b	Regalos y celebraciones	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	14	2026-04-18 16:52:44.719348+00	47efb61c-4011-41b8-b5e1-4f0330882c75	f
f6836d49-2c28-486f-9772-b97a6b5df604	Regalos de Navidad	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	15	2026-04-18 16:52:44.719348+00	47efb61c-4011-41b8-b5e1-4f0330882c75	f
1a545736-c6af-4fba-82d8-b019ad54a0c3	Baby	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	16	2026-04-18 16:52:44.719348+00	47efb61c-4011-41b8-b5e1-4f0330882c75	f
d264ccd5-379b-4c13-bbbb-0c33265d6f12	Familias	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	17	2026-04-18 16:52:44.719348+00	47efb61c-4011-41b8-b5e1-4f0330882c75	f
196d615e-988c-4607-a44c-b938afe81c80	Otros (Julio & Flor)	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	18	2026-04-18 16:52:44.719348+00	47efb61c-4011-41b8-b5e1-4f0330882c75	f
975f1203-e02d-41c9-baf6-d4f184135be1	Ahorro Casa	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	19	2026-04-18 16:52:44.719348+00	47efb61c-4011-41b8-b5e1-4f0330882c75	f
195c8af1-fa02-495e-aa83-778044fc0713	Emergencia	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	20	2026-04-18 16:52:44.719348+00	47efb61c-4011-41b8-b5e1-4f0330882c75	f
0f1463f0-31ba-45db-aaf9-8127e578f17d	Limpieza y Cuidado personal	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	7	2026-04-18 14:03:57.555929+00	d4e0c3e4-a37a-4f31-83d3-bc87e953ae23	f
5157dbca-4143-4b3f-b770-f48dff432ec8	Préstamo carro	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	21	2026-04-18 18:22:18.216778+00	47efb61c-4011-41b8-b5e1-4f0330882c75	f
\.


--
-- Data for Name: personal_expenses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.personal_expenses (id, user_id, date, description, casita, flor_julio, julio, flor, salidas, power, gasolina, regalos, navidad, otros_power, entretenimiento, tab_name, year, created_at, updated_at, corte_id, category, subcategory, account_type) FROM stdin;
2b1bde9a-8ad3-4639-a1a0-777a1c836f61	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-04-18	taxi trabajo de flor a cas	\N	19.60	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026	2026-04-18 20:36:24.584072+00	2026-04-19 00:19:59.435198+00	ea12e391-9867-4fb3-a265-52320bfac699	transporte	taxi	credito
b15f3dfc-8380-41cd-bcbb-90b0799612a7	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-07	didi jeanca 2	\N	\N	8.90	\N	\N	\N	\N	\N	\N	\N	\N	03-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
854803d7-9b9a-4d0f-8df4-66d2422ccfd3	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-07	chilis pardo	\N	105.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	03-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
7f3916de-bb79-4d49-b60a-1fa096195898	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-07	falabella miraflores - regalo JC	\N	\N	20.33	20.33	\N	\N	\N	\N	\N	\N	\N	03-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
1d9dfcf6-5a12-4ee9-91e5-5be10419504e	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-11	trattoria miraflow	\N	151.30	\N	\N	\N	\N	\N	\N	\N	\N	\N	03-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
f55eacb0-ba2f-414d-93a8-94feb80422bf	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-11	apparka	\N	\N	\N	\N	\N	\N	13.00	\N	\N	\N	\N	03-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
9a644352-68c2-4508-85e6-f5040296a9ec	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-11	sodimac	\N	53.70	19.80	9.90	\N	\N	\N	\N	\N	\N	\N	03-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
9fa91403-495e-4299-b57a-4ba0bb48940d	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-13	wong benavides	61.57	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	03-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
2db39db2-5665-4754-b306-96fac9b16329	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-04	don giuseppe	\N	52.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	03-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
dd93b8bc-d998-49ae-a94a-c585da563314	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-04	estacionamiento la punta	\N	\N	\N	\N	\N	\N	4.00	\N	\N	\N	\N	03-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
580747e5-7996-4808-93dd-ec69ba6c5f3c	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-07	llantas presióón	\N	\N	\N	\N	\N	\N	5.00	\N	\N	\N	\N	03-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
4a490fa3-c915-48e6-b45a-b58a41a80d8f	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-10	agua cielo	\N	4.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	03-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
8ad9719e-d2bc-4974-b16c-b41c45a4bc2d	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-06	Menú 2	42.60	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	03-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
99538004-00da-41bd-8985-e302c6051ac2	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-17	mangos desayuno	\N	164.80	\N	\N	\N	\N	\N	\N	\N	\N	\N	19-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
2d3f1a7f-cf43-47bf-a255-3301c679df78	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-17	rayban larcomar	\N	\N	\N	\N	\N	1834.00	\N	\N	\N	\N	\N	19-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
25b95b1f-a58e-4d92-9ab6-5f580377028c	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-17	rappi sac - don tito	\N	54.10	\N	\N	\N	\N	\N	\N	\N	\N	\N	19-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
9cf8f29d-adde-47f0-ada3-128d810fc4ad	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-17	tanqueado	\N	\N	\N	\N	\N	\N	109.30	\N	\N	\N	\N	19-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
db37d4ff-f037-4aa8-9336-64f5f69ad7ef	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-18	starbuck pan sur	\N	62.20	\N	\N	\N	\N	\N	\N	\N	\N	\N	19-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
63cbb71f-374d-4389-9cbb-625d9e31e6f8	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-18	pvea grifo kio	\N	\N	21.00	21.00	\N	\N	\N	\N	\N	\N	\N	19-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
8d34a2f0-c541-4076-8716-faa593f3e09e	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-18	ao pip almuerzo	\N	75.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	19-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
6c031c57-b131-401c-90df-7826530f18b5	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-18	pedidos ya canchita	\N	\N	45.60	\N	\N	\N	\N	\N	\N	\N	\N	19-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
121ca7e8-7662-4f33-9401-2f5cfe47acd0	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-18	retiro efectivo	50.00	60.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	19-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
8ab9810a-04ee-48ef-a5cc-5fb1b916368c	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-18	picarones	\N	\N	\N	10.00	\N	\N	\N	\N	\N	\N	\N	19-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
c912febd-4751-4168-9268-49fc535b614b	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-18	apple icloud	\N	42.15	\N	\N	\N	\N	\N	\N	\N	\N	\N	19-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
34882505-fa20-4bd7-bbef-f43c53cd4a91	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-21	movistar celular	50.00	\N	6.90	\N	\N	\N	\N	\N	\N	\N	\N	29-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
8af32f14-9ad7-4443-a557-c0f3bb054f02	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-21	mantenimiento	396.73	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	29-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
39eed5de-623b-421d-af7c-862924ead342	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-23	rayban sol	\N	\N	\N	\N	\N	663.20	\N	\N	\N	\N	\N	29-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
280167c5-c340-4154-8270-0c1087a3458b	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-23	ohasi	\N	73.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	29-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
6ad273f2-9d8c-46b7-b7c2-6ed8b828c9e6	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-25	apparka ibe	\N	\N	\N	\N	\N	\N	13.00	\N	\N	\N	\N	29-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
2c5e6c7b-b39f-4adc-b494-1308585eee51	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-25	donna cativa	\N	\N	159.00	\N	\N	\N	\N	\N	\N	\N	\N	29-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
fa0b9797-ee87-4b31-bcf4-cb39a59d673e	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-25	estacionamiento real plaza	\N	\N	\N	\N	\N	\N	5.00	\N	\N	\N	\N	29-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
4578ffdb-77e8-4a31-9f32-bfd0e2ba2653	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-27	tanqueado	\N	\N	\N	\N	\N	\N	127.61	\N	\N	\N	\N	29-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
24898772-3300-46c1-bf0b-ee3394fe8fcd	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-27	didi	\N	\N	19.30	\N	\N	\N	\N	\N	\N	\N	\N	29-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
197ff8b3-b28a-4f64-954a-e72c3691ea06	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-27	norkys	\N	\N	127.00	\N	\N	\N	\N	\N	\N	\N	\N	29-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
71a93fde-331b-4561-b782-03492af5f867	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-27	uber	\N	\N	41.90	\N	\N	\N	\N	\N	\N	\N	\N	29-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
9d32739b-57af-4e7a-9aa0-b3cc1f7c38cb	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-27	didi	\N	\N	21.20	\N	\N	\N	\N	\N	\N	\N	\N	29-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
df67ddf2-f751-4cb7-8acf-ce1477332a32	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-27	didi	\N	\N	14.60	\N	\N	\N	\N	\N	\N	\N	\N	29-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
27fcdc56-d0de-48ec-8554-aeaef009c469	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-27	pizza hut	\N	\N	\N	54.90	\N	\N	\N	\N	\N	\N	\N	29-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
287d24ba-39d8-4577-bb97-86250d428b2d	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-27	parche llanta	\N	\N	\N	\N	\N	\N	20.00	\N	\N	\N	\N	29-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
5d352793-5a54-406c-9619-b03ffc0d78af	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-27	corte enero	40.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	29-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
507ace50-94d1-452a-8784-92b058275aea	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-27	netflix	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	79.80	29-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
24f647d5-f7fe-4384-9df8-b0f6ecbc1684	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-27	youtu	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	59.66	29-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
51181ef3-e92c-4be8-9e93-b433427dfefb	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-30	didi	\N	\N	\N	\N	\N	\N	\N	\N	\N	54.05	\N	09-02-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
15c3d2d7-d9d1-4249-be0b-7c763cfb4569	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-05	uber	\N	\N	14.90	\N	\N	\N	\N	\N	\N	\N	\N	09-02-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
16b93c02-e290-4725-9f29-a069cff4ef97	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-05	uber	\N	\N	15.90	\N	\N	\N	\N	\N	\N	\N	\N	09-02-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
d254d760-9cd5-4738-9b7a-36b3ab14e734	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-05	blu	\N	24.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	09-02-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
d79d6596-33d8-42a8-bc73-2a4f58e4bf29	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-06	medicentro	\N	\N	\N	\N	\N	45.00	\N	\N	\N	\N	\N	09-02-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
af6f3ec6-0e31-4ce0-a48a-636a676a78aa	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-06	medicina	\N	\N	\N	\N	\N	9.38	\N	\N	\N	\N	\N	09-02-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
8ad3bf65-cc8b-4640-8177-6409109c2cf7	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-06	plaza del sol	\N	\N	\N	\N	\N	9.00	\N	\N	\N	\N	\N	09-02-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
f61b90a4-45c4-4a74-91dc-55c5b3294c75	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-07	wong benavides	108.35	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	09-02-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
2904fd63-cf33-42e3-a45e-43df1efed827	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-07	rodizio	\N	219.70	\N	\N	\N	\N	\N	\N	\N	\N	\N	09-02-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
3a639e29-d395-4144-80f4-abfcdf7797dd	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-07	apparka ibe	\N	13.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	09-02-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
43a83116-adb8-4470-9534-3246487779de	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-07	sodimac foco	\N	22.90	\N	\N	\N	\N	\N	\N	\N	\N	\N	09-02-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
c508c5ff-4c12-4f75-815c-f1e871ca199f	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-07	pedidos ya juan valdez	\N	40.90	\N	\N	\N	\N	\N	\N	\N	\N	\N	09-02-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
0088f02f-6e0e-486a-b1a6-f2923baefda3	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-04-18	gasoline tanqueado	\N	\N	\N	\N	\N	\N	141.20	\N	\N	\N	\N	\N	2026	2026-04-18 12:00:00+00	2026-04-19 00:19:59.435198+00	ea12e391-9867-4fb3-a265-52320bfac699	transporte	gasolina	credito
9579347e-7a67-4524-aca8-f58bcea2b8cd	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-02-03	taxi de aeropuerto a casa	\N	\N	\N	\N	\N	\N	\N	\N	\N	60.00	\N	09-02-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
e79957a9-207d-4535-9548-0888636de5d0	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-02-03	almuerzo don giuseppe	\N	136.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	09-02-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
9c107feb-b607-438d-b40e-c2d97d4fa57e	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-02-03	propina giuseppe	\N	5.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	09-02-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
a9f4103e-6ddb-4aa6-9046-665a0966d35a	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-02-03	estacionamiento giuseppe	\N	4.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	09-02-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
a069dc5a-ca21-4df8-a222-173273d93625	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-02-14	taxi oltursa al myr	\N	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	27-02-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
a723fa73-4c8d-4dab-bd1f-3fea2dcd0c39	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-02-14	pasaje al puerto	\N	\N	\N	\N	\N	\N	\N	\N	\N	20.00	\N	27-02-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
8bf57401-31b7-4e94-8c26-b8e6b21bbd70	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-02-14	banano	\N	30.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	27-02-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
a5e7744f-5cb2-4f65-a7a0-42d3642abe1d	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-02-15	desayuno puerto	\N	\N	\N	\N	\N	\N	\N	\N	\N	29.00	\N	27-02-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
cd5b7164-17b9-45b7-bbe2-8813174c2449	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-02-15	agua sin gas casa tía Raquel	\N	\N	\N	\N	\N	\N	\N	\N	\N	2.00	\N	27-02-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
881c45cd-ecff-4a9c-91de-7ffb696bd0e6	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-02-15	pasaje a Trujillo	\N	\N	\N	\N	\N	\N	\N	\N	\N	20.00	\N	27-02-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
e358a950-4c3d-4efb-a54b-2af33b8dcfaa	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-02-15	papel higiénico	\N	\N	\N	\N	\N	\N	\N	\N	\N	1.20	\N	27-02-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
18521b80-f9f6-47a5-902d-b8a385be08b1	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-02-16	10:09 yape julio fer	\N	5.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	27-02-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
b1950277-20ef-4b3e-8e29-5401093690a1	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-02-24	fruta mercado+mirasol	19.60	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	27-02-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
b8b7d30d-bfb0-4ed9-96e9-39edc136f781	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-02-19	icloud	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	48.64	27-02-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
cfb32846-4a46-42a4-95ab-0f58d13fc233	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-02-24	youtube	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	60.55	27-02-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
3863672f-81dd-4b83-beea-8560168a4d68	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-02-24	tanqueado	\N	\N	\N	\N	\N	\N	141.11	\N	\N	\N	\N	27-02-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
98859893-8df9-4392-bc60-a641528bf3af	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-02-24	alitas x16	\N	55.40	\N	\N	\N	\N	\N	\N	\N	\N	\N	27-02-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
79e4e5e8-7333-4f9e-9cd8-092a851b814d	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-02-13	taxi a oltursa	\N	\N	\N	\N	\N	\N	\N	\N	\N	12.00	\N	27-02-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
b42f6ac8-4e91-47c7-94af-62fe369dee83	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-02-15	MYR a oltursa	\N	\N	\N	\N	\N	\N	\N	\N	\N	5.10	\N	27-02-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
e6184f41-814c-41ae-b718-d5e6db7d2011	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-02-16	taxi de oltursa a casa	\N	\N	\N	\N	\N	\N	\N	\N	\N	19.55	\N	27-02-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
f4c93a92-a79f-4a98-9b06-280e8711dfe8	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-02-16	rappi primos chicken	\N	63.29	\N	\N	\N	\N	\N	\N	\N	\N	\N	27-02-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
75280efc-0b79-4ca2-8178-20ceafc2c96a	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-02-16	7 sopas	\N	89.50	\N	\N	\N	\N	\N	\N	\N	\N	\N	27-02-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
62502c65-2219-49b4-85d0-2a4023234941	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-02-20	alitas x12	\N	48.30	\N	\N	\N	\N	\N	\N	\N	\N	\N	27-02-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
6384dfd1-f281-46da-97a4-287bdb2b857f	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-02-21	tanqueado	\N	\N	\N	\N	\N	\N	85.65	\N	\N	\N	\N	27-02-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
22c7a668-c396-4e3c-ac78-b8e922fa3e40	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-02-21	celular movistar	50.00	\N	6.90	\N	\N	\N	\N	\N	\N	\N	\N	27-02-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
b68cfacb-f6e9-4fde-8f6d-1343318df6ae	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-02-21	lucha kennedy	\N	51.60	\N	\N	\N	\N	\N	\N	\N	\N	\N	27-02-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
2717eb5c-d82c-4859-98c8-b3bdf9721b60	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-02-21	estac real plaza	\N	5.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	27-02-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
548177d5-0c69-404c-9e33-bad9d3cc974e	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-02-21	cuota papás	\N	\N	\N	\N	\N	\N	\N	\N	\N	50.00	\N	27-02-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
d3af802e-def5-4d09-834f-6d4624a69d48	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-02	Taxi a qenqo	\N	\N	\N	\N	\N	\N	\N	\N	\N	17.00	\N	02-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
f39f97b1-f157-4d05-9565-f0d64a5a721b	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-02	taxo de regreso de qenqo post bus	\N	\N	\N	\N	\N	\N	\N	\N	\N	7.00	\N	02-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
551be732-aa2f-43c4-869f-e4fa94843b0d	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-02	taxi a Saqsayhuaman	\N	\N	\N	\N	\N	\N	\N	\N	\N	15.00	\N	02-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
526b4941-bcff-4d46-aff9-1c8fdfe61f2f	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-02	taxi a aeropuerto en Cusco	\N	\N	\N	\N	\N	\N	\N	\N	\N	18.00	\N	02-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
75572e21-5ae6-4ce8-95f5-73c1973f8a25	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-02	makro	307.29	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	02-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
da092115-40e3-4f4c-8cd4-c04fd90ff463	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-02	Hotel check in	\N	\N	\N	\N	\N	\N	\N	\N	\N	53.07	\N	02-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
583c5693-849a-443d-ab36-aa6a90b9e35b	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-02	vino dulce	\N	\N	\N	\N	\N	\N	\N	\N	\N	85.00	\N	02-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
3465cca2-2bfb-4ea4-875d-8882326c4ab5	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-02	Didi salida de casa a aeropuerto	\N	\N	\N	\N	\N	\N	\N	\N	\N	76.82	\N	02-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
fb64105b-fddd-4813-809c-4686d86bf14a	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-02	checkout casa andina - aguas	\N	\N	\N	\N	\N	\N	\N	\N	\N	10.00	\N	02-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
231f8aed-60fb-481f-aff1-a4d2d23a2367	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-02	pollería toldos	\N	\N	\N	147.50	\N	\N	\N	\N	\N	65.50	\N	02-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
016672ad-b1a4-4dd2-b8ab-0c9f808032a7	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-02	Florencia y Fortunata	\N	\N	\N	\N	\N	\N	\N	\N	\N	51.00	\N	02-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
1efc361e-cb51-4633-a6a8-6c9716b11caf	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-02	Regalo gorro	\N	\N	70.00	\N	\N	\N	\N	\N	\N	\N	\N	02-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
dccb20a5-0c64-4d27-a3c6-d73bfdec6755	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-02	didi a casa post viaje	\N	\N	\N	\N	\N	\N	\N	\N	\N	12.50	\N	02-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
528a1341-0e00-4c63-9536-57cb6134f2ca	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-02	makro	267.27	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	21-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
87757aef-08b7-476e-bffe-d610a5d9a29f	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-04	pedidos ya chilis	\N	47.20	\N	\N	\N	\N	\N	\N	\N	\N	\N	21-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
651ac2b0-da4b-4881-ad15-2f7605f5eb32	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-05	caleta	\N	91.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	21-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
be65dcda-ac75-491d-907f-32a48890108e	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-05	tanqueado	\N	\N	\N	\N	\N	\N	176.45	\N	\N	\N	\N	21-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
bd097353-fe08-4e9f-9257-2b4ef457ce72	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-05	mifarma barranco	\N	\N	\N	\N	\N	41.50	\N	\N	\N	\N	\N	21-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
0084d191-05a2-4d71-8471-2318c657fb54	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-05	ch larcomar	\N	48.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	21-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
8ab540bf-f9f3-4a18-b93d-e8d824fdfaae	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-05	cinepolis	\N	30.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	21-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
84c15099-cc9b-4166-b9b8-8c2f8a863420	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-05	cinepolis	\N	37.50	\N	\N	\N	\N	\N	\N	\N	\N	\N	21-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
22989240-b007-48e7-a4b3-877abf98e5ed	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-13	rappi sac	\N	60.30	\N	\N	\N	\N	\N	\N	\N	\N	\N	21-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
3ee310d8-a963-4532-9477-84b8f2def62f	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-13	the box	\N	\N	95.40	\N	\N	\N	\N	\N	\N	1476.70	\N	21-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
da3af578-8500-4cdf-b036-64fcb7175642	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-13	nike	\N	\N	\N	\N	\N	\N	\N	\N	\N	328.93	\N	21-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
a806cab0-8c1c-4ef8-9bde-d545111292ce	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-04-18	gasolina pampilla	\N	\N	\N	\N	\N	\N	162.33	\N	\N	\N	\N	\N	2026	2026-04-18 19:56:04.987442+00	2026-04-19 00:19:59.435198+00	ea12e391-9867-4fb3-a265-52320bfac699	transporte	gasolina	credito
062ba5ff-e866-4beb-90fc-9751f01f6e18	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-04-18	farmacia mifarma chacarilla	\N	\N	\N	\N	\N	\N	\N	\N	\N	35.00	\N	ps|salud	2026	2026-04-18 12:00:00+00	2026-04-19 00:19:59.435198+00	ea12e391-9867-4fb3-a265-52320bfac699	salud	medicinas	credito
1578d151-6019-45f3-ac22-0fa140cf979f	7075dbbd-c539-49a4-a20c-ebd750505b81	2025-12-31	mifarma - dolor estómago	\N	\N	\N	\N	\N	\N	\N	\N	\N	10.60	\N	03-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
e76dadc1-0fe2-4bba-a884-cdeb2a362794	7075dbbd-c539-49a4-a20c-ebd750505b81	2025-12-31	morena	\N	\N	\N	\N	\N	\N	\N	\N	\N	378.00	\N	03-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
c7cbaff2-0e80-4108-817e-5843400fb843	7075dbbd-c539-49a4-a20c-ebd750505b81	2025-12-31	cotillon - vincha	\N	\N	\N	10.00	\N	\N	\N	\N	\N	\N	\N	03-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
3d86f213-860a-4f75-a1b0-30ab6763069f	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-02	chicha cusco	\N	\N	\N	\N	\N	\N	\N	\N	\N	206.00	\N	03-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
98792d2e-6dbc-4d8f-92a9-428abaede031	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-01	toldos chicken	\N	\N	\N	\N	\N	\N	\N	\N	\N	99.00	\N	03-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
db552ef3-3ec2-4401-8c55-d43d0592355b	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-01	cafe de mama oli	\N	\N	\N	\N	\N	\N	\N	\N	\N	30.00	\N	03-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
0b38443c-a15a-461b-9b1a-8f1427f63125	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-01	kion	\N	\N	\N	\N	\N	\N	\N	\N	\N	163.00	\N	03-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
e0fd5e94-8909-4a1f-8c19-5b1ca9251484	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-03	taxi aeropuerto a casa	\N	\N	\N	\N	\N	\N	\N	\N	\N	60.00	\N	03-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
b3901763-51b4-4280-82b1-58ee5f26367d	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-02	taxi airbnb a aeropuerto	\N	\N	\N	\N	\N	\N	\N	\N	\N	12.00	\N	03-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
b91831c7-ee22-4ee8-8a61-22b6fb91d331	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-02	jugos	\N	\N	\N	\N	\N	\N	\N	\N	\N	15.00	\N	03-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
6f4d845e-98d4-4b8a-8c01-c68cbe213964	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-03	rodizio	\N	226.70	\N	\N	\N	\N	\N	\N	\N	\N	\N	03-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
7c793ab6-5382-49e3-8266-9f6f7564c1cf	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-03	izi pay - giovana salv lima	\N	120.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	03-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
eba7c252-a0f0-47ab-a0e9-904942fb8e5c	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-03	wong benavides	114.67	\N	30.00	\N	\N	\N	\N	\N	\N	\N	\N	03-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
bcc40c69-b7c5-4c1f-bb51-5c369d0c1da3	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-03	wong benavides - compras casa	\N	\N	\N	\N	\N	248.00	\N	\N	\N	\N	\N	03-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
7a87a664-dce3-44cf-9394-e47c89701a7d	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-03	levis larcomar	\N	\N	5.30	\N	\N	\N	\N	100.00	\N	\N	\N	03-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
70f0f5d0-6380-452d-b6c5-1606ffc1f425	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-03	puku puku larcomar	\N	32.50	\N	\N	\N	\N	\N	\N	\N	\N	\N	03-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
caf5ab10-eab3-4f8a-af7a-d9378233bebe	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-04	rappi torta	\N	\N	42.30	\N	\N	\N	\N	\N	\N	\N	\N	03-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
2cf3bda8-82bd-4505-a466-80b5ce9814c7	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-05	cinepolis	\N	82.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	03-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
3e227482-3830-44a9-860a-0898916f8aea	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-05	cinepolis	\N	50.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	03-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
61c14026-b046-4277-87e6-0181f5cd835b	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-06	primos chicken bar	\N	115.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	03-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
35582b85-5672-43b0-9465-0937f4690164	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-04-18	delivery chilis	\N	77.80	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026	2026-04-18 12:00:00+00	2026-04-19 00:19:59.435198+00	ea12e391-9867-4fb3-a265-52320bfac699	alimentacion	delivery	credito
e52278be-9063-41c9-9626-7a7fb4fa8dc5	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-04-18	clinica sanna chacarilla - inyección	\N	\N	\N	\N	\N	\N	\N	\N	\N	4.99	\N	ps|salud	2026	2026-04-18 12:00:00+00	2026-04-19 00:19:59.435198+00	ea12e391-9867-4fb3-a265-52320bfac699	salud	consultas	credito
ed38f8e7-adc7-41f2-868c-b7cc2f10dc06	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-04-18	metro de barrancp	61.97	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026	2026-04-18 12:00:00+00	2026-04-19 00:19:59.435198+00	ea12e391-9867-4fb3-a265-52320bfac699	alimentacion	supermercado	credito
3f9d9943-e2d3-480d-b2cc-6ca05fcfd694	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-04-18	subscription claude	\N	\N	\N	\N	\N	\N	\N	\N	\N	68.90	\N	ps|ahorro_extra	2026	2026-04-18 12:00:00+00	2026-04-19 00:19:59.435198+00	ea12e391-9867-4fb3-a265-52320bfac699	otros	imprevistos	credito
e2a45b6e-b644-4762-90d1-6d76cbc9b410	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-04-18	panes panadería 	2.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026	2026-04-18 12:00:00+00	2026-04-19 00:19:59.435198+00	ea12e391-9867-4fb3-a265-52320bfac699	alimentacion	supermercado	credito
23766928-a704-4779-9bb4-057f568d1e05	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-04-18	pilas balanza y llaves carro	\N	21.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026	2026-04-18 12:00:00+00	2026-04-19 00:19:59.435198+00	ea12e391-9867-4fb3-a265-52320bfac699	otros	imprevistos	credito
98640ee2-cf2c-4436-a65e-cba95b8c15d3	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-04-18	Netflix 28 marzo	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	70.70	\N	2026	2026-04-18 12:00:00+00	2026-04-19 00:19:59.435198+00	ea12e391-9867-4fb3-a265-52320bfac699	entretenimiento	streaming	credito
f4e769d6-94f6-495e-bf21-2ccbfe05841e	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-04-18	restaurante siete sopas	\N	\N	\N	\N	55.60	\N	\N	\N	\N	\N	\N	\N	2026	2026-04-18 12:00:00+00	2026-04-19 00:19:59.435198+00	ea12e391-9867-4fb3-a265-52320bfac699	alimentacion	restaurantes	credito
543f5b95-638b-4bcb-866c-b9e1c86442a0	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-04-18	san roque	20.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026	2026-04-18 12:00:00+00	2026-04-19 00:19:59.435198+00	ea12e391-9867-4fb3-a265-52320bfac699	alimentacion	supermercado	credito
b10d3854-dba1-48ee-9237-01ccfc857a42	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-04-18	restaurante walok	\N	\N	\N	\N	101.00	\N	\N	\N	\N	\N	\N	\N	2026	2026-04-18 12:00:00+00	2026-04-19 00:19:59.435198+00	ea12e391-9867-4fb3-a265-52320bfac699	alimentacion	restaurantes	credito
544ff7b5-de6a-43a6-b255-5c13cc9b524c	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-04-18	supermercados holi	32.40	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026	2026-04-18 19:58:27.218896+00	2026-04-19 00:19:59.435198+00	ea12e391-9867-4fb3-a265-52320bfac699	alimentacion	supermercado	credito
d4bb45cd-bd90-4f19-9f50-df5b4b8657ea	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-04-18	estacionamiento - cerca a larcomar	\N	5.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026	2026-04-18 12:00:00+00	2026-04-19 00:19:59.435198+00	ea12e391-9867-4fb3-a265-52320bfac699	alimentacion	restaurantes	credito
a566780d-fb00-4bdf-8ed3-f027a36209a6	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-04-18	pollo Broaster	\N	11.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026	2026-04-18 12:00:00+00	2026-04-19 00:19:59.435198+00	ea12e391-9867-4fb3-a265-52320bfac699	alimentacion	delivery	credito
25890a45-11c5-49b0-9e5d-23d944543c72	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-04-03	cinepolis	\N	\N	\N	\N	39.50	\N	\N	\N	\N	\N	\N	\N	2026	2026-04-18 12:00:00+00	2026-04-19 00:19:59.435198+00	ea12e391-9867-4fb3-a265-52320bfac699	entretenimiento	cine	credito
a4da2bc5-5a7c-426a-8f85-cfacaad17f71	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-04-18	miniso	\N	\N	92.20	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026	2026-04-18 19:23:44.634033+00	2026-04-19 00:19:59.435198+00	ea12e391-9867-4fb3-a265-52320bfac699	familia	regalos	credito
0009ae5c-677f-4dbf-a5bd-45f452f37232	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-04-18	restaurante rustica barranco	\N	\N	\N	\N	80.60	\N	\N	\N	\N	\N	\N	\N	2026	2026-04-18 12:00:00+00	2026-04-19 00:19:59.435198+00	ea12e391-9867-4fb3-a265-52320bfac699	alimentacion	restaurantes	credito
85efb711-0153-4cbf-a760-6725188d7ba9	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-04-18	restaurante rodizio	\N	\N	\N	\N	224.70	\N	\N	\N	\N	\N	\N	\N	2026	2026-04-18 12:00:00+00	2026-04-19 00:19:59.435198+00	ea12e391-9867-4fb3-a265-52320bfac699	alimentacion	restaurantes	credito
62fe578b-7a73-4498-a395-c43e10ee2ee0	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-04-18	restaurante siete sopas	\N	\N	\N	\N	44.60	\N	\N	\N	\N	\N	\N	\N	2026	2026-04-18 12:00:00+00	2026-04-19 00:19:59.435198+00	ea12e391-9867-4fb3-a265-52320bfac699	alimentacion	restaurantes	credito
b311f70d-ff90-4fa9-986b-5cd6912853b4	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-04-18	control remoto	\N	10.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026	2026-04-18 12:00:00+00	2026-04-19 00:19:59.435198+00	ea12e391-9867-4fb3-a265-52320bfac699	otros	imprevistos	credito
64a3bcc8-a818-4a37-bc64-49ec8a662cb6	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-04-18	streaming disney	\N	17.50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026	2026-04-18 12:00:00+00	2026-04-19 00:19:59.435198+00	ea12e391-9867-4fb3-a265-52320bfac699	entretenimiento	streaming	credito
c740f91f-9555-45f3-8a2a-ce9b31717ea2	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-04-03	cinepolis entradas	\N	\N	\N	\N	74.00	\N	\N	\N	\N	\N	\N	\N	2026	2026-04-18 12:00:00+00	2026-04-19 00:19:59.435198+00	ea12e391-9867-4fb3-a265-52320bfac699	entretenimiento	cine	credito
4fd093ec-27ad-4f31-8f82-100c63088bbb	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-07	didi a mamáá de Flor	\N	\N	24.22	\N	\N	\N	\N	\N	\N	\N	\N	03-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
5663ec5f-4a70-4b05-bbc3-69b9b947a0fb	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-07	tanqueado	\N	\N	\N	\N	\N	\N	140.55	\N	\N	\N	\N	03-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
8e129b78-6d2f-4733-85d2-ee1601c5de5d	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-07	tio mario	\N	90.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	03-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
52760e0c-0b20-452b-82ca-8783e1896c94	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-07	mifarma sm mamáá	\N	\N	57.40	\N	\N	\N	\N	\N	\N	\N	\N	03-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
543c4225-d97b-4c13-8b81-c8c4b646840d	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-07	lucha sm	\N	\N	48.10	\N	\N	\N	\N	\N	\N	\N	\N	03-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
11c822bc-1d5c-4206-80ab-ccfa752fb66b	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-01-07	didi jeanca	\N	\N	15.00	\N	\N	\N	\N	\N	\N	\N	\N	03-01-2026	2026	2026-04-13 06:26:27.154165+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
c19b8ae0-cb40-4339-8065-eddf191a8666	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-14	metro	\N	80.60	\N	\N	\N	\N	\N	\N	\N	\N	\N	21-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
f48d4ccb-8774-43a7-9dcf-db2bdba1d9cc	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-14	tanqueado	\N	\N	\N	\N	\N	\N	194.09	\N	\N	\N	\N	21-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
017fbae1-30e9-4998-ac08-f0aac5317bf6	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-14	la lucha	\N	82.50	\N	\N	\N	\N	\N	\N	\N	\N	\N	21-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
d25e444e-a1d0-416b-b05d-cfee955e376b	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-17	revisión técnica	\N	\N	\N	\N	\N	195.00	\N	\N	\N	\N	\N	21-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
08d2d2b9-bec4-4d57-b14d-ecabbbddddec	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-17	metro barranco	\N	24.56	\N	\N	\N	\N	\N	\N	\N	\N	\N	21-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
d6e0b6c8-56e0-4d4a-adb9-daa170a553f6	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-17	seven soups	\N	67.60	\N	\N	\N	\N	\N	\N	\N	\N	\N	21-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
83fa6a61-bbda-43ef-9e95-5d10495faf72	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-17	MANTENIMIENTO	431.79	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	21-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
113a110b-a5a3-4833-86a5-5a98a6ed3b76	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-17	celular	50.00	\N	6.90	\N	\N	\N	\N	\N	\N	\N	\N	21-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
04e4b38b-2ad6-4646-b54c-78fef7885c06	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-07	el tambo medio pollo	\N	21.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	21-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
bea39cec-901f-46ae-81f4-6ad2a29a3343	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-07	soat	\N	\N	\N	\N	\N	53.90	\N	\N	\N	\N	\N	21-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
c1918bc0-411c-462b-a34f-23052206bbdd	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-07	pan de molde	\N	7.50	\N	\N	\N	\N	\N	\N	\N	\N	\N	21-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
65c5c7ba-25d9-4602-bb17-274d4f318c95	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-14	estacionamiento 1:30pm	\N	3.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	21-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
955d2164-501e-44ae-8c40-0747c62774f5	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-14	canchita	\N	4.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	21-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
5e80058b-4bb6-4a5e-aac0-af09d767cfac	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-14	estacionamiento 7 sopas	\N	5.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	21-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
3d2e847a-6f2f-4b26-91de-657763916c93	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-14	spotify	\N	8.30	\N	\N	\N	\N	\N	\N	\N	\N	\N	21-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
4cb7012a-1fe8-477b-a80d-79eeda6bffab	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-22	mifarma	13.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	27-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
09729de0-c766-471e-aca6-db14602237b1	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-22	apparka jockey	\N	7.90	\N	\N	\N	\N	\N	\N	\N	\N	\N	27-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
12081af0-b977-406b-9431-3feef4446ce1	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-22	sanguchería el chinito	\N	60.90	\N	\N	\N	\N	\N	\N	\N	\N	\N	27-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
18a3f69d-0a6d-4120-9990-cfd6eb11c962	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-22	cinepolis	\N	121.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	27-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
8dc8ff7b-cb3d-40e4-8f9d-ee01305cae60	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-22	horneando ando	\N	148.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	27-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
d8eae67a-7ceb-4296-be01-81925d0ea211	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-23	holi boli	30.20	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	27-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
b41dd69c-5dd2-4c23-83cf-19222a5fd42b	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-24	burgerboy	\N	23.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	27-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
983287ab-5152-405e-ae36-ff6f17a9ac92	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-26	dolce capriccio	\N	133.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	27-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
143f3a3e-cdbc-4b3d-b0ec-7307293720a7	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-23	yutú	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	60.25	27-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
e34ec700-938b-483f-a349-b9bc87eec9e9	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-03-22	blu	\N	24.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	27-03-2026	2026	2026-04-13 06:26:27.427367+00	2026-04-15 01:32:00.062431+00	60bfccfc-7292-4d1d-bf7d-687dd6eeae2b	\N	\N	credito
76ff9aea-dc08-4e42-af98-99fe0c7092ed	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-04-18	cineplanet	\N	\N	148.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026	2026-04-18 19:24:57.440778+00	2026-04-19 00:19:59.435198+00	ea12e391-9867-4fb3-a265-52320bfac699	entretenimiento	cine	credito
f34e3e2e-c35e-476f-8f2f-0f16197bda2d	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-04-18	delivery chills alitas	\N	54.90	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026	2026-04-18 12:00:00+00	2026-04-19 00:19:59.435198+00	ea12e391-9867-4fb3-a265-52320bfac699	alimentacion	delivery	credito
cd0f1373-d13f-4a30-bb02-23ef6d626c6d	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-04-18	restaurante caleta	\N	91.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026	2026-04-18 12:00:00+00	2026-04-19 00:19:59.435198+00	ea12e391-9867-4fb3-a265-52320bfac699	alimentacion	restaurantes	credito
e355a2a2-d6ee-4d6a-a03e-43c577176d81	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-04-18	delivery trattoria	\N	136.80	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026	2026-04-18 20:04:04.080875+00	2026-04-19 00:19:59.435198+00	ea12e391-9867-4fb3-a265-52320bfac699	alimentacion	delivery	credito
f9fc0dd0-08b8-4dc3-96b5-8dd1099b0c6c	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-04-18	vidrios: dulcera y cafetera	\N	10.50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026	2026-04-18 12:00:00+00	2026-04-19 00:19:59.435198+00	ea12e391-9867-4fb3-a265-52320bfac699	otros	imprevistos	credito
91d26372-83c3-495e-be31-c6b5d91481af	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-04-18	lentes piscina	\N	\N	\N	\N	\N	\N	\N	\N	\N	107.00	\N	ps|ahorro_extra	2026	2026-04-18 12:00:00+00	2026-04-19 00:19:59.435198+00	ea12e391-9867-4fb3-a265-52320bfac699	otros	imprevistos	credito
9e9bbb28-4e9c-4344-8191-2dc854f36d70	7075dbbd-c539-49a4-a20c-ebd750505b81	2026-04-18	restaurante estacionamiento 27 marzo siete sopas 	\N	\N	\N	\N	5.00	\N	\N	\N	\N	\N	\N	\N	2026	2026-04-18 12:00:00+00	2026-04-19 00:19:59.435198+00	ea12e391-9867-4fb3-a265-52320bfac699	alimentacion	restaurantes	credito
\.


--
-- Data for Name: power_account_entries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.power_account_entries (id, entry_year, entry_month, description, carro, ahorro_casa, ahorro_extra, sueldo, cts, intereses_ganados, gratificaciones, afp, emergencia, jf_baby, bonos_utilidades, salud, notes, created_at) FROM stdin;
474ab126-f40f-43ba-a511-1e0d2804b5f9	2026	Marzo	taxi sanna diente	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	-26.40	\N	2026-04-13 06:26:26.819194+00
eb480ab0-3c88-4202-98cc-6fbe61194f02	2025	Enero	Grati: 3232,43 capital car	\N	\N	\N	\N	\N	\N	-3232.43	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
67fb8b6a-f5ad-4dac-972b-6b4776de77bf	2025	Enero	\N	\N	700.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
3893c141-d2a5-4dfa-b829-ca44b68b42b7	2025	Enero	Cuota	962.79	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
cb367466-1a99-4fc7-a3b7-fd93bb999244	2025	Enero	\N	\N	\N	\N	\N	\N	\N	\N	\N	500.00	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
ebb8f9d8-f98e-4fa5-b672-4fff0042d454	2025	Enero	pago cuota	-960.54	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
1038e60c-40fe-4924-a111-295dd35cd270	2025	Enero	pago viajes - Jvlio	\N	\N	\N	\N	\N	\N	\N	\N	\N	50.00	\N	\N	\N	2026-04-13 06:26:26.226319+00
3ddf365a-2a66-476c-80cc-d3737df8518f	2025	Enero	pago viajes - Flor	\N	\N	\N	\N	\N	\N	\N	\N	\N	50.00	\N	\N	\N	2026-04-13 06:26:26.226319+00
bec673fe-3007-4af3-a17c-117839399a47	2025	Enero	\N	\N	\N	\N	\N	\N	330.27	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
cacfc8d4-26ec-41f9-945b-61739192a04c	2025	Enero	manejo + licencia	\N	\N	\N	\N	-385.20	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
21f6f611-a265-4566-b4e7-c5d2cbc296c5	2025	Enero	lentes	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	-710.00	\N	\N	2026-04-13 06:26:26.226319+00
fa265462-9dcf-4143-9a15-a23df3ae0f33	2025	Enero	auxilio ama charo FyJ	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	-157.00	\N	\N	2026-04-13 06:26:26.226319+00
2c9279ec-315a-4b61-864d-d0e8d86585ff	2025	Enero	seguro carro	-63.13	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
48270797-2a16-42de-b67d-bd6ced814ceb	2025	Enero	Ropa matri Julio	\N	\N	\N	\N	-272.67	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
7dbde5ec-fbb7-4f6c-8d49-8b862322f57d	2025	Enero	Vestido maquillaje Flor	\N	\N	\N	\N	-617.00	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
2b8139d6-84b1-4dc5-b7f0-aa3a876e859e	2025	Febero	\N	\N	700.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
269a134e-f8cf-4eea-9cd4-cf3258109ed6	2025	Febero	Cuota febrero	962.79	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
5bbbb15d-aa70-4542-bda9-7f11420b15f0	2025	Febero	Pago cuota	-960.54	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
f4627daf-64f1-4dca-b85b-8156710b9935	2025	Febero	\N	\N	\N	\N	\N	\N	349.13	\N	\N	500.00	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
d264df46-3ec6-40ca-ba18-5937ed28cff1	2025	Febero	Brasil	\N	\N	\N	\N	\N	-319.68	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
bc72b75c-8f00-4525-bbce-dafa8c28f983	2025	Febero	seguro carro	-62.57	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
b15fe697-4a19-4044-bef0-33b134fed166	2025	Febero	viaje Brasil	\N	\N	\N	\N	\N	\N	-3415.76	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
7f89f46c-7956-492b-b1ca-b02e8776b4c4	2025	Febero	Isadora matrimonio	\N	\N	\N	\N	-193.90	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
84971dc1-6154-4836-a5ff-c34ebb4ef05a	2025	Febero	paseo - pago hospedaje	\N	\N	\N	\N	-299.44	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
147a70ac-2d57-4e5b-a16d-20520fca76bc	2025	Febero	paseo - pago comida	\N	\N	\N	\N	-128.00	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
81e9e1cf-d0b2-4e4b-b478-93f58f58b360	2025	Febero	\N	\N	\N	\N	\N	\N	299.10	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
bd47a489-c9c2-4632-aeac-7837cb2aaf4e	2025	Febero	Bono Julio	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	16458.02	\N	\N	2026-04-13 06:26:26.226319+00
bc483786-b88b-4b25-9f3a-c8cf0e36df16	2025	Febero	Utilidades Flor	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	8673.34	\N	\N	2026-04-13 06:26:26.226319+00
4969c539-2b9c-4cdf-9e39-61b144587875	2025	Febero	Perida maleta (compras julio)	\N	\N	\N	\N	\N	\N	\N	\N	-805.99	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
1310bedb-c34a-4c3a-b210-1a2c95214e8f	2025	Febero	cuota carro	962.79	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
38602205-10b4-4aee-82cd-18bd449d4450	2025	Marzo	\N	\N	700.00	\N	\N	\N	\N	\N	\N	500.00	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
aa082edc-fbdb-4d1d-8da0-ad3cdeb4c9ab	2025	Marzo	seguro carro	-62.27	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
2058905e-6d27-4255-a763-cce7e1e61446	2025	Marzo	cuota carro	-960.54	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
14b871eb-2dcb-46c9-9fa7-2ded8ef98ebd	2025	Marzo	Amortización Prest. carro	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	-10000.50	\N	\N	2026-04-13 06:26:26.226319+00
a7b8d190-7553-46d5-97c5-68c3840c6c81	2025	Marzo	Pago arreglo carro	\N	\N	\N	\N	\N	\N	\N	\N	-1300.00	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
8a5e9b7c-ba5d-4f87-95d9-dd79c2cfc654	2025	Marzo	Pago Soat y Revisión carro	-193.34	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
be63bbbe-5c7a-45cb-b8fc-21f771c27a96	2025	Marzo	Pasaje Lima - New York	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	-2763.19	\N	\N	2026-04-13 06:26:26.226319+00
4bafa954-670c-4d07-8830-3af783a68818	2025	Abril	Cuota carro	962.79	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
495236e3-7f66-4790-8e82-f8251eaa576e	2025	Abril	\N	\N	700.00	\N	\N	\N	\N	\N	\N	500.00	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
364f09a6-bab5-490a-ad7c-645a4631a9f4	2025	Abril	ahorro baby	\N	\N	\N	\N	\N	\N	\N	\N	\N	200.00	\N	\N	\N	2026-04-13 06:26:26.226319+00
31950dd7-c449-472a-ad17-284852794a34	2025	Abril	pago arbitrios todo 2025 - ene-dic	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	-690.74	\N	\N	2026-04-13 06:26:26.226319+00
43bdda03-4a5f-459c-81f2-63879ffa0ce2	2025	Abril	\N	\N	\N	\N	\N	\N	409.24	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
4c3ac5e5-359e-407e-b9dd-d739c117be72	2025	Abril	llantas presión	-5.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
8169a389-731c-467e-bf54-a38a52c6c547	2025	Abril	compra edredón, sábana, mueble oficina	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	-489.70	\N	\N	2026-04-13 06:26:26.226319+00
a59b45bd-af48-4c94-90fd-53bb37b741a0	2025	Abril	feritest	\N	\N	\N	\N	\N	-160.00	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
97380133-f0d2-407b-93a1-1b23479dda22	2025	Abril	compra sábanas, escurridor, cara de papa	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	-506.03	\N	\N	2026-04-13 06:26:26.226319+00
3f33ed86-74bd-40d0-9cf3-d6b792b66d97	2025	Abril	seguro carro	-61.81	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
b8190f27-3450-4a13-a4b7-d1930ad1bb0b	2025	Mayo	Casa, baby y emergencia	\N	700.00	\N	\N	\N	\N	\N	\N	500.00	200.00	\N	\N	\N	2026-04-13 06:26:26.226319+00
777a37e1-dc75-4e52-9cbd-f1abbb6a8ddf	2025	Mayo	Cuota del carro	724.25	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
0b155a5a-9311-426e-9416-b75e2706eab4	2025	Mayo	Intereses ganados a ahorro para casa	\N	1000.00	\N	\N	\N	-1000.00	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
aca2237c-a47f-47aa-b97c-c868a9abcefc	2025	Mayo	\N	\N	\N	\N	\N	\N	381.41	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
39d575d5-9663-49f0-af40-23bbe2c33842	2025	Mayo	\N	-724.25	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
7582aa43-60fa-48b8-acd2-57f3d0e60c25	2025	Mayo	Gastos Viaje Dólares	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	-11117.98	\N	\N	2026-04-13 06:26:26.226319+00
e030a5d0-1eb8-4a76-9089-883152c5cb89	2025	Mayo	\N	\N	\N	\N	\N	\N	344.12	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
dbbfec82-fbd9-4edb-ae41-0c55d3329af1	2025	Mayo	Cambio de dolares	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	-738.60	\N	\N	2026-04-13 06:26:26.226319+00
81c9e16a-3209-477e-a5b5-422d15211770	2025	Junio	\N	724.25	700.00	\N	\N	\N	\N	\N	\N	500.00	200.00	\N	\N	\N	2026-04-13 06:26:26.226319+00
be30d7aa-bfda-47e3-be1f-388461745295	2025	Junio	Cts Flor	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	4338.04	\N	\N	2026-04-13 06:26:26.226319+00
d37fed36-f149-4e1a-8eef-ab1779b6c3b4	2025	Junio	Cts Flor	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	6671.76	\N	\N	2026-04-13 06:26:26.226319+00
8bd86624-8eb5-426e-9505-3b232024f7d0	2025	Junio	seguro carro	-60.70	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
7ab96308-7c7a-4c74-b04f-ee9a14622928	2025	Junio	pago viaje	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	-18834.42	\N	\N	2026-04-13 06:26:26.226319+00
98bf1c78-e83e-41ce-bfa7-8b2ca4a781cb	2025	Junio	\N	-724.25	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
ff9ba3c9-e007-4d6f-a41c-52689bb60e1d	2025	Junio	prestamo viaje USA	\N	\N	\N	\N	\N	\N	\N	-22127.83	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
e38f4382-2c94-4c10-ae08-f3195d94c6d9	2025	Julio	\N	724.25	700.00	\N	\N	\N	\N	\N	\N	500.00	200.00	\N	\N	\N	2026-04-13 06:26:26.226319+00
46bf42fe-1ccc-4e75-9b2f-7864455aeff9	2025	Julio	sobrante de junio	\N	\N	403.42	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
409bc66e-bb31-4ab6-be48-0cc986005465	2025	Julio	sobrante de julio	\N	\N	847.43	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
c9e7ec0f-aa14-45d4-8ede-2e3b39b3eae2	2025	Julio	\N	\N	\N	\N	\N	\N	319.25	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
2c9265b6-fee3-417b-bd9f-deb672480704	2025	Julio	teclado iPad	\N	\N	\N	\N	\N	\N	-989.50	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
66d52e84-c824-49d4-8d0e-ed49d118df61	2025	Julio	pago Flor 1ra cuota USA	\N	\N	\N	\N	\N	\N	\N	500.00	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
d048de6c-271b-413c-b884-4bc462e92ba4	2025	Julio	grati Flor - mes julio	\N	\N	\N	\N	\N	\N	\N	7964.00	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
c5882402-e826-4275-89e8-2dfdaf02de39	2025	Julio	grati Julio - mes julio	\N	\N	\N	\N	\N	\N	\N	12281.99	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
653f0392-4ca9-4aa3-9931-e0dada9037be	2025	Julio	lo restante se repartio	\N	\N	\N	\N	\N	\N	\N	-368.26	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
bffe0da2-375d-4807-94f2-545a3618e61b	2025	Julio	pago Flor 2da cuota USA	\N	\N	\N	\N	\N	\N	\N	184.13	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
fcae7773-8e25-412c-92a0-9ea58c4fab03	2025	Julio	Boda Luis y compras saga	\N	\N	-687.53	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
3726e3b0-9301-4111-96db-90b452b3a491	2025	Julio	Monitor Julio	\N	\N	\N	\N	\N	\N	-404.00	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
de699798-5584-4988-ab2a-1fe4d500861d	2025	Julio	\N	-724.25	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
ec5f5264-df58-4022-951b-ec23ca43ee12	2025	Julio	Pago del carro doble cuota	-724.25	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
d154a9d7-b60f-44b7-898e-119f39535b8b	2025	Setiembre	Cuota carro setiembre	724.25	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
98891f99-3397-41a1-b72d-21c4cfff9a49	2025	Setiembre	sobrante agosto	\N	\N	933.28	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
6f832297-c665-4e13-8aa2-18ea44261180	2025	Setiembre	pago título	\N	\N	\N	\N	\N	\N	-415.00	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
c62c7286-e7e1-4a0d-b29d-bcb7c8e6c1b2	2025	Setiembre	Devolución de ganancias ropa venta	\N	\N	160.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
9e2fd3e4-2877-47ef-81da-19ecb90376d7	2025	Setiembre	Cuota carro setiembre	-724.25	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
ba87147a-7b96-4cc6-9533-641b6b126e63	2025	Setiembre	gastos carro	-460.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
0688462f-74a4-4107-b3d7-06d9687d1359	2025	Setiembre	almuerzo papá	-100.29	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
246de4f5-a397-4975-81a8-6f693017e1c8	2025	Setiembre	gasto extras del mes de setiembre	\N	\N	-553.44	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
f976ee97-38e1-4772-83f9-ac4e57ddb6cd	2025	Setiembre	dentista	\N	\N	\N	\N	\N	\N	\N	\N	-585.00	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
eb135c31-5a52-46e9-8fa4-e201637af27a	2025	Octubre	\N	\N	1000.00	504.43	\N	\N	\N	\N	\N	500.00	200.00	\N	150.00	\N	2026-04-13 06:26:26.530901+00
61c063f3-438d-4e69-b530-bc5aa9176a86	2025	Octubre	Cuota carro octubre	724.25	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
6e863ed1-6845-47e3-810b-e99e8e42124a	2025	Octubre	Cuota carro setiembre	-724.25	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
8d45e321-a849-47e1-aa6a-f8ab9e0d23f1	2025	Octubre	Dentista Flor	\N	\N	\N	\N	\N	\N	-125.00	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
a35088e0-c648-49cb-a627-e34cbb063ac4	2025	Octubre	\N	\N	\N	\N	\N	\N	312.37	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
256b4015-5c88-4ed6-bf1e-f9e3f6d97050	2025	Octubre	Batería carro	-430.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
d73b7097-fca1-4c3b-a931-41d0ccd710dc	2025	Octubre	power a casita	\N	\N	-129.04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
7ec24449-2742-487f-b8a2-c186ab0e3518	2025	Octubre	power a FyJ	\N	\N	-1245.86	\N	-52.94	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
3bfbe922-9d89-4af9-ad74-b2c9c4ea1367	2025	Octubre	seguro Rimac	-235.71	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
7e0e5261-27f5-41c7-afce-17adfcf8dab6	2025	Noviembre	\N	\N	1000.00	380.52	\N	\N	\N	\N	\N	500.00	200.00	\N	150.00	\N	2026-04-13 06:26:26.530901+00
cca4933f-0fb0-425e-b1ac-e271ea7431e3	2025	Noviembre	prestamos carro	724.25	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
537b6671-2668-43e3-bf17-4e76dacff87b	2025	Noviembre	seguro carro Rimac	234.53	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
164ea51e-04ff-4719-8bf9-1457667c0ae9	2025	Noviembre	Cuota carro octubre	-724.25	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
c1201929-925a-4be0-b7bb-30829ffcf1fe	2025	Noviembre	\N	\N	\N	\N	\N	\N	324.34	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
46e9834b-ae26-4c16-bb1d-d469998994e4	2025	Noviembre	cts Flor	\N	\N	\N	\N	4387.21	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
47fdc8f5-a34e-4f1d-bd4c-ae276af92e36	2025	Noviembre	cts Jvlio	\N	\N	\N	\N	6712.33	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
2fdc02c2-abbb-496e-9e27-2a66f0660618	2025	Noviembre	Navidad	\N	\N	\N	\N	-896.43	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
a3302b05-5a03-4fee-b176-e3ea4e764902	2025	Noviembre	seguro carro Rimac	-237.69	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
9694a45f-43e1-42d8-8b50-552bbdb3c1c8	2025	Noviembre	afp julio - 1era parte	\N	\N	\N	\N	\N	\N	\N	5350.55	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
ccc97797-f54a-4a4b-a56c-e7925d6e2f63	2025	Noviembre	Viaje a Cusco	\N	\N	\N	\N	-580.77	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
ccdce473-1d33-4b57-9850-2e48037e3590	2025	Noviembre	Salvavidas a FyJ	\N	\N	-237.40	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
f2dcb7f6-bec6-4875-bc45-a3cfb4582d5f	2025	Diciembre	Butrich	\N	\N	\N	\N	-632.00	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
9d4ce0c9-88ae-46ad-8632-a5af3b087403	2025	Diciembre	BBW navidad	\N	\N	\N	\N	-124.00	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
16a0e664-1f46-4703-b87f-e8d79769b6dd	2025	Diciembre	youtube noviembre	\N	\N	-60.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
676be0a1-c351-4848-a52a-8d9a0edab8d1	2025	Diciembre	Compra de millas viaje	\N	\N	\N	\N	-59.00	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
cea1f870-3f27-40fd-b79a-7ac1005240d8	2023	Fin 2023	\N	19700.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
30fae1ed-5965-4f0a-8fed-8fb8ed3ffa18	2024	Enero	\N	\N	700.00	\N	\N	\N	118.29	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
4894a92f-7b12-4d10-a9e1-5a653df04241	2024	Febero	Sueldo Flor	\N	700.00	\N	\N	\N	87.32	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
e548e165-b777-441d-a24e-0cf331cfc7c9	2024	Febero	BonoJulio	\N	\N	7291.58	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
7d12359c-6984-47b0-9480-3b79e86624de	2024	Febero	Utifloryjulio	\N	\N	9641.80	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
ce254ee6-2bbd-4f8a-bdc4-b53aea4381d0	2024	Febero	Usado en restante garantia	\N	\N	-6000.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
c76943c5-fdbb-49e8-8ed4-118c7b8ddabe	2024	Febero	pago arbitrios	\N	\N	-516.76	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
877669a7-7d04-4a39-a55b-8903312cfdbb	2024	Febero	total compras hasta 24 marzo	\N	\N	-379.50	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
26996fe4-77e8-4aa3-b667-361be701f579	2024	Febero	separacion depa	\N	\N	-3004.80	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
4b697562-c956-46b4-9ed9-168bd75302f2	2024	Febero	comedor y muebles	\N	\N	-1920.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
338c1729-4e97-42c0-b624-37c527e83012	2024	Febero	escritorio	\N	\N	-488.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
a4fc9658-95ce-46c7-a7a4-b0d2d00506a7	2024	Marzo	Gastos mudanza	\N	\N	-1043.20	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
974a3755-829e-459f-8ae2-f81d82850781	2024	Marzo	Casa	\N	700.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
c8328227-5093-413e-959d-979f889357f0	2024	Marzo	Alquiler no pagado	\N	\N	2500.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
228273f5-9717-49b6-849b-a6e65129d313	2024	Marzo	tocacor	\N	\N	-309.90	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
e7600d31-71aa-4b02-9618-e9a3d88f2571	2024	Marzo	terma	\N	\N	-638.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
b4693999-a9eb-4ddc-afe2-31938af24f6d	2024	Marzo	Devolución garatia miguel grau	\N	\N	3898.71	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
68446e29-e4c1-41ae-872d-7897c93bc259	2024	Marzo	\N	\N	\N	\N	\N	\N	157.97	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
12215bd3-2eed-4bdd-b695-0835626aefa3	2024	Abril	Saga	\N	\N	-343.44	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
3d0d24fe-9596-4e19-a58a-2c986dd2f5a7	2024	Abril	instalacion terma	\N	\N	-120.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
2b56338a-c388-4df7-ba9e-0b77d41c4861	2024	Abril	pasajes mueblería	\N	\N	-10.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
35884a31-3833-4b28-bac5-4bac48a54c67	2024	Abril	copia llave	\N	\N	-25.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
bd8c63f8-a12a-4d5b-b0fd-5a846735b354	2024	Abril	microondas	\N	\N	-374.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
2a37e294-84bf-4657-907c-30eb6886a714	2024	Abril	didi mueblería	\N	\N	-8.64	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
794ed254-8170-4a90-bc22-704435492546	2024	Abril	veladores	\N	\N	-650.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
e9debf08-7f94-4475-9780-9a93d855bbd1	2024	Abril	sodimac	\N	\N	-128.16	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
17a942de-3ed5-4c6b-996d-20f9bc23731f	2024	Abril	Mueble + comedor	\N	\N	-4484.80	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
f8b8d5bb-3fd1-4a79-b866-b076673e4f85	2024	Abril	Movilidad mueblecome	\N	\N	-190.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
280cacc1-327f-479a-8d96-f96db63731ee	2024	Abril	Puff	\N	\N	-140.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
b7a42198-9f8f-4890-b023-8195ff3a82f2	2024	Abril	Compras casa	\N	\N	-401.15	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
9c873ca0-81ce-4790-b0c3-222283b564ba	2024	Abril	Casa	\N	700.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
4a443cf9-137a-4468-b799-dec8006c3f96	2024	Abril	Zara	\N	\N	-2156.74	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
775ea306-0aee-4a4f-bcbd-615e80064b34	2024	Mayo	\N	\N	\N	\N	\N	\N	158.78	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
6049db4f-306e-4c9f-8b51-ea8667e99376	2024	Mayo	\N	\N	\N	\N	\N	\N	137.47	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
6048d903-1f0b-441e-880a-9b273e7ec9a3	2024	Mayo	\N	\N	700.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
eddc0e84-1a9a-4290-9d27-73944179eef3	2024	Junio	CTS	\N	\N	8584.21	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
e206aa0e-24f2-42db-8879-7a82e8bcdf4f	2024	Junio	deuda europa	\N	\N	-4000.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
3dc3dc96-33a1-4a25-8287-6022defd7dd6	2024	Junio	vijaes (junioagosto)	\N	\N	1000.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
622a3425-906c-4eb2-93d4-74781e217564	2024	Junio	Sobro de CTS	\N	\N	1000.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
40f01e33-fbd9-4d92-bd94-fac2a771a293	2024	Junio	nos lo merecemos	\N	\N	-2000.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
3278d468-7f19-4f01-b298-cb8983961790	2024	Junio	ropa julio + crocsx2	\N	\N	-1081.70	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
d971a922-8651-452e-9eb2-eee2038f2720	2024	Junio	Extra luz + internet	\N	\N	-83.10	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
9c6d1480-55c4-41a1-926d-a3b525d88038	2024	Junio	Ropa flor	\N	\N	-495.25	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
a2f906ed-3e8d-4d51-8149-9561ddef45be	2024	Junio	Tendedero	\N	\N	-260.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
27da1059-771c-421f-91ab-61972db64fe2	2024	Junio	Fotos-wolpic	\N	\N	-414.20	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
d8759f7b-51ce-45b9-b85a-87c9573e38ad	2024	Junio	\N	\N	700.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
430d73b4-e715-4a0b-a9d2-5f81e0de69a6	2024	Junio	\N	\N	\N	\N	\N	\N	145.78	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
7884bed2-e5ef-4333-af2b-f5be1bfdbf4c	2024	Julio	Gratificación Julio	\N	\N	\N	\N	\N	\N	11742.50	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
9eb48d49-2aa1-4561-9b87-73b3e5d14e4f	2024	Julio	Grati a Julio	\N	\N	\N	\N	\N	\N	7686.00	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
f89812da-7a7e-4762-8d03-eb1220bd89cf	2024	Julio	Pasaje a trujillo regreso	\N	\N	-120.14	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
e0c414fe-afc6-4caa-ae28-d3494addd637	2024	Julio	Regalo JyF grati	\N	\N	\N	\N	\N	\N	-2004.80	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
88581db1-3e0d-4c41-a9bf-449712edd7d0	2024	Julio	AFP Flor 1ra parte	\N	\N	\N	\N	\N	\N	\N	5150.00	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
122ea92b-6b07-4c2d-aa37-e2efdd21da93	2024	Julio	Pago deuda toatal Europa	\N	\N	\N	\N	\N	\N	-14989.79	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
8c22da8c-868a-47bc-93eb-8c07ca0d85d5	2024	Julio	Examen medico manejo	-298.95	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
6e82847b-1624-44e0-b0e4-9107b9f39010	2024	Julio	Pasaje ida limaTrux	\N	\N	-361.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
9e7f0148-92a4-40a0-8c99-40b3375814c1	2024	Julio	AFP Julio 1ra parte	\N	\N	\N	\N	\N	\N	\N	5150.00	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
85424fb3-38df-46e3-afaa-c9970d7a626d	2024	Agosto	\N	\N	700.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
38d80211-f97b-4773-ab9b-088045246ca9	2024	Agosto	\N	\N	\N	\N	\N	\N	206.16	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
48fa4525-2824-44b5-9226-1bb220d0a048	2024	Agosto	Devolución préstamos	\N	\N	284.31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
cdd2a1c9-a0c9-420a-bd35-dca7009c7016	2024	Agosto	AFP Flor 2da parte	\N	\N	\N	\N	\N	\N	\N	5152.24	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
8839f68f-61ef-41c2-9d78-eb9dbc901a90	2024	Agosto	Hospedaje vijae	\N	\N	-240.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
e7edabcf-0795-40d6-b766-3b965909430d	2024	Agosto	Pago examen teorico	-50.40	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
f88c0947-1022-41c3-98d0-5d5ff851c461	2024	Agosto	Viaje gastos	\N	\N	-528.82	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
cadd5200-d95e-4eb4-8395-5e489309ac9f	2024	Agosto	mueble sal	\N	\N	-1000.00	\N	\N	-352.80	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
17be096b-8438-4bb0-bf3c-960eb8cfedf4	2024	Agosto	AFP Julio 2ra parte	\N	\N	\N	\N	\N	\N	\N	5149.91	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
ca35605c-8522-4504-a585-1e046e2c07de	2024	Agosto	Gastos Marbal	\N	\N	-284.31	\N	\N	-304.69	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
a412f6db-f348-406a-9de7-bb0d7af0b3b9	2024	Agosto	Gastos FyJ	\N	\N	\N	\N	\N	-150.00	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
1541538f-fb36-4fcb-8fb4-55ac8e2d1666	2024	Agosto	AFP Flor 3ra parte	\N	\N	\N	\N	\N	\N	\N	4010.00	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
deab62da-de22-41b4-9cf5-522024069212	2024	Setiembre	Sobrante de agosto	\N	\N	1000.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
669b4d1d-35ac-4d8b-a385-df2129b0acd6	2024	Setiembre	\N	649.35	50.65	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
292e0a89-26ea-4f82-9750-36171167fa36	2024	Setiembre	\N	\N	\N	\N	\N	\N	237.40	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
12cfb766-1f6c-4510-90e5-a86be294f049	2024	Setiembre	Gastos Manejo	\N	\N	\N	\N	\N	-230.70	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
d70d031a-e49e-4e91-84d5-b660ac34ae1f	2024	Setiembre	AFP Julio 3ra parte	\N	\N	\N	\N	\N	\N	\N	5149.99	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
1f4f4d12-4c90-4cf6-b89b-5ae4a5ad5f79	2024	Setiembre	Prestamo	45000.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
03f7b556-394b-4967-bf3c-a27b5338a46f	2024	Setiembre	Compra de carro	-61737.26	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
61192de4-bd93-4a81-b9fb-52b68d1b3b3b	2024	Setiembre	Gastos carro	-718.21	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
eb9e101d-6fda-449c-a17f-93ea09c2e09b	2024	Setiembre	Oxigenando FyJ - AmáCharo	\N	\N	-500.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
450b630a-e830-4c8b-bbc4-654063cf1cad	2024	Octubre	\N	\N	700.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
0d4b07e9-4fc2-4011-9f61-e2e0f2f2b5e3	2024	Octubre	AFP última parte	\N	\N	\N	\N	\N	\N	\N	5149.99	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
65aab122-372d-4eb8-98bf-7c0eb187b511	2024	Octubre	lunas	-500.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
f5444a57-41c5-46cf-a4bc-ff54f9398f45	2024	Octubre	\N	\N	\N	\N	\N	\N	234.28	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
eaa57a40-3eb2-49ca-90d5-fc65acb58be6	2024	Octubre	gastos pastillas carro	-269.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
33db5a21-b532-413d-bc83-4ce50f9b7e48	2024	Octubre	Seguro carro	-64.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
2eeec480-e6d9-4d1f-859f-459e70b501c9	2024	Octubre	Cuota carro	-962.79	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
89c71569-3df1-4675-b2f5-53054f69a08c	2024	Octubre	pago FYJ	\N	\N	-206.71	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
67f47b8a-aa49-427d-b7b4-a0a34985cd98	2024	Noviembre	\N	\N	700.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
3a4e815f-f079-422e-a633-9d97836d15a6	2024	Noviembre	Cuota	962.79	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
647fbe6b-51fd-4ad8-8dd9-2720e6ef8a5d	2024	Noviembre	\N	\N	\N	\N	\N	\N	230.42	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
dd39e8f6-9a21-41f5-8012-6c09af01963f	2024	Noviembre	CTS Flor	\N	\N	\N	\N	4222.00	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
45182ed7-e43e-4834-a993-3c883d19ee19	2024	Noviembre	CTS Julio	\N	\N	\N	\N	6411.95	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
76cdbc06-7877-4821-a2a3-9e3a6391b230	2024	Noviembre	show burbujas Rafa + Promo Ale	\N	\N	\N	\N	-380.00	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
2c759eb1-7c2a-46ed-b696-53c3ea8afd1b	2024	Noviembre	Navidad	\N	\N	\N	\N	-479.40	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
01063ac7-6910-4723-83c1-38a192a0eed9	2024	Noviembre	Resonancia	\N	\N	\N	\N	-302.67	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
7fe93edd-7d9e-4d78-880a-399cfc86e778	2024	Noviembre	traje flor	\N	\N	\N	\N	-324.00	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
33caefd9-0430-44f3-878f-99298486a4db	2024	Noviembre	Gym	\N	\N	\N	\N	-1049.00	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
87370243-63c7-4c2c-864b-cf896b0d7f77	2024	Noviembre	CasaAndina	\N	\N	\N	\N	-599.68	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
831433e8-6f2f-45cd-a280-0978f86a208f	2024	Noviembre	Regalo S&S	\N	\N	\N	\N	-1500.30	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
9d2d28eb-b646-4452-907c-4aa82c2e3a09	2024	Noviembre	Manejo	\N	\N	\N	\N	-55.00	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
e8cf6950-ea20-4a79-856f-4849f300886c	2024	Noviembre	seguro carro	-63.33	\N	\N	\N	\N	240.42	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
d463a9d9-4c69-464a-bfab-5637ebcd8bb8	2024	Noviembre	Limpieza	-35.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:25.830544+00
4d71dc99-1e33-44f6-83b6-1b9dcd8d7257	2025	Julio	mora carro por demorones	-1.32	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
27dc4e28-39f6-4fc7-8b63-2889c273ac49	2025	Julio	salvavidas a FyJ	\N	\N	-334.91	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
9f59476e-1d8d-4772-8430-e74403d9ce9e	2025	Julio	entradas chiquiwilo	\N	\N	-278.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
3e0cc1e3-720f-422c-8a08-c76d2f38cb31	2025	Julio	\N	\N	700.00	\N	\N	\N	\N	\N	\N	500.00	200.00	\N	\N	\N	2026-04-13 06:26:26.530901+00
3a6e31c9-3911-4187-9610-4b7abf97fd9a	2025	Julio	Cuota carro julio	724.25	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
71de9f28-55dc-4c94-b19c-b67b11080239	2025	Julio	Sobrante julio	\N	\N	760.97	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
76688681-e4cd-49c9-9ac6-7fc280e2f001	2025	Julio	resta de lo sobrante	\N	\N	-220.75	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
afce6057-3657-43e9-8d1b-0c35307e1ae9	2025	Julio	seguro carro	-59.79	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
01e17b9b-e14a-4a42-a737-52b51cb1d425	2025	Julio	devolución sunat	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	194.07	\N	\N	2026-04-13 06:26:26.530901+00
f18d8b83-5701-4d07-a391-a56533c28274	2025	Julio	pago Flor 3ra cuota USA	\N	\N	\N	\N	\N	\N	\N	300.00	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
352705dd-0f28-4db7-9931-bcf9d0bda151	2025	Agosto	intereses ganados mes anterior	\N	\N	\N	\N	\N	275.42	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
ccfeeac5-9d23-4bf8-be57-8531b1c4d6b0	2025	Agosto	préstamo pago feria	\N	\N	-160.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
0ee515c5-4ded-4c1f-8a6e-72cd802f76b3	2025	Setiembre	\N	\N	\N	\N	\N	\N	316.40	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
9c1db6ed-23e9-4c1d-b64f-cef145aa7796	2025	Setiembre	Ferula dental Flor	\N	\N	\N	\N	\N	\N	-450.00	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
e9d9167e-f722-48aa-ac7c-27e983df3a9b	2025	Setiembre	Salva vida agosto	\N	\N	\N	\N	\N	\N	-482.18	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
21c0a00b-1177-46aa-9a5e-a22433bfc0d6	2025	Setiembre	Seguro carro	-59.53	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
597b8b19-5afd-40ac-a3b1-f6b33203a8e7	2025	Setiembre	\N	\N	700.00	\N	\N	\N	\N	\N	\N	500.00	200.00	\N	\N	\N	2026-04-13 06:26:26.530901+00
d333af5b-b70f-4256-89f2-a68b0c513c0a	2026	Abril	farmacia mifarma chacarilla - corte 18-04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	-35.00	\N	2026-04-19 00:20:00.777531+00
82b3267c-bf24-4426-a8c0-56bebcf286bc	2026	Abril	clinica sanna chacarilla - inyección - corte 18-04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	-4.99	\N	2026-04-19 00:20:00.777531+00
3ece51a8-26a2-420b-aeea-ff85484c9b54	2026	Abril	subscription claude - corte 18-04	\N	\N	-68.90	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-19 00:20:00.777531+00
469c55e0-a5e5-4d6b-8069-8a5c4aeb4f3b	2026	Abril	lentes piscina - corte 18-04	\N	\N	-107.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-19 00:20:00.777531+00
e58c04be-8eea-4575-88cd-cf215a7242f6	2024	Noviembre	menu	\N	\N	-29.80	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
d54c9b65-f3a3-432b-b8ed-0721a1d4b241	2024	Noviembre	Extra Noviembre	\N	\N	-263.49	\N	\N	-340.01	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
f68fbc7f-8f09-4c55-ba67-cbf56c6ea7a2	2024	Noviembre	B2 Flor	\N	\N	\N	\N	-740.00	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
94ca2876-8699-4db7-badf-3cc80dea0aed	2024	Noviembre	Sodimac	\N	\N	\N	\N	-326.40	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
5a1857ea-b4c2-4bee-8dc1-42b003b320aa	2024	Noviembre	Air fryer	\N	\N	\N	\N	-351.90	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
6fda1f18-42b9-47ae-b305-0bda3a72bf73	2024	Noviembre	Emergencia	\N	\N	\N	\N	\N	\N	\N	\N	5000.00	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
c66f443c-f9dc-4c6b-a893-a55d22458826	2024	Diciembre	Cuota	962.79	700.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
557b85a3-6273-4573-b0a2-b2808287b0c2	2024	Diciembre	pago cuota	-960.54	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
a743a6ac-9062-4703-98a1-d0afd15afd2f	2024	Diciembre	\N	\N	\N	\N	\N	\N	\N	\N	\N	500.00	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
aa774a05-b809-4a50-aece-f53e3a1a3bdf	2024	Diciembre	Espejo	\N	\N	\N	\N	-579.80	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
b5e230c5-94f6-4304-86a8-0bab4fdccd77	2024	Diciembre	Camino mesa	\N	\N	\N	\N	-208.00	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
9c630268-562c-47d3-a52a-93af4b208017	2024	Diciembre	GratiFlor	\N	\N	\N	\N	\N	\N	7686.00	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
5b89cec9-700f-4484-b3fd-136f45494043	2024	Diciembre	Casa Andina igv	\N	\N	\N	\N	-111.61	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
b5aba8f8-a0b8-4ee5-92a5-5ef4d68d9ca7	2024	Diciembre	Grati señora Sussy	\N	\N	\N	\N	-50.00	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
279b8038-31b5-4a3e-bafb-0f88f0363d0d	2024	Diciembre	pagalope prueba de manejo Flor	\N	\N	\N	\N	-31.60	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
1422f850-f1cc-406a-ad21-0117bcbae7f8	2024	Diciembre	GratiJulio	\N	\N	\N	\N	\N	\N	11742.50	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
a0a8bcce-d673-46f9-907a-d0b064befcfe	2024	Diciembre	RegaloaFloryJulio	\N	\N	\N	\N	\N	\N	-4005.25	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
56630a4b-7529-4d23-a27c-790ca635877e	2024	Diciembre	Oxigeno FyJ	\N	\N	\N	\N	\N	\N	-504.82	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
0faa83d6-057f-4bd4-bc62-a5fe049b5f36	2024	Diciembre	ViajeaPiura (millasLatam)	\N	\N	\N	\N	\N	\N	\N	\N	-894.00	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
5e4a2eab-2207-4c4e-b2c3-8bb4ce504a36	2024	Diciembre	seguro carro	-63.33	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
80c03201-d571-4728-b926-088d8e242507	2024	Diciembre	Bono Flor	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	9867.00	\N	\N	2026-04-13 06:26:26.226319+00
91b4394f-ea92-4465-b52d-cbdf3559feb3	2024	Diciembre	Viaje a Brasil + hospesaje	\N	\N	\N	\N	\N	\N	-6704.15	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
34cf9e1a-8795-4122-b4fe-2d37713e072d	2024	Diciembre	devolución gym Julio	\N	\N	\N	\N	312.98	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
b4c572cf-3d34-47e5-84fa-6b603aec7a36	2025	Enero	polos Julio	\N	\N	\N	\N	\N	\N	-270.00	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
26f71b15-b722-4069-882a-109dcb43f954	2025	Enero	CTS: 1767,57 capital car	\N	\N	\N	\N	-1767.57	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.226319+00
85590dc8-aa7a-4d55-8f25-d75ee88465b4	2025	Diciembre	Navidad compras	\N	\N	\N	\N	-175.32	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
888544ce-c288-45d4-a1d6-9464346fa7f7	2025	Diciembre	\N	\N	\N	\N	\N	\N	337.59	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
365eb9b4-7881-4f24-8924-464b9ae3d49a	2025	Diciembre	descuento de sentimos desconocidos	\N	\N	\N	\N	\N	-0.48	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
7ab255e1-c069-45f3-9772-7642222d3368	2025	Diciembre	\N	\N	1000.00	\N	\N	\N	\N	\N	\N	500.00	200.00	\N	150.00	\N	2026-04-13 06:26:26.530901+00
b96e8841-e96e-4717-b65f-ccfc619ccbd3	2025	Diciembre	sobrante diciembre	\N	\N	290.74	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
b03a8440-931b-4f57-bf24-05304cd64830	2025	Diciembre	préstamo carro nov	724.25	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
9a557fd4-f095-4fe6-b355-ba32f4889b9a	2025	Diciembre	seguro carro	234.53	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
bf9239a3-3e60-44ed-b5b5-ed774a8ed1c3	2025	Diciembre	pago cuota nov	-724.25	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
9b5325d4-7a6c-4ff6-b0ac-742abf46ec47	2025	Diciembre	Pago extralinea carro	\N	\N	\N	\N	-3000.00	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
e06067ca-b0b5-4f62-8d41-90c3bdc210ea	2025	Diciembre	parlante echo studio	\N	\N	\N	\N	-1199.99	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
4cebdbde-5afe-4b05-be1a-11400008c129	2025	Diciembre	makro canastas navidad	\N	\N	\N	\N	-373.08	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
9c618fc1-33a5-440c-8d90-00321290c9ec	2025	Diciembre	salud	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	-95.90	\N	2026-04-13 06:26:26.530901+00
5f00d57c-7af1-4909-a7c4-1c27841c33f2	2025	Diciembre	seguro carro	-233.01	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
38d085f7-d18e-4d58-8e25-3db98ded9299	2025	Diciembre	tabas jvlio	\N	\N	\N	\N	-509.91	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
bf8611e5-b068-4837-9261-b5142542ba46	2025	Diciembre	suscripción office 365	\N	\N	-30.99	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
25c62ad4-6131-4a3b-99b8-55653bc294bc	2025	Diciembre	Grati Julio	\N	\N	\N	\N	\N	\N	12276.79	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
ef2957a3-bd28-412b-af10-0fa596beb01d	2025	Diciembre	Bono navidad julio	\N	\N	\N	\N	\N	\N	-2000.00	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
59896c09-6100-4626-9828-a81245d783f8	2025	Diciembre	Grati Flor	\N	\N	\N	\N	\N	\N	7964.00	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
df38b0d7-c238-4f22-8187-bdcc0048a864	2025	Diciembre	bono navidad flor	\N	\N	\N	\N	\N	\N	-2000.00	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
6ca63dd4-1f3a-423c-bef4-5a0638ef63a9	2025	Diciembre	\N	\N	\N	\N	\N	\N	\N	-0.55	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
11e83131-a3ed-4568-a50f-cf4f7272259e	2025	Diciembre	AFP - segunda cuota	\N	\N	\N	\N	\N	\N	\N	5349.75	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
dac6f4ad-1fa7-4671-97a7-8cf6cf14c4d1	2025	Diciembre	ayuda a FyJ	\N	\N	\N	\N	-270.02	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
0d849863-c73d-4043-84c1-e35cdf7a7da3	2025	Diciembre	Bono FLor	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	7666.00	\N	\N	2026-04-13 06:26:26.530901+00
d9e40d68-adaf-4a61-b0c1-943e7481a146	2025	Diciembre	viaje cusco	\N	\N	\N	\N	-1703.11	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
d1724eea-45a3-48e2-af76-7833b8ae4f36	2025	Diciembre	consulta media + pastillas gase	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	-55.50	\N	2026-04-13 06:26:26.530901+00
0f20c221-f35b-48e5-a4b5-1e392e2a1b8a	2026	Enero	\N	\N	1000.00	\N	\N	\N	\N	\N	\N	500.00	200.00	\N	150.00	\N	2026-04-13 06:26:26.530901+00
82e52f2d-0592-4844-93bf-3e509eb6271d	2026	Enero	sobrante enero	204.09	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
0c5f6746-ec49-4366-9ad6-59f5468be53d	2026	Enero	préstamo carro dic	724.25	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
f5ad6c33-f65d-44ad-b330-efef5cd8c9de	2026	Enero	seguro carro	234.53	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
345be680-b69b-4101-8b7d-80ab31004b20	2026	Enero	Vinos dulces Cusco	\N	\N	\N	\N	-35.00	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
3234f2e6-80ee-4388-a95d-492fed67800e	2026	Enero	Intereses ganados mes anterior	\N	\N	\N	\N	\N	456.14	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
a074f043-7ab6-46d7-8307-e03a21b69eeb	2026	Enero	retiro en cajero cusco	\N	\N	\N	\N	-150.00	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
189b9e5a-fa1f-4b2c-a0c2-43cc00390702	2026	Enero	pago cuota dic	-724.25	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
b857bd98-a7c5-4ed5-8d71-dde879cade5a	2026	Enero	seguro carro	-232.25	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
1f897e58-6522-4ba6-870a-f5f89f3689d7	2026	Enero	Vitaminas baby	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	-41.50	\N	2026-04-13 06:26:26.530901+00
642a6a06-5bc5-4efa-839d-33dbc87df9d2	2026	Enero	gastos cusco jvlio	\N	\N	\N	\N	-973.60	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
8384c3ad-12b5-4cba-a1a8-9c929b008213	2026	Enero	compra sartenes roca volcánica	\N	\N	\N	\N	-248.00	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
f11465cb-af10-49cf-8803-e018ce8f724b	2026	Enero	gastos Cusco flor	\N	\N	\N	\N	-130.90	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
ae65d76c-521d-4af3-bcd8-899f691467eb	2026	Enero	AFP - tercera cuota	\N	\N	\N	\N	\N	\N	\N	5351.01	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
dfdab806-d275-4d6b-b368-6e9e5424ac0f	2026	Enero	salvavidas a FyJ	\N	\N	-300.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
ab4d3783-82e0-40ca-b1c0-014bacfc4c9c	2026	Enero	Lentes J&F	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	-3106.00	\N	\N	2026-04-13 06:26:26.530901+00
061f3788-95b8-4bea-a38a-55165cc7833c	2026	Enero	Álbum Éter 200 fotos	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	-498.00	\N	\N	2026-04-13 06:26:26.530901+00
c711049c-ea1c-4148-9ddb-55b6b8373f60	2026	Enero	Pago viaje argentina, cusco, airbnb (prestamo)	\N	\N	\N	\N	\N	-2264.91	\N	\N	\N	\N	-4256.07	\N	\N	2026-04-13 06:26:26.530901+00
222c1ea3-4f46-4540-a3f3-fbf24ba9b2cb	2026	Enero	ray ban sol (préstamo)	\N	\N	\N	\N	\N	-663.20	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
994f6041-73ef-4e5c-a426-1483b61e0344	2026	Enero	préstamo carro enero	724.25	\N	385.75	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
20c9f8a4-ccda-4e60-888b-8b5ce089fab4	2026	Enero	\N	\N	1000.00	\N	\N	\N	\N	\N	\N	500.00	200.00	\N	110.00	\N	2026-04-13 06:26:26.530901+00
92721ccb-4a08-4ebf-b23b-0faa261d6a1a	2026	Enero	seguro carro	234.53	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
0bb76301-9f27-42f9-957f-30798b8cb2e5	2026	Enero	donacióón flor y julio quebrados	\N	\N	\N	\N	\N	\N	\N	\N	-500.00	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
0ad30059-f2e3-419e-bd43-29446b646448	2026	Enero	préstamo pago carro	-725.62	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.530901+00
d3308a31-2b5c-4c44-a507-8119ce756a45	2026	Febero	Pago Carro (10k)	\N	\N	\N	\N	\N	\N	-10000.00	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.819194+00
90d064cd-9720-4014-a836-85f222dad997	2026	Febero	Intereses ganados mes anterior	\N	\N	\N	\N	\N	534.83	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.819194+00
46fe8695-41df-4cc9-a552-67697b54dc7f	2026	Febero	AFP - cuarta cuota	\N	\N	\N	\N	\N	\N	\N	5350.27	\N	\N	\N	\N	\N	2026-04-13 06:26:26.819194+00
a53f5334-9f49-4ebb-9004-9e0cfb20b6bf	2026	Febero	AFP - primera cuota	\N	\N	\N	\N	\N	\N	\N	5500.13	\N	\N	\N	\N	\N	2026-04-13 06:26:26.819194+00
ba9ea140-3a20-4852-8cdc-ac4860f00058	2026	Febero	seguro carro	-232.04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.819194+00
4c5df458-cc76-4196-b07c-8498238beb73	2026	Febero	salud - julio brazo	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	-63.38	\N	2026-04-13 06:26:26.819194+00
5f3ef862-ace7-4983-a229-7c20fd518110	2026	Febero	cuota pto malabrigo (préstamo)	\N	\N	\N	\N	\N	-170.00	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.819194+00
cb9e671b-17b1-417b-95f4-e577777c6f22	2026	Febero	pasajes pto malabrigo (préstamo)	\N	\N	\N	\N	\N	-398.00	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.819194+00
51c80621-7e7e-4a7d-938a-89c12a0b7eb9	2026	Febero	Devolución de prestamos a intereses y.	\N	\N	\N	\N	\N	3496.11	\N	\N	\N	\N	3634.20	\N	\N	2026-04-13 06:26:26.819194+00
5d152c9b-9d8d-4418-81b1-ff4cb8d7a17d	2026	Febero	AFP - segunda cuota	\N	\N	\N	\N	\N	\N	\N	5500.00	\N	\N	\N	\N	\N	2026-04-13 06:26:26.819194+00
043c1ddb-0293-4352-a75b-35023e137930	2026	Marzo	\N	\N	1000.00	\N	\N	\N	\N	\N	\N	500.00	200.00	\N	110.00	\N	2026-04-13 06:26:26.819194+00
30ad4508-bf52-4d57-ba2a-dc46952d6c94	2026	Marzo	seguro carro	234.53	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.819194+00
c03dd105-501a-413a-8ce2-ffa16ea3ea4e	2026	Marzo	préstamo carro enero	724.25	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.819194+00
2cc98c5d-5e21-4ab6-ba6f-1178cd596609	2026	Marzo	\N	\N	\N	771.46	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.819194+00
8bc1d466-30c4-4a88-af1b-74501265bd9d	2026	Marzo	préstamo carro enero	-724.25	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.819194+00
93d5b9af-a52a-4cb5-9f88-9088c6944415	2026	Marzo	Intereses ganados mes anterior	\N	\N	\N	\N	\N	464.04	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.819194+00
076307c6-4487-4325-bb87-501760113a38	2026	Marzo	gastos Cusco Totales	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	-692.09	\N	\N	2026-04-13 06:26:26.819194+00
579a4c4e-1d70-4179-89a0-8182e1fe7186	2026	Marzo	regalo a Flor y a Julio	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	-1000.00	\N	\N	2026-04-13 06:26:26.819194+00
9166b3b7-d1c4-4e00-82bb-63000dae02a5	2026	Marzo	Pago SOS Services empleada	\N	\N	-150.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.819194+00
c8b40a3c-40a1-4d43-89a5-1b3759699378	2026	Marzo	recarga casita	\N	\N	-200.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.819194+00
fe3a1fb2-ed8b-4c3a-b01a-44db969a6ca3	2026	Marzo	prestamo al bono	\N	\N	\N	\N	\N	-2704.63	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.819194+00
4f843fae-d551-4c96-998f-aa6ca0f159c8	2026	Marzo	soat + revisión técnica	-248.90	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.819194+00
4d9d7011-eb19-41bc-a91b-a35123fa96eb	2026	Marzo	vitaminas baby	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	-41.50	\N	2026-04-13 06:26:26.819194+00
7b4f7756-3487-498f-96cb-de824fdf5775	2026	Marzo	AFP tercera y cuarta	\N	\N	\N	\N	\N	\N	\N	8072.98	\N	\N	\N	\N	\N	2026-04-13 06:26:26.819194+00
e7370f2b-c3f3-4223-bd70-e6d65d597a86	2026	Marzo	Dentista	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	-35.00	\N	2026-04-13 06:26:26.819194+00
adf406c7-c6df-45e4-8ded-0fc49a4d3a67	2026	Marzo	Salvavidas fyj	\N	\N	-224.99	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.819194+00
6803da25-e7b1-46f4-a11a-d22e6207d56d	2026	Marzo	REvident	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	-109.90	\N	2026-04-13 06:26:26.819194+00
23a842c4-c63e-4972-85a0-de4ff44ba1ef	2026	Abril	\N	\N	1000.00	\N	\N	\N	\N	\N	\N	500.00	200.00	\N	200.00	\N	2026-04-13 06:26:26.819194+00
48baa6a0-2bc6-41eb-88dd-310dc7344853	2026	Abril	seguro del carro	240.00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.819194+00
b6599617-a964-42d2-be27-9ae059243e50	2026	Abril	bono jvlio	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	16108.65	\N	\N	2026-04-13 06:26:26.819194+00
e0b6c430-4906-4774-882a-3476b57f299d	2026	Marzo	seguro Rimac carro	-240.81	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.819194+00
c8b4907e-06ff-4540-a266-87e1ec5b850c	2026	Abril	compra zapatillas	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	-2704.63	\N	\N	2026-04-13 06:26:26.819194+00
0c9e40e1-5f51-4523-9845-dcf415a46a83	2026	Abril	pago del carro Total (Dios es bueno)	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	-8741.57	\N	\N	2026-04-13 06:26:26.819194+00
45a61fe9-a3c5-4322-9e02-d37dc497babb	2026	Abril	\N	\N	\N	\N	\N	\N	592.95	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.819194+00
75a2df80-4515-4d8e-a63d-9b16a7a24f40	2026	Abril	devolución préstamo bono	\N	\N	\N	\N	\N	2704.63	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.819194+00
127d9236-873d-498e-8f2c-72cfe168f9b9	2026	Abril	Extracción molar	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	-350.00	\N	2026-04-13 06:26:26.819194+00
391146a3-1c90-4fc6-8b6e-6148a8fdc4fe	2026	Abril	de la ex fila: Sobrante meses pasados	\N	\N	2.71	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.819194+00
c7e66ac2-9812-4e64-b350-43aa5ef9f6e6	2026	Abril	Kipling	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	-599.20	\N	\N	2026-04-13 06:26:26.819194+00
6638734f-ac7f-41e7-af02-625edcf92fef	2026	Abril	\N	\N	\N	612.61	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-13 06:26:26.819194+00
fb4599f2-1b67-4650-bbda-50e5003c1241	2026	Abril	Mueble	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	-1400.00	\N	\N	2026-04-13 06:26:26.819194+00
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.profiles (id, full_name, personal_sheet_configured, created_at) FROM stdin;
7075dbbd-c539-49a4-a20c-ebd750505b81	Julio Alva Linares	f	2026-04-13 04:43:37.516681+00
adcac57e-d415-4d34-b3fe-fb500fea3d59	\N	f	2026-04-18 20:18:07.045411+00
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2026-04-13 00:37:14
20211116045059	2026-04-13 00:37:14
20211116050929	2026-04-13 00:37:14
20211116051442	2026-04-13 00:37:14
20211116212300	2026-04-13 00:37:15
20211116213355	2026-04-13 00:37:15
20211116213934	2026-04-13 00:37:15
20211116214523	2026-04-13 00:37:15
20211122062447	2026-04-13 00:37:15
20211124070109	2026-04-13 00:37:16
20211202204204	2026-04-13 00:37:16
20211202204605	2026-04-13 00:37:16
20211210212804	2026-04-13 00:37:17
20211228014915	2026-04-13 00:37:17
20220107221237	2026-04-13 00:37:17
20220228202821	2026-04-13 00:37:17
20220312004840	2026-04-13 00:37:17
20220603231003	2026-04-13 00:37:18
20220603232444	2026-04-13 00:37:18
20220615214548	2026-04-13 00:37:18
20220712093339	2026-04-13 00:37:18
20220908172859	2026-04-13 00:37:19
20220916233421	2026-04-13 00:37:19
20230119133233	2026-04-13 00:37:19
20230128025114	2026-04-13 00:37:19
20230128025212	2026-04-13 00:37:19
20230227211149	2026-04-13 00:37:20
20230228184745	2026-04-13 00:37:20
20230308225145	2026-04-13 00:37:20
20230328144023	2026-04-13 00:37:20
20231018144023	2026-04-13 00:37:20
20231204144023	2026-04-13 00:37:21
20231204144024	2026-04-13 00:37:21
20231204144025	2026-04-13 00:37:21
20240108234812	2026-04-13 00:37:21
20240109165339	2026-04-13 00:37:22
20240227174441	2026-04-13 00:37:22
20240311171622	2026-04-13 00:37:22
20240321100241	2026-04-13 00:37:23
20240401105812	2026-04-13 00:37:23
20240418121054	2026-04-13 00:37:23
20240523004032	2026-04-13 00:37:24
20240618124746	2026-04-13 00:37:24
20240801235015	2026-04-13 00:37:24
20240805133720	2026-04-13 00:37:25
20240827160934	2026-04-13 00:37:25
20240919163303	2026-04-13 00:37:25
20240919163305	2026-04-13 00:37:25
20241019105805	2026-04-13 00:37:25
20241030150047	2026-04-13 00:37:26
20241108114728	2026-04-13 00:37:26
20241121104152	2026-04-13 00:37:27
20241130184212	2026-04-13 00:37:27
20241220035512	2026-04-13 00:37:27
20241220123912	2026-04-13 00:37:27
20241224161212	2026-04-13 00:37:27
20250107150512	2026-04-13 00:37:28
20250110162412	2026-04-13 00:37:28
20250123174212	2026-04-13 00:37:28
20250128220012	2026-04-13 00:37:28
20250506224012	2026-04-13 00:37:28
20250523164012	2026-04-13 00:37:28
20250714121412	2026-04-13 00:37:29
20250905041441	2026-04-13 00:37:29
20251103001201	2026-04-13 00:37:29
20251120212548	2026-04-13 00:37:29
20251120215549	2026-04-13 00:37:29
20260218120000	2026-04-13 00:37:30
20260326120000	2026-04-13 00:37:30
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at, action_filter) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets_analytics (name, type, format, created_at, updated_at, id, deleted_at) FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets_vectors (id, type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2026-04-13 00:37:38.249079
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2026-04-13 00:37:38.280658
2	storage-schema	f6a1fa2c93cbcd16d4e487b362e45fca157a8dbd	2026-04-13 00:37:38.297001
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2026-04-13 00:37:38.332581
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2026-04-13 00:37:38.346961
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2026-04-13 00:37:38.352284
6	change-column-name-in-get-size	ded78e2f1b5d7e616117897e6443a925965b30d2	2026-04-13 00:37:38.358313
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2026-04-13 00:37:38.364234
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2026-04-13 00:37:38.369526
9	fix-search-function	af597a1b590c70519b464a4ab3be54490712796b	2026-04-13 00:37:38.375075
10	search-files-search-function	b595f05e92f7e91211af1bbfe9c6a13bb3391e16	2026-04-13 00:37:38.380741
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2026-04-13 00:37:38.386437
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2026-04-13 00:37:38.392503
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2026-04-13 00:37:38.397802
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2026-04-13 00:37:38.403207
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2026-04-13 00:37:38.426484
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2026-04-13 00:37:38.43182
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2026-04-13 00:37:38.437137
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2026-04-13 00:37:38.44792
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2026-04-13 00:37:38.455844
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2026-04-13 00:37:38.461517
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2026-04-13 00:37:38.468838
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2026-04-13 00:37:38.510749
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2026-04-13 00:37:38.522891
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2026-04-13 00:37:38.529761
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2026-04-13 00:37:38.538675
26	objects-prefixes	215cabcb7f78121892a5a2037a09fedf9a1ae322	2026-04-13 00:37:38.545252
27	search-v2	859ba38092ac96eb3964d83bf53ccc0b141663a6	2026-04-13 00:37:38.550736
28	object-bucket-name-sorting	c73a2b5b5d4041e39705814fd3a1b95502d38ce4	2026-04-13 00:37:38.565049
29	create-prefixes	ad2c1207f76703d11a9f9007f821620017a66c21	2026-04-13 00:37:38.577165
30	update-object-levels	2be814ff05c8252fdfdc7cfb4b7f5c7e17f0bed6	2026-04-13 00:37:38.59396
31	objects-level-index	b40367c14c3440ec75f19bbce2d71e914ddd3da0	2026-04-13 00:37:38.601648
32	backward-compatible-index-on-objects	e0c37182b0f7aee3efd823298fb3c76f1042c0f7	2026-04-13 00:37:38.606695
33	backward-compatible-index-on-prefixes	b480e99ed951e0900f033ec4eb34b5bdcb4e3d49	2026-04-13 00:37:38.611586
34	optimize-search-function-v1	ca80a3dc7bfef894df17108785ce29a7fc8ee456	2026-04-13 00:37:38.617196
35	add-insert-trigger-prefixes	458fe0ffd07ec53f5e3ce9df51bfdf4861929ccc	2026-04-13 00:37:38.624675
36	optimise-existing-functions	6ae5fca6af5c55abe95369cd4f93985d1814ca8f	2026-04-13 00:37:38.632393
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2026-04-13 00:37:38.642295
38	iceberg-catalog-flag-on-buckets	02716b81ceec9705aed84aa1501657095b32e5c5	2026-04-13 00:37:38.648673
39	add-search-v2-sort-support	6706c5f2928846abee18461279799ad12b279b78	2026-04-13 00:37:38.658769
40	fix-prefix-race-conditions-optimized	7ad69982ae2d372b21f48fc4829ae9752c518f6b	2026-04-13 00:37:38.66357
41	add-object-level-update-trigger	07fcf1a22165849b7a029deed059ffcde08d1ae0	2026-04-13 00:37:38.668513
42	rollback-prefix-triggers	771479077764adc09e2ea2043eb627503c034cd4	2026-04-13 00:37:38.673372
43	fix-object-level	84b35d6caca9d937478ad8a797491f38b8c2979f	2026-04-13 00:37:38.680103
44	vector-bucket-type	99c20c0ffd52bb1ff1f32fb992f3b351e3ef8fb3	2026-04-13 00:37:38.684955
45	vector-buckets	049e27196d77a7cb76497a85afae669d8b230953	2026-04-13 00:37:38.69841
46	buckets-objects-grants	fedeb96d60fefd8e02ab3ded9fbde05632f84aed	2026-04-13 00:37:38.708531
47	iceberg-table-metadata	649df56855c24d8b36dd4cc1aeb8251aa9ad42c2	2026-04-13 00:37:38.714587
48	iceberg-catalog-ids	e0e8b460c609b9999ccd0df9ad14294613eed939	2026-04-13 00:37:38.719872
49	buckets-objects-grants-postgres	072b1195d0d5a2f888af6b2302a1938dd94b8b3d	2026-04-13 00:37:38.735879
50	search-v2-optimised	6323ac4f850aa14e7387eb32102869578b5bd478	2026-04-13 00:37:38.74142
51	index-backward-compatible-search	2ee395d433f76e38bcd3856debaf6e0e5b674011	2026-04-13 00:37:38.757261
52	drop-not-used-indexes-and-functions	5cc44c8696749ac11dd0dc37f2a3802075f3a171	2026-04-13 00:37:38.759692
53	drop-index-lower-name	d0cb18777d9e2a98ebe0bc5cc7a42e57ebe41854	2026-04-13 00:37:38.772994
54	drop-index-object-level	6289e048b1472da17c31a7eba1ded625a6457e67	2026-04-13 00:37:38.776406
55	prevent-direct-deletes	262a4798d5e0f2e7c8970232e03ce8be695d5819	2026-04-13 00:37:38.778516
56	fix-optimized-search-function	cb58526ebc23048049fd5bf2fd148d18b04a2073	2026-04-13 00:37:38.787363
57	s3-multipart-uploads-metadata	f127886e00d1b374fadbc7c6b31e09336aad5287	2026-04-13 00:37:38.793919
58	operation-ergonomics	00ca5d483b3fe0d522133d9002ccc5df98365120	2026-04-13 00:37:38.799235
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata, metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.vector_indexes (id, name, bucket_id, data_type, dimension, distance_metric, metadata_configuration, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: -
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 59, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: -
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- PostgreSQL database dump complete
--

\unrestrict nE3BbWszIDxdo6ToJc7xUjIufzcU6lBELT0DuuMGgK2N3l36HJSQFkFT8LkIZTk

