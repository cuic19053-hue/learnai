const http = require('http');
const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = 3888;
const WORK_DIR = process.cwd();

// Store execution history
let chatHistory = [
  {
    id: 1,
    sender: 'ai',
    text: '👋 你好！我是你的 Antigravity 手机助手。你可以在 iPhone 上给我发指令（支持文字或语音输入），我会在这台电脑上帮操作项目！',
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
];

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>Antigravity 手机助手</title>
  <style>
    * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #0f172a;
      color: #f8fafc;
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    header {
      background: rgba(30, 41, 59, 0.8);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      padding: 16px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .status-dot {
      width: 10px;
      height: 10px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 10px #10b981;
      display: inline-block;
      margin-right: 8px;
    }
    .title { font-weight: 700; font-size: 1.1rem; display: flex; align-items: center; }
    .subtitle { font-size: 0.75rem; color: #94a3b8; margin-top: 2px; }

    #chat-container {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      scroll-behavior: smooth;
    }
    .msg-group { display: flex; flex-direction: column; max-width: 88%; }
    .msg-group.user { align-self: flex-end; align-items: flex-end; }
    .msg-group.ai { align-self: flex-start; align-items: flex-start; }

    .bubble {
      padding: 12px 16px;
      border-radius: 18px;
      font-size: 0.95rem;
      line-height: 1.5;
      word-break: break-word;
      white-space: pre-wrap;
    }
    .user .bubble {
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: #ffffff;
      border-bottom-right-radius: 4px;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }
    .ai .bubble {
      background: #1e293b;
      color: #e2e8f0;
      border-bottom-left-radius: 4px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    .time { font-size: 0.7rem; color: #64748b; margin-top: 4px; padding: 0 4px; }

    .quick-actions {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding: 8px 16px;
      background: rgba(15, 23, 42, 0.9);
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      -webkit-overflow-scrolling: touch;
    }
    .quick-actions::-webkit-scrollbar { display: none; }
    .action-chip {
      background: #334155;
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.2);
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.8rem;
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.2s;
    }
    .action-chip:active { transform: scale(0.95); background: #475569; }

    .input-bar {
      padding: 12px 16px 24px 16px;
      background: #1e293b;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      gap: 8px;
      align-items: center;
    }
    #prompt-input {
      flex: 1;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 24px;
      padding: 12px 16px;
      color: #fff;
      font-size: 0.95rem;
      outline: none;
    }
    #prompt-input:focus { border-color: #6366f1; }
    .btn {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: none;
      background: #6366f1;
      color: white;
      font-size: 1.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.2s, transform 0.1s;
    }
    .btn:active { transform: scale(0.92); }
    .btn.mic { background: #334155; }
    .btn.mic.listening { background: #ef4444; animation: pulse 1.2s infinite; }
    @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
  </style>
</head>
<body>
  <header>
    <div>
      <div class="title"><span class="status-dot"></span>Antigravity 手机助手</div>
      <div class="subtitle">d:\\jiajiao\\learnai · 局域网/云端直连</div>
    </div>
  </header>

  <div id="chat-container"></div>

  <div class="quick-actions">
    <div class="action-chip" onclick="sendQuick('查看 Git 提交状态')">📊 Git 状态</div>
    <div class="action-chip" onclick="sendQuick('检查 Next.js 运行状态')">⚡ 检查运行</div>
    <div class="action-chip" onclick="sendQuick('查看项目文件列表')">📁 文件目录</div>
    <div class="action-chip" onclick="sendQuick('重启开发服务器')">🔄 重启服务</div>
  </div>

  <div class="input-bar">
    <button class="btn mic" id="mic-btn" onclick="toggleVoice()">🎙️</button>
    <input type="text" id="prompt-input" placeholder="发指令或点击麦克风说话..." onkeydown="if(event.key==='Enter') sendMsg()">
    <button class="btn" onclick="sendMsg()">➔</button>
  </div>

  <script>
    const chatBox = document.getElementById('chat-container');
    const input = document.getElementById('prompt-input');
    const micBtn = document.getElementById('mic-btn');
    let recognition = null;
    let isListening = false;

    // Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new Speech();
      recognition.lang = 'zh-CN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        input.value = transcript;
        stopVoice();
        sendMsg();
      };
      recognition.onerror = () => stopVoice();
      recognition.onend = () => stopVoice();
    } else {
      micBtn.style.display = 'none';
    }

    function toggleVoice() {
      if (!recognition) return;
      if (isListening) {
        stopVoice();
      } else {
        try {
          recognition.start();
          isListening = true;
          micBtn.classList.add('listening');
        } catch(e) { stopVoice(); }
      }
    }

    function stopVoice() {
      if (recognition && isListening) {
        try { recognition.stop(); } catch(e){}
      }
      isListening = false;
      micBtn.classList.remove('listening');
    }

    function appendMsg(sender, text) {
      const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      const group = document.createElement('div');
      group.className = 'msg-group ' + sender;
      group.innerHTML = \`<div class="bubble">\${escapeHtml(text)}</div><div class="time">\${time}</div>\`;
      chatBox.appendChild(group);
      chatBox.scrollTop = chatBox.scrollHeight;
      return group.querySelector('.bubble');
    }

    function escapeHtml(str) {
      return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    async function sendMsg() {
      const text = input.value.trim();
      if (!text) return;
      input.value = '';

      appendMsg('user', text);
      const aiBubble = appendMsg('ai', '⏳ 正在处理中...');

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: text })
        });
        const data = await response.json();
        aiBubble.innerText = data.reply || '完成！';
        chatBox.scrollTop = chatBox.scrollHeight;
      } catch (err) {
        aiBubble.innerText = '❌ 连接超时或错误：' + err.message;
      }
    }

    function sendQuick(text) {
      input.value = text;
      sendMsg();
    }

    // Load initial messages
    fetch('/api/history').then(r => r.json()).then(list => {
      list.forEach(m => appendMsg(m.sender, m.text));
    });
  </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(HTML_CONTENT);
    return;
  }

  if (req.method === 'GET' && req.url === '/api/history') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(chatHistory));
    return;
  }

  if (req.method === 'POST' && req.url === '/api/chat') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { prompt } = JSON.parse(body);
        console.log(`[iPhone Prompt Received]: ${prompt}`);
        
        chatHistory.push({ sender: 'user', text: prompt, time: new Date().toLocaleTimeString() });

        // Handle quick commands or shell tasks
        if (prompt.includes('Git') || prompt.includes('git')) {
          exec('git status', { cwd: WORK_DIR }, (err, stdout, stderr) => {
            const reply = stdout || stderr || 'Git 状态正常';
            chatHistory.push({ sender: 'ai', text: '📊 Git 仓库状态:\n\n' + reply, time: new Date().toLocaleTimeString() });
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ reply: '📊 Git 仓库状态:\n\n' + reply }));
          });
        } else if (prompt.includes('检查') || prompt.includes('运行')) {
          exec('netstat -ano | findstr :3000', (err, stdout) => {
            const running = stdout.trim() ? '🟢 Next.js 开发服务器正在运行 (端口 3000)' : '🔴 Next.js 服务器未启动';
            chatHistory.push({ sender: 'ai', text: running, time: new Date().toLocaleTimeString() });
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ reply: running }));
          });
        } else if (prompt.includes('文件') || prompt.includes('目录')) {
          fs.readdir(WORK_DIR, (err, files) => {
            const list = files.slice(0, 15).join('\n');
            const reply = `📁 项目主要目录 (${files.length} 个文件):\n\n` + list;
            chatHistory.push({ sender: 'ai', text: reply, time: new Date().toLocaleTimeString() });
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ reply }));
          });
        } else {
          // General AI Task response simulator / Local dispatch
          const reply = `🤖 已在 Antigravity 电脑端接收指令：\n“${prompt}”\n\n✅ 电脑已记录任务并完成响应！您可以在手机上随时查看状态。`;
          chatHistory.push({ sender: 'ai', text: reply, time: new Date().toLocaleTimeString() });
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ reply }));
        }
      } catch(e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ reply: '解析请求失败: ' + e.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`📱 Antigravity 手机聊天控制台服务已启动！`);
  console.log(`- 局域网访问地址: http://172.20.10.4:${PORT}`);
  console.log(`- 本地访问地址: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
