# 🧳 Travel Planner · 出游攻略助手

一个**开源、隐私友好、开箱即用**的出游攻略规划工具。帮助你规划行程、安排每日活动、管理出行清单，并一键导出精美的 Markdown 攻略分享给旅伴。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/LMD1-bot/travel-planner)

## 🌐 在线体验

👉 **https://travel-planner-vert.vercel.app** （部署后请把这里替换成你的实际 Vercel 域名）

> 也可以点击上方「Deploy with Vercel」按钮，30 秒部署一个属于你自己的实例。

---

## ✨ 功能特性

- 🗓️ **行程规划** — 按天组织行程，为每天添加活动（时间、地点、费用、备注）
- 🎒 **出行清单** — 内置常用打包清单（证件/衣物/电子/药品），支持自定义
- 💰 **费用估算** — 自动汇总每个活动的花费，与预算对比
- 📋 **一键导出** — 生成排版精美的 Markdown 攻略，可复制或下载分享给旅伴
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
├── app/                   # Next.js App Router 页面
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 主页面（行程列表 + 详情）
│   └── globals.css        # 全局样式
├── components/            # React 组件
│   ├── NewTripForm.tsx    # 新建行程表单
│   ├── TripCard.tsx       # 行程卡片
│   └── TripDetail.tsx     # 行程详情（活动编辑 + 清单）
├── lib/                   # 业务逻辑
│   ├── storage.ts         # localStorage 读写 + JSON 导入导出
│   ├── trip.ts            # 行程工厂、费用统计、Markdown 生成
│   └── utils.ts           # 日期/格式化工具
└── types/
    └── trip.ts            # 核心数据类型定义
```

## 🤝 贡献指南

欢迎 Issue 和 Pull Request！详见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feat/amazing-feature`
3. 提交更改：`git commit -m "feat: add amazing feature"`
4. 推送分支：`git push origin feat/amazing-feature`
5. 提交 Pull Request

## 🗺️ Roadmap

- [ ] 行程模板库（热门城市现成攻略）
- [ ] 地图视图（接入地图展示每日路线）
- [ ] 多人协作编辑
- [ ] PWA 离线支持
- [ ] 多语言（中/英）

## 📄 开源协议

[MIT](./LICENSE) © Travel Planner contributors