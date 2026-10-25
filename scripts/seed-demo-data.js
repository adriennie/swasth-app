#!/usr/bin/env node

/**
 * Loads supabase/seed.sql into the hosted database from the terminal.
 * Run `npm run seed:users` first so the demo accounts exist.
 *
 * Run with: npm run seed:data
 * Needs SUPABASE_DB_HOST and SUPABASE_DB_PASSWORD (or SUPABASE_DB_URL) in
 * .env.local. .env.local is gitignored, so the password stays local.
 */

const fs = require("fs");
const path = require("path");
const { connect } = require("./db");

async function main() {
  const sql = fs.readFileSync(path.join(__dirname, "..", "supabase", "seed.sql"), "utf8");
  const client = await connect();
  try {
    const { rows } = await client.query("select count(*)::int as n from public.orders");
    if (rows[0].n > 0) {
      console.error(`The database already has ${rows[0].n} orders. Seed data is only loaded into an empty project.`);
      process.exit(1);
    }

    // One multi-statement query runs as a single transaction: all or nothing.
    await client.query(sql);

    const counts = await client.query(`
      select
        (select count(*) from public.products)::int as products,
        (select count(*) from public.orders)::int as orders,
        (select count(*) from public.pharmacy_inventory)::int as inventory
    `);
    const c = counts.rows[0];
    console.log(`Seeded ${c.products} products, ${c.orders} orders, ${c.inventory} inventory rows.`);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(`Seed failed: ${e.message}`);
  process.exit(1);
});
