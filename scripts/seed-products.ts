/**
 * Firestore product seeder.
 *
 * Usage:
 *   npx tsx scripts/seed-products.ts <path-to-csv> <n> [--collection products] [--dry-run]
 *
 * Examples:
 *   npx tsx scripts/seed-products.ts ./data/products.csv 100
 *   npx tsx scripts/seed-products.ts ./data/products.csv 50 --collection products --dry-run
 *
 * Auth (pick one):
 *   FIREBASE_SERVICE_ACCOUNT=./serviceAccountKey.json   (path to a service account key)
 *   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
 *
 * Install once:
 *   npm i -D firebase-admin csv-parse tsx
 */

import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { ProductSchema } from "@/types/database";

// Every CSV column is uploaded, so extra columns are allowed on top of ProductSchema
type ProductDoc = ProductSchema & Record<string, string>;

const DEFAULT_COLLECTION = "products";
const BATCH_SIZE = 400; // Firestore allows 500 writes per batch; stay safely under

function printUsageAndExit(message?: string): never {
  if (message) console.error(`\n✖ ${message}\n`);
  console.error(
    "Usage: npx tsx scripts/seed-products.ts <path-to-csv> <n> [--collection products] [--dry-run]\n",
  );
  process.exit(1);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const positional: string[] = [];
  let collection = DEFAULT_COLLECTION;
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--dry-run") dryRun = true;
    else if (arg === "--collection") collection = args[++i] ?? "";
    else if (arg.startsWith("--")) printUsageAndExit(`Unknown option: ${arg}`);
    else positional.push(arg);
  }

  const [csvArg, nArg] = positional;
  if (!csvArg || !nArg)
    printUsageAndExit("Both <path-to-csv> and <n> are required.");

  const limit = Number(nArg);
  if (!Number.isInteger(limit) || limit <= 0)
    printUsageAndExit("<n> must be a positive whole number.");
  if (!collection) printUsageAndExit("--collection needs a value.");

  const csvPath = path.resolve(csvArg);
  if (!fs.existsSync(csvPath))
    printUsageAndExit(`CSV file not found: ${csvPath}`);

  return { csvPath, limit, collection, dryRun };
}

function initFirestore() {
  const keyPath =
    process.env.FIREBASE_SERVICE_ACCOUNT ??
    process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!keyPath) {
    console.error(
      "✖ No credentials. Set FIREBASE_SERVICE_ACCOUNT to your service account key path.",
    );
    process.exit(1);
  }
  const serviceAccount = JSON.parse(
    fs.readFileSync(path.resolve(keyPath), "utf8"),
  );
  initializeApp({ credential: cert(serviceAccount) });
  return getFirestore();
}

const clean = (value: unknown) =>
  value === undefined || value === null ? "" : String(value).trim();

function toProductDoc(row: Record<string, string>): ProductDoc | null {
  const productId = clean(row.product_id);
  if (!productId) return null;

  // Upload every CSV column as a trimmed string, so new columns need no code change
  const fields = Object.fromEntries(
    Object.entries(row)
      .filter(([column]) => column.trim() !== "")
      .map(([column, value]) => [column.trim(), clean(value)]),
  );

  return { ...fields, id: productId, product_id: productId } as ProductDoc;
}

async function readProducts(csvPath: string, limit: number) {
  const products = new Map<string, ProductDoc>(); // dedupes repeated product_ids
  let rowsRead = 0;
  let skippedInvalid = 0;
  let skippedDuplicates = 0;

  const stream = fs.createReadStream(csvPath).pipe(
    parse({
      columns: true,
      bom: true,
      skip_empty_lines: true,
      relax_quotes: true,
      relax_column_count: true,
      trim: true,
    }),
  );

  for await (const row of stream) {
    rowsRead++;
    const doc = toProductDoc(row as Record<string, string>);

    if (!doc) {
      skippedInvalid++;
      continue;
    }
    if (products.has(doc.product_id)) {
      skippedDuplicates++;
      continue;
    }

    products.set(doc.product_id, doc);
    if (products.size >= limit) {
      stream.destroy(); // stop reading, we have enough
      break;
    }
  }

  return {
    products: [...products.values()],
    rowsRead,
    skippedInvalid,
    skippedDuplicates,
  };
}

async function main() {
  const { csvPath, limit, collection, dryRun } = parseArgs();

  console.log(`📄 Reading up to ${limit} products from ${csvPath}`);
  const { products, rowsRead, skippedInvalid, skippedDuplicates } =
    await readProducts(csvPath, limit);

  console.log(
    `   Rows read: ${rowsRead} | to upload: ${products.length} | ` +
      `skipped (no product_id): ${skippedInvalid} | skipped (duplicate id): ${skippedDuplicates}`,
  );

  if (products.length === 0) {
    console.error(
      '✖ Nothing to upload. Check the CSV has a "product_id" column.',
    );
    process.exit(1);
  }

  if (products.length < limit) {
    console.warn(
      `⚠ Asked for ${limit} but the CSV only had ${products.length} usable products.`,
    );
  }

  if (dryRun) {
    console.log(
      `\n🧪 Dry run: nothing written. First product that would go to "${collection}/${products[0].product_id}":`,
    );
    console.log(products[0]);
    return;
  }

  const db = initFirestore();
  const collectionRef = db.collection(collection);

  let uploaded = 0;
  for (let start = 0; start < products.length; start += BATCH_SIZE) {
    const chunk = products.slice(start, start + BATCH_SIZE);
    const batch = db.batch();

    // Document id = product_id. set() overwrites, so re-running is safe (no duplicates)
    chunk.forEach((product) =>
      batch.set(collectionRef.doc(product.product_id), product),
    );

    await batch.commit();
    uploaded += chunk.length;
    console.log(`⬆ Uploaded ${uploaded}/${products.length}`);
  }

  console.log(`\n✔ Done. ${uploaded} products written to "${collection}".`);
}

main().catch((error) => {
  console.error("\n✖ Seeding failed:", error);
  process.exit(1);
});
