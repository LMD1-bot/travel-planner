# 🧳 Travel Planner · 出游攻略助手

一个**开源、隐私友好、开箱即用**的 AI 出游攻略工具。一句话生成行程、套用热门城市模板、生成高颜值分享卡片、零后端分享给旅伴——所有数据只存在你的浏览器里。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/LMD1-bot/travel-planner)

## 🌐 在线体验

👉 **https://travel-planner-tau-blue.vercel.app**

> 也可以点击上方「Deploy with Vercel」按钮，30 秒部署一个属于你自己的实例。

---

## ✨ 功能特性

- 🧠 **体验体检** — 用体力曲线模型检查强度、用餐节奏、休息、衔接缓冲与峰值设计，给出分级建议
- 💗 **个体关怀（女性友好）** — 生理期自动降档、洗手间可达性、夜晚安全优先、不跳餐
- 🤖 **AI 一键生成** — 一句话描述需求（目的地/天数/预算/偏好），按体验模型自动生成完整行程
- 📚 **模板库** — 内置厦门、成都、西安、杭州、重庆、大理、北京等热门城市攻略，一键套用
- 🖼️ **分享美图** — Canvas 渲染高颜值行程卡片，适合小红书/微信分享
- 🔗 **零后端分享链接** — 行程编码进 URL，朋友打开即可查看并「克隆」成自己的
- 🗓️ **行程规划** — 按天组织行程，为每天添加活动（时间、地点、费用、备注），支持排序
- 💡 **智能提示** — 行程强度预警 + 预算健康度进度条与超支提醒
- 🎒 **出行清单** — 内置常用打包清单（证件/衣物/电子/药品），支持自定义
- 📋 **导出攻略** — 一键复制或下载排版精美的 Markdown 攻略
- 📱 **PWA 离线** — 可安装到手机桌面，无网络时也能查看行程
- 🔒 **隐私优先** — 所有数据保存在浏览器 `localStorage`，不上传任何服务器
- 💾 **备份/恢复** — 支持导出/导入 JSON 备份，换设备也不丢数据
- 🚀 **零依赖后端** — 纯前端静态应用，可一键部署到 Vercel / GitHub Pages

## 🚀 快速开始

### 环境要求

- Node.js ≥ 18.17
- npm / pnpm / yarn

### 本地运行

```bash
git clone https://github.com/LMD1-bot/travel-planner.git
cd travel-planner
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可使用。

### 构建生产版本

```bash
npm run build
npm start
```

## 📦 技术栈

| 技术 | 用途 |
| --- | --- |
| [Next.js 16](https://nextjs.org/) | React 应用框架（App Router） |
| [React 19](https://react.dev/) | UI 库 |
| [TypeScript](https://www.typescriptlang.org/) | 类型安全 |
| [Tailwind CSS v4](https://tailwindcss.com/) | 样式 |
| 浏览器 `localStorage` | 本地数据持久化（无后端） |

## 📁 项目结构

```
src/
├── app/                        # Next.js App Router 页面
│   ├── layout.tsx              # 根布局（含 PWA manifest）
│   ├── page.tsx                # 主页面（行程列表 + AI/模板/创建入口）
│   ├── share/page.tsx          # 分享页（只读查看 + 一键克隆）
│   └── globals.css             # 全局样式
├── components/                 # React 组件
│   ├── NewTripForm.tsx         # 新建行程表单
│   ├── TripCard.tsx            # 行程卡片
│   ├── TripDetail.tsx          # 行程详情（活动编辑 + 清单 + 分享）
│   ├── TemplatePicker.tsx      # 模板选择器
│   ├── AiGenerateForm.tsx      # AI 生成表单
│   └── SwRegister.tsx          # Service Worker 注册（PWA）
├── lib/                        # 业务逻辑
│   ├── storage.ts              # localStorage 读写 + JSON 导入导出
│   ├── trip.ts                 # 行程工厂、费用统计、Markdown 生成
│   ├── templates.ts            # 热门城市行程模板数据
│   ├── share.ts                # 行程 ↔ URL 编码（零后端分享）
│   ├── shareImage.ts           # Canvas 分享图片渲染
│   ├── experience.ts           # 以人为本的体验模型与体检引擎（纯函数）
│   ├── experience.test.ts      # 28 个单元测试
│   ├── ai.ts                   # AI 行程生成（OpenAI 兼容 API）
│   └── utils.ts                # 日期/格式化工具
└── types/
    └── trip.ts                 # 核心数据类型定义
public/
├── manifest.webmanifest        # PWA 清单
├── sw.js                       # Service Worker（离线缓存）
└── icon.svg                    # 应用图标
```

## 🤖 AI 生成行程（可选）

AI 生成功能需要你自己的 API Key（兼容 OpenAI 接口）：

1. 点首页 **「🤖 AI 生成」**
2. 填入 API Key（如 OpenAI、DeepSeek、通义千问等任一兼容服务）
3. 如需使用第三方服务，填其 **Base URL**（如 `https://api.deepseek.com/v1`）
4. 用自然语言描述需求，例如："五一去厦门玩 3 天，2 个人，预算 3000，喜欢海边和美食"

> 🔒 API Key 仅保存在你的浏览器并直接调用你指定的服务，本项目不含任何后端，不会收集你的 Key。

## 🧠 设计理念：以人的体验来排行程

大多数行程工具在做「景点罗列」，本项目在做「**人的体力、情绪与需求在时间轴上的安排**」。

这套模型是**确定性代码**（`src/lib/experience.ts`），不依赖 AI —— 因此对手动创建的行程同样生效。

**① 体力曲线**
`08:00-11:00` 精力高峰 · `13:00-15:00` 人体第二低谷 · `15:00-18:00` 回升 · 夜间低体力高情绪。
重体力活动排在高峰，午后低谷只安排室内、有座位的内容。

**② 峰值体验**
每天只设计 **1 个**「记忆锚点」，放在体力与光线最好的时段（风景类放在日落前约 1.5 小时）。峰值前不赶路，峰值后不排长队。

**③ 个体关怀（女性友好）**

| 维度 | 系统行为 |
| --- | --- |
| 生理期 | 当天负荷上限**自动下调至约 60%**，避开长时间徒步 / 暴晒 / 久站，保留随时回住宿点的余地，并附照护提醒（保温杯、暖贴、允许随时取消行程） |
| 洗手间可达性 | 连续超过 2.5 小时没有可预期停靠点（用餐 / 休息 / 回住处 / 商场）时提示 |
| 夜晚安全优先 | 21:00 后仍有户外安排时，提示走明亮人多区域、确认返程方式、22:00 前回住宿地 |
| 用餐节奏 | 两餐间隔超过 5 小时提示——低血糖直接影响体力与情绪 |
| 决策疲劳 | 不排满，每天留出自由时间 |

**④ 体验体检**
每次编辑行程，`analyzeTrip()` 实时检查强度、用餐、休息、衔接缓冲（相邻活动至少留 20 分钟冗余）与峰值设计，并按 `需注意 / 建议 / 提示` 分级展示。

**⑤ AI + 确定性复核**
同一套模型既写进 System Prompt（让模型按此设计），也用于**生成后复核**：AI 的输出会被确定性代码再检查一遍，不合规处自动标注，避免"看起来很美但根本走不完"的行程。

**⑥ 单元测试**
`npm test` 运行 28 个用例，覆盖负荷计算、生理期降档、用餐间隔、衔接缓冲、洗手间与夜晚安全开关，以及"张弛有度的行程不应产生任何告警"的正向用例。

## 🤝 贡献指南

欢迎 Issue 和 Pull Request！详见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feat/amazing-feature`
3. 提交更改：`git commit -m "feat: add amazing feature"`
4. 推送分支：`git push origin feat/amazing-feature`
5. 提交 Pull Request

## 🗺️ Roadmap

- [x] AI 一键生成行程（按体验模型设计 + 确定性复核）
- [x] 以人为本的体验模型（体力曲线 / 峰值体验 / 生理期关怀 / 洗手间可达性 / 夜晚安全）
- [x] 单元测试（28 个用例，接入 CI）
- [x] 行程模板库（厦门/成都/西安/杭州/重庆/大理/北京）
- [x] 分享美图（Canvas 生成分享卡片）
- [x] 零后端分享链接 + 一键克隆
- [x] 行程强度提示 + 预算健康度
- [x] PWA 离线支持
- [ ] 地图视图（接入地图展示每日路线）
- [ ] 多人实时协作编辑
- [ ] 多语言（中/英）
- [ ] 更多城市模板 & 出行装备推荐

## 📄 开源协议

[MIT](./LICENSE) © Travel Planner contributors