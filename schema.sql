-- Cloudflare D1 schema. Apply once: npx wrangler d1 execute classic-leasing --remote --file=schema.sql

CREATE TABLE IF NOT EXISTS enquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  received_at TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  car TEXT NOT NULL,
  odometer TEXT,
  running TEXT,
  employer TEXT,
  notes TEXT
);

-- Anonymous daily counts. No personal data.
CREATE TABLE IF NOT EXISTS funnel (
  day TEXT NOT NULL,
  event TEXT NOT NULL,
  n INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, event)
);
