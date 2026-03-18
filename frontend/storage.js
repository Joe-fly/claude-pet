/**
 * 本地存储模块 - 用于保存对话历史和设置
 */

const Storage = {
  // 存储键名
  KEYS: {
    CHAT_HISTORY: 'claude_pet_history',
    SETTINGS: 'claude_pet_settings'
  },

  // 最大历史记录数
  MAX_HISTORY: 50,

  /**
   * 获取对话历史
   */
  getHistory() {
    try {
      const data = localStorage.getItem(this.KEYS.CHAT_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('[Storage] Failed to get history:', e);
      return [];
    }
  },

  /**
   * 保存对话到历史
   */
  addToHistory(message, response) {
    try {
      let history = this.getHistory();

      // 添加新对话
      history.push({
        id: Date.now(),
        message: message,
        response: response,
        timestamp: new Date().toISOString()
      });

      // 限制历史数量
      if (history.length > this.MAX_HISTORY) {
        history = history.slice(-this.MAX_HISTORY);
      }

      localStorage.setItem(this.KEYS.CHAT_HISTORY, JSON.stringify(history));
      return true;
    } catch (e) {
      console.error('[Storage] Failed to save history:', e);
      return false;
    }
  },

  /**
   * 清空历史记录
   */
  clearHistory() {
    try {
      localStorage.removeItem(this.KEYS.CHAT_HISTORY);
      return true;
    } catch (e) {
      console.error('[Storage] Failed to clear history:', e);
      return false;
    }
  },

  /**
   * 获取设置
   */
  getSettings() {
    try {
      const data = localStorage.getItem(this.KEYS.SETTINGS);
      return data ? JSON.parse(data) : this.getDefaultSettings();
    } catch (e) {
      console.error('[Storage] Failed to get settings:', e);
      return this.getDefaultSettings();
    }
  },

  /**
   * 保存设置
   */
  saveSettings(settings) {
    try {
      const current = this.getSettings();
      const merged = { ...current, ...settings };
      localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(merged));
      return true;
    } catch (e) {
      console.error('[Storage] Failed to save settings:', e);
      return false;
    }
  },

  /**
   * 获取默认设置
   */
  getDefaultSettings() {
    return {
      autoStart: false,
      opacity: 0.95,
      alwaysOnTop: true,
      showHistory: true
    };
  }
};

// 导出供全局使用
window.Storage = Storage;
