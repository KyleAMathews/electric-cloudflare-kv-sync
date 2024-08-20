# electric-cloudflare-kv-sync

Demo showing how to sync data with ElectricSQL from Postgres to Cloudflare's Workers KV

Edge Workers often need very quick access to data.

Querying to the db is slow.

Maintaining a cache isn't ideal as you either need to hook up cache invalidation or accept stale data.

Sync Engines like [ElectricSQL](https://next.electric-sql.com/) are a systematic fix to these sorts of "I want an up-to-date copy of some Postgres data in this other system". Electric lets you subscribe to what we call a [shape](https://next.electric-sql.com/guides/shapes), which is basically a table with a where clause, and then any changes to the database within that shape will be sent to subscribers

Check out the demo.

https://github.com/user-attachments/assets/cebc1eaf-d8ae-4603-83fa-920b974bc04d

The sync code is in `kv-sync.ts` and worker code in `worker.ts`.

To run this locally.

1. clone
2. `npm install`
3. start the PG/Electric backends (Docker should be installed) `npm run backend:up`
4. start the worker: `npm run start`
5. start the syncer: `npm run sync` (note, the port of the worker is hard-coded but might be different on your machine). Open the worker in the browser to see what port it's on.
6. curl the worker `curl http://localhost:65094/` — you should get back an empty array.
7. Insert some organizations:

```sql
insert into
  organizations (
    name,
    address,
    city,
    state,
    postal_code,
    country,
    phone_number,
    email,
    website
  )
values
  (
    'Tech Innovators Inc.',
    '123 Tech Lane',
    'San Francisco',
    'CA',
    '94105',
    'USA',
    '415-555-1234',
    'info@techinnovators.com',
    'www.techinnovators.com'
  ),
  (
    'Green Solutions LLC',
    '456 Greenway Blvd',
    'Austin',
    'TX',
    '78701',
    'USA',
    '512-555-5678',
    'contact@greensolutions.com',
    'www.greensolutions.com'
  ),
  (
    'Health First Corp.',
    '789 Wellness Ave',
    'New York',
    'NY',
    '10001',
    'USA',
    '212-555-9012',
    'support@healthfirst.com',
    'www.healthfirst.com'
  );
```
8. Curl again — you should see the data. Then try updating a field or two and deleting an org and curl to see how the data is instantly synced.
