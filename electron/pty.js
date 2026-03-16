const pty = require('node-pty');
const { ipcMain } = require('electron');
const os = require('os');

class ClaudePTY {
  constructor() {
    this.shell = null;
    this.isReady = false;
    this.isThinking = false;
    this.pendingPermission = null;
    this.outputBuffer = '';
  }

  start() {
    // Use zsh on macOS (default shell)
    const shellPath = '/bin/zsh';

    console.log('[PTY] Starting with shell:', shellPath);

    try {
      this.shell = pty.spawn(shellPath, [], {
        name: 'xterm-256color',
        cols: 80,
        rows: 24,
        cwd: os.homedir(),
        env: {
          ...process.env,
          TERM: 'xterm-256color',
          COLORTERM: 'truecolor'
        }
      });

      console.log('[PTY] PTY shell started with PID:', this.shell.pid);

      // Wait a moment for shell to initialize, then start Claude
      setTimeout(() => {
        if (this.shell) {
          this.shell.write('claude\r');
        }
      }, 500);

      this.shell.onData((data) => {
        this.handleOutput(data);
      });

      this.shell.onExit(({ exitCode }) => {
        console.log('[PTY] Shell exited with code:', exitCode);
        this.isReady = false;
        this.notifyStatus('stopped');
      });

      this.isReady = true;
      this.notifyStatus('ready');
    } catch (error) {
      console.error('[PTY] Failed to start PTY:', error);
      throw error;
    }
  }

  handleOutput(data) {
    this.outputBuffer += data;

    // Check for permission requests
    if (this.checkPermissionRequest(data)) {
      this.pendingPermission = data;
      this.notifyPermission(data);
      return;
    }

    // Check for thinking state
    if (this.checkThinkingState(data)) {
      if (!this.isThinking) {
        this.isThinking = true;
        this.notifyStatus('thinking');
      }
    } else if (this.isThinking && this.checkThinkingEnd(data)) {
      this.isThinking = false;
      this.notifyStatus('ready');
    }

    // Check for errors
    if (this.checkError(data)) {
      this.notifyStatus('error');
    }

    // Send output to renderer
    this.notifyOutput(data);
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
      /Reading.*\.\.\./i
    ];

    return patterns.some(pattern => pattern.test(data));
  }

  checkThinkingEnd(data) {
    // If we have a significant amount of output, thinking probably ended
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
