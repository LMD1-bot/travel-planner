# 贡献指南

感谢你对 Travel Planner 的关注！我们欢迎各种形式的贡献。

## 报告问题（Issue）

- 使用 [Bug 报告模板](.github/ISSUE_TEMPLATE/bug_report.md) 提交问题
- 使用 [功能建议模板](.github/ISSUE_TEMPLATE/feature_request.md) 提出想法
- 提交前请先搜索是否已有相同 Issue

## 提交代码（Pull Request）

1. **Fork** 本仓库并克隆到本地
2. 安装依赖：`npm install`
3. 创建分支：`git checkout -b feat/your-feature`
4. 开发并确保通过检查：
   ```bash
   npm run lint
   npm run build
   ```
5. 提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org/)：
   - `feat: 新功能`
   - `fix: 修复`
   - `docs: 文档`
   - `refactor: 重构`
6. 推送并创建 PR，描述清楚改动内容和动机

## 代码规范

- 使用 TypeScript，避免 `any`
- 组件使用函数式组件 + Hooks
- 样式统一使用 Tailwind CSS
- 保持「无后端、本地存储」的架构原则

## 行为准则

请保持友善与尊重，共同维护一个开放的社区。