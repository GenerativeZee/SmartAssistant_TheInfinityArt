-- ============================================================================
-- The Infinity Art — seed data
-- Creates the shop + a realistic dataset so "Aaj Ka Kaam" looks alive on the
-- very first open. Re-runnable: it deletes the seeded shop (cascade) first.
-- All dates are relative to "today" in Asia/Kolkata.
-- ============================================================================

do $$
declare
  v_shop  uuid := '11111111-1111-1111-1111-111111111111';
  v_today date := (now() at time zone 'Asia/Kolkata')::date;
  v_fy    text;

  -- clients
  c1 uuid := 'c0000000-0000-0000-0000-000000000001';
  c2 uuid := 'c0000000-0000-0000-0000-000000000002';
  c3 uuid := 'c0000000-0000-0000-0000-000000000003';
  c4 uuid := 'c0000000-0000-0000-0000-000000000004';
  c5 uuid := 'c0000000-0000-0000-0000-000000000005';
  c6 uuid := 'c0000000-0000-0000-0000-000000000006';
  c7 uuid := 'c0000000-0000-0000-0000-000000000007';
  c8 uuid := 'c0000000-0000-0000-0000-000000000008';
  c9 uuid := 'c0000000-0000-0000-0000-000000000009';
  c10 uuid := 'c0000000-0000-0000-0000-000000000010';
  c11 uuid := 'c0000000-0000-0000-0000-000000000011';
  c12 uuid := 'c0000000-0000-0000-0000-000000000012';

  -- services
  s1 uuid := '50000000-0000-0000-0000-000000000001';
  s2 uuid := '50000000-0000-0000-0000-000000000002';
  s3 uuid := '50000000-0000-0000-0000-000000000003';
  s4 uuid := '50000000-0000-0000-0000-000000000004';
  s5 uuid := '50000000-0000-0000-0000-000000000005';
  s6 uuid := '50000000-0000-0000-0000-000000000006';
  s7 uuid := '50000000-0000-0000-0000-000000000007';
  s8 uuid := '50000000-0000-0000-0000-000000000008';
  s9 uuid := '50000000-0000-0000-0000-000000000009';
  s10 uuid := '50000000-0000-0000-0000-000000000010';
  s11 uuid := '50000000-0000-0000-0000-000000000011';

  -- quotations
  q1 uuid := '40000000-0000-0000-0000-000000000001';
  q2 uuid := '40000000-0000-0000-0000-000000000002';
  q3 uuid := '40000000-0000-0000-0000-000000000003';
  q4 uuid := '40000000-0000-0000-0000-000000000004';
  q5 uuid := '40000000-0000-0000-0000-000000000005';
  q6 uuid := '40000000-0000-0000-0000-000000000006';

  -- jobs
  j1 uuid := '30000000-0000-0000-0000-000000000001';
  j2 uuid := '30000000-0000-0000-0000-000000000002';
  j3 uuid := '30000000-0000-0000-0000-000000000003';
  j4 uuid := '30000000-0000-0000-0000-000000000004';
  j5 uuid := '30000000-0000-0000-0000-000000000005';
  j6 uuid := '30000000-0000-0000-0000-000000000006';
  j7 uuid := '30000000-0000-0000-0000-000000000007';
  j8 uuid := '30000000-0000-0000-0000-000000000008';
  j9 uuid := '30000000-0000-0000-0000-000000000009';
begin
  v_fy := public.fy_code(v_today);

  delete from public.shops where id = v_shop;

  -- ---------------------------------------------------------------- shop -----
  insert into public.shops
    (id, name, legal_name, address, city, state, pincode, phone, whatsapp_number,
     email, gstin, upi_id, doc_prefix, default_gst_rate, sqft_rounding,
     default_greeting, built_by_credit, quotation_terms)
  values
    (v_shop, 'The Infinity Art', 'The Infinity Art', 'Shop 4, MG Road', 'Nagpur',
     'Maharashtra', '440001', '9822012345', '919822012345',
     'hello@theinfinityart.in', '27ABCDE1234F1Z5', 'theinfinityart@okhdfcbank',
     'INF', 18, 'up_to_whole', 'ji', 'Built by The Infinity Art',
     E'1. 50% advance to start the work.\n2. Rates valid for 15 days.\n3. GST extra as applicable.\n4. Design approval on WhatsApp is treated as final.');

  -- ------------------------------------------------------------ rate card ----
  insert into public.services
    (id, shop_id, name, category, unit, default_rate, hsn_sac, gst_rate, active, sort_order)
  values
    (s1,  v_shop, 'Flex Printing',            'signage',  'sqft', 15,    '4911', 18, true, 1),
    (s2,  v_shop, 'Star Flex',                'signage',  'sqft', 25,    '4911', 18, true, 2),
    (s3,  v_shop, 'Vinyl on Sunboard',        'signage',  'sqft', 60,    '4911', 18, true, 3),
    (s4,  v_shop, 'ACP Board',                'signage',  'sqft', 180,   '7606', 18, true, 4),
    (s5,  v_shop, 'LED Acrylic Letters',      'signage',  'sqft', 550,   '9405', 18, true, 5),
    (s6,  v_shop, 'Visiting Cards 300gsm',    'print',    'box',  250,   '4909', 18, true, 6),
    (s7,  v_shop, 'Wedding Card',             'wedding',  'piece',45,     '4909', 18, true, 7),
    (s8,  v_shop, 'Standee 6x3 ft',           'print',    'piece',900,   '4911', 18, true, 8),
    (s9,  v_shop, 'Logo Design',              'branding', 'job',  5000,  '998391',18,true, 9),
    (s10, v_shop, 'Website (5 pages)',        'web',      'job',  25000, '998314',18,true, 10),
    (s11, v_shop, 'Social Media Creatives',   'branding', 'job',  6000,  '998391',18,true, 11);

  -- -------------------------------------------------------------- clients ----
  insert into public.clients
    (id, shop_id, name, phone, company, source, referred_by_client_id, tags, last_contacted_at)
  values
    (c1,  v_shop, 'Ayesha Traders',      '9876543201', 'Ayesha Traders',      'walk_in',  null, '{signage}',        (v_today - 3)::timestamptz),
    (c2,  v_shop, 'Rehan Khan',          '9876543202', null,                  'instagram',null, '{signage,repeat}', (v_today - 10)::timestamptz),
    (c3,  v_shop, 'Sunrise Bakery',      '9876543203', 'Sunrise Bakery',      'reference', c1,  '{print,branding}', (v_today - 2)::timestamptz),
    (c4,  v_shop, 'Dr. Meena Sharma',    '9876543204', 'Meena Dental Care',   'google',   null, '{branding}',       (v_today - 120)::timestamptz),
    (c5,  v_shop, 'Gupta Electronics',   '9876543205', 'Gupta Electronics',   'repeat',   null, '{signage}',        (v_today - 4)::timestamptz),
    (c6,  v_shop, 'Farhan Ali',          '9876543206', null,                  'whatsapp', null, '{print}',          (v_today - 22)::timestamptz),
    (c7,  v_shop, 'Bright Future School','9876543207', 'Bright Future School','reference', c5,  '{wedding,print}',  (v_today - 1)::timestamptz),
    (c8,  v_shop, 'Nikhil Verma',        '9876543208', null,                  'walk_in',  null, '{print}',          (v_today - 6)::timestamptz),
    (c9,  v_shop, 'Kalpana Boutique',    '9876543209', 'Kalpana Boutique',    'instagram',null, '{branding,web}',   (v_today - 8)::timestamptz),
    (c10, v_shop, 'Al-Noor Caterers',    '9876543210', 'Al-Noor Caterers',   'repeat',   null, '{signage,print}',  (v_today - 40)::timestamptz),
    (c11, v_shop, 'Prakash Motors',      '9876543211', 'Prakash Motors',      'walk_in',  null, '{signage}',        (v_today - 130)::timestamptz),
    (c12, v_shop, 'Zara Events',         '9876543212', 'Zara Events',         'reference', c7,  '{wedding}',        (v_today - 95)::timestamptz);

  -- --------------------------------------------------------- interactions ----
  insert into public.interactions (shop_id, client_id, type, summary, requirement_tags, occurred_at)
  values
    (v_shop, c1,  'visit',    'Shop ke naye board aur glow sign ke baare me baat ki.', '{signage}',          (v_today - 3)::timestamptz),
    (v_shop, c1,  'call',     'Rate follow-up ke liye call kiya, kal aayenge bole.',   '{signage}',          (v_today - 1)::timestamptz),
    (v_shop, c2,  'whatsapp', 'ACP board aur LED letters ka reference bheja.',          '{signage}',          (v_today - 11)::timestamptz),
    (v_shop, c3,  'visit',    'Visiting card aur naya logo dono chahiye.',              '{print,branding}',   (v_today - 2)::timestamptz),
    (v_shop, c4,  'call',     'Clinic ke liye logo demo maanga.',                       '{branding}',         (v_today - 120)::timestamptz),
    (v_shop, c5,  'visit',    'Purana board badalna hai, star flex + ACP.',             '{signage}',          (v_today - 4)::timestamptz),
    (v_shop, c6,  'whatsapp', 'Brochure print ka kaam, sample dekh liya.',              '{print}',            (v_today - 22)::timestamptz),
    (v_shop, c7,  'visit',    'School function ke wedding-style invites, 300 pieces.',   '{wedding,print}',    (v_today - 1)::timestamptz),
    (v_shop, c8,  'call',     'Visiting card 5 box, design confirm karna baaki.',        '{print}',            (v_today - 6)::timestamptz),
    (v_shop, c9,  'visit',    'Boutique ke liye website + branding discuss kiya.',       '{web,branding}',     (v_today - 8)::timestamptz),
    (v_shop, c10, 'visit',    'Catering van ki branding + menu standee.',                '{signage,print}',    (v_today - 40)::timestamptz),
    (v_shop, c11, 'visit',    'Showroom ka flex board, project abhi hold pe hai.',       '{signage}',          (v_today - 130)::timestamptz),
    (v_shop, c12, 'note',     'Wedding season ke liye card designs bhejne hain.',        '{wedding}',          (v_today - 95)::timestamptz);

  -- ----------------------------------------------------------- quotations ----
  insert into public.quotations
    (id, shop_id, client_id, number, quote_date, valid_until, status, lost_reason, lost_note,
     subtotal, discount, taxable_amount, gst_amount, total, sent_at, decided_at)
  values
    (q1, v_shop, c1, 'INF/Q/'||v_fy||'/0001', v_today - 1,  v_today + 14, 'draft', null, null,
       1320,    0,    1320,    237.60,  1557.60, null, null),
    (q2, v_shop, c2, 'INF/Q/'||v_fy||'/0002', v_today - 2,  v_today + 13, 'sent',  null, null,
       16900,   0,    16900,   3042.00, 19942.00, (v_today - 2)::timestamptz, null),
    (q3, v_shop, c3, 'INF/Q/'||v_fy||'/0003', v_today - 6,  v_today + 9,  'sent',  null, null,
       6250,    0,    6250,    1125.00, 7375.00, (v_today - 6)::timestamptz, null),
    (q4, v_shop, c7, 'INF/Q/'||v_fy||'/0004', v_today - 4,  v_today + 11, 'followup', null, null,
       13500,   500,  13000,   2340.00, 15340.00, (v_today - 4)::timestamptz, null),
    (q5, v_shop, c5, 'INF/Q/'||v_fy||'/0005', v_today - 5,  v_today + 10, 'won',   null, null,
       12200,   0,    12200,   2196.00, 14396.00, (v_today - 5)::timestamptz, (v_today - 3)::timestamptz),
    (q6, v_shop, c9, 'INF/Q/'||v_fy||'/0006', v_today - 12, v_today - 2,  'lost',  'price',
       'Budget abhi nahi tha, season ke baad karenge.',
       25000,   0,    25000,   4500.00, 29500.00, (v_today - 12)::timestamptz, (v_today - 5)::timestamptz);

  insert into public.quotation_items
    (quotation_id, service_id, description, unit, qty, width_ft, height_ft, rate, gst_rate, amount, sort_order)
  values
    (q1, s1, 'Flex board — 10 x 4 ft',            'sqft', 1, 10, 4,  15,  18, 600.00,   1),
    (q1, s3, 'Vinyl on sunboard — 4 x 3 ft',      'sqft', 1, 4,  3,  60,  18, 720.00,   2),
    (q2, s4, 'ACP board — 8 x 5 ft',              'sqft', 1, 8,  5,  180, 18, 7200.00,  1),
    (q2, s5, 'LED acrylic letters — 8 x 2 ft',    'sqft', 1, 8,  2,  550, 18, 8800.00,  2),
    (q2, s8, 'Standee 6x3 ft',                    'piece',1, null,null,900,18, 900.00,   3),
    (q3, s6, 'Visiting cards 300gsm — 5 box',     'box',  5, null,null,250, 18, 1250.00, 1),
    (q3, s9, 'Logo design',                       'job',  1, null,null,5000,18, 5000.00, 2),
    (q4, s7, 'Wedding-style invites — 300 pcs',   'piece',300,null,null,45, 18, 13500.00,1),
    (q5, s2, 'Star flex — 20 x 10 ft',            'sqft', 1, 20, 10, 25,  18, 5000.00,  1),
    (q5, s4, 'ACP board — 10 x 4 ft',             'sqft', 1, 10, 4,  180, 18, 7200.00,  2),
    (q6, s10,'Website — 5 pages',                 'job',  1, null,null,25000,18,25000.00,1);

  -- ---------------------------------------------------------------- jobs -----
  insert into public.jobs
    (id, shop_id, client_id, quotation_id, number, title, category, stage,
     promised_date, delivered_at, total_amount, notes)
  values
    (j1, v_shop, c1, null, 'INF/J/'||v_fy||'/0001', 'Shop board + glow sign', 'signage', 'design',
       v_today + 6, null, 15000, null),
    (j2, v_shop, c5, q5,   'INF/J/'||v_fy||'/0002', 'Star flex + ACP board',  'signage', 'approval',
       v_today + 1, null, 14396, null),
    (j3, v_shop, c3, null, 'INF/J/'||v_fy||'/0003', 'Visiting cards + logo',  'print',   'print',
       v_today - 2, null, 7375,  'Design approve ho gaya, printing me hai.'),
    (j4, v_shop, c7, null, 'INF/J/'||v_fy||'/0004', 'School function invites','wedding', 'finishing',
       v_today - 1, null, 15340, 'Cutting aur packing baaki.'),
    (j5, v_shop, c9, null, 'INF/J/'||v_fy||'/0005', 'Boutique signage set',   'signage', 'installation',
       v_today + 3, null, 48000, null),
    (j6, v_shop, c11,null, 'INF/J/'||v_fy||'/0006', 'Showroom flex board',    'signage', 'cancelled',
       null, null, 0, 'Client ne project hold/cancel kiya.'),
    (j7, v_shop, c2, null, 'INF/J/'||v_fy||'/0007', 'ACP + LED name board',   'signage', 'delivered',
       v_today - 12, (v_today - 10)::timestamptz, 20000, null),
    (j8, v_shop, c6, null, 'INF/J/'||v_fy||'/0008', 'Brochure printing',      'print',   'delivered',
       v_today - 25, (v_today - 22)::timestamptz, 30000, null),
    (j9, v_shop, c10,null, 'INF/J/'||v_fy||'/0009', 'Van branding + standee', 'signage', 'delivered',
       v_today - 45, (v_today - 40)::timestamptz, 120000, null);

  insert into public.job_stage_events (job_id, from_stage, to_stage, note, at) values
    (j1, null, 'design', 'Job started', (v_today - 2)::timestamptz),
    (j2, null, 'design', 'From quotation INF/Q/'||v_fy||'/0005', (v_today - 3)::timestamptz),
    (j2, 'design', 'approval', 'Design bheja, approval ka wait', (v_today - 1)::timestamptz),
    (j3, null, 'design', 'Job started', (v_today - 5)::timestamptz),
    (j3, 'design', 'approval', 'Proof bheja', (v_today - 4)::timestamptz),
    (j3, 'approval', 'print', 'Approved on WhatsApp', (v_today - 3)::timestamptz),
    (j7, 'installation', 'delivered', 'Installed at site', (v_today - 10)::timestamptz),
    (j8, 'finishing', 'delivered', 'Delivered to shop', (v_today - 22)::timestamptz),
    (j9, 'installation', 'delivered', 'Van wrap done', (v_today - 40)::timestamptz);

  -- ------------------------------------------------------------ payments ----
  insert into public.payments
    (shop_id, client_id, job_id, kind, amount, mode, received_at, receipt_number, note)
  values
    (v_shop, c2,  j7, 'advance', 12000, 'upi',  (v_today - 15)::timestamptz, 'INF/R/'||v_fy||'/0001', 'Advance before work'),
    (v_shop, c6,  j8, 'part',    15000, 'cash', (v_today - 25)::timestamptz, 'INF/R/'||v_fy||'/0002', null),
    (v_shop, c10, j9, 'advance', 42500, 'bank', (v_today - 45)::timestamptz, 'INF/R/'||v_fy||'/0003', 'Advance 42500'),
    (v_shop, c9,  j5, 'advance', 20000, 'upi',  (v_today - 3)::timestamptz,  'INF/R/'||v_fy||'/0004', 'Signage advance'),
    (v_shop, c3,  j3, 'part',     3000, 'cash', (v_today - 1)::timestamptz,  'INF/R/'||v_fy||'/0005', null),
    (v_shop, c5,  j2, 'advance',  5000, 'upi',  (v_today - 4)::timestamptz,  'INF/R/'||v_fy||'/0006', 'Advance on won quote');

  -- ----------------------------------------------------------- follow-ups ----
  insert into public.follow_ups
    (shop_id, client_id, related_type, related_id, title, context, due_date, status)
  values
    (v_shop, c1,  'client',    c1, 'Call back',                'Board ka final rate batana hai',            v_today - 3, 'open'),
    (v_shop, c4,  'client',    c4, 'Demo dikhana',             'Clinic logo demo dikhana hai',             v_today - 1, 'open'),
    (v_shop, c2,  'quotation', q2, 'Quotation ka follow-up',   'INF/Q/'||v_fy||'/0002 — total 19942',      v_today,     'open'),
    (v_shop, c8,  'client',    c8, 'Call back',                'Visiting card design confirm karna hai',    v_today + 1, 'open'),
    (v_shop, c10, 'job',       j9, 'Payment reminder',         'Van branding — baaki 77500',               v_today + 2, 'open');

  -- ------------------------------------------------------------ sequences ----
  insert into public.sequences (shop_id, doc_type, fy, last_value) values
    (v_shop, 'quotation', v_fy, 6),
    (v_shop, 'job',       v_fy, 9),
    (v_shop, 'receipt',   v_fy, 6)
  on conflict (shop_id, doc_type, fy) do update set last_value = excluded.last_value;

end;
$$;
