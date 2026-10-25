-- ===================================================================
-- Swasthya demo data
--
-- SYNTHETIC DATA for demos and local development only. Order history is
-- generated, so forecasting or anomaly results on it are not real-world
-- accuracy. Do not run against a database holding real business data.
--
-- Every demo account uses the password: Demo@12345
-- Accounts are listed in docs/supabase_setup.md.
-- ===================================================================

-- -------------------------------------------------------------------
-- Demo auth users
-- Local Supabase lets this script create them directly. Hosted Supabase
-- blocks SQL writes to auth tables, so there run `npm run seed:users`
-- first; it creates the same accounts through the Auth Admin API.
-- -------------------------------------------------------------------
create temporary table demo_users (id uuid, email text, role text, name text);
insert into demo_users values
  ('a0000000-0000-4000-8000-000000000001', 'admin@hercircle.com', 'admin', 'Swasthya Admin'),
  ('d0000000-0000-4000-8000-000000000001', 'medline@demo.swasthya.test', 'distributor', 'MedLine Distributors'),
  ('d0000000-0000-4000-8000-000000000002', 'healthbridge@demo.swasthya.test', 'distributor', 'HealthBridge Pharma Supply'),
  ('d0000000-0000-4000-8000-000000000003', 'quickmeds@demo.swasthya.test', 'distributor', 'QuickMeds Wholesale'),
  ('b0000000-0000-4000-8000-000000000001', 'sanjeevani@demo.swasthya.test', 'pharmacy', 'Sanjeevani Medicals'),
  ('b0000000-0000-4000-8000-000000000002', 'careplus@demo.swasthya.test', 'pharmacy', 'CarePlus Pharmacy'),
  ('b0000000-0000-4000-8000-000000000003', 'aarogya@demo.swasthya.test', 'pharmacy', 'Aarogya Chemists'),
  ('b0000000-0000-4000-8000-000000000004', 'nova@demo.swasthya.test', 'pharmacy', 'Nova Health Store');

do $$
declare
  missing int;
begin
  begin
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    )
    select
      '00000000-0000-0000-0000-000000000000', d.id, 'authenticated', 'authenticated', d.email,
      extensions.crypt('Demo@12345', extensions.gen_salt('bf')), now(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      jsonb_build_object('role', d.role, 'name', d.name), now(), now(),
      '', '', '', ''
    from demo_users d
    where not exists (select 1 from auth.users u where u.id = d.id);

    insert into auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    select
      gen_random_uuid(), d.id::text, d.id,
      jsonb_build_object('sub', d.id::text, 'email', d.email, 'email_verified', true),
      'email', now(), now(), now()
    from demo_users d
    where not exists (select 1 from auth.identities i where i.user_id = d.id and i.provider = 'email');
  exception when insufficient_privilege then
    raise notice 'Cannot write auth tables here; expecting accounts from npm run seed:users.';
  end;

  select count(*) into missing
  from demo_users d
  where not exists (select 1 from auth.users u where u.id = d.id);

  if missing > 0 then
    raise exception '% demo account(s) missing. Run `npm run seed:users` first, then run this file again.', missing;
  end if;
end;
$$;

insert into public.admins (user_id) values ('a0000000-0000-4000-8000-000000000001');

-- -------------------------------------------------------------------
-- Business profiles
-- -------------------------------------------------------------------
insert into public.distributor_profiles
  (id, email, name, display_name, drug_license, gstin, contact_name, contact_designation,
   contact_mobile, phone, address, warehouse_address, location, city, state, status)
values
  ('d0000000-0000-4000-8000-000000000001', 'medline@demo.swasthya.test', 'MedLine Distributors', 'MedLine Distributors',
   'KA-BLR-21B-100231', '29AABCM1234D1Z5', 'Ravi Menon', 'Operations Manager',
   '+91 98450 11001', '+91 98450 11001', '42, 3rd Cross, Peenya Industrial Area', 'Shed 7, Peenya Phase 2',
   'Bengaluru', 'Bengaluru', 'Karnataka', 'approved'),
  ('d0000000-0000-4000-8000-000000000002', 'healthbridge@demo.swasthya.test', 'HealthBridge Pharma Supply', 'HealthBridge Pharma',
   'MH-PUN-20B-204518', '27AACCH5678E1Z2', 'Sneha Kulkarni', 'Director',
   '+91 98220 22002', '+91 98220 22002', '18, Bhosari MIDC', 'Godown 3, Bhosari MIDC',
   'Pune', 'Pune', 'Maharashtra', 'approved'),
  ('d0000000-0000-4000-8000-000000000003', 'quickmeds@demo.swasthya.test', 'QuickMeds Wholesale', 'QuickMeds',
   'MH-MUM-20B-310077', '27AADCQ9012F1Z9', 'Imran Shaikh', 'Owner',
   '+91 98190 33003', '+91 98190 33003', '5, Masjid Bunder Road', null,
   'Mumbai', 'Mumbai', 'Maharashtra', 'pending');

insert into public.pharmacy_profiles
  (id, email, business_legal_name, trade_name, drug_license, gstin, contact_name, contact_designation,
   contact_mobile, address, city, state, status, ml_id)
values
  ('b0000000-0000-4000-8000-000000000001', 'sanjeevani@demo.swasthya.test', 'Sanjeevani Medicals Pvt Ltd', 'Sanjeevani Medicals',
   'KA-BLR-20-445120', '29AAFCS3344G1Z1', 'Anita Rao', 'Pharmacist-in-charge',
   '+91 99000 44001', '12, 80 Feet Road, Indiranagar', 'Bengaluru', 'Karnataka', 'approved', 'PH_01'),
  ('b0000000-0000-4000-8000-000000000002', 'careplus@demo.swasthya.test', 'CarePlus Healthcare LLP', 'CarePlus Pharmacy',
   'KA-BLR-20-452288', '29AAJFC5566H1Z4', 'Vikram Shetty', 'Partner',
   '+91 99000 55002', '88, 27th Main, HSR Layout', 'Bengaluru', 'Karnataka', 'approved', 'PH_02'),
  ('b0000000-0000-4000-8000-000000000003', 'aarogya@demo.swasthya.test', 'Aarogya Chemists', 'Aarogya Chemists',
   'MH-PUN-20-118903', '27ABDPA7788J1Z6', 'Meera Joshi', 'Proprietor',
   '+91 98500 66003', '7, FC Road, Shivajinagar', 'Pune', 'Maharashtra', 'approved', 'PH_03'),
  ('b0000000-0000-4000-8000-000000000004', 'nova@demo.swasthya.test', 'Nova Health Store', 'Nova Health',
   'MH-MUM-20-227641', null, 'Rahul Desai', 'Owner',
   '+91 98670 77004', '21, Linking Road, Bandra West', 'Mumbai', 'Maharashtra', 'pending', 'PH_04');

insert into public.pharmacy_distributors (pharmacy_id, distributor_id) values
  ('b0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001'),
  ('b0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001'),
  ('b0000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000002');

-- -------------------------------------------------------------------
-- Product catalog (generic names, fictional manufacturers, INR)
-- price = pharmacy purchase price, distributor_price = distributor cost
-- -------------------------------------------------------------------
insert into public.products
  (sku, name, category, manufacturer, pack_size, hsn_code, mrp, price, distributor_price, moq, description)
values
  ('SW-PCM-650', 'Paracetamol 650 mg Tablet', 'Pain & Fever', 'Arogya Labs', 'Strip of 15', '3004', 34.00, 26.50, 21.00, 20, 'Analgesic and antipyretic.'),
  ('SW-PCM-500', 'Paracetamol 500 mg Tablet', 'Pain & Fever', 'Arogya Labs', 'Strip of 10', '3004', 18.00, 13.80, 11.00, 20, 'Analgesic and antipyretic.'),
  ('SW-IBU-400', 'Ibuprofen 400 mg Tablet', 'Pain & Fever', 'Medisure Pharma', 'Strip of 10', '3004', 22.00, 16.90, 13.40, 10, 'Non-steroidal anti-inflammatory.'),
  ('SW-MEF-SPS', 'Mefenamic Acid + Dicyclomine Tablet', 'Women''s Health', 'Lifeline Healthcare', 'Strip of 10', '3004', 48.00, 37.00, 29.50, 10, 'Antispasmodic for menstrual cramps.'),
  ('SW-DCL-GEL', 'Diclofenac Gel 1%', 'Pain & Fever', 'Medisure Pharma', 'Tube of 30 g', '3004', 95.00, 73.00, 58.00, 5, 'Topical pain relief gel.'),
  ('SW-AZI-500', 'Azithromycin 500 mg Tablet', 'Antibiotics', 'Medisure Pharma', 'Strip of 3', '3004', 72.00, 55.50, 44.00, 10, 'Macrolide antibiotic.'),
  ('SW-AMX-625', 'Amoxicillin + Clavulanic Acid 625 mg Tablet', 'Antibiotics', 'Arogya Labs', 'Strip of 6', '3004', 168.00, 129.00, 103.00, 10, 'Broad-spectrum antibiotic.'),
  ('SW-CET-10', 'Cetirizine 10 mg Tablet', 'Allergy', 'Lifeline Healthcare', 'Strip of 10', '3004', 20.00, 15.40, 12.20, 20, 'Antihistamine.'),
  ('SW-MLV-10', 'Montelukast 10 mg + Levocetirizine 5 mg Tablet', 'Allergy', 'Medisure Pharma', 'Strip of 10', '3004', 145.00, 111.50, 89.00, 10, 'For allergic rhinitis.'),
  ('SW-PAN-40', 'Pantoprazole 40 mg Tablet', 'Gastro', 'Arogya Labs', 'Strip of 15', '3004', 120.00, 92.00, 73.50, 10, 'Proton pump inhibitor.'),
  ('SW-OME-20', 'Omeprazole 20 mg Capsule', 'Gastro', 'Lifeline Healthcare', 'Strip of 15', '3004', 62.00, 47.70, 38.00, 10, 'Proton pump inhibitor.'),
  ('SW-OND-4', 'Ondansetron 4 mg Tablet', 'Gastro', 'Medisure Pharma', 'Strip of 10', '3004', 58.00, 44.60, 35.60, 10, 'Antiemetic.'),
  ('SW-DOM-10', 'Domperidone 10 mg Tablet', 'Gastro', 'Arogya Labs', 'Strip of 10', '3004', 38.00, 29.20, 23.30, 10, 'Antiemetic and prokinetic.'),
  ('SW-ORS-200', 'Oral Rehydration Salts (WHO formula)', 'Gastro', 'Lifeline Healthcare', 'Sachet of 21 g', '3004', 22.00, 16.90, 13.50, 50, 'Rehydration for diarrhoea.'),
  ('SW-MET-500', 'Metformin 500 mg Tablet', 'Diabetes', 'Arogya Labs', 'Strip of 20', '3004', 40.00, 30.80, 24.60, 20, 'Oral antidiabetic.'),
  ('SW-GLM-1', 'Glimepiride 1 mg Tablet', 'Diabetes', 'Medisure Pharma', 'Strip of 15', '3004', 85.00, 65.40, 52.20, 10, 'Oral antidiabetic.'),
  ('SW-AML-5', 'Amlodipine 5 mg Tablet', 'Cardiac', 'Lifeline Healthcare', 'Strip of 15', '3004', 46.00, 35.40, 28.30, 20, 'Calcium channel blocker.'),
  ('SW-TEL-40', 'Telmisartan 40 mg Tablet', 'Cardiac', 'Arogya Labs', 'Strip of 15', '3004', 98.00, 75.40, 60.20, 10, 'Angiotensin receptor blocker.'),
  ('SW-LOS-50', 'Losartan 50 mg Tablet', 'Cardiac', 'Medisure Pharma', 'Strip of 15', '3004', 78.00, 60.00, 47.90, 10, 'Angiotensin receptor blocker.'),
  ('SW-ATV-10', 'Atorvastatin 10 mg Tablet', 'Cardiac', 'Lifeline Healthcare', 'Strip of 15', '3004', 110.00, 84.60, 67.60, 10, 'Statin for cholesterol.'),
  ('SW-AMB-SYR', 'Ambroxol Cough Syrup', 'Cold & Cough', 'Arogya Labs', 'Bottle of 100 ml', '3004', 105.00, 80.80, 64.50, 10, 'Mucolytic expectorant.'),
  ('SW-VD3-60K', 'Cholecalciferol 60,000 IU Capsule', 'Vitamins', 'Medisure Pharma', 'Strip of 4', '3004', 135.00, 103.80, 83.00, 10, 'Vitamin D3 supplement.'),
  ('SW-CAD-500', 'Calcium Carbonate 500 mg + Vitamin D3 Tablet', 'Vitamins', 'Lifeline Healthcare', 'Strip of 15', '3004', 120.00, 92.30, 73.80, 10, 'Calcium supplement.'),
  ('SW-BCX-CAP', 'Vitamin B-Complex Capsule', 'Vitamins', 'Arogya Labs', 'Strip of 10', '3004', 42.00, 32.30, 25.80, 20, 'B-vitamin supplement.'),
  ('SW-IFA-TAB', 'Ferrous Ascorbate + Folic Acid Tablet', 'Women''s Health', 'Medisure Pharma', 'Strip of 10', '3004', 150.00, 115.40, 92.20, 10, 'Iron and folic acid supplement.'),
  ('SW-PAD-XL', 'Sanitary Pads XL', 'Women''s Health', 'HerCircle Essentials', 'Pack of 15', '9619', 199.00, 153.00, 122.00, 10, 'Ultra-thin pads with wings.'),
  ('SW-CUP-M', 'Menstrual Cup (Medium)', 'Women''s Health', 'HerCircle Essentials', '1 cup', '4014', 349.00, 268.00, 214.00, 5, 'Medical-grade silicone cup.'),
  ('SW-PVI-100', 'Povidone-Iodine Solution 5%', 'First Aid', 'Lifeline Healthcare', 'Bottle of 100 ml', '3004', 115.00, 88.50, 70.70, 10, 'Antiseptic solution.'),
  ('SW-SAN-500', 'Hand Sanitizer 70% Alcohol', 'First Aid', 'Lifeline Healthcare', 'Bottle of 500 ml', '3808', 250.00, 192.00, 153.50, 10, 'Alcohol-based hand rub.'),
  ('SW-THM-DIG', 'Digital Thermometer', 'Devices', 'CareTech Devices', '1 unit', '9025', 299.00, 230.00, 184.00, 5, 'Oral and underarm use.');

-- -------------------------------------------------------------------
-- Stock: distributors carry the full catalog; pharmacies hold a subset,
-- including some low-stock and near-expiry batches to trigger alerts.
-- -------------------------------------------------------------------
do $$ begin perform setseed(0.42); end $$;

insert into public.distributor_stock (distributor_id, product_id, sku, quantity, min_order_quantity, batch_number, expiry_date)
select
  d.id, p.id, p.sku,
  (200 + floor(random() * 1800))::int,
  p.moq,
  'B' || to_char(now(), 'YY') || upper(substr(md5(d.id::text || p.sku), 1, 5)),
  (current_date + (180 + floor(random() * 540))::int)
from public.distributor_profiles d
cross join public.products p
where d.status = 'approved';

insert into public.pharmacy_inventory (pharmacy_id, product_id, stock_quantity, reorder_level, batch_number, expiry_date)
select
  ph.id, p.id,
  case when random() < 0.2 then floor(random() * 15)::int else (40 + floor(random() * 260))::int end,
  (20 + floor(random() * 40))::int,
  'B' || to_char(now(), 'YY') || upper(substr(md5(ph.id::text || p.sku), 1, 5)),
  case when random() < 0.12 then current_date + (10 + floor(random() * 50))::int
       else current_date + (120 + floor(random() * 600))::int end
from public.pharmacy_profiles ph
cross join public.products p
where ph.status = 'approved' and random() < 0.75;

-- -------------------------------------------------------------------
-- 90 days of pharmacy -> distributor orders.
-- Older orders are delivered (a few cancelled); recent ones are in flight.
-- Mondays and Tuesdays order more, giving forecasting a weekly pattern.
-- -------------------------------------------------------------------
do $$
declare
  ph record;
  days_ago int;
  ordered_at timestamptz;
  new_order uuid;
  order_status text;
begin
  for ph in
    select p.id,
           (select m.distributor_id from public.pharmacy_distributors m
            where m.pharmacy_id = p.id order by m.distributor_id limit 1) as distributor_id
    from public.pharmacy_profiles p
    where p.status = 'approved'
    order by p.id
  loop
    for days_ago in reverse 90..0 loop
      continue when random() >= 0.4;

      ordered_at := least(
        date_trunc('day', now()) - days_ago * interval '1 day' + interval '9 hours' + random() * interval '9 hours',
        now() - interval '5 minutes'
      );
      order_status := case
        when days_ago > 7 then case when random() < 0.94 then 'delivered' else 'cancelled' end
        when days_ago > 3 then 'shipped'
        when days_ago > 1 then 'confirmed'
        else 'pending'
      end;

      insert into public.orders (pharmacy_id, distributor_id, status, delivery_otp, order_date, created_at)
      values (
        ph.id, ph.distributor_id, order_status,
        case when order_status = 'shipped' then lpad(floor(random() * 10000)::text, 4, '0') end,
        ordered_at, ordered_at
      )
      returning id into new_order;

      insert into public.order_items (order_id, product_id, quantity, unit_price)
      select
        new_order, p.id,
        (p.moq * (1 + floor(random() * 3))
          * case when extract(isodow from ordered_at) in (1, 2) then 2 else 1 end)::int,
        p.price
      from (
        select * from public.products
        where category <> 'Devices'
        order by random()
        limit (2 + floor(random() * 4))::int
      ) p;

      update public.orders
      set total_amount = (select sum(quantity * unit_price) from public.order_items where order_id = new_order)
      where id = new_order;
    end loop;
  end loop;
end;
$$;

-- Two orders without a mapped distributor, routed to the admin queue.
do $$
declare
  new_order uuid;
  sku_list text[];
begin
  foreach sku_list slice 1 in array array[['SW-PAD-XL', 'SW-MEF-SPS'], ['SW-THM-DIG', 'SW-SAN-500']] loop
    insert into public.orders (pharmacy_id, distributor_id, status, order_date, created_at)
    values ('b0000000-0000-4000-8000-000000000002', null, 'pending', now() - interval '3 hours', now() - interval '3 hours')
    returning id into new_order;

    insert into public.order_items (order_id, product_id, quantity, unit_price)
    select new_order, p.id, p.moq * 2, p.price
    from public.products p
    where p.sku = any (sku_list);

    update public.orders
    set total_amount = (select sum(quantity * unit_price) from public.order_items where order_id = new_order)
    where id = new_order;
  end loop;
end;
$$;

-- -------------------------------------------------------------------
-- Distributor -> admin purchase orders and an open distributor cart
-- -------------------------------------------------------------------
do $$
declare
  dist uuid;
  i int;
  ordered_at timestamptz;
  new_order uuid;
begin
  foreach dist in array array[
    'd0000000-0000-4000-8000-000000000001'::uuid,
    'd0000000-0000-4000-8000-000000000002'::uuid
  ] loop
    for i in 1..4 loop
      ordered_at := now() - ((5 - i) * 14 + floor(random() * 5)) * interval '1 day';

      insert into public.distributor_admin_orders (distributor_id, status, delivery_otp, order_date, created_at)
      values (
        dist,
        case i when 4 then 'Pending' when 3 then 'Shipped' else 'Completed' end,
        case when i = 3 then lpad(floor(random() * 10000)::text, 4, '0') end,
        ordered_at, ordered_at
      )
      returning id into new_order;

      insert into public.distributor_admin_order_items (order_id, product_id, quantity, price)
      select new_order, p.id, p.moq * (5 + floor(random() * 10))::int, p.distributor_price
      from (select * from public.products order by random() limit 4) p;

      update public.distributor_admin_orders
      set total_amount = (select sum(quantity * price) from public.distributor_admin_order_items where order_id = new_order)
      where id = new_order;
    end loop;
  end loop;
end;
$$;

insert into public.distributor_cart_items (distributor_id, product_id, quantity)
select 'd0000000-0000-4000-8000-000000000001', p.id, p.moq * 10
from public.products p
where p.sku in ('SW-PCM-650', 'SW-ORS-200', 'SW-PAD-XL');

drop table demo_users;
