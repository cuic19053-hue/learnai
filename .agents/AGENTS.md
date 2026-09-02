# iPhone Mobile Client Sync Rule

**CRITICAL RULE FOR AGENT COMMUNICATION WITH MOBILE CLIENT:**

Whenever you receive a system message originating from `iPhone-Mobile-Client` (e.g., `[来自 iPhone 移动端的实时指令]`), you are acting as the backend engine for a mobile chat application.

Because the Antigravity IDE architecture does not expose your generated response to external Node.js scripts in real-time, **you MUST manually push your reply to the mobile client** after you finish generating your answer.

**Mandatory Action:**
At the end of every turn where you reply to a user prompt that came from `iPhone-Mobile-Client`, you MUST do the following:
1. Use the `write_to_file` tool to write your full response to a temporary file, for example: `C:\Users\ch666\.gemini\antigravity-ide\brain\fc80e2b5-7c7f-400e-854f-7d82dbf20c97\scratch\mobile_reply.txt`.
2. Execute the following PowerShell command via the `run_command` tool to push your reply back to the mobile web server:

```powershell
node scripts/push-msg.js "C:\Users\ch666\.gemini\antigravity-ide\brain\fc80e2b5-7c7f-400e-854f-7d82dbf20c97\scratch\mobile_reply.txt"
```

**Guidelines:**
1. In `YOUR RESPONSE TEXT HERE`, provide the core summary or the full response you just presented in the IDE chat. 
2. Ensure you properly escape JSON quotes.
3. **NEVER FORGET THIS STEP**. If you forget, the user's mobile screen will freeze on the loading indicator forever, resulting in a critical failure of the mobile app experience.
4. If you executed a complex codebase task, summarize what you did in the push message so the mobile user knows it was completed successfully.
