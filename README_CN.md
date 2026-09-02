# 🎓 LearnAI — 全阶段自适应 AI 智能教育平台

<p align="center">
  <strong>陪伴每位学习者终身成长的开源 AI 导师</strong>
</p>

<p align="center">
  统一教学引擎 · 六大学习世界 · 十大经典教学法 · 零门槛即开即用
</p>

---

## 🌟 项目亮点

LearnAI 旨在打破优质教育资源的阶层与地域壁垒，通过先进的语言模型与科学的教学法结合，为全球学习者提供一对一的个性化 AI 导师。

- <b>全新 6 步自适应闭环机制</b>：兴趣引入 (Hook) ➔ 概念讲解 (Explain) ➔ 互动练习 (Practice) ➔ 即时反馈 (Feedback) ➔ 反思总结 (Reflect) ➔ 能力进阶 (Evolve)。
- <b>四大年龄段沉浸模式</b>：
  - 🌸 **趣味萌芽世界 (3–6岁)**：生动故事、趣味互动与启蒙图形。
  - 🚀 **探索任务世界 (12–15岁)**：闯关挑战、逻辑思维与项目实践。
  - 💼 **职场实践世界 (18岁+)**：真实案例、云计算认证与前沿技能。
  - 👵 **沉浸关怀世界 (长者模式)**：清晰步骤、大字号与耐心的语气。
- <b>全中文界面与多语言支持</b>：主页及各主要模块均支持全中文汉化与本地化适配。
- <b>手机控制台联动</b>：支持 iPhone 移动端语音/文字操控，随时指挥 AI 完成代码修改与服务器调试。

---

## 🛠️ 技术栈

- **前端框架**：Next.js 15 (App Router) + React 18 + TypeScript 5.7
- **UI & 样式**：Tailwind CSS + Framer Motion (自适应动画)
- **数据库 & ORM**：PostgreSQL + Prisma ORM
- **AI 引擎**：通义千问 (Qwen-Plus) / OpenAI API / Gemini API
- **移动端控制服务**：Node.js + Cloudflare Tunnel / 局域网 Socket 实时推流

---

## 🚀 快速启动

### 1. 克隆项目与安装依赖
```bash
git clone https://github.com/ruslanmv/learnai.git
cd learnai
npm install
```

### 2. 配置环境变量
复制 `.env.example` 为 `.env.local` 并配置 API Key：
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/learnai"
NEXTAUTH_SECRET="your-secret-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. 运行本地开发服务器
```bash
npm run dev
```
打开浏览器访问 [http://localhost:3000](http://localhost:3000)。

### 4. 启动 iPhone 手机助手控制台
```bash
node scripts/mobile-agent.js
```
手机访问：`http://172.20.10.4:3888` 即可通过 iPhone 控制开发与查看状态。

---

## 📄 开源协议
本项目采用 [Apache-2.0 License](LICENSE) 开源协议。
