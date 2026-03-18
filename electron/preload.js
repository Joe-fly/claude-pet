const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  hideWindow: () => ipcRenderer.invoke('hide-window'),
  showWindow: () => ipcRenderer.invoke('show-window'),

  // Opacity
  getOpacity: () => ipcRenderer.invoke('get-opacity'),
  setOpacity: (opacity) => ipcRenderer.invoke('set-opacity', opacity),

  // Always on top
  setAlwaysOnTop: (flag) => ipcRenderer.invoke('set-always-on-top', flag),

  // Drag window (will be handled in renderer)
  startDrag: () => {
    ipcRenderer.invoke('start-drag');
  },

  // PTY methods
  pty: {
    start: () => ipcRenderer.invoke('pty-start'),
    input: (input) => ipcRenderer.invoke('pty-input', input),
    chat: (message) => ipcRenderer.invoke('pty-chat', message),
    permit: () => ipcRenderer.invoke('pty-permit'),
    deny: () => ipcRenderer.invoke('pty-deny'),
    permitPermanently: () => ipcRenderer.invoke('pty-permit-permanently'),
    resize: (cols, rows) => ipcRenderer.invoke('pty-resize', { cols, rows }),
    stop: () => ipcRenderer.invoke('pty-stop'),

    // Event listeners
    onOutput: (callback) => {
      ipcRenderer.on('pty-output', (event, data) => callback(data));
    },
    onStatus: (callback) => {
      ipcRenderer.on('pty-status', (event, status) => callback(status));
    },
    onPermission: (callback) => {
      ipcRenderer.on('pty-permission', (event, data) => callback(data));
    },

    // Remove listeners
    removeOutputListener: () => {
      ipcRenderer.removeAllListeners('pty-output');
    },
    removeStatusListener: () => {
      ipcRenderer.removeAllListeners('pty-status');
    },
    removePermissionListener: () => {
      ipcRenderer.removeAllListeners('pty-permission');
    }
  },

  // CLI View toggle
  toggleCliView: () => ipcRenderer.invoke('toggle-cli-view'),
  getCliViewState: () => ipcRenderer.invoke('get-cli-view-state'),

  // Window resize event
  onResize: (callback) => {
    ipcRenderer.on('window-resize', (event, data) => callback(data));
  },
  removeResizeListener: () => {
    ipcRenderer.removeAllListeners('window-resize');
  }
});
