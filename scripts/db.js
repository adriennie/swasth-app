// Shared database connection for the seed scripts.
// Reads .env.local first so it takes precedence (loadEnvFile never overrides).
const { Client } = require("pg");

for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // Missing files are fine.
  }
}

// Either a full SUPABASE_DB_URL, or SUPABASE_DB_HOST + SUPABASE_DB_PASSWORD
// (the URL is then built from the project ref in EXPO_PUBLIC_SUPABASE_URL).
function connectionString() {
  const url = process.env.SUPABASE_DB_URL;
  if (url && !url.includes("[YOUR-PASSWORD]")) return url;

  const host = process.env.SUPABASE_DB_HOST;
  const password = process.env.SUPABASE_DB_PASSWORD;
  const ref = (process.env.EXPO_PUBLIC_SUPABASE_URL || "").match(/^https:\/\/([^.]+)\./)?.[1];
  if (host && password && ref) {
    return `postgresql://postgres.${ref}:${encodeURIComponent(password)}@${host}:5432/postgres`;
  }
  return null;
}

async function connect() {
  const dbUrl = connectionString();
  if (!dbUrl) {
    console.error(
      "Missing database connection settings in .env.local. Add:\n" +
        "SUPABASE_DB_HOST=<session pooler host, e.g. aws-0-eu-west-1.pooler.supabase.com>\n" +
        "SUPABASE_DB_PASSWORD=<your database password>\n" +
        "Reset the password under Project Settings → Database if you don't know it."
    );
    process.exit(1);
  }
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  client.on("notice", (n) => console.log(`notice: ${n.message}`));
  await client.connect();
  return client;
}

module.exports = { connect };
