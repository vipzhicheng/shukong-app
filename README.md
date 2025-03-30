# 书空

一个优雅的汉字笔顺学习应用，让汉字书写学习变得轻松有趣。

![](./screenshots/home.png)

## 项目简介

书空是一款专注于汉字笔顺学习的现代化桌面应用，采用最新的前端技术栈打造。它不仅为儿童和汉字学习者提供直观的笔顺动画演示，还通过智能识别技术实时纠正书写错误。结合教材同步和游戏化学习等创新功能，让用户在轻松愉悦的氛围中掌握正确的汉字书写技能。

## 立项原因

作为一名家长，我发现我的孩子在汉字书写时经常出现笔顺错误。"书空"应用正是为解决这一教育痛点而生，它将传统的"书空"作业（在空中比划汉字）数字化，通过创新的交互方式和智能识别技术，帮助孩子们更高效地掌握标准汉字笔顺。应用名称"书空"既保留了传统教学方法的精髓，又融入了现代教育技术的优势。

## 特性

- 🎯 **笔顺动画演示**：通过流畅的动画效果，清晰展示每个汉字的标准书写过程和笔顺规则
- 📚 **教材同步**：完整支持部编版小学语文教材，帮助学生系统地进行课后练习和复习
- 🎨 **响应式设计**：采用现代化UI设计，完美适配从手机到大屏幕的各种设备尺寸
- 🔍 **智能汉字查询**：支持拼音、部首、笔画等多种查询方式，快速定位目标汉字
- 📝 **书空练习**：创新的交互式书写练习模式，配合智能识别技术实时纠正笔顺错误
- 🗺️ **导图字典**：独特的可视化汉字结构关系展示，帮助用户更深入地理解汉字组成
- 📖 **智能生字本**：个性化的生字收藏与管理系统，支持标签分类和智能复习提醒
- 🎮 **趣味练习**：融入多样化的游戏元素，让枯燥的汉字学习变得生动有趣
- 🌐 **全平台支持**：基于 Electron 开发，完美支持 Windows、macOS 和 Linux 系统

## 技术栈

- 📦 **pnpm**：高效的包管理工具，确保依赖的一致性和快速安装
- 🚀 **Vue 3**：采用 Composition API，构建响应式、高性能的用户界面
- ⚡️ **Vite**：享受闪电般的开发体验和高效的构建过程
- 🎨 **Tailwind CSS**：使用实用优先的 CSS 框架，实现灵活的样式定制
- 📝 **HanziWriter**：整合专业的汉字书写动画库，展示标准笔顺
- 🗺️ **Markmap**：强大的思维导图可视化工具，展示汉字结构关系
- 🎯 **Vue Router**：实现流畅的单页面应用路由管理
- 🔧 **Electron**：构建跨平台桌面应用，提供原生系统集成能力
- 📦 **Pinia**：Vue 3 的官方状态管理方案，支持 TypeScript
- 🎙️ **Web Speech API**：集成语音合成与识别功能，提升学习体验

## IDE

- **Trae**：强大的AI代码编辑器，大部分基于 Claude-3.5-Sonnet，少部分 Claude-3.7-Sonnet 和 DeepSeek-V3-0324
- 90% 以上的代码都是由 AI 生成的，只有 不到 10% 的代码是由我编写的。

## 开发指南

```bash
# 克隆项目
git clone https://github.com/yourusername/shukong-app.git

# 进入项目目录
cd shukong-app

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建桌面应用
pnpm build
```

## 许可证

[MIT](LICENSE.txt) © 2025 书空团队
