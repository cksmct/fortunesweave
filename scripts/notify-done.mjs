#!/usr/bin/env node
/**
 * notify-done.mjs - 任务完成提示（本机 Windows 气泡通知 + 响铃）
 *
 * 为什么需要它：使用者听不到沙箱内的语音提示，需要一个「跑完了」的信号。
 * 实现为 detached 子进程，主流程立刻返回，不会拖慢构建；
 * PowerShell 若被环境禁止（无桌面会话/组策略），脚本会如实打印 warning，不假装成功。
 */
import { spawn } from "node:child_process";

const title = process.argv[2] || "FortunesWeave.online";
const message = process.argv[3] || "Task finished";
const safe = (value) => String(value).replace(/[^A-Za-z0-9 .,:_\\/()\\[\\]-]/g, " ");

const script = [
  "Add-Type -AssemblyName System.Windows.Forms",
  "Add-Type -AssemblyName System.Drawing",
  "try { [console]::beep(880, 180) } catch { }",
  "$n = New-Object System.Windows.Forms.NotifyIcon",
  "$n.Icon = [System.Drawing.SystemIcons]::Information",
  "$n.Visible = $true",
  "$n.ShowBalloonTip(15000, " + JSON.stringify(safe(title)) + ", " + JSON.stringify(safe(message)) + ", [System.Windows.Forms.ToolTipIcon]::Info)",
  "Start-Sleep -Seconds 9",
  "$n.Dispose()",
].join("; ");

const child = spawn("powershell", ["-NoProfile", "-WindowStyle", "Hidden", "-Command", script], {
  detached: true,
  stdio: "ignore",
});
child.on("error", (error) => {
  console.log("warning: could not start the notification helper - " + error.message);
});
child.unref();
console.log("[notify] queued balloon + beep: " + safe(title) + " / " + safe(message));
