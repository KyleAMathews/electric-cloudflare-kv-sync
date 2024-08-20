import { KVNamespace, ExportedHandler } from '@cloudflare/workers-types'

export interface Env {
    organizations: KVNamespace;
}

export default {
  async fetch(request, env): Promise<Response> {
    try {
      // Write to organizations KV namespace when kv-sync sends updates from Postgres.
      if (request.method === `POST`) {
        const body: any[] = await request.json()
        console.log(body)
        for (const entry of body) {
          const [[key,value], [_operation, operation]] = Object.entries(entry)
          if (operation === `insert`) {
             await env.organizations.put(key, value as string);
          } else if (operation === `update`) {
            // Merge updates into the old value
            const oldValue = await env.organizations.get(key)
            const mergedValue = {...JSON.parse(oldValue), ...JSON.parse(value as string)}
            await env.organizations.put(key, JSON.stringify(mergedValue));
          } else if (operation === `delete`) {
            await env.organizations.delete(key)
          }
        }
        return new Response(`ok`)
      } else if (request.method === `GET`) {
        // Get all organization values from the KV store and return them.
        const list = await env.organizations.list()
        console.log(list)
        const values = await Promise.all(list.keys.map(async ({name}) => {
          const value = await env.organizations.get(name)
          return JSON.parse(value)
        }))
        return new Response(JSON.stringify(values, null, 4));
      }
    } catch (err) {
      console.error(`KV returned error: ${err}`)
      return new Response(err, { status: 500 })
    }
  },
} satisfies ExportedHandler<Env>;
