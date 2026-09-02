<p align="center">
  <img src="public/logo.svg" alt="LearnAI" width="120" height="120" />
</p>

<h1 align="center">LearnAI</h1>

<p align="center">
  <strong>一款适合所有人、适用于人生各个阶段的开源 AI 教师。</strong><br/>
  🌐 <a href="./README.md"><strong>English (English README)</strong></a>
</p>

<p align="center">
  一种教学引擎。六个学习世界。十种久经考验的教学方法。<br/>
  免费使用。无需绑卡。无需安装应用。
</p>

<p align="center">
  <a href="https://learnskillsai.com"><img src="https://img.shields.io/badge/Try_LearnAI-→_learnskillsai.com-2e5bff?style=for-the-badge" alt="Try LearnAI"/></a>
  &nbsp;
  <a href="https://github.com/sponsors/ruslanmv"><img src="https://img.shields.io/badge/💖_成为赞助者-ec4899?style=for-the-badge" alt="Become a sponsor"/></a>
</p>

<p align="center">
  <a href="https://www.apache.org/licenses/LICENSE-2.0"><img src="https://img.shields.io/badge/License-Apache_2.0-blue.svg" alt="License: Apache 2.0"/></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-15-black" alt="Next.js 15"/></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.7-3178C6" alt="TypeScript"/></a>
  <a href="https://modelcontextprotocol.io"><img src="https://img.shields.io/badge/MCP-Enabled-6366F1" alt="MCP Enabled"/></a>
</p>

> 👉 **产品体验地址：[learnskillsai.com](https://learnskillsai.com)。** 本仓库为开源源代码 —— 开放透明、可供审查和贡献。学习者无需安装任何东西；只需打开链接即可。

---

## 为什么这很重要

2500 年来，人类一直知道什么是好的教学。苏格拉底善于提问；维果茨基将学习者推向舒适区之外一点点；艾宾浩斯描绘了遗忘曲线；费曼发明了“以教促学”；斯威勒证明了在自己尝试之前先看一个解答示例并不是偷懒 —— 这正是人类真实的学习方式。

问题从来不在于方法。**问题始终在于规模。** 一位优秀的老师可以教导 30 个孩子，一位优秀的导师可以教导 1 个孩子。

在历史上，这一限制首次被打破。语言模型可以坐在地球上每一个学习者的身边 —— 耐心、凌晨 3 点随时待命、永远不知疲倦、从不对需要将同一个概念解释四遍的孩子失去耐心。问题不再是 *“AI 够聪明来教书吗？”* 而是 *“它应该成为什么样的老师？”*

LearnAI 就是我们希望与之共存的答案。

- **它不是硬生生塞进教科书的聊天机器人。** 它是一个完整的教学闭环 —— 吸引（Hook） → 讲解（Explain） → 练习（Practice） → 反馈（Feedback） → 反思（Reflect） → 进阶（Evolve） —— 无论是对学习数数的 4 岁孩子，还是正在演练论文答辩的博士生，运作方式都一样。
- **它不是一刀切的。** 它拥有六个适应不同年龄段的世界，每个世界都有自己的 UI、导师角色和节奏。4 岁孩子永远不会看到 SAT 备考界面，老年人也永远不会得到类似 Discord 机器人的教程。
- **它不是一个黑盒。** 每一个自适应的选择都是可解释的。每一个推荐都引用了其背后的数据。生成的每一份测试都会标明来源段落。*为什么是这个？为什么是现在？* —— 在每个屏幕的上下文中都有解答。
- **它不具剥削性。** 没有广告。没有诱导消费的弹窗。不出售儿童数据。完全作为访客使用。只有在跨设备同步时才需要登录。
- **它不被锁定。** 采用 Apache 2.0 开源协议意味着我们永远无法默默地将其变成一个需要付费墙的产品。托管服务是产品；开源则是它保持诚实的保证。

> **我们的赌注是：** 下十亿学习者不会通过教科书或 YouTube 频道接触网络。他们将通过个人的 AI 教师在线学习。这位教师应该是开源的、具备良好教学素养的，且在文化上具有普适性的。如果不是我们，那就会是动机截然不同的其他人。

---

## 教学闭环 (The Loop)

每一节课 —— 针对每一个年龄段 —— 都遵循相同的六个步骤：

> 🧲 **吸引 (Hook)** → 💡 **讲解 (Explain)** → ✏️ **练习 (Practice)** → 💬 **反馈 (Feedback)** → 🪞 **反思 (Reflect)** → 🌱 **进阶 (Evolve)**

表面形式在适应变化，但教学法始终如一。

---

## 教学法 — 10 种历史方法，1 个引擎

LearnAI 实现了 **借鉴自 2500 年教育史的十种学习方法**，这些方法都因其*简单*和*有证据支持*而被选中：

| # | 方法 | 传统 | 年份 | 所属闭环步骤 |
|---|---|---|---|---|
| 1 | ❓ 苏格拉底式对话 | 古希腊 | 公元前 5 世纪 | 吸引 (Hook) |
| 2 | 🏛️ 记忆宫殿法 | 古希腊 | 约公元前 500 年 | 讲解 (Explain) · 进阶 (Evolve) |
| 3 | 🔁 间隔重复 | 德国 (艾宾浩斯) | 1885 | 进阶 (Evolve) |
| 4 | 🎯 主动回忆 (测试效应) | 认知科学 | 2006 | 练习 (Practice) · 反馈 (Feedback) |
| 5 | 🧮 样例 → 变式 | Sweller，认知负荷理论 | 1985 | 讲解 (Explain) · 练习 (Practice) |
| 6 | 🎲 交错学习 | Bjork 实验室 | 1990 年代 | 练习 (Practice) |
| 7 | 🗣️ 费曼技巧 | 美国 (费曼) | 1960 年代 | 反馈 (Feedback) · 反思 (Reflect) |
| 8 | 🪜 公文式精通阶梯 | 日本 (公文公) | 1958 | 练习 (Practice) |
| 9 | 📈 最近发展区 | 苏联 (维果茨基) | 1934 | 练习 (Practice) |
| 10 | 🗺️ 沙塔洛夫参考信号 | 苏联 (沙塔洛夫) | 1970 年代 | 反思 (Reflect) |

每节课都会组装一个方法计划 —— 每个闭环步骤对应一种方法，并根据学习者的阶段进行调整。**教学法成为了代码，而不是营销术语。**

---

## 六个学习世界

| 世界 | 年龄 | 界面形式 | 示例课程 |
|---|---|---|---|
| 🦁 **小小学习者 (Little Learner)** | 3–6 | 故事、语音、色彩 | 和 Milo 一起数丛林动物 |
| 🚀 **探索者 (Explorer)** | 7–11 | 任务、徽章、好奇心 | 火山为什么会喷发？ |
| 🛠️ **建造者 (Builder)** | 12–15 | 项目、代码、任务 | 用 Python 做一个计算器 |
| 🎓 **学者 (Scholar)** | 16–18 | 备考、薄弱环节强化 | 三角函数冲刺掌握 |
| 💼 **专业人士 (Professional)** | 18+ | 路径、证书 | AWS 网络知识复习 |
| 🌿 **长者学习 (Senior Learner)** | 65+ | 安静、大字体、语音 | 如何识别诈骗短信 |

引导流程会将学习者分配到合适的世界，他们永远不会看到其他世界的界面。

---

## 与众不同之处

- **教学法是代码，而非营销。** 在代码中分类了十种方法，组合成适合各个阶段的计划，并在 UI 中标明其出处。其他产品可能会在发布推文中提到“苏格拉底方法”，而我们在提示词标签上标注了方法名称，并附带了工具提示。
- **开源、提供商无关的 AI。** 自由切换模型。您的课程不会改变。您的数据也留存本地。
- **以访客优先的架构。** 大多数 AI 产品在进行首次有用操作之前都需要注册。LearnAI 从第一次点击即可运行 —— 无需邮箱，无需绑卡，无需等待。
- **有据可查，不凭直觉。** 每一个 WikiTest 测试题都列出了来源标题。每一个个性化推荐都引用了生成它的数据。
- **内置无障碍访问。** 长者世界不是生搬硬套的 —— 它是头等变体，具有更大的字体、更平和的文案，并在项目向导本身提供了直观的无障碍控制。

---

## 手机控制台联动快速启动

### 1. 克隆项目与安装依赖
```bash
git clone https://github.com/cuic19053-hue/Antigravity-ide-iOS-apple-app-remote-control.git
cd learnai
npm install
```

### 2. 启动 iPhone 手机助手控制台
```bash
node scripts/mobile-agent.js
```
手机端即可控制开发与查看状态。

---

## 支持本项目

LearnAI 永远免费向学习者开放，在首年使用免费云服务层期间由赞助商资助。如果它对您有用，请[在 GitHub 上赞助](https://github.com/sponsors/ruslanmv)或给仓库点亮星星 (Star) —— 这些都有很大帮助。

---

## 路线图

**已发布**

- [x] 六个适应年龄的学习世界
- [x] 5步引导 (我是谁 → 学习旅程 → 老师 → 目标 → 准备就绪)
- [x] 课程播放器，包含闭环机制和自适应调整
- [x] 访客优先认证 —— 无需登录即可学习
- [x] 进度引擎 —— 经验值 (XP)、连续打卡、跨标签页同步
- [x] 管理控制台 —— 概览 / 学习者 / 闭环 / 世界 / AI 提供商 / 角色 / 安全 / 账单 / 审计
- [x] **WikiTest** —— 粘贴维基百科网址即可生成带有引用解析的评分测试
- [x] **项目创建向导** —— 六种受众，三种变体 (4步 / 家长主导 / 简易模式)，5 个开箱即用的演示
- [x] **项目工作区** —— AI 生成课程 + 带有导师实时反馈的交互式评分
- [x] **持久的 AI 导师侧边栏** —— 具备上下文感知，标注技巧名称，对每一个自适应选择都有“为什么是这个？”的解答
- [x] **家长仪表盘** —— 类似 YouTube Kids 的多儿童档案、科目白名单、安静时间、无障碍设置、数据导出
- [x] 认证模块 (AWS · Azure · GCP · IBM)
- [x] 语言模块 (7 种语言，CEFR A1 → B2)

**开发中**

- [ ] MaterialTest —— 相同管道用于 PDF + YouTube 字幕 + 练习册照片
- [ ] 语音模式的费曼练习 (麦克风 → Whisper → AI 评价)
- [ ] 进度引擎中的间隔重复队列
- [ ] 离线优先的 PWA 框架
- [ ] 前 10 大语言的国际化 (i18n)
- [ ] 答辩模式 (用于研究生备考的苏格拉底逻辑链 + 费曼复述解释)
- [ ] 课程市场 —— 发布课程，或复刻 (fork) 他人的课程

查看 [`docs/ROADMAP.md`](./docs/ROADMAP.md) 获取完整计划。

---

## 参与贡献

欢迎关于 Bug 修复、设计、课程内容、翻译以及教学法批评的 Pull Requests。相关指南请参阅 [`CONTRIBUTING.md`](./CONTRIBUTING.md)；架构及本地开发设置请参阅 [`docs/DEVELOPMENT.md`](./docs/DEVELOPMENT.md)；负责任的漏洞披露请参阅 [`SECURITY.md`](./SECURITY.md)。

---

## 开源协议

Apache 2.0 — 详见 [`LICENSE`](./LICENSE)。

来自维基百科的内容 (WikiTest 的文章文本) 在展示的每个页面均保留归属署名的前提下，遵循 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 协议进行重用。

---

<p align="center">
  <img src="public/logo.svg" alt="LearnAI" width="40" height="40" /><br/>
  <strong>由 <a href="https://ruslanmv.com">Ruslan Magana</a> 及众多贡献者构建。</strong><br/>
  <em>教育是一项权利。让地球上的每一个学习者都能拥有一位优秀的老师。</em><br/><br/>
  <a href="https://github.com/sponsors/ruslanmv"><strong>💖 支持 LearnAI</strong></a>
</p>
