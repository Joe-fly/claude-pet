# Claude Pet v2.0

一个可爱的桌面宠物应用，集成了完整的 Claude Code CLI 能力，有Pet Mode（宠物模式）和Cli Mode（完整模式）
<img width="903" height="623" alt="cli-mode" src="https://github.com/user-attachments/assets/5931fe84-a1ff-4cae-b368-7a74fad51ed5" />
<img width="340" height="416" alt="pet-mode" src="https://github.com/user-attachments/assets/8b3675ef-2e84-4c19-b677-e4a94326d4ec" />

![Claude Pet](https://img.shields.io/badge/version-2.0.0-blue) ![Electron](https://img.shields.io/badge/Electron-28+-green) ![Platform-macOS](https://img.shields.io/badge/Platform-macOS-orange)

## 特性

### v2.0 新增功能

- **完整 CLI 集成** - 接入 Claude Code 完整命令行工具，支持对话上下文、工具调用、项目感知
- **双视图模式** - 保留可爱的 Pet 视图，同时支持展开完整的 CLI 终端视图
- **状态联动** - Pet 表情与 Claude 状态实时联动（思考、说话、开心、悲伤）
- **权限管理** - 自动拦截权限请求，在 Pet 区域显示授权气泡

### 原有功能

- 像素风格螃蟹宠物
- 聊天气泡交互
- 透明窗口效果
- 置顶显示
- 系统托盘支持

## 界面预览

```
┌─────────────────────────────────────────────────────────────┐
│                     Claude Pet v2.0                          │
│  ┌────────────────┐    ┌────────────────────────────────┐  │
│  │   🦀 Pet 视图   │    │     CLI 完整视图 (可弹出)       │  │
│  │                │    │                                │  │
│  │  [气泡区域]     │◄──►│  ┌────────────────────────┐   │  │
│  │                │    │  │ xterm.js 终端模拟器    │   │  │
│  │  [表情动画]     │    │  │ (完整 CLI 输出)        │   │  │
│  │                │    │  └────────────────────────┘   │  │
│  │  [输入框]       │    │  [输入框]                      │  │
│  │                │    │                                │  │
│  │ [⚡打开CLI按钮] │    │ [🐱收起按钮]                    │  │
│  └────────────────┘    └────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 技术架构

### 核心技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Electron | ^28.0.0 | 桌面应用框架 |
| Phaser 3 | ^3.60.0 | 2D 游戏引擎 (宠物动画) |
| node-pty | ^1.0.0 | 伪终端 (运行 Claude CLI) |
| xterm.js | ^5.3.0 | 终端模拟器 |
| Flask | - | 后端服务 (可选) |

### 项目结构

```
ClaudePet/
├── electron/
│   ├── main.js        # Electron 主进程
│   ├── preload.js     # 预加载脚本 (IPC 桥接)
│   └── pty.js         # PTY 管理模块
├── frontend/
│   ├── index.html     # 主页面
│   ├── styles.css     # 样式
│   └── game.js        # 游戏逻辑 & PTY 通信
├── backend/
│   ├── app.py         # Flask 后端 (可选)
│   └── requirements.txt
├── package.json
└── README.md
```

## 安装

### 前置要求

- Node.js 18+
- Python 3.8+ (可选，用于 Flask 后端)
- macOS (当前仅支持 macOS)

### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/Joe-fly/claude-pet.git
cd claude-pet

# 2. 安装依赖
npm install

# 3. 运行应用
npm start
```

## 使用说明

### 启动应用

```bash
npm start
```

应用启动后，会在桌面显示一个透明的宠物窗口。

### 基本交互

1. **聊天模式** - 在输入框中输入文字，与宠物对话
2. **打开 CLI** - 点击 ⚡ 按钮，展开完整的 Claude CLI 终端
3. **收起 CLI** - 点击 🐱 按钮，收起终端回到 Pet 视图
4. **输入同步** - Pet 输入框和 CLI 输入框内容实时同步

### 快捷键

- `Enter` - 发送消息
- `Ctrl+Enter` / `Cmd+Enter` - 换行

## 权限管理

当 Claude 需要请求权限时（如允许工具调用），Pet 区域会弹出授权气泡：

- **允许** - 临时允许当前操作
- **永久允许** - 记住选择，后续不再询问
- **拒绝** - 拒绝当前操作

## 开发

### 构建发布

```bash
npm run build
```

构建完成后，在 `dist/` 目录生成 macOS 应用。

### 调试

```bash
npm run dev
```

## 常见问题

### PTY 启动失败

如果遇到 `posix_spawnp failed` 错误，尝试重新构建 native 模块：

```bash
npm rebuild
```

### 端口被占用

Flask 后端默认使用端口 5001。如被占用，可修改 `backend/app.py` 中的端口。

## 更新日志

### v2.0.0 (2024-03-16)

- 新增完整 Claude CLI 集成
- 新增 xterm.js 终端模拟器
- 新增双视图切换功能
- 新增状态联动动画
- 新增权限管理气泡

### v1.0.0 (初始版本)

- 像素风格螃蟹宠物
- 聊天气泡交互
- 基础窗口管理

## License

MIT License

## 作者

[Lary](https://github.com/Joe-fly)
