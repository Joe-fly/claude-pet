const { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage, screen } = require('electron');
const path = require('path');
const ptyManager = require('./pty');

// Disable sandbox for node-pty to work on macOS
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-setuid-sandbox');

// Global references
let mainWindow = null;
let tray = null;
let isQuitting = false;
let isCliView = false;

// PTY window dimensions
const PET_WIDTH = 340;
const PET_HEIGHT = 416;
const CLI_WIDTH = 1150;
const CLI_HEIGHT = 650;
const PET_MIN_WIDTH = 340;
const PET_MIN_HEIGHT = 416;
const CLI_MIN_WIDTH = 800;
const CLI_MIN_HEIGHT = 400;

// Get the correct path for resources
function getResourcePath(relativePath) {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, relativePath);
  }
  return path.join(__dirname, '..', relativePath);
}

// Create main window
function createWindow() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: PET_WIDTH,
    height: PET_HEIGHT,
    x: Math.round((screenWidth - PET_WIDTH) / 2),
    y: Math.round((screenHeight - PET_HEIGHT) / 2),
    frame: false,
    transparent: false,
    backgroundColor: '#0A0E1A',
    hasShadow: false,
    alwaysOnTop: true,
    resizable: true,
    minWidth: 340,
    minHeight: PET_MIN_HEIGHT,
    skipTaskbar: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Make mainWindow accessible globally for PTY
  global.mainWindow = mainWindow;

  mainWindow.loadFile(path.join(__dirname, '..', 'frontend', 'index.html'));

  // Handle close to tray
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    global.mainWindow = null;
  });

  // 通知前端窗口尺寸变化
  const sendResizeEvent = () => {
    if (mainWindow) {
      const [width, height] = mainWindow.getSize();
      mainWindow.webContents.send('window-resize', { width, height, isCliView });
    }
  };

  // 监听 resize（窗口大小改变结束）
  mainWindow.on('resize', sendResizeEvent);

  // 监听 move（窗口拖动过程中）
  mainWindow.on('move', sendResizeEvent);

  console.log('Main window created');
}

// Create system tray
function createTray() {
  // Create a more visible tray icon (orange crab 22x22 for menu bar)
  const trayIcon = nativeImage.createFromDataURL(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAA7AAAAOwBeShxvQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAGUSURBVFiF7ZY9TsNAEIW/DZFoKCgoKNEgHIEbcAFuwAG4BgfUHIEDUNJQUCRAokCK/DRxYCV2frez1k5I4UtjW/vOm5n5vLYNCoVCoVAYE2MMABhjRvsdx8kYk/h+34cQQuD7PgghIIQoXZdlWfHQ0E9IKQEAxphCCIHv+8jznMg0m2VZ0QIAy7JCCIHruri9vYUQovR3KaUKAMA0Tdy9uxdCYO/e3r5N0zS8vb0VQgjEGEOMsfD9fr/RaJQwxmCM2bdtu7Ft+8v7+3sihMBxHIZhYG1t7T9t29ZSSuI4ThzH+dZ1XTeO4wIAtm37o+u6R9vtdqfZbB4C8FhrLbTWLs/zfYxxG2Ps+L4fxHF8b9t2o9FofAOASimJ4zhhhKHWWltjDMZYA8BqrY1t266UMtZaZ1mWJ0mS+L5fG+Oc53leCCGYn59vLCwsrAH4BEBKaZMkyZumaRzHcd8YY/7S/4a5ublGo9FYAvAGgJRS27Z9y7KsG8dxgtnZ2YVery8AuAPwJYRQSimdMcaGYRifnp7eXVpa+gwgV0qZJEkyPM9ba631xYsX8/P7+6cA3gDI8zw/OTm5e/Xq1cM8zzMArLW+urry/ejo6EuapnkIIY9hGDMzM7sTExOrAPYCuFZK6TiO84NhmM+yrODy5cuZqampZQDvAQzDMM7Ozk4DeAVgEMD4+Pj44uLiEoAPAEYAzM7OzgN4A2AQwMTExOTi4uISgM8A/h98PfwKrQKz7AAAAABJRU5ErkJggg=='
  );

  // Resize for macOS menu bar
  const resized = trayIcon.resize({ width: 22, height: 22 });

  tray = new Tray(resized);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示窗口',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    {
      label: '隐藏窗口',
      click: () => {
        if (mainWindow) {
          mainWindow.hide();
        }
      }
    },
    { type: 'separator' },
    {
      label: '透明度',
      submenu: [
        { label: '100%', click: () => mainWindow && mainWindow.setOpacity(1) },
        { label: '80%', click: () => mainWindow && mainWindow.setOpacity(0.8) },
        { label: '60%', click: () => mainWindow && mainWindow.setOpacity(0.6) },
        { label: '40%', click: () => mainWindow && mainWindow.setOpacity(0.4) }
      ]
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Claude Pet - 点击显示窗口');
  tray.setContextMenu(contextMenu);

  // 单击显示窗口
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.focus();
      } else {
        mainWindow.show();
      }
    }
  });
}

// IPC handlers
ipcMain.handle('get-opacity', () => {
  return mainWindow ? mainWindow.getOpacity() : 1;
});

ipcMain.handle('set-opacity', (event, opacity) => {
  if (mainWindow) {
    mainWindow.setOpacity(opacity);
  }
});

ipcMain.handle('set-always-on-top', (event, flag) => {
  if (mainWindow) {
    mainWindow.setAlwaysOnTop(flag);
  }
});

ipcMain.handle('hide-window', () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});

ipcMain.handle('show-window', () => {
  if (mainWindow) {
    mainWindow.show();
  }
});

// PTY handlers
ipcMain.handle('pty-start', () => {
  try {
    ptyManager.start();
    return { success: true };
  } catch (error) {
    console.error('[PTY] Failed to start:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('pty-input', (event, input) => {
  ptyManager.write(input);
});

// Chat handler - sends message to PTY and gets response
ipcMain.handle('pty-chat', async (event, message) => {
  if (!ptyManager.shell || !ptyManager.isReady) {
    return '[Claude 未启动，请先点击 ⚡ 打开 CLI 面板]';
  }

  return await ptyManager.chat(message);
});

ipcMain.handle('pty-permit', () => {
  ptyManager.permit();
});

ipcMain.handle('pty-deny', () => {
  ptyManager.deny();
});

ipcMain.handle('pty-permit-permanently', () => {
  ptyManager.permitPermanently();
});

ipcMain.handle('pty-resize', (event, { cols, rows }) => {
  ptyManager.resize(cols, rows);
});

ipcMain.handle('pty-stop', () => {
  ptyManager.stop();
});

// View toggle handler
ipcMain.handle('toggle-cli-view', () => {
  if (!mainWindow) return;

  // 获取当前窗口位置
  const [currentX, currentY] = mainWindow.getPosition();
  const [currentWidth, currentHeight] = mainWindow.getSize();

  if (isCliView) {
    // Switch to Pet view
    // 先设置最小尺寸，允许窗口缩小
    mainWindow.setMinimumSize(1, 1);
    // 计算新位置，保持窗口居中或保持在原来位置
    const newX = currentX + (currentWidth - PET_WIDTH) / 2;
    mainWindow.setBounds({
      x: Math.round(newX),
      y: currentY,
      width: PET_WIDTH,
      height: PET_HEIGHT
    }, true);  // true = animate
    mainWindow.setMinimumSize(PET_MIN_WIDTH, PET_MIN_HEIGHT);
    isCliView = false;
  } else {
    // Switch to CLI view
    // 计算新位置，保持窗口左边缘对齐
    mainWindow.setMinimumSize(CLI_MIN_WIDTH, CLI_MIN_HEIGHT);
    mainWindow.setBounds({
      x: currentX,
      y: currentY,
      width: CLI_WIDTH,
      height: CLI_HEIGHT
    }, true);  // true = animate
    isCliView = true;
  }

  return isCliView;
});

ipcMain.handle('get-cli-view-state', () => {
  return isCliView;
});

// App lifecycle
app.whenReady().then(() => {
  console.log('App starting...');
  createTray();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else if (mainWindow) {
    mainWindow.show();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
  if (ptyManager) {
    ptyManager.stop();
  }
});
