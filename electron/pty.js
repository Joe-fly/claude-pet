const pty = require('node-pty');
const { ipcMain } = require('electron');
const os = require('os');
const path = require('path');

class ClaudePTY {
  constructor() {
    this.shell = null;
    this.isReady = false;
    this.isThinking = false;
    this.currentStatus = 'ready'; // ready, thinking, coding, permission, done, error
    this.pendingPermission = null;
    this.outputBuffer = '';
    this.chatCallback = null;
    this.chatBuffer = '';
    this.waitingForResponse = false;
  }

  start() {
    // Use zsh on macOS (default shell)
    const shellPath = '/bin/zsh';

    console.log('[PTY] Starting with shell:', shellPath);

    try {
      // Create clean env without CLAUDECODE to avoid nested session error
      const cleanEnv = { ...process.env };
      delete cleanEnv.CLAUDECODE;

      // Get workspace path
      const workspacePath = path.join(__dirname, '..', 'workspace');

      this.shell = pty.spawn(shellPath, [], {
        name: 'xterm-256color',
        cols: 80,
        rows: 24,
        cwd: workspacePath,
        env: {
          ...cleanEnv,
          TERM: 'xterm-256color',
          COLORTERM: 'truecolor',
          CLAUDE_TRUST_WORKSPACE: 'true',
          CLAUDE_API_KEY: cleanEnv.ANTHROPIC_API_KEY || ''
        }
      });

      console.log('[PTY] Working directory:', workspacePath);

      console.log('[PTY] PTY shell started with PID:', this.shell.pid);
      console.log('[PTY] PTY dimensions:', this.shell._cols, 'x', this.shell._rows);

      // Auto-start Claude after shell initializes (wait longer for terminal to be ready)
      setTimeout(() => {
        if (this.shell) {
          // Send enter to get a clean prompt first
          this.shell.write('\r');
        }
      }, 1000);

      // Then start Claude after another delay
      setTimeout(() => {
        if (this.shell) {
          this.shell.write('claude\r');
        }
      }, 2500);

      this.shell.onData((data) => {
        this.handleOutput(data);
      });

      this.shell.onExit(({ exitCode, signal }) => {
        console.log('[PTY] Shell exited with code:', exitCode, 'signal:', signal);
        this.isReady = false;
        // 如果是非正常退出，通知错误状态
        if (exitCode !== 0 && exitCode !== null) {
          this.notifyStatus('error');
          // 5秒后尝试重启
          setTimeout(() => {
            console.log('[PTY] Attempting to restart...');
            this.start().catch(err => {
              console.error('[PTY] Restart failed:', err);
            });
          }, 5000);
        } else {
          this.notifyStatus('stopped');
        }
      });

      this.isReady = true;
      this.notifyStatus('ready');
    } catch (error) {
      console.error('[PTY] Failed to start PTY:', error);
      // 发送错误通知到前端
      this.notifyStatus('error');
      throw error;
    }
  }

  handleOutput(data) {
    this.outputBuffer += data;

    // If waiting for chat response, collect it
    if (this.waitingForResponse) {
      this.chatBuffer += data;

      // Check if Claude is done (waiting for next input - shows prompt)
      // Use multiple detection strategies for reliability
      if (this.isResponseComplete(data)) {
        this.waitingForResponse = false;

        // Debug: log the raw response length
        console.log('[PTY] Response complete, buffer length:', this.chatBuffer.length);

        // Clean up the response using improved cleaning
        let response = this.cleanPrintResponse(this.chatBuffer);

        console.log('[PTY] Cleaned response length:', response.length);

        // Send to callback if exists
        if (this.chatCallback) {
          this.chatCallback(response);
          this.chatCallback = null;
        }

        this.chatBuffer = '';
        // Don't return - continue to process status changes
      }
    }

    // Check for permission requests (highest priority)
    if (this.checkPermissionRequest(data)) {
      this.pendingPermission = data;
      this.notifyPermission(data);
      this.currentStatus = 'permission';
      this.notifyStatus('permission');
      return;
    }

    // Check for thinking state
    if (this.checkThinkingState(data)) {
      if (!this.isThinking && this.currentStatus !== 'thinking') {
        this.isThinking = true;
        this.currentStatus = 'thinking';
        this.notifyStatus('thinking');
      }
    }
    // Check for coding state
    else if (this.checkCodingState(data)) {
      if (this.currentStatus !== 'coding') {
        this.currentStatus = 'coding';
        this.notifyStatus('coding');
      }
    }
    // Check for done state
    else if (this.checkDoneState(data)) {
      if (this.currentStatus !== 'done') {
        this.currentStatus = 'done';
        this.notifyStatus('done');
      }
    }
    // Check for errors
    else if (this.checkError(data)) {
      this.currentStatus = 'error';
      this.notifyStatus('error');
    }
    // Check if back to ready/prompt
    else if (this.checkClaudePrompt(data) && this.currentStatus !== 'ready') {
      this.currentStatus = 'ready';
      this.notifyStatus('ready');
    }

    // Send output to renderer
    this.notifyOutput(data);
  }

  // Check if Claude response is complete
  isResponseComplete(data) {
    // Multiple detection strategies

    // Strategy 1: Check for prompt patterns in current data
    if (this.checkClaudePrompt(data)) {
      // Give a small buffer to collect any final output
      setTimeout(() => {
        if (this.waitingForResponse && this.chatBuffer.length > 50) {
          this.waitingForResponse = false;
          let response = this.cleanPrintResponse(this.chatBuffer);
          if (this.chatCallback) {
            this.chatCallback(response);
            this.chatCallback = null;
          }
          this.chatBuffer = '';
        }
      }, 300);
      return true;
    }

    // Strategy 2: Check buffer size and patterns - if we have substantial content
    // and see certain completion patterns
    if (this.chatBuffer.length > 100) {
      const completionPatterns = [
        /Anything else\?/i,
        /can I help with anything else/i,
        /Ready for next task/i,
        /Task completed/i,
        /All done/i,
        /is ready to help/i
      ];
      for (const pattern of completionPatterns) {
        if (pattern.test(this.chatBuffer)) {
          return true;
        }
      }
    }

    return false;
  }

  // Send a chat message and get response via IPC
  // Uses claude --print for non-interactive clean output
  chat(message) {
    return new Promise((resolve) => {
      if (!this.shell || !this.isReady) {
        // Fallback: try using claude --print
        this.runClaudePrint(message, resolve);
        return;
      }

      // Use existing handleOutput logic - just set callback
      this.chatBuffer = '';
      this.waitingForResponse = true;
      this.chatCallback = resolve;

      // Write message to PTY
      this.shell.write(message + '\r');

      // Timeout after 60 seconds - give more time for complex tasks
      setTimeout(() => {
        if (this.waitingForResponse) {
          this.waitingForResponse = false;
          const response = this.cleanPrintResponse(this.chatBuffer);
          this.chatCallback = null;
          if (response && response.length > 10) {
            resolve(response + '\n\n[⚠️ 响应超时，部分内容可能未显示]');
          } else {
            resolve('[⚠️ 请求超时，请重试或直接使用 CLI 面板]');
          }
        }
      }, 60000);
    });
  }

  // Run claude --print command directly
  runClaudePrint(message, callback) {
    const { spawn } = require('child_process');

    // Escape the message for shell
    const escapedMessage = message.replace(/"/g, '\\"');

    const child = spawn('claude', ['--print', '-p', message], {
      cwd: path.join(__dirname, '..', 'workspace'),
      env: {
        ...process.env,
        CLAUDE_TRUST_WORKSPACE: 'true'
      }
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (stdout) {
        callback(this.cleanPrintResponse(stdout));
      } else if (stderr) {
        // 更友好的错误消息
        let errorMsg = stderr.substring(0, 150);
        if (errorMsg.includes('API key')) {
          errorMsg = 'API Key 未设置或已过期，请检查环境变量 ANTHROPIC_API_KEY';
        } else if (errorMsg.includes('network') || errorMsg.includes('Connection')) {
          errorMsg = '网络连接失败，请检查网络后重试';
        } else if (errorMsg.includes('timeout')) {
          errorMsg = '请求超时，请稍后重试';
        }
        callback('[错误] ' + errorMsg);
      } else {
        callback('[无响应] 请确保 Claude CLI 已正确安装');
      }
    });

    child.on('error', (err) => {
      // 更友好的错误提示
      let errorMsg = err.message;
      if (errorMsg.includes('ENOENT') || errorMsg.includes('not found')) {
        errorMsg = 'Claude CLI 未找到，请确保已安装 Claude Code';
      } else if (errorMsg.includes('permission')) {
        errorMsg = '权限不足，请检查 Claude CLI 安装';
      }
      callback('[启动失败] ' + errorMsg);
    });
  }

  // Clean response from --print mode
  cleanPrintResponse(text) {
    if (!text) return '[无响应]';

    // Remove ANSI codes
    let clean = text.replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, '');

    // Also remove escape sequences that might be missed
    clean = clean.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');

    // Split into lines
    const lines = clean.split('\n');

    // Find where the actual Claude response starts
    // Look for the first substantial line after any prompts
    let responseStartIndex = 0;
    let foundPrompt = false;

    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();

      // Mark when we see a prompt
      if (/^(❯|➜|>|\||\$|claude:|you:|you@)/i.test(trimmed)) {
        foundPrompt = true;
        continue;
      }

      // After seeing a prompt, look for substantive content
      if (foundPrompt && trimmed.length > 0) {
        responseStartIndex = i;
        break;
      }
    }

    // Filter out unwanted lines
    const filtered = lines.slice(responseStartIndex).filter(line => {
      const trimmed = line.trim();

      // Skip empty lines
      if (!trimmed) return false;

      // Skip separator lines (---, ===, etc.)
      if (/^[-=]{3,}$/.test(trimmed)) return false;

      // Skip prompt-like lines
      if (/^(❯|➜|>|\||\$|claude:|you:|you@|zsh|bash)/i.test(trimmed)) return false;

      // Skip help/tip lines
      if (trimmed.startsWith('Tip:')) return false;
      if (trimmed.startsWith('ESC')) return false;
      if (trimmed.includes('interrupt')) return false;
      if (trimmed.includes('switched from')) return false;
      if (trimmed.includes('Press Enter')) return false;
      if (trimmed.includes('Press any key')) return false;
      if (trimmed.includes('clau.de/web')) return false;
      if (trimmed.includes('Run tasks in the cloud')) return false;
      if (trimmed.includes('Type "help"')) return false;
      if (trimmed.includes('For more options')) return false;

      // Skip lines that are just prompts or very short special chars
      if (/^[❯➜>\|$%]+$/.test(trimmed)) return false;

      return true;
    });

    // Join and clean up multiple empty lines
    let result = filtered.join('\n').replace(/\n{3,}/g, '\n\n').trim();

    // If result is empty, try a less aggressive approach - get everything after last prompt
    if (!result || result.length < 10) {
      // Find the last prompt and get content after it
      const lastPromptPatterns = ['❯', '>', '$', '➜'];
      let lastPromptIndex = -1;

      for (const pattern of lastPromptPatterns) {
        const idx = clean.lastIndexOf(pattern);
        if (idx > lastPromptIndex) {
          lastPromptIndex = idx;
        }
      }

      if (lastPromptIndex >= 0) {
        result = clean.substring(lastPromptIndex + 1).trim();
      } else {
        // No prompt found, use the whole cleaned text
        result = clean.trim();
      }

      // Remove separators from result
      result = result.replace(/^[-=]{3,}.*/gm, '').replace(/\n{3,}/g, '\n\n').trim();
    }

    // Final cleanup - remove any remaining prompt characters at the start
    result = result.replace(/^[❯➜>\|$%\s]+/, '');

    return result || clean.trim() || '[响应内容为空]';
  }

  // Clean response for chat mode
  cleanChatResponse(text) {
    // Remove ANSI codes
    let clean = text.replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, '');

    // Split into lines
    const lines = clean.split('\n');

    // Find where the user message was sent (look for '>' or 'you:')
    let messageStartIdx = -1;
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].includes('you:') || lines[i].trim() === '>') {
        messageStartIdx = i;
        break;
      }
    }

    // Get lines after the message
    let response = lines.slice(messageStartIdx + 1).join('\n');

    // Remove prompts and trailing content
    response = response.replace(/claude:/gi, '');
    response = response.replace(/you:/gi, '');
    response = response.replace(/^>.*$/gm, '');
    response = response.replace(/❯.*$/g, '');
    response = response.replace(/➜.*$/g, '');
    response = response.replace(/z.*$/gm, '');

    // Remove tips and help messages
    const linesToRemove = [
      'Tip:',
      'Run tasks in the cloud',
      'clau.de/web',
      'esctointerrupt',
      'ESC',
      'interrupt',
      'ClaudeCode has switched',
      'switched from',
      'to continue in',
      'current conversation'
    ];

    for (const line of linesToRemove) {
      response = response.replace(new RegExp(line, 'gi'), '');
    }

    // Remove lines that are mostly symbols or short prompts
    const responseLines = response.split('\n');
    const filteredLines = responseLines.filter(line => {
      // Skip empty lines
      if (!line.trim()) return false;
      // Skip lines that are just prompts
      if (/^[❯➜>\|]+$/.test(line.trim())) return false;
      // Skip very short lines that are likely prompts
      if (line.trim().length < 3) return false;
      // Skip lines with mostly special characters
      const chars = line.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '').length;
      return chars > 0;
    });

    response = filteredLines.join('\n');

    // Remove empty lines at start/end
    response = response.trim();

    return response;
  }


  // Check if we're at Claude prompt
  checkClaudePrompt(data) {
    // Check for various Claude prompt patterns - more flexible matching
    const patterns = [
      /claude\s*>\s*$/m,              // claude >
      /claude:\s*$/m,                  // claude:
      /you:\s*$/m,                     // you:
      />\s*$/m,                       // >
      /Type.*for more options\?$/m,   // Waiting for choice
      /\[y\/n\]\s*$/m,                 // [y/n]
      /\[a\/y\/n\/d\]\s*$/m,           // [a/y/n/d]
      /\[a\/y\/n\/d\/e\]\s*$/m,        // [a/y/n/d/e]
      /❯\s*$/m,                       // ❯ prompt
      /➜\s+\~\s*$/m,                  // ➜ ~ prompt
      /➜\s+\w+\s*$/m,                 // ➜ directory prompt
      /\$\s*$/m,                      // $ prompt
      /%s*$/m,                        // % prompt (zsh)
      /^\s*$/m,                       // empty line (potential prompt)
      /Enter.*to continue/m,          // Press Enter to continue
      /Press.*to/m,                    // Press key to
    ];

    return patterns.some(pattern => pattern.test(data));
  }

  // Clean response text
  cleanResponse(text) {
    // Remove ANSI codes
    let clean = text.replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, '');

    // Remove the command user typed (first line)
    const lines = clean.split('\n');
    if (lines.length > 0) {
      // Remove first line (the command echo)
      lines.shift();
    }

    // Rejoin and remove prompts
    clean = lines.join('\n');

    // Remove prompts
    clean = clean.replace(/claude:\s*$/gim, '');
    clean = clean.replace(/you:\s*$/gim, '');
    clean = clean.replace(/^>\s*/gm, '');

    // Trim
    clean = clean.trim();

    return clean;
  }

  checkPermissionRequest(data) {
    const patterns = [
      /Allow.*\?.*\[a\/y\/n\/d\]/,
      /allow.*\?.*\(yes\/no\)/i,
      /Permanently allow/i,
      /Allow this terminal\?/i,
      /\[a\/y\/n\/d\/e\]/,
      /\[y\/n\]\s*$/m,
      /Type.*for more options\?/i
    ];

    return patterns.some(pattern => pattern.test(data));
  }

  checkThinkingState(data) {
    const patterns = [
      /Thinking/i,
      /Analyzing/i,
      /Searching/i,
      /Reading files/i,
      /Working on/i,
      /Reading.*\.\.\./i,
      /Processing/i,
      /Investigating/i
    ];

    return patterns.some(pattern => pattern.test(data));
  }

  // Check if Claude is coding/executing
  checkCodingState(data) {
    const patterns = [
      /Writing|Creating|Modifying/i,
      /Running.*command/i,
      /Executing/i,
      /Building/i,
      /Installing/i,
      /Applying.*changes/i,
      /Making.*edits/i,
      /Generating.*code/i,
      /Running.*tests/i,
      /Creating.*file/i,
      /Edit.*file/i,
      /Terminal command/i,
      /Bash command/i
    ];

    return patterns.some(pattern => pattern.test(data));
  }

  // Check if task is done
  checkDoneState(data) {
    const patterns = [
      /All done/i,
      /completed/i,
      /finished/i,
      /Task.*complete/i,
      /Done!/i,
      /Ready for next task/i,
      /can I help with anything else/i,
      /Anything else/i
    ];

    return patterns.some(pattern => pattern.test(data));
  }

  checkThinkingEnd(data) {
    return data.length > 100 && !this.checkThinkingState(data);
  }

  checkError(data) {
    return /error|Error|failed|Failed|exception/gi.test(data);
  }

  write(input) {
    if (this.shell) {
      this.shell.write(input);
    }
  }

  permit() {
    if (this.pendingPermission) {
      this.shell.write('a\r');
      this.pendingPermission = null;
      this.notifyStatus('ready');
    }
  }

  deny() {
    if (this.pendingPermission) {
      this.shell.write('\r');
      this.pendingPermission = null;
      this.notifyStatus('ready');
    }
  }

  permitPermanently() {
    if (this.pendingPermission) {
      this.shell.write('e\r');
      this.pendingPermission = null;
      this.notifyStatus('ready');
    }
  }

  resize(cols, rows) {
    if (this.shell) {
      this.shell.resize(cols, rows);
    }
  }

  notifyOutput(data) {
    if (global.mainWindow && !global.mainWindow.isDestroyed()) {
      global.mainWindow.webContents.send('pty-output', data);
    }
  }

  notifyStatus(status) {
    if (global.mainWindow && !global.mainWindow.isDestroyed()) {
      global.mainWindow.webContents.send('pty-status', status);
    }
  }

  notifyPermission(data) {
    if (global.mainWindow && !global.mainWindow.isDestroyed()) {
      global.mainWindow.webContents.send('pty-permission', data);
    }
  }

  // New method: chat with callback
  notifyChatResponse(response) {
    if (global.mainWindow && !global.mainWindow.isDestroyed()) {
      global.mainWindow.webContents.send('pty-chat-response', response);
    }
  }

  stop() {
    if (this.shell) {
      this.shell.kill();
      this.shell = null;
      this.isReady = false;
    }
  }
}

// Export singleton instance
module.exports = new ClaudePTY();
