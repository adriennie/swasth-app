#!/usr/bin/env node

/**
 * Creates the demo login accounts used by supabase/seed.sql.
 * Hosted Supabase blocks SQL writes to auth tables, so accounts are created
 * through the Auth Admin API with the secret key instead.
 *
 * Run with: npm run seed:users
 * Reads EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY from .env.
 * Safe to re-run: existing accounts are left unchanged.
 */

const { createClient } = require("@supabase/supabase-js");

try {
  process.loadEnvFile(".env");
} catch {
  // Fall back to variables already in the environment.
}

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!url || !secretKey) {
  console.error("Missing EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env.");
  process.exit(1);
}

// Must match the ids and emails in supabase/seed.sql.
const PASSWORD = "Demo@12345";
const DEMO_USERS = [
  { id: "a0000000-0000-4000-8000-000000000001", email: "admin@hercircle.com", role: "admin", name: "Swasthya Admin" },
  { id: "d0000000-0000-4000-8000-000000000001", email: "medline@demo.swasthya.test", role: "distributor", name: "MedLine Distributors" },
  { id: "d0000000-0000-4000-8000-000000000002", email: "healthbridge@demo.swasthya.test", role: "distributor", name: "HealthBridge Pharma Supply" },
  { id: "d0000000-0000-4000-8000-000000000003", email: "quickmeds@demo.swasthya.test", role: "distributor", name: "QuickMeds Wholesale" },
  { id: "b0000000-0000-4000-8000-000000000001", email: "sanjeevani@demo.swasthya.test", role: "pharmacy", name: "Sanjeevani Medicals" },
  { id: "b0000000-0000-4000-8000-000000000002", email: "careplus@demo.swasthya.test", role: "pharmacy", name: "CarePlus Pharmacy" },
  { id: "b0000000-0000-4000-8000-000000000003", email: "aarogya@demo.swasthya.test", role: "pharmacy", name: "Aarogya Chemists" },
  { id: "b0000000-0000-4000-8000-000000000004", email: "nova@demo.swasthya.test", role: "pharmacy", name: "Nova Health Store" },
];

const supabase = createClient(url, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  let failed = 0;
  for (const user of DEMO_USERS) {
    const { data: existing } = await supabase.auth.admin.getUserById(user.id);
    if (existing?.user) {
      console.log(`exists   ${user.email}`);
      continue;
    }

    const { error } = await supabase.auth.admin.createUser({
      id: user.id,
      email: user.email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { role: user.role, name: user.name },
    });

    if (error) {
      failed++;
      console.error(`failed   ${user.email}: ${error.message}`);
    } else {
      console.log(`created  ${user.email}`);
    }
  }

  if (failed) {
    process.exit(1);
  }
  console.log("\nDemo accounts ready. Now run: npm run seed:data");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
