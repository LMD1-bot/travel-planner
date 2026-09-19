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

- 🤖 **AI 一键生成** — 一句话描述需求（目的地/天数/预算/偏好），自动生成完整行程
- 📚 **模板库** — 内置厦门、成都、西安、杭州、重庆、大理、北京等热门城市攻略，一键套用
- 🖼️ **分享美图** — Canvas 渲染高颜值行程卡片，适合小红书/微信分享
- 🔗 **零后端分享链接** — 行程编码进 URL，朋友打开即可查看并「克隆」成自己的
- 🗓️ **行程规划** — 按天组织行程，为每天添加活动（时间、地点、费用、备注），支持排序
- 💡 **智能提示** — 行程强度预警（"今天排太满"）+ 预算健康度进度条与超支提醒
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

## 🤝 贡献指南

欢迎 Issue 和 Pull Request！详见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feat/amazing-feature`
3. 提交更改：`git commit -m "feat: add amazing feature"`
4. 推送分支：`git push origin feat/amazing-feature`
5. 提交 Pull Request

## 🗺️ Roadmap

- [x] AI 一键生成行程
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