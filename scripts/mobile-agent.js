const http = require('http');
const https = require('https');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = 3888;
const WORK_DIR = process.cwd();
const CONVERSATION_ID = 'fc80e2b5-7c7f-400e-854f-7d82dbf20c97';
const BRAIN_MESSAGES_DIR = `C:\\Users\\ch666\\.gemini\\antigravity-ide\\brain\\${CONVERSATION_ID}\\.system_generated\\messages`;
const HISTORY_FILE = path.join(__dirname, 'mobile-history.json');
const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY || 'sk-d3a23ff80981440e875bb22f9611e9dd';

let sseClients = [];
let lastProcessedCount = 0;

function loadHistory() {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
      return Array.isArray(data) ? data : [];
    }
  } catch (e) {}
  return [];
}

function saveHistory(list) {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (e) {}
}

let chatHistory = loadHistory();
lastProcessedCount = chatHistory.length;

function broadcastSSE(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(client => {
    try { client.write(payload); } catch(e){}
  });
}

// Watch mobile-history.json for instant disk sync
fs.watchFile(HISTORY_FILE, { interval: 200 }, () => {
  const latest = loadHistory();
  if (latest.length > lastProcessedCount) {
    const newItems = latest.slice(lastProcessedCount);
    chatHistory = latest;
    lastProcessedCount = latest.length;
    newItems.forEach(item => {
      broadcastSSE({ type: 'ai_end', id: item.id, fullText: item.text, time: item.time, sender: item.sender, device: item.device });
    });
  }
});

// Periodic heartbeat ping to keep iOS Safari EventSource alive
setInterval(() => {
  sseClients.forEach(client => {
    try { client.write(':ping\n\n'); } catch(e){}
  });
}, 3000);

// Inject prompt to Antigravity IDE Message Queue
function injectMessageToAntigravityIDE(promptText, deviceName) {
  try {
    if (!fs.existsSync(BRAIN_MESSAGES_DIR)) {
      fs.mkdirSync(BRAIN_MESSAGES_DIR, { recursive: true });
    }
    const msgId = crypto.randomUUID();
    const filePath = path.join(BRAIN_MESSAGES_DIR, `${msgId}.json`);
    const messagePayload = {
      id: msgId,
      recipient: CONVERSATION_ID,
      sender: `iPhone-Mobile-Client`,
      priority: "MESSAGE_PRIORITY_HIGH",
      timestamp: new Date().toISOString(),
      renderDetails: {
        messageTitle: `📱 iPhone 发来实时指令 (${deviceName})`
      },
      content: `[来自 iPhone 移动端的实时指令]: ${promptText}`
    };
    fs.writeFileSync(filePath, JSON.stringify(messagePayload, null, 2), 'utf8');
    console.log(`[IDE Bridge]: Injected prompt into Antigravity IDE: ${promptText}`);
  } catch (e) {
    console.error('[IDE Bridge Error]:', e);
  }
}

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>Antigravity IDE 双端直连控制台</title>
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
      background: rgba(30, 41, 59, 0.85);
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
    .status-dot.connecting { background: #f59e0b; box-shadow: 0 0 10px #f59e0b; }
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

    .device-badge {
      font-size: 0.68rem;
      color: #64748b;
      margin-bottom: 3px;
      padding: 0 6px;
    }

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

    form.input-bar {
      margin: 0;
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
      -webkit-appearance: none;
    }
    .btn:active { transform: scale(0.92); }
    .btn.mic { background: #334155; }
    .btn.mic.listening { background: #ef4444; animation: pulse 1.2s infinite; }
    @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }

    /* Markdown Styles */
    .bubble pre { background: #0f172a; padding: 12px; border-radius: 8px; overflow-x: auto; font-size: 0.85rem; margin: 8px 0; border: 1px solid rgba(255,255,255,0.1); }
    .bubble code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    .bubble p { margin: 0 0 8px 0; }
    .bubble p:last-child { margin: 0; }
    .bubble ul, .bubble ol { margin: 8px 0; padding-left: 20px; }

    .typing-indicator {
      display: flex; gap: 4px; align-items: center; padding: 4px 8px;
    }
    .typing-indicator span {
      width: 6px; height: 6px; background: #94a3b8; border-radius: 50%;
      animation: bounce 1.4s infinite ease-in-out both;
    }
    .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
    .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
    @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
</head>
<body>
  <header>
    <div>
      <div class="title"><span class="status-dot" id="status-dot"></span>Antigravity 双端实时同步</div>
      <div class="subtitle">💻 电脑 IDE ↔ 📱 iPhone 实时直连</div>
    </div>
  </header>

  <div id="chat-container"></div>

  <div class="quick-actions">
    <div class="action-chip" onclick="sendQuick('测试双端同步')">⚡ 测试同步</div>
    <div class="action-chip" onclick="sendQuick('汉化成功了吗')">🇨🇳 汉化进度</div>
    <div class="action-chip" onclick="sendQuick('查看 Git 提交状态')">📊 Git 状态</div>
    <div class="action-chip" onclick="sendQuick('检查 Next.js 运行状态')">⚡ 检查运行</div>
  </div>

  <form class="input-bar" onsubmit="sendMsg(); return false;" action="javascript:void(0);">
    <button type="button" class="btn mic" id="mic-btn" onclick="toggleVoice()">🎙️</button>
    <input type="text" id="prompt-input" autocomplete="off" placeholder="发指令直通电脑端 Antigravity IDE...">
    <button type="submit" class="btn">➔</button>
  </form>

  <script>
    const chatBox = document.getElementById('chat-container');
    const input = document.getElementById('prompt-input');
    const micBtn = document.getElementById('mic-btn');
    const statusDot = document.getElementById('status-dot');
    let recognition = null;
    let isListening = false;
    const msgBubbles = {};

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const deviceType = isMobile ? 'iPhone' : '电脑端';

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

    function renderBubble(id, sender, text, time, device) {
      const isTyping = text === 'TYPING_INDICATOR';
      const displayText = isTyping 
        ? '<div class="typing-indicator"><span></span><span></span><span></span></div><div style="font-size:0.75rem; color:#94a3b8; margin-top:4px;">Antigravity 正在思考与执行...</div>'
        : marked.parse(text);

      if (msgBubbles[id]) {
        msgBubbles[id].innerHTML = displayText;
        chatBox.scrollTop = chatBox.scrollHeight;
        return msgBubbles[id];
      }
      const t = time || new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      const devTag = device ? (device === 'iPhone' ? '📱 iPhone' : (device === '电脑端' ? '💻 电脑 IDE' : '🤖 Antigravity AI')) : (sender === 'user' ? '👤 发送' : '🤖 Antigravity AI');
      
      const group = document.createElement('div');
      group.className = 'msg-group ' + sender;
      group.innerHTML = \`<div class="device-badge">\${escapeHtml(devTag)}</div><div class="bubble">\${displayText}</div><div class="time">\${t}</div>\`;
      chatBox.appendChild(group);
      chatBox.scrollTop = chatBox.scrollHeight;
      const b = group.querySelector('.bubble');
      msgBubbles[id] = b;
      return b;
    }

    function escapeHtml(str) {
      return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    function clearTyping() {
      Object.keys(msgBubbles).forEach(key => {
        if (key.startsWith('typing_')) {
          msgBubbles[key].parentElement.remove();
          delete msgBubbles[key];
        }
      });
    }

    async function syncPolling() {
      try {
        const res = await fetch('/api/history');
        const list = await res.json();
        // Clear typing indicator if we received an AI message
        if (list.length > 0 && list[list.length - 1].sender === 'ai') {
          clearTyping();
        }
        list.slice(-20).forEach(m => renderBubble(m.id, m.sender, m.text, m.time, m.device));
      } catch(e){}
    }

    function connectSSE() {
      const evtSource = new EventSource('/api/events');
      evtSource.onopen = () => {
        statusDot.classList.remove('connecting');
      };
      evtSource.onerror = () => {
        statusDot.classList.add('connecting');
      };
      evtSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'history') {
            data.list.slice(-20).forEach(m => renderBubble(m.id, m.sender, m.text, m.time, m.device));
          } else if (data.type === 'user_msg') {
            renderBubble(data.id, 'user', data.text, data.time, data.device);
          } else if (data.type === 'ai_start') {
            renderBubble(data.id, 'ai', '💭 Antigravity 响应中...', data.time, 'Antigravity AI');
          } else if (data.type === 'ai_chunk' || data.type === 'ai_end') {
            clearTyping();
            renderBubble(data.id, 'ai', data.fullText, data.time, 'Antigravity AI');
          }
        } catch(err){}
      };
    }

    async function sendMsg() {
      const text = input.value.trim();
      if (!text) return false;
      input.value = '';

      const localId = 'u_' + Date.now();
      renderBubble(localId, 'user', text, null, deviceType);

      // Show typing indicator
      const typingId = 'typing_' + Date.now();
      renderBubble(typingId, 'ai', 'TYPING_INDICATOR', null, 'Antigravity AI');

      try {
        await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: text, device: deviceType, id: localId, typingId: typingId })
        });
        syncPolling();
      } catch (err) {
        renderBubble('err_' + Date.now(), 'ai', '❌ 发送失败：' + err.message);
      }
      return false;
    }

    function sendQuick(text) {
      input.value = text;
      sendMsg();
    }

    // Connect SSE + Dual Fallback Polling (1s) for 100% guarantee on iOS Safari
    connectSSE();
    syncPolling();
    setInterval(syncPolling, 1000);
  </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/api/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    sseClients.push(res);
    res.write(`data: ${JSON.stringify({ type: 'history', list: chatHistory })}\n\n`);

    req.on('close', () => {
      sseClients = sseClients.filter(c => c !== res);
    });
    return;
  }

  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    res.writeHead(200, { 
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(HTML_CONTENT);
    return;
  }

  if (req.method === 'GET' && req.url === '/api/history') {
    res.writeHead(200, { 
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(JSON.stringify(chatHistory));
    return;
  }

  if (req.method === 'POST' && req.url === '/api/chat') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { prompt, device, id } = JSON.parse(body);
        const devName = device || 'iPhone';
        const userMsgId = id || Date.now();
        const userTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        
        const userMsgObj = { id: userMsgId, sender: 'user', device: devName, text: prompt, time: userTime };
        chatHistory.push(userMsgObj);
        lastProcessedCount = chatHistory.length; // PREVENT fs.watchFile loop!
        saveHistory(chatHistory);

        broadcastSSE({ type: 'user_msg', ...userMsgObj });

        // Inject to Antigravity IDE queue
        injectMessageToAntigravityIDE(prompt, devName);

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: true }));
      } catch(e) {
        console.error('[Error processing chat]:', e);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/ai_reply') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { text } = JSON.parse(body);
        const aiMsgId = 'ai_' + Date.now();
        const aiTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        
        const aiMsgObj = { id: aiMsgId, sender: 'ai', device: 'Antigravity AI', text: text, time: aiTime };
        chatHistory.push(aiMsgObj);
        lastProcessedCount = chatHistory.length;
        saveHistory(chatHistory);

        broadcastSSE({ type: 'ai_end', fullText: text, id: aiMsgId, time: aiTime, sender: 'ai', device: 'Antigravity AI' });

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: true }));
      } catch(e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`💻 Antigravity IDE ↔ 📱 iPhone 双重零延迟同步服务已启动！`);
  console.log(`- 局域网访问地址: http://172.20.10.4:${PORT}`);
  console.log(`====================================================`);
});
