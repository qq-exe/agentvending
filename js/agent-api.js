/**
 * AgentVendingAPI — 浏览器端智能体运行时（Open Agentic Web Challenge）
 *
 * 同源 fetch 与跨域 postMessage 双通道。每个 capability 都是 grounded
 * （锚定 catalog.json 的价格表）且有副作用声明与限流。
 *
 * 用法（跨站点买家智能体）:
 *   const api = new AgentVendingAPI('https://seller.example');
 *   const q  = await api.capability('quote').invoke({ sku: 'landing-page' });
 *   const o  = await api.capability('order').invoke({ quote_id: q.quote_id, ... });
 */
export class AgentVendingAPI {
  constructor(origin) {
    this.origin = origin.replace(/\/$/, '');
    this._orders = new Map();      // order_id -> record（demo 内存态）
    this._quotes = new Map();      // quote_id -> record
    this._reqCount = new Map();    // buyer_agent_id -> timestamps（限流）
    this._seq = 0;
  }

  /** 能力发现：拉取并校验 /.well-known/agent-network.json */
  async discover() {
    const res = await fetch(`${this.origin}/.well-known/agent-network.json`);
    if (!res.ok) throw new Error(`discovery failed: HTTP ${res.status}`);
    const desc = await res.json();
    this._descriptor = desc;
    return desc;
  }

  /** 取某个 capability 的调用句柄 */
  capability(id) {
    const cap = this._descriptor?.capabilities?.find(c => c.id === id);
    if (!cap) throw new Error(`capability '${id}' not advertised`);
    return { invoke: (input) => this._invoke(id, input) };
  }

  async _invoke(id, input) {
    switch (id) {
      case 'quote': return this._quote(input);
      case 'order': return this._order(input);
      case 'status': return this._status(input);
      case 'discover': return this.discover();
      default: throw new Error(`unknown capability ${id}`);
    }
  }

  _rateOk(buyerId) {
    const now = Date.now();
    const arr = (this._reqCount.get(buyerId) || []).filter(t => now - t < 3600e3);
    if (arr.length >= 10) return false;
    arr.push(now); this._reqCount.set(buyerId, arr);
    return true;
  }

  async _quote({ sku, rush = false }) {
    const cat = await (await fetch(`${this.origin}/catalog.json`)).json();
    const item = cat.skus.find(s => s.id === sku);
    if (!item) return { error: 'unknown-sku', hint: Object.keys(cat.skus) };
    const price = +(item.base_price * (rush ? item.rush_multiplier : 1)).toFixed(2);
    const quote_id = `q_${Date.now().toString(36)}_${++this._seq}`;
    const rec = { quote_id, sku, price_usd: price, delivery_days: rush ? Math.max(1, item.delivery_days - 2) : item.delivery_days, valid_until: new Date(Date.now() + 864e5).toISOString() };
    this._quotes.set(quote_id, rec);
    return rec;
  }

  async _order({ quote_id, buyer_agent_id, max_budget_usd, brief_url }) {
    if (!this._rateOk(buyer_agent_id)) return { order_id: null, status: 'rejected-rate-limit' };
    const q = this._quotes.get(quote_id);
    if (!q || new Date(q.valid_until) < new Date()) return { order_id: null, status: 'rejected-invalid-quote' };
    if (max_budget_usd < q.price_usd) return { order_id: null, status: 'rejected-budget', needed: q.price_usd };
    const live = [...this._orders.values()].filter(o => o.status === 'accepted').length;
    if (live >= 3) return { order_id: null, status: 'rejected-capacity' };
    const order_id = `o_${Date.now().toString(36)}_${++this._seq}`;
    const rec = { order_id, quote_id, sku: q.sku, price_usd: q.price_usd, buyer_agent_id, brief_url, status: 'accepted', progress_pct: 0, delivery_url: `${this.origin}/deliveries/${order_id}.zip` };
    this._orders.set(order_id, rec);
    return rec;
  }

  async _status({ order_id }) {
    const o = this._orders.get(order_id);
    if (!o) return { error: 'unknown-order' };
    return { order_id, status: o.status, progress_pct: o.progress_pct };
  }

  /** 跨站点通道：以 postMessage 暴露同一套能力（iframe/弹窗场景） */
  serveViaPostMessage(targetOrigin = '*') {
    window.addEventListener('message', async (ev) => {
      const { jsonrpc, id, method, params } = ev.data || {};
      if (jsonrpc !== 'agentvending-0.2' || !method) return;
      let result;
      try { result = await this._invoke(method, params); }
      catch (e) { result = { error: String(e.message || e) }; }
      ev.source.postMessage({ jsonrpc: 'agentvending-0.2', id, result }, targetOrigin);
    });
  }

  /** 买家侧客户端：向 seller iframe 发起调用 */
  static client(iframeEl, targetOrigin) {
    let seq = 0; const pending = new Map();
    window.addEventListener('message', (ev) => {
      const { jsonrpc, id, result } = ev.data || {};
      if (jsonrpc === 'agentvending-0.2' && pending.has(id)) { pending.get(id)(result); pending.delete(id); }
    });
    return async (method, params) => new Promise((resolve) => {
      const id = ++seq;
      pending.set(id, resolve);
      iframeEl.contentWindow.postMessage({ jsonrpc: 'agentvending-0.2', id, method, params }, targetOrigin);
    });
  }
}
