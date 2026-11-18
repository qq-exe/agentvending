/**
 * buyer-agent.js — Built-in buyer agent (for the demo)
 * Simulates a real external buyer agent: discover → quote → budget guard → order → status check.
 * All decision logs go to the onLog callback and display live on the demo page.
 */
export async function runBuyerAgent(sellerApi, { sku = 'browser-automation', budget = 200, onLog = console.log } = {}) {
  const t0 = Date.now();
  const log = (step, detail) => onLog({ t: ((Date.now() - t0) / 1000).toFixed(1) + 's', step, detail });

  log('discover', `GET /.well-known/agent-network.json @ ${sellerApi.origin}`);
  const desc = await sellerApi.discover();
  log('discovered', `seller="${desc.name}", capabilities=[${desc.capabilities.map(c => c.id).join(', ')}]`);

  log('quote', `asking price for sku="${sku}"`);
  const q = await sellerApi.capability('quote').invoke({ sku });
  if (q.error) { log('quote-failed', JSON.stringify(q)); return q; }
  log('quoted', `$${q.price_usd} · ${q.delivery_days} days · valid 24h (${q.quote_id})`);

  if (q.price_usd > budget) {
    log('budget-guard', `quote $${q.price_usd} > my budget $${budget} → negotiating down: trying non-rush / smaller sku`);
    const alt = await sellerApi.capability('quote').invoke({ sku: 'landing-page' });
    log('counter-quote', `$${alt.price_usd} — ${alt.price_usd <= budget ? 'ACCEPT' : 'DECLINE'}`);
    if (alt.price_usd > budget) { log('walk-away', 'no deal within budget'); return { status: 'no-deal' }; }
    Object.assign(q, alt);
  }

  log('order', `placing order with budget guard $${budget}`);
  const o = await sellerApi.capability('order').invoke({ quote_id: q.quote_id, buyer_agent_id: 'demo-buyer-agent', max_budget_usd: budget, brief_url: `${sellerApi.origin}/briefs/example.md` });
  log(o.status === 'accepted' ? 'ordered ✅' : 'order-rejected', `status=${o.status}${o.order_id ? ' id=' + o.order_id : ''}`);

  if (o.order_id) {
    const s = await sellerApi.capability('status').invoke({ order_id: o.order_id });
    log('status', `progress ${s.progress_pct}%`);
  }
  log('done', `total ${(Date.now() - t0) / 1000}s — a deal a human would take 3 days, closed in seconds`);
  return { status: 'done' };
}
