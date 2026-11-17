# AgentVending — 智能体自动售货机

> **一句话**：把任何个人主页变成 24 小时自助售货机——访客的 AI 智能体自己走进来、发现你的服务、拿到报价、完成下单，全程无人值守。

**赛事**: Open Agentic Web Challenge (Cognizant × MIT Media Lab × Mozilla × ITU)
**奖金**: $10,000（一等奖 $5,000）｜报名 124 人｜截止 2027-01-11
**提交要求（第零项评分标准，逐条对照）**:
- ✅ 发布一个符合规范的 agent-network 描述 + 浏览器可运行的 runtime 接口
- ✅ Conformance gate（合规门）: 公开站点必须可加载、有 grounded capabilities、可控外部访问
- ✅ YouTube 演示视频 < 2 分钟，**真人出镜讲解**（不许 AI 配音）
- ✅ 评判四维等权：technological implementation / design / potential impact / idea
- ✅ 可复现的跨站点结果 + 简短的书面复现路径

## 核心功能（严格 3 个）
1. **Agent 发现卡**：`/.well-known/agent-network.json` 标准描述符，任何智能体可自动发现本站服务
2. **报价/下单 API**：grounded capabilities（quote / order / status），带预算守卫
3. **跨站点演示**：demo.html 里内置一个"买家智能体"，在浏览器里完成 发现→询价→下单→交付 全流程

## 前 30 秒 Pitch（痛点场景开场）
"你接自由职业单，网站挂了个邮箱表单。客户的 AI 助手想雇你——但它不会填表单，只能发邮件等你回，一来一回三天没了。如果网站本身就是一台自动售货机呢？客户智能体走过来，选服务、报价、下单、收货，你睡觉的时候生意自己跑。这就是 AgentVending。"

## 复现路径（给评委的书面说明）
1. 打开 `index.html` → 人看的售货机页面
2. 打开 `demo_cross.html`（需两个端口同时服务）→ 跨 origin 完整交易日志；或 `demo.html` 单站点版
3. `GET /.well-known/agent-network.json` → 机器可读的服务发现描述符
4. 全程无后端、无密钥、双开两个浏览器窗口即可复现跨站点交易

## 文件
- `index.html` — 售货机门面（人类访客）
- `demo.html` — 单站点实况交易演示
- `demo_cross.html` — **跨站点演示**（买家 :8900 / 卖家 :8899 两个 origin，postMessage jsonrpc 通道）
- `.well-known/agent-network.json` — 规范发现描述符
- `js/agent-api.js` — capabilities 运行时（quote/order/status）
- `js/buyer-agent.js` — 内置买家智能体（演示用）
