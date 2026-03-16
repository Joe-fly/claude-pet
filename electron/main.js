const { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage, screen } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const ptyManager = require('./pty');

// Disable sandbox for node-pty to work on macOS
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-setuid-sandbox');

// Global references
let mainWindow = null;
let tray = null;
let isQuitting = false;
let isCliView = false;

// Flask backend process
let flaskProcess = null;

// PTY window dimensions
const PET_WIDTH = 320;
const PET_HEIGHT = 480;
const CLI_WIDTH = 800;

// Get the correct path for resources
function getResourcePath(relativePath) {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, relativePath);
  }
  return path.join(__dirname, '..', relativePath);
}

// Start Flask backend
function startFlaskBackend() {
  const backendPath = path.join(__dirname, '..', 'backend', 'app.py');

  flaskProcess = spawn('python3', [backendPath], {
    cwd: path.join(__dirname, '..', 'backend'),
    stdio: 'pipe'
  });

  flaskProcess.stdout.on('data', (data) => {
    console.log('[Flask]', data.toString());
  });

  flaskProcess.stderr.on('data', (data) => {
    console.error('[Flask Error]', data.toString());
  });

  console.log('Flask backend started');
}

// Create main window
function createWindow() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: PET_WIDTH,
    height: PET_HEIGHT,
    x: screenWidth - 340,
    y: 40,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
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

  // Enable transparency effects
  mainWindow.setOpacity(0.95);

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

  const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize;

  if (isCliView) {
    // Switch to Pet view
    mainWindow.setSize(PET_WIDTH, PET_HEIGHT);
    mainWindow.setPosition(screenWidth - PET_WIDTH - 20, 40);
    isCliView = false;
  } else {
    // Switch to CLI view
    mainWindow.setSize(CLI_WIDTH, PET_HEIGHT);
    mainWindow.setPosition(screenWidth - CLI_WIDTH - 20, 40);
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
  startFlaskBackend();
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
  if (flaskProcess) {
    flaskProcess.kill();
  }
  if (ptyManager) {
    ptyManager.stop();
  }
});
