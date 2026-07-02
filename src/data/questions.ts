import { Question } from "@/types/sow";

// ───────────────────────── TIER 1 (1–30) ─────────────────────────
const TIER1: Array<{ label: string; placeholder: string }> = [
  { label: "What is your company's full legal name and any \"doing business as\" names?", placeholder: "Smart Office Automation, LLC (DBA: SOA Texas)" },
  { label: "How many locations do you operate, and in what time zone(s) do you mainly take calls?", placeholder: "3 locations, all in Central Time (CST/CDT): Dallas HQ, Houston Branch, San Antonio Branch." },
  { label: "What are your normal business hours for these locations (including after-hours expectations)?", placeholder: "Mon–Fri 8:00 AM–5:30 PM CT; Sat 9:00 AM–1:00 PM CT for service; all other times considered after-hours." },
  { label: "Which office locations and branches should the AI answer calls for?", placeholder: "Dallas HQ – 123 Main St, Dallas, TX 75201, CST, (555) 100-1000; Houston – 456 Market Ave, Houston, TX 77002, CST, (555) 200-2000." },
  { label: "What systems do you use today for customers, billing, phones, and service tickets?", placeholder: "CRM: SalesChain v9.x (cloud); ERP: e-automate v8.x (ECI hosted); Telephony: SignalWire SIP with Mitel PBX; Ticketing: e-automate Service Desk; Scheduling: Outlook/Exchange." },
  { label: "Where do you log into SalesChain (production and, if any, test URL)?", placeholder: "Production: https://soa.saleschain.com; Sandbox: https://soa-sandbox.saleschain.com." },
  { label: "How will you give us API access to SalesChain (integration user, API key, or token)?", placeholder: "Dedicated integration user 'PhaosAI_Integration' with Open API enabled; OAuth2 Bearer token issued via SalesChain Open API; rate limit: 100 calls/min." },
  { label: "Who owns SalesChain setup and approves new API integrations on your side?", placeholder: "CRM Admin: Linda Perez; all new API keys and integrations must be approved by Linda and the CIO." },
  { label: "In your words, what is a lead vs a contact vs an opportunity in SalesChain?", placeholder: "Lead = unqualified prospect; Contact = person record tied to an Account; Opportunity = active sales process with products, stage, amount, close date." },
  { label: "When the AI creates a new lead, what information must always be filled in?", placeholder: "Required fields: Company_Name, Contact_First_Name, Contact_Last_Name, Phone, Email, Branch, Lead_Source, Assigned_Sales_Rep, Vertical." },
  { label: "After an inbound call, what should the AI create in SalesChain (lead, phone note, or both)?", placeholder: "Create a new Lead and a Phone Call Activity; if an existing Account/Contact is matched, attach the Activity to that Contact and Account; otherwise, create a new Account + Contact." },
  { label: "Where in SalesChain should we put the call summary and final outcome?", placeholder: "Summary in Activity.Comments field; Outcome in custom field Call_Disposition__c (values: New Lead, Info Only, Ticket Created, Transferred, Voicemail)." },
  { label: "How should the AI decide if a caller is an existing customer or a brand-new prospect?", placeholder: "First, match on exact Phone_Number; if no match, then match on Email_Address; if still no match, create a new Lead and new Account." },
  { label: "How should the AI show how urgent a sales call is inside SalesChain?", placeholder: "Map AI urgency (Low/Normal/High/Critical) to CRM picklist Lead_Priority__c: Low→Low, Normal→Medium, High→High, Critical→Urgent; use for pipeline views and SLA tracking." },
  { label: "How do you access e-automate (cloud, on-prem, hosted) and what version is it?", placeholder: "ECI hosted e-automate v8.x; access via HTTPS API and Windows Auth integration account over IP-restricted VPN." },
  { label: "Do you have test and live e-automate systems? If yes, how do we reach each one?", placeholder: "TEST: ea-test.smartoffice.com; PROD: ea-prod.smartoffice.com; both accessible via corporate VPN and IP allowlist for Phaos AI." },
  { label: "When your staff look up a machine, what information do they use first (serial, device ID, customer number, etc.)?", placeholder: "Primary: Equipment.SerialNumber; Secondary: Customer.CustomerNumber; occasionally ContractNumber for managed print contracts." },
  { label: "What should the AI ask the caller to correctly find their machine in e-automate?", placeholder: "Prompt for Serial Number from the device label; if unknown, ask for Customer Name + Site Address + floor/department." },
  { label: "For a new service ticket, what information is absolutely required in your system?", placeholder: "Required fields: Customer, Site, EquipmentID, ProblemCode, ContactName, ContactPhone, Priority, and brief ProblemDescription." },
  { label: "If e-automate is temporarily down, what should the AI do with new service requests?", placeholder: "Switch to Note-Taking mode: capture all details, email a structured ticket to dispatch@smartoffice.com, flag ERP_Failover event, and inform caller that a dispatcher will follow up." },
  { label: "Who should be notified when there are repeated errors talking to e-automate?", placeholder: "Send alerts to it-alerts@smartoffice.com and Dispatch Manager (SMS) if API error rate exceeds 5% of requests in 15 minutes; integrate with PagerDuty if possible." },
  { label: "Can you list your most important error codes and which ones are emergencies vs low priority?", placeholder: "Provide CSV: Make, Model, ErrorCode → ProblemCategory, TechnicianPriority (1-Critical, 2-High, 3-Standard, 4-Low). Example: Sharp MX-3070N, L4-06 → Fuser Failure, P1." },
  { label: "What phone system or provider do you use today (SignalWire, Twilio, 3CX, Avaya, etc.)?", placeholder: "SignalWire SIP trunks terminating on a Mitel PBX; some numbers still on legacy Verizon DIDs forwarded into Mitel." },
  { label: "List all phone numbers that you want the AI to answer.", placeholder: "Main: (555) 100-1000; Service: (555) 100-2000; Sales: (555) 100-3000; TX Service: (555) 210-1000; Billing: (555) 100-4000." },
  { label: "For each of these numbers, how should calls be routed (AI first, humans first, after-hours rules)?", placeholder: "Service: AI answers immediately; Sales: ring Sales Hunt Group 20 seconds then AI; all numbers route directly to AI outside 8:00 AM–5:30 PM CT." },
  { label: "When a caller needs a real person, who can the AI transfer to (teams, roles, extensions)?", placeholder: "TX Dispatch Queue (ext 300), Sales Queue (ext 400), Billing Queue (ext 500), Manager on Duty (ext 999) via warm transfer using SIP REFER." },
  { label: "Can the AI offer rough appointment windows for technicians, or should it only say \"we'll call you back\"?", placeholder: "Offer 4-hour windows (8–12, 12–4) for next-business-day P3/P4. For P1/P2 say 'a dispatcher will call back within 30 minutes'. Never commit to a specific tech or hard time slot." },
  { label: "If a caller is clearly angry or upset, who should the AI send them to right away?", placeholder: "Trigger escalation when sentiment < −0.6 or profanity detected; transfer immediately to Tier 2 Escalation queue (ext 999) and pass call summary." },
  { label: "What should we call the AI agent, and how should it introduce itself?", placeholder: "Name: 'Sophie from Smart Office Automation.' Script: 'Thank you for calling Smart Office Automation. My name is Sophie, your virtual assistant. I can help with service, supplies, sales, and general questions.'" },
  { label: "What types of information should the AI never store in notes or transcripts?", placeholder: "Never persist full credit card numbers, full Social Security numbers, or detailed PHI; redact using regex before storage (e.g., \\d{3}-\\d{2}-\\d{4})." },
  { label: "What is your target Go Live date, and who is allowed to say \"Flip the Switch\"?", placeholder: "Target Go Live: July 1st. Only CIO or VP of Operations can authorize routing production inbound calls to the AI agent." },
];

// ───────────────────────── TIER 2 (31–60) ─────────────────────────
const TIER2: Array<{ label: string; placeholder: string }> = [
  { label: "How do you assign new leads to sales reps today (territory, branch, account owner)?", placeholder: "Territory by ZIP code → Branch → AccountOwner; round-robin within branch when no owner; default to 'Unassigned' queue if territory unmapped, with daily review by Sales Ops." },
  { label: "Do you have any custom fields in SalesChain that you want the AI to fill from calls?", placeholder: "Custom fields: Vertical__c (Legal/Medical/Education/Other), Equipment_Interest__c (MFP/Production/Wide-Format), Call_Disposition__c, AI_Confidence__c (0–1), Source_Detail__c (free text)." },
  { label: "Where should we store customer mood (sentiment) in SalesChain, if you want that tracked?", placeholder: "Custom picklist Sentiment__c on Activity record: Positive / Neutral / Negative / Escalated; numeric Sentiment_Score__c (−1.0 to 1.0) for analytics rollups." },
  { label: "Do you want the AI to save full call transcripts in your CRM, or just a summary?", placeholder: "Summary (≤500 chars) in Activity.Comments; full transcript stored in S3 bucket with signed URL pasted into custom field Transcript_URL__c. Retain transcripts 90 days, summaries indefinitely." },
  { label: "What should count as a \"hot\" or high-priority lead for your team?", placeholder: "Hot = intent_confidence ≥ 0.85 AND (stated budget ≥ $10k OR timeline ≤ 30 days OR fleet ≥ 5 devices). Sets Lead_Priority__c=High and notifies branch manager via email + SMS." },
  { label: "How should AI map its urgency levels to e-automate ticket priorities (P1, P2, etc.)?", placeholder: "Critical→P1 (≤2hr SLA), High→P2 (≤4hr), Normal→P3 (next-day), Low→P4 (≤72hr). Override to P1 for production stoppage keywords (\"down\", \"can't print\", \"deadline\")." },
  { label: "Are there busy hours when we should limit how fast we call the e-automate APIs?", placeholder: "Peak: 8–10 AM and 1–3 PM CT. Cap concurrency at 5 and 2 req/sec during peak; exponential backoff (250ms → 8s) on 429/503; queue non-urgent writes for off-peak." },
  { label: "Do you want a log of every API call to SalesChain and e-automate? If yes, how long should we keep it?", placeholder: "Yes — log request/response (sans PII) to Supabase table integration_audit_log: 180 days hot, 1 year cold (S3 Glacier). Includes correlation_id, status, latency_ms." },
  { label: "How should we match customers between SalesChain and e-automate when data doesn't perfectly line up?", placeholder: "Deterministic: External_ID match first; then phone E.164 + ZIP; then fuzzy company name (≥0.9 Jaro-Winkler) + address line 1 normalized. Below threshold → flag for manual reconciliation." },
  { label: "What phone behaviors or phrases should always trigger a human transfer (beyond just anger)?", placeholder: "Keywords: 'cancel', 'attorney', 'lawsuit', 'BBB', 'refund', 'speak to manager', 'enterprise quote >$50k'. Also any DTMF '0' press, repeated request, or 3 consecutive low-confidence intents." },
  { label: "What exact wording must we use for call-recording or legal statements at the start of calls?", placeholder: "'This call may be recorded for quality and training purposes.' Spoken before the first substantive question; logged with timestamp in Consent_Captured__c. Two-party consent states require explicit yes/no." },
  { label: "How should the AI treat wrong numbers and obvious spam calls?", placeholder: "Tag Disposition=Wrong Number or Spam; do not create Lead/Activity; log to spam_calls table with caller_id and transcript snippet; auto-block ANIs with ≥3 spam tags in 7 days." },
  { label: "Are there any phone numbers or call types that should never be answered by the AI?", placeholder: "Direct executive lines (CEO ext 100, CFO ext 110), union steward line (ext 911), and 24/7 enterprise NOC line (855-xxx-xxxx). These must always reach a human or voicemail." },
  { label: "Do you want AI to identify itself as an AI, a virtual assistant, or something else?", placeholder: "'I'm Sophie, the virtual assistant for Smart Office Automation.' If asked directly 'are you a robot/AI?', confirm honestly: 'Yes, I'm an AI assistant — I can transfer you to a person any time.'" },
  { label: "Besides English, what languages should the AI be ready to handle?", placeholder: "English (primary, US/Southern + neutral). Spanish (es-MX/es-US) at parity for service calls. French and Vietnamese as roadmap items; auto-detect language and switch within 1 turn." },
  { label: "Do you want the AI to send email notifications when certain call outcomes happen (like new lead or VIP ticket)?", placeholder: "New Lead → sales-leads@smartoffice.com + branch manager; VIP ticket (Tier-1 customer) → dispatch@ + account_manager; ERP failover → it-alerts@ + on-call engineer; daily 6pm digest to ops." },
  { label: "Can you share an example of a \"perfect\" lead record in raw data (we can accept JSON/CSV)?", placeholder: "Golden Record JSON with all required + custom fields populated: company, contact name/email/phone, branch, vertical, equipment_interest, source, priority, owner, sentiment, transcript URL." },
  { label: "Can you share an example of a \"perfect\" service ticket in raw data?", placeholder: "Golden Record JSON: customer_id, site_id, equipment_id (serial), problem_code, problem_description, contact_name/phone, priority (P1–P4), preferred_window, dispatch_branch, parts_needed[]." },
  { label: "Who is the best person on your team to try to \"trick\" or stress-test the AI during calls?", placeholder: "Lead UAT: Maria Gomez (Senior Service Dispatcher, 12 yrs). Backup: James Chen (Sales Manager). Both will execute the UAT scenario matrix and sign acceptance." },
  { label: "What kinds of test calls are most important (noisy, strong accents, angry customers, etc.)?", placeholder: "Priority UAT: 1) noisy shop floor BG, 2) heavy Southern/Spanish accents, 3) angry escalation, 4) caller doesn't know serial #, 5) ERP outage, 6) duplicate-account collision, 7) wrong-number spam." },
  { label: "What must be true before you are comfortable going live (success criteria)?", placeholder: "≥95% intent accuracy, ≤2% duplicate Leads, ≤1% mis-routed transfers, average handle time ≤2:30, CSAT ≥4.2/5 across 50+ test calls, zero P1 dispatch misses in UAT." },
  { label: "Who needs training on the AI dashboard and live monitoring tools?", placeholder: "Service Dispatch team (8), Sales Ops (3), Branch Managers (3), IT Help Desk (2), Executive sponsor (1). Role-based access: agents = read-only, ops = edit routing, IT = full admin." },
  { label: "How do you prefer training: live session, recorded videos, written guides, or a combination?", placeholder: "Combination: 90-min live Zoom kickoff + recording, 1-page quick-reference PDF per role, 3 short Loom videos (dashboard, escalations, retraining). Refresher session 30 days post go-live." },
  { label: "How often would you like performance review meetings (weekly, bi-weekly, monthly)?", placeholder: "Weekly 30-min during first 4 weeks (Phaos CSM + Ops + IT), bi-weekly months 2–3, then monthly steady-state with quarterly executive review." },
  { label: "What are your top 3 success metrics (KPIs) for this AI project?", placeholder: "1) AI containment rate ≥60% (calls resolved without human), 2) Speed-to-answer ≤3 sec, 3) Lead conversion lift ≥10% vs baseline. Tracked weekly in shared dashboard." },
  { label: "Who approves future changes to AI scripts, call flows, and routing after Go Live?", placeholder: "Change Advisory Board: VP Operations (chair), CRM Admin, Service Manager, Phaos CSM. Minor copy edits = CSM + CRM Admin; flow/routing changes = full CAB; emergency hotfix = VP Ops only." },
  { label: "How will your team submit change requests (email, ticket system, other)?", placeholder: "Jira project 'PHAOS-OPS' with change-request template (impact, urgency, business case); SLA: ack ≤1 business day, scoping ≤3 days. Email alias phaos-cr@smartoffice.com auto-files into Jira." },
  { label: "Do you have any upcoming telephony changes (new PBX, carrier, or migration)?", placeholder: "Q3 cutover from Mitel PBX to cloud-based RingCentral; legacy Verizon DIDs to be ported in waves Aug–Oct. Need Phaos to support dual-stack (SignalWire + RingCentral SIP) during migration." },
  { label: "Are there any known risks or \"gotchas\" we should know about before we start?", placeholder: "Data quality: ~8% of e-automate accounts have stale phone numbers; SalesChain custom Lead_Source picklist locked by VP Sales (changes need approval); union rules forbid recording on Local-99 break-room line." },
];

// ───────────────────────── TIER 3 (61+) — Comprehensive SOW depth ─────────────────────────
const TIER3: Array<{ label: string; placeholder: string }> = [
  // SalesChain – Access & Architecture
  { label: "What is your SalesChain tenant URL and instance/region?", placeholder: "Tenant: soa.saleschain.com (US-East region, multi-tenant SaaS). Login domain: smartoffice.saleschain.com. Sandbox refreshed monthly from prod." },
  { label: "What SalesChain subscription level / module set do you have?", placeholder: "Enterprise tier with CRM, Quoting, Contracts, Open API add-on, and Analytics module. Seat count: 45 named users." },
  { label: "What are the documented SalesChain API rate limits and concurrency constraints?", placeholder: "100 req/min per token, 5 concurrent connections per integration user, 10MB max payload, 30s server-side timeout. 429 responses include Retry-After header." },
  { label: "Are there IP allowlist or VPN requirements to reach SalesChain APIs?", placeholder: "No VPN required (public HTTPS), but IP allowlist enforced — Phaos egress IPs (52.x.x.x, 54.x.x.x) must be added by SalesChain support ticket; allowlist propagation ≤2 hours." },
  { label: "Are there SalesChain webhooks available, or must we poll for changes?", placeholder: "Webhooks available for Lead, Account, Activity create/update events; HMAC-SHA256 signed; delivery retried 5x with exponential backoff. Phaos receiver: https://hooks.phaosai.com/saleschain." },

  // SalesChain – Data Model & Workflows
  { label: "How is your SalesChain Account → Contact → Opportunity hierarchy structured?", placeholder: "1 Account ↔ many Contacts ↔ many Opportunities; Contacts may roll up to a Parent Account for multi-site; Opportunities tied to one primary Contact and an Account." },
  { label: "What are your validation rules on Lead, Account, and Activity records?", placeholder: "Lead: phone in E.164, email RFC-valid, Source picklist required. Account: tax ID required for Net-30 terms. Activity: Subject ≤80 chars, Disposition required to close." },
  { label: "What are the deduplication rules in SalesChain today?", placeholder: "Native dedupe on Lead by email exact + phone E.164; Account dedupe by website domain + tax ID; merge requires CRM Admin approval — AI must not auto-merge, only flag duplicates." },
  { label: "How are activity ownership and follow-up tasks routed today?", placeholder: "Activity owner inherits from Account owner; if absent, assigned to Branch queue. Follow-up Task auto-created with due_date = today+1 for inbound calls flagged High/Critical." },
  { label: "What custom workflows or triggers fire on Lead/Activity create that we should know about?", placeholder: "Workflows: Lead create → Slack #new-leads; Lead Source=Call → enqueue Marketing nurture; Activity Disposition=Quote Requested → auto-create Opportunity stub in 'Discovery' stage." },

  // e-automate – Access & Architecture
  { label: "Is e-automate cloud, on-prem, or hosted, and what middleware is in front of it?", placeholder: "ECI Cloud-Hosted; access via ECI Web Services (REST + legacy SOAP); no middleware. On-prem reporting DB replica available for read-only via Phaos JDBC if needed." },
  { label: "Which authentication methods are supported for e-automate APIs?", placeholder: "Basic Auth over TLS for SOAP; API Key + integration user for REST; OAuth2 not yet GA in our version. Service account: ea_phaos_int with least-privilege role." },
  { label: "What network access (VPN, site-to-site, IP allowlist) do we need for e-automate?", placeholder: "Site-to-site IPsec VPN between Phaos AWS VPC and ECI hosting tenant; or IP allowlist for Phaos NAT IPs. MFA required for the integration user portal." },
  { label: "Are credentials separate for test vs production e-automate?", placeholder: "Yes — distinct service accounts (ea_phaos_test, ea_phaos_prod) with separate API keys; secrets stored in Phaos AWS Secrets Manager and rotated quarterly." },
  { label: "What is your expected call volume and concurrency to e-automate during steady state?", placeholder: "~1,500 read calls/day, ~250 writes/day at steady state; peak burst ≤30 req/min; Phaos must respect a 10 concurrent connection ceiling." },
  { label: "Which channels do you prefer for failover and integration health alerts?", placeholder: "Primary: PagerDuty service 'PHAOS-EA'; secondary: it-alerts@smartoffice.com; tertiary: SMS to on-call rotation. Slack #integrations-alerts for FYI severity." },

  // e-automate – Data Model
  { label: "How is your customer/site/department structure modeled in e-automate?", placeholder: "Parent Customer → Sites (physical locations) → Departments (cost centers); equipment tied to Site + Department; billing rolls up to Parent. Some legacy customers are flat (no Sites)." },
  { label: "What are the asset identification keys we can use (serial, asset tag, EquipmentID)?", placeholder: "Primary: Equipment.SerialNumber (vendor-assigned); Secondary: Internal_AssetTag (barcode label); Legacy: EquipmentID (numeric, unique). MAC/IP not reliably populated." },
  { label: "How should the AI disambiguate when one serial returns multiple matches?", placeholder: "Multi-match resolution: (1) prefer Site matching caller's CallerID ZIP; (2) prefer Equipment.Status=Active; (3) prefer most recent ServiceCall date; (4) fall back to ask caller for site address." },
  { label: "What fields are required to attach a service call to the correct account/site?", placeholder: "Required: CustomerID, SiteID, EquipmentID, ProblemCode, ContactName, ContactPhone, Priority. Optional but recommended: PreferredTechnicianID, AccessNotes, MeterRead." },
  { label: "What default values should the AI use when caller cannot provide certain fields?", placeholder: "Defaults: Priority=P3, ProblemCode=GEN-OTHER, ContactName=caller stated name, PreferredWindow=next business day. All defaults flagged AI_Defaulted=true for dispatcher review." },
  { label: "What are the dispatch / scheduling business rules (territory, skills, rotation)?", placeholder: "Tech assignment by Territory (ZIP → Tech) then Skill (color/B&W/wide-format/production); round-robin within skill pool; do-not-schedule rules: PTO calendar, certain customers tied to named techs only." },
  { label: "How should notes and attachments be marked internal vs customer-visible?", placeholder: "ServiceCall.Notes: Visibility=Internal by default; AI summary marked Visibility=Customer if caller agreed to email confirmation. Attachments default Internal." },
  { label: "Which system is the source of truth — SalesChain or e-automate — for shared entities?", placeholder: "Customer master = e-automate (ERP source of truth); Lead/Opportunity = SalesChain; Contacts bidirectional with conflict resolution favoring e-automate Site contacts and SalesChain Sales contacts." },

  // Telephony
  { label: "Which DIDs will be ported to VAPI / Phaos infrastructure, and which remain on your PBX?", placeholder: "Port: (555) 100-2000 service, (555) 100-3000 sales, (555) 210-1000 TX service. Keep on Mitel: main IVR, executive DIDs, fax DIDs. Port window 30 days, FOC date confirmed." },
  { label: "What SIP/VAPI configuration details (codec, DTMF, trunk) should we use?", placeholder: "Codec preference: G.711 µ-law (US) → OPUS fallback; DTMF: RFC2833; SIP REGISTER vs IP auth: IP auth on trunk; SRTP optional, TLS-SIP required for new trunks." },
  { label: "How should Caller ID and outbound presentation be handled?", placeholder: "Inbound: pass full ANI E.164 to Phaos. Outbound (callbacks/transfers): present main branch DID (not personal extensions); CNAM = 'Smart Office Auto'." },
  { label: "How should voicemail and missed-call flows behave?", placeholder: "If AI fails or caller opts out: route to branch voicemail box; transcribe via Phaos and email to dispatch@; create Activity with Disposition=Voicemail and Priority inferred from keywords." },
  { label: "Is there an existing IVR menu structure that should be preserved or replaced?", placeholder: "Replace existing 5-option IVR with conversational AI; keep '0' DTMF as immediate human transfer at any time; preserve language selection (1=English, 2=Español) for accessibility." },

  // AI Call Flows & Intents
  { label: "What are the primary call intents to support end-to-end vs hand off?", placeholder: "End-to-end: service_request, supply_order, hours/location, order_status, basic billing inquiry. Handoff: complex quotes >$25k, contract changes, escalations, legal/HR." },
  { label: "Provide example phrases the AI should always use and phrases to avoid.", placeholder: "Use: 'I'd be happy to help', 'Let me confirm…', 'You should hear back within X'. Avoid: 'I don't know', 'That's not my job', filler 'um/uh', commitments to discounts or specific techs." },
  { label: "What disposition outcomes should be available, and how do they map into CRM/ERP?", placeholder: "Dispositions: NewLead → SalesChain Lead+Activity; ServiceCreated → e-automate ServiceCall + SalesChain Activity; InfoOnly → Activity only; Transferred → Activity (no record); Voicemail → Activity+VM URL; Spam → spam log only." },
  { label: "Describe the AI persona and tone (formal, casual, regional flavor).", placeholder: "Warm professional, concise, friendly Texan undertone (no caricature); avoid jargon; mirror caller's formality; calm + confident under stress; never sarcastic or apologetic-defensive." },
  { label: "Which accents and dialects must the AI reliably understand?", placeholder: "Required: General American, Southern US, US Spanish, Mexican Spanish, AAVE, Indian English. Stretch: Vietnamese English, Caribbean English. ASR accuracy ≥92% on each." },

  // Security, Privacy & Compliance
  { label: "What is your data classification scheme and where does call data fit?", placeholder: "Tiers: Public, Internal, Confidential, Restricted. Call transcripts = Confidential; payment info = Restricted (must not be captured); contact PII = Confidential." },
  { label: "What redaction patterns are required (real-time vs post-processing)?", placeholder: "Real-time mute on credit card pattern (Luhn-valid 13–19 digit) and SSN (\\d{3}-\\d{2}-\\d{4}); post-processing redaction for DOB, account numbers; redacted tokens replaced with [REDACTED-CC]/[REDACTED-SSN]." },
  { label: "Which data storage regions are acceptable (US-only, US/EU, etc.)?", placeholder: "US-only (us-east-1 primary, us-west-2 DR). No data leaves US borders; sub-processors must be US-resident or contractually US-restricted; EU/CA expansion deferred." },
  { label: "What are retention policies for recordings, transcripts, summaries, and logs?", placeholder: "Recordings: 30 days then purge; Transcripts: 90 days; Summaries (in CRM): indefinite; Integration logs: 180 days hot + 1 yr cold; Backups: 35 days encrypted." },
  { label: "Which compliance frameworks apply (HIPAA, SOC 2, PCI-DSS, state privacy laws)?", placeholder: "SOC 2 Type II required from Phaos; HIPAA out-of-scope (no PHI captured); PCI-DSS by avoidance (never capture card data — direct to IVR pay portal); CCPA + TX privacy compliance required." },
  { label: "Do you require a DPA, BAA, or other contractual safeguards?", placeholder: "Mutual NDA + Data Processing Agreement required pre-pilot; BAA not required (no PHI); subprocessor list must be disclosed and updated 30 days before any change." },
  { label: "What role-based access controls are needed for AI dashboards and data exports?", placeholder: "Roles: Viewer (read), Operator (acknowledge/route), Admin (config), Auditor (logs only). SSO via Okta SAML; MFA enforced; export of transcripts requires Admin + audit log entry." },
  { label: "How should consent for call recording be captured and stored where two-party consent applies?", placeholder: "Spoken disclosure at call start; capture explicit verbal consent for two-party consent states (CA, FL, IL, MA, MD, MT, NH, PA, WA); store consent_captured boolean + timestamp + ASR snippet on Activity." },

  // Monitoring, Dashboards & KPIs
  { label: "What dashboard views and filters do you need (by branch, intent, agent, time)?", placeholder: "Filters: branch, intent, disposition, sentiment band, time range (today/7d/30d/custom), language. Views: live calls, daily ops, weekly KPI scorecard, executive monthly." },
  { label: "What real-time alerts do you need (integration failures, volume spikes, abandonment, sentiment trend)?", placeholder: "Alerts: integration error rate >5%/15min, abandon rate >10%/hour, P1 ticket SLA breach, sentiment trend −0.3 over 1hr window, call volume >2x baseline. Severity tiers SEV1–3." },
  { label: "Through which channels should alerts be delivered (email, SMS, Slack/Teams, webhooks)?", placeholder: "SEV1 → PagerDuty + SMS; SEV2 → Slack #phaos-alerts + email; SEV3 → email digest; webhook to internal SIEM (Splunk HEC) for all SEV1–2." },
  { label: "What standard reports and export schedules do you need?", placeholder: "Daily 6pm ops summary email; weekly KPI scorecard PDF Mondays 7am; monthly executive deck first business day; ad-hoc CSV export of any filtered view; raw event API for BI." },

  // Testing & UAT
  { label: "Is a dedicated test phone number / sandbox available for end-to-end UAT?", placeholder: "Yes — (555) 999-0000 routes to Phaos staging connected to SalesChain sandbox + e-automate TEST. Available 24/7; please notify ops before high-volume load tests." },
  { label: "Which Golden Record examples will you provide for leads and tickets?", placeholder: "We will provide: 5 ideal Lead JSON examples (1 per vertical), 5 ideal ServiceCall JSON examples (1 per priority), and 3 multi-site Account examples for matching tests." },
  { label: "What is the prioritized UAT scenario list and pass/fail criteria?", placeholder: "Top scenarios: new lead happy path, repeat customer service call, ERP outage, escalation to human, Spanish caller, noisy environment, wrong number, duplicate-account collision. Pass = ≥90% scenario success across 3 runs." },
  { label: "What are explicit acceptance criteria before authorizing Go Live?", placeholder: "Sign-offs from: VP Operations, CRM Admin, Service Manager, IT Security, Phaos CSM. KPI thresholds met for 5 consecutive business days in pilot; rollback plan rehearsed once." },

  // Go-Live, Phasing & Support
  { label: "What is the go-live phasing plan (single branch vs all, single line vs all)?", placeholder: "Phase 1: Dallas Service line only, 7 days. Phase 2: + Houston Service, 7 days. Phase 3: + Sales lines, 14 days. Phase 4: + after-hours all branches. Each phase requires KPI green-light." },
  { label: "What rollback and safety plan should be in place if something goes wrong?", placeholder: "One-click route revert in carrier portal (≤5 min RTO); fallback IVR + dispatch hotline; 24/7 Phaos on-call during first 30 days; daily standup at 8am for first 2 weeks." },
  { label: "What are your expected support response times by severity (P1/P2/P3)?", placeholder: "P1 (production down): 15-min response, 4-hr restoration; P2 (major degradation): 1-hr response, 8-hr; P3 (minor/cosmetic): next business day; 24×7 for P1/P2 first 90 days." },

  // Change Management & Cadence
  { label: "What is the cadence for content/script reviews and continuous improvement?", placeholder: "Weekly transcript-review meeting (30 min) for first 90 days; monthly thereafter. Phaos delivers improvement backlog with effort estimates; CAB prioritizes." },
  { label: "Who owns documentation of AI flows, prompts, and integration mappings on your side?", placeholder: "CRM Admin (Linda Perez) owns CRM mappings; IT Manager (Raj Patel) owns ERP + telephony; Phaos CSM maintains canonical flow docs in shared Confluence space." },

  // Constraints, Risks, Legal/Policy
  { label: "Are there upcoming CRM, ERP, or telephony upgrades that may overlap this project?", placeholder: "SalesChain v9 → v10 upgrade planned Q4 (potential API contract changes); e-automate version bump Q1 next year; RingCentral telephony migration Q3 (see Tier 2)." },
  { label: "Are there organizational changes (M&A, restructuring) we should be aware of?", placeholder: "Acquisition of regional competitor closes Q3; will add 2 branches (Austin, Tulsa) and ~6,000 customer records — must plan a data merge sequence with Phaos." },
  { label: "Are there call-recording laws or union rules constraining recording, retention, or AI use?", placeholder: "Texas is one-party consent (OK); operate dual-consent disclosure for safety. Local 99 union contract prohibits recording on break-room line ext 870; AI must not answer that line." },

  // Future Roadmap
  { label: "Which additional channels do you want on the roadmap (SMS, chat, outbound, email)?", placeholder: "Phase 2: SMS for appointment confirmations + meter reads; Phase 3: web chat on smartoffice.com; Phase 4: outbound proactive (toner-low, contract renewal); email triage Phase 5." },
  { label: "Which additional systems should the AI eventually integrate with (RMM, monitoring, accounting)?", placeholder: "Roadmap: PrintFleet/FMAudit RMM (proactive supply orders), ConnectWise for IT services arm, QuickBooks for invoicing reconciliation, Microsoft Bookings for sales demos." },
  { label: "What proactive/outbound use cases would deliver the most value first?", placeholder: "1) Appointment reminders (cut no-shows 25%); 2) toner-low proactive supply orders; 3) contract renewal nurture 90 days pre-expiry; 4) win-back campaign for dormant accounts >180 days." },
  { label: "Anything else (open mic) — what would make this project a wild success for you?", placeholder: "Free up dispatch team to spend 30% more time on field-service planning; lift sales-qualified leads 15% YoY; achieve a CSAT of 4.5+; have a measurable ROI story to share at the next industry summit." },
];

// ───────────────────────── Build the unified question array ─────────────────────────
const tier1Questions: Question[] = TIER1.map((q, i) => ({
  id: `q${i + 1}`,
  tier: 1,
  label: q.label,
  placeholder: q.placeholder,
}));

const tier2Questions: Question[] = TIER2.map((q, i) => ({
  id: `q${i + 31}`,
  tier: 2,
  label: q.label,
  placeholder: q.placeholder,
}));

const tier3Questions: Question[] = TIER3.map((q, i) => ({
  id: `q${i + 61}`,
  tier: 3,
  label: q.label,
  placeholder: q.placeholder,
}));

export const QUESTIONS: Question[] = [
  ...tier1Questions,
  ...tier2Questions,
  ...tier3Questions,
];
