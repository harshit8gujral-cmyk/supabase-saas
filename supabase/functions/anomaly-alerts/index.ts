// Optional webhook/email sender stub replaced with a no-op to keep deployable.
Deno.serve(() => new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json" }}));
