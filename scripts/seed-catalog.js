#!/usr/bin/env node

/**
 * Loads supabase/catalog.sql (the extended demo catalog) into the hosted
 * database and stocks it for approved distributors. Safe to re-run: existing
 * SKUs and stock rows are left unchanged.
 *
 * Run with: npm run seed:catalog
 */

const fs = require("fs");
const path = require("path");
const { connect } = require("./db");

async function main() {
  const sql = fs.readFileSync(path.join(__dirname, "..", "supabase", "catalog.sql"), "utf8");
  const client = await connect();
  try {
    await client.query(sql);
    const { rows: [c] } = await client.query(`
      select
        (select count(*) from public.products)::int as products,
        (select count(distinct category) from public.products)::int as categories,
        (select count(*) from public.distributor_stock)::int as stock
    `);
    console.log(`Catalog has ${c.products} products in ${c.categories} categories; ${c.stock} distributor stock rows.`);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(`Catalog seed failed: ${e.message}`);
  process.exit(1);
});
