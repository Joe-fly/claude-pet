// ============================================
// 统一状态管理模块
// ============================================

// 状态常量 - 与 pty.js 保持一致
const PetStatus = {
  IDLE: 'idle',
  THINKING: 'thinking',        // 思考中
  ANALYZING: 'analyzing',      // 分析中
  CODING: 'coding',            // 写代码中
  EXECUTING: 'executing',      // 执行命令中
  USING_TOOLS: 'using_tools',  // 使用工具中
  DOWNLOADING: 'downloading',  // 下载中
  PERMISSION: 'permission',    // 等待授权
  DONE: 'done',                // 完成
  ERROR: 'error',              // 错误
  SAD: 'sad',                  // 伤心
  HAPPY: 'happy',              // 开心
  ANGRY: 'angry',              // 生气
  EXCITED: 'excited',         // 兴奋
  BORED: 'bored',              // 无聊
  SURPRISED: 'surprised',     // 惊讶
  SPEAKING: 'speaking',        // 说话中
  CRYING: 'crying',           // 哭泣
  SLEEPING: 'sleeping',       // 睡觉
  CLICKED: 'clicked'          // 点击互动
};

// 纹理映射
const TextureMap = {
  [PetStatus.IDLE]: 'crab_idle',
  [PetStatus.THINKING]: 'crab_thinking',
  [PetStatus.ANALYZING]: 'crab_thinking',
  [PetStatus.SPEAKING]: 'crab_speaking',
  [PetStatus.HAPPY]: 'crab_happy',
  [PetStatus.SAD]: 'crab_sad',
  [PetStatus.CRYING]: 'crab_crying',
  [PetStatus.SLEEPING]: 'crab_sleeping',
  [PetStatus.CLICKED]: 'crab_happy',
  [PetStatus.CODING]: 'crab_speaking',
  [PetStatus.EXECUTING]: 'crab_speaking',
  [PetStatus.USING_TOOLS]: 'crab_thinking',
  [PetStatus.DOWNLOADING]: 'crab_thinking',
  [PetStatus.PERMISSION]: 'crab_thinking',
  [PetStatus.DONE]: 'crab_happy',
  [PetStatus.ERROR]: 'crab_sad',
  [PetStatus.ANGRY]: 'crab_angry',
  [PetStatus.EXCITED]: 'crab_happy',
  [PetStatus.BORED]: 'crab_bored',
  [PetStatus.SURPRISED]: 'crab_surprised'
};

// 预设短语配置 - 扩展版本
const statusMessages = {
  // Claude 工作状态
  [PetStatus.THINKING]: [
    '让我想想...',
    '思考中...',
    '正在分析问题...',
    '嗯...让我理清思路',
    '这个问题有点意思...',
    '容我想一想~',
    '我正在思考呢',
    '大脑运转中...',
    '整理思路ing...'
  ],
  [PetStatus.ANALYZING]: [
    '深入分析中...',
    '正在仔细研究...',
    '分析问题ing...',
    '让我看看怎么回事...',
    '正在读取信息...',
    '解析中...',
    '研究中...'
  ],
  [PetStatus.CODING]: [
    '正在写代码...',
    'Coding中...',
    '正在修改文件...',
    '执行命令中...',
    '代码生成中...',
    '修改ing...',
    '正在干活~',
    '敲代码中...',
    '编写中...'
  ],
  [PetStatus.EXECUTING]: [
    '执行命令中...',
    '运行ing...',
    '正在执行...',
    '处理中...',
    '操作中...',
    '命令执行ing...'
  ],
  [PetStatus.USING_TOOLS]: [
    '使用工具中...',
    '调用工具ing...',
    '正在操作...',
    '处理中...',
    '工具使用中...'
  ],
  [PetStatus.DOWNLOADING]: [
    '下载中...',
    '获取数据ing...',
    '抓取信息...',
    '加载中...',
    '下载资源...',
    '获取中...'
  ],
  [PetStatus.PERMISSION]: [
    '需要确认一下...',
    '等待授权...',
    '请确认操作权限',
    '老大，请授权一下哦',
    '这个需要你同意~',
    '需要你点个头~',
    '等你点头呢~',
    '需要你批准~'
  ],
  [PetStatus.DONE]: [
    '搞定！',
    '完成啦！',
    '已经好啦~',
    '指令执行完毕！',
    '完美解决！',
    '又完成了一件事~',
    '没问题搞定！',
    '大功告成！',
    '完成！'
  ],
  [PetStatus.ERROR]: [
    '哎呀，出错了...',
    '呜呜，出问题了...',
    '抱歉 出错了...',
    '好像哪里不对...',
    '让我再试试...',
    '这次没成功...',
    '出错啦...',
    '遇到问题了...'
  ],

  // 空闲状态
  [PetStatus.IDLE]: [
    '有什么可以帮你的吗？',
    '我在等你的消息~',
    '戳戳你~',
    '来聊天吧~',
    '今天怎么样？',
    '无聊中...',
    '随时待命！',
    '找我什么事呀~',
    '在的呢~'
  ],

  // 情感状态 - 开心 (5个)
  [PetStatus.HAPPY]: [
    '太棒了！',
    '嘿嘿~',
    '开心！',
    '完成任务！',
    '好耶！'
  ],

  // 情感状态 - 伤心 (5个)
  [PetStatus.SAD]: [
    '有点难过...',
    '呜呜...',
    '心情不好...',
    '不舒服...',
    '有点失落...'
  ],

  // 情感状态 - 生气 (5个)
  [PetStatus.ANGRY]: [
    '哼！不理你了！',
    '太过分了！',
    '气鼓鼓...',
    '哼！',
    '表示强烈谴责！'
  ],

  // 情感状态 - 兴奋 (5个)
  [PetStatus.EXCITED]: [
    '哇！好厉害！',
    '太酷了！',
    '哇塞！',
    '好棒啊！',
    '激动！'
  ],

  // 情感状态 - 无聊 (5个)
  [PetStatus.BORED]: [
    '好无聊啊...',
    '无所事事...',
    '发懒中...',
    '好闲哦...',
    '无聊ing...'
  ],

  // 情感状态 - 惊讶 (5个)
  [PetStatus.SURPRISED]: [
    '哇！真的假的？',
    '吓我一跳！',
    '竟然是这样！',
    '好意外！',
    '哇哦！'
  ],

  // 哭泣状态
  [PetStatus.CRYING]: [
    '呜呜呜...',
    '哭一会儿...',
    '太难了...',
    '眼泪止不住...'
  ],

  // 睡觉状态
  [PetStatus.SLEEPING]: [
    '呼噜呼噜...',
    'ZZZ...',
    '睡觉中...',
    '别吵我...',
    '打盹ing...'
  ],

  // 点击互动
  [PetStatus.CLICKED]: [
    '嘿嘿，痒~',
    '干嘛呀~',
    '好痒哦~',
    '戳我干嘛~',
    '嘿嘿~'
  ]
};

// 获取随机预设短语 - 改进版
function getStatusMessage(status) {
  const messages = statusMessages[status] || statusMessages[PetStatus.IDLE];
  // 使用时间戳增加随机性
  const index = Math.floor(Math.random() * messages.length);
  return messages[index];
}

// 简短问候语 - 根据时间变化
function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return '早上好！';
  } else if (hour >= 12 && hour < 14) {
    return '中午好！';
  } else if (hour >= 14 && hour < 18) {
    return '下午好！';
  } else if (hour >= 18 && hour < 22) {
    return '晚上好！';
  } else {
    return '夜深了，还不睡吗？';
  }
}

// ============================================
// Phaser 游戏配置
// ============================================

// 获取游戏容器的实际尺寸
function getGameContainerSize() {
  const container = document.getElementById('game-container');
  if (container) {
    return {
      width: container.clientWidth || 280,
      height: container.clientHeight || 200
    };
  }
  return { width: 280, height: 200 };
}

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  transparent: true,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: '100%',
    height: '100%'
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let game = new Phaser.Game(config);

// Game state - 统一管理
const GameState = {
  crab: null,
  currentAnimation: PetStatus.IDLE,
  isCliView: false,
  term: null,
  fitAddon: null,
  isThinking: false,
  typingTimeout: null,
  isTypewriterActive: false,  // 标记是否正在显示打字机效果
  isResponseDisplayed: false   // 标记是否已经显示了Claude响应
};

// Preload assets
function preload() {
  // Generate pixel crab texture programmatically
  generateCrabTextures(this);
}

// Generate crab textures
function generateCrabTextures(scene) {
  // Create graphics for crab body
  const graphics = scene.make.graphics({ x: 0, y: 0, add: false });

  // Idle state - simple crab
  graphics.clear();
  // Body (orange/red)
  graphics.fillStyle(0xff6b35, 1);
  graphics.fillRoundedRect(20, 40, 60, 40, 10);

  // Eyes
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(35, 35, 8);
  graphics.fillCircle(65, 35, 8);

  // Pupils
  graphics.fillStyle(0x000000, 1);
  graphics.fillCircle(35, 35, 4);
  graphics.fillCircle(65, 35, 4);

  // Claws
  graphics.fillStyle(0xff6b35, 1);
  graphics.fillCircle(15, 55, 12);
  graphics.fillCircle(85, 55, 12);

  // Small claws
  graphics.fillCircle(8, 45, 6);
  graphics.fillCircle(92, 45, 6);

  graphics.generateTexture('crab_idle', 100, 100);
  graphics.clear();

  // Thinking state - with bubbles
  graphics.fillStyle(0xff6b35, 1);
  graphics.fillRoundedRect(20, 40, 60, 40, 10);
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(35, 35, 8);
  graphics.fillCircle(65, 35, 8);
  graphics.fillStyle(0x000000, 1);
  graphics.fillCircle(35, 35, 4);
  graphics.fillCircle(65, 35, 4);
  graphics.fillStyle(0xff6b35, 1);
  graphics.fillCircle(15, 55, 12);
  graphics.fillCircle(85, 55, 12);
  graphics.fillCircle(8, 45, 6);
  graphics.fillCircle(92, 45, 6);

  // Thought bubble
  graphics.fillStyle(0xffffff, 0.9);
  graphics.fillCircle(75, 20, 10);
  graphics.fillCircle(85, 10, 6);
  graphics.fillCircle(90, 5, 3);

  graphics.generateTexture('crab_thinking', 100, 100);
  graphics.clear();

  // Speaking state - mouth open
  graphics.fillStyle(0xff6b35, 1);
  graphics.fillRoundedRect(20, 40, 60, 40, 10);
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(35, 35, 8);
  graphics.fillCircle(65, 35, 8);
  graphics.fillStyle(0x000000, 1);
  graphics.fillCircle(35, 35, 4);
  graphics.fillCircle(65, 35, 4);

  // Open mouth
  graphics.fillStyle(0x8b0000, 1);
  graphics.fillEllipse(50, 65, 15, 10);

  graphics.fillStyle(0xff6b35, 1);
  graphics.fillCircle(15, 55, 12);
  graphics.fillCircle(85, 55, 12);
  graphics.fillCircle(8, 45, 6);
  graphics.fillCircle(92, 45, 6);

  graphics.generateTexture('crab_speaking', 100, 100);
  graphics.clear();

  // Happy state - jumping
  graphics.fillStyle(0xff6b35, 1);
  graphics.fillRoundedRect(20, 30, 60, 40, 10);
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(35, 25, 8);
  graphics.fillCircle(65, 25, 8);
  graphics.fillStyle(0x000000, 1);
  graphics.fillCircle(35, 25, 4);
  graphics.fillCircle(65, 25, 4);

  // Happy mouth (^)
  graphics.lineStyle(3, 0x8b0000, 1);
  graphics.beginPath();
  graphics.moveTo(42, 60);
  graphics.lineTo(50, 55);
  graphics.lineTo(58, 60);
  graphics.strokePath();

  graphics.fillStyle(0xff6b35, 1);
  graphics.fillCircle(15, 45, 12);
  graphics.fillCircle(85, 45, 12);
  graphics.fillCircle(8, 35, 6);
  graphics.fillCircle(92, 35, 6);

  graphics.generateTexture('crab_happy', 100, 100);
  graphics.clear();

  // Sad state -下垂的眼睛
  graphics.fillStyle(0xff6b35, 1);
  graphics.fillRoundedRect(20, 40, 60, 40, 10);
  // 下垂的眼睛（变成椭圆形）
  graphics.fillStyle(0xffffff, 1);
  graphics.fillEllipse(35, 38, 8, 6);
  graphics.fillEllipse(65, 38, 8, 6);
  // 下垂的瞳孔
  graphics.fillStyle(0x000000, 1);
  graphics.fillEllipse(35, 39, 3, 2);
  graphics.fillEllipse(65, 39, 3, 2);
  // 向下撇的嘴巴
  graphics.lineStyle(2, 0x8b0000, 1);
  graphics.beginPath();
  graphics.moveTo(42, 68);
  graphics.lineTo(50, 62);
  graphics.lineTo(58, 68);
  graphics.strokePath();
  // 钳子放下
  graphics.fillStyle(0xff6b35, 1);
  graphics.fillCircle(15, 60, 12);
  graphics.fillCircle(85, 60, 12);
  graphics.fillCircle(8, 50, 6);
  graphics.fillCircle(92, 50, 6);

  graphics.generateTexture('crab_sad', 100, 100);
  graphics.clear();

  // Crying state - 流泪
  graphics.fillStyle(0xff6b35, 1);
  graphics.fillRoundedRect(20, 40, 60, 40, 10);
  // 闭着的眼睛
  graphics.fillStyle(0x000000, 1);
  graphics.fillEllipse(35, 35, 8, 2);
  graphics.fillEllipse(65, 35, 8, 2);
  // 眼泪
  graphics.fillStyle(0x4fc3f7, 1);
  graphics.fillCircle(30, 42, 4);
  graphics.fillCircle(60, 42, 4);
  graphics.fillCircle(25, 48, 3);
  graphics.fillCircle(55, 48, 3);
  // 哭泣的嘴巴
  graphics.fillStyle(0x8b0000, 1);
  graphics.fillEllipse(50, 65, 8, 6);
  // 钳子举起
  graphics.fillStyle(0xff6b35, 1);
  graphics.fillCircle(15, 45, 12);
  graphics.fillCircle(85, 45, 12);
  graphics.fillCircle(8, 35, 6);
  graphics.fillCircle(92, 35, 6);

  graphics.generateTexture('crab_crying', 100, 100);
  graphics.clear();

  // Sleeping state - 睡觉（闭眼+z）
  graphics.fillStyle(0xff6b35, 1);
  graphics.fillRoundedRect(20, 40, 60, 40, 10);
  // 闭着的眼睛
  graphics.lineStyle(2, 0x000000, 1);
  graphics.beginPath();
  graphics.moveTo(28, 35);
  graphics.lineTo(42, 35);
  graphics.strokePath();
  graphics.beginPath();
  graphics.moveTo(58, 35);
  graphics.lineTo(72, 35);
  graphics.strokePath();
  // 嘴巴微笑
  graphics.lineStyle(2, 0x8b0000, 1);
  graphics.beginPath();
  graphics.moveTo(42, 62);
  graphics.lineTo(50, 58);
  graphics.lineTo(58, 62);
  graphics.strokePath();
  // 钳子放下
  graphics.fillStyle(0xff6b35, 1);
  graphics.fillCircle(15, 60, 12);
  graphics.fillCircle(85, 60, 12);
  graphics.fillCircle(8, 50, 6);
  graphics.fillCircle(92, 50, 6);
  // Zzz
  graphics.fillStyle(0xffffff, 0.8);
  graphics.fillCircle(80, 25, 5);
  graphics.fillCircle(88, 18, 4);
  graphics.fillCircle(93, 12, 3);

  graphics.generateTexture('crab_sleeping', 100, 100);
  graphics.clear();

  // Angry state - 生气的螃蟹（鼓眼睛+皱眉）
  graphics.fillStyle(0xff6b35, 1);
  graphics.fillRoundedRect(20, 40, 60, 40, 10);
  // 愤怒的眼睛（鼓起来）
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(35, 32, 10);
  graphics.fillCircle(65, 32, 10);
  graphics.fillStyle(0x000000, 1);
  graphics.fillCircle(35, 32, 5);
  graphics.fillCircle(65, 32, 5);
  // 愤怒的眉毛
  graphics.lineStyle(2, 0x000000, 1);
  graphics.beginPath();
  graphics.moveTo(25, 26);
  graphics.lineTo(40, 30);
  graphics.strokePath();
  graphics.beginPath();
  graphics.moveTo(75, 26);
  graphics.lineTo(60, 30);
  graphics.strokePath();
  // 鼓起的嘴巴
  graphics.fillStyle(0x8b0000, 1);
  graphics.fillEllipse(50, 65, 12, 8);
  // 钳子举起
  graphics.fillStyle(0xff6b35, 1);
  graphics.fillCircle(15, 45, 12);
  graphics.fillCircle(85, 45, 12);
  graphics.fillCircle(8, 35, 6);
  graphics.fillCircle(92, 35, 6);

  graphics.generateTexture('crab_angry', 100, 100);
  graphics.clear();

  // Bored state - 无聊的螃蟹（眼睛向下看+打哈欠）
  graphics.fillStyle(0xff6b35, 1);
  graphics.fillRoundedRect(20, 40, 60, 40, 10);
  // 无聊的眼睛（半闭）
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(35, 35, 8);
  graphics.fillCircle(65, 35, 8);
  graphics.fillStyle(0x000000, 1);
  graphics.fillCircle(35, 36, 3);
  graphics.fillCircle(65, 36, 3);
  // 上眼皮（向下耷拉）
  graphics.lineStyle(2, 0x000000, 1);
  graphics.beginPath();
  graphics.moveTo(27, 32);
  graphics.lineTo(43, 33);
  graphics.strokePath();
  graphics.beginPath();
  graphics.moveTo(57, 33);
  graphics.lineTo(73, 32);
  graphics.strokePath();
  // 嘴巴（打哈欠）
  graphics.fillStyle(0x8b0000, 1);
  graphics.fillEllipse(50, 62, 10, 6);
  // 钳子放下
  graphics.fillStyle(0xff6b35, 1);
  graphics.fillCircle(15, 60, 12);
  graphics.fillCircle(85, 60, 12);
  graphics.fillCircle(8, 50, 6);
  graphics.fillCircle(92, 50, 6);

  graphics.generateTexture('crab_bored', 100, 100);
  graphics.clear();

  // Surprised state - 惊讶的螃蟹（眼睛睁大+嘴巴张圆）
  graphics.fillStyle(0xff6b35, 1);
  graphics.fillRoundedRect(20, 40, 60, 40, 10);
  // 惊讶的眼睛（睁很大）
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(35, 30, 10);
  graphics.fillCircle(65, 30, 10);
  graphics.fillStyle(0x000000, 1);
  graphics.fillCircle(35, 30, 6);
  graphics.fillCircle(65, 30, 6);
  // 惊讶的嘴巴（张圆）
  graphics.fillStyle(0x8b0000, 1);
  graphics.fillCircle(50, 60, 10);
  // 钳子举起
  graphics.fillStyle(0xff6b35, 1);
  graphics.fillCircle(15, 45, 12);
  graphics.fillCircle(85, 45, 12);
  graphics.fillCircle(8, 35, 6);
  graphics.fillCircle(92, 35, 6);

  graphics.generateTexture('crab_surprised', 100, 100);
  graphics.clear();

  // Generate background gradient texture
  const bgGraphics = scene.make.graphics({ x: 0, y: 0, add: false });
  bgGraphics.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x0f3460, 1);
  bgGraphics.fillRect(0, 0, 300, 300);
  bgGraphics.generateTexture('bg', 300, 300);
}

// Create game objects
function create() {
  // 获取游戏实际尺寸
  const gameWidth = this.scale.width || 280;
  const gameHeight = this.scale.height || 200;

  // Add background - 填充整个游戏区域
  const bg = this.add.image(gameWidth / 2, gameHeight / 2, 'bg');
  bg.setDisplaySize(gameWidth, gameHeight);
  // 保存背景引用以便 resize 时更新
  this.bg = bg;

  // Add crab sprite - 根据游戏尺寸定位
  GameState.crab = this.add.sprite(gameWidth / 2, gameHeight * 0.65, 'crab_idle');
  // 缩放螃蟹以适应不同尺寸
  const scale = Math.min(gameWidth / 300, gameHeight / 300, 1.2);
  GameState.crab.setScale(scale * 0.8);

  // Enable interactive for click handling
  GameState.crab.setInteractive();

  // Click interaction
  GameState.crab.on('pointerdown', () => {
    // Only trigger if not already in clicked state
    if (GameState.currentAnimation !== PetStatus.CLICKED) {
      setAnimation(PetStatus.CLICKED);
      // Return to idle after animation
      setTimeout(() => {
        setAnimation(PetStatus.IDLE);
      }, 1500);
    }
  });

  // Create idle animation using tweens
  createIdleAnimation(this, GameState.crab, gameHeight);

  // Setup input handlers
  setupInputHandlers(this);

  // Setup PTY
  setupPTY();

  // Setup view toggle
  setupViewToggle();

  // Setup window resize listener
  setupWindowResizeListener();

  // Setup history panel
  setupHistoryPanel();

  // Setup quick commands
  setupQuickCommands();
}

// Create idle breathing animation
function createIdleAnimation(scene, sprite, gameHeight) {
  const baseY = sprite.y;
  const baseX = sprite.x;

  // Breathing effect
  scene.tweens.add({
    targets: sprite,
    scaleY: 1.05,
    y: baseY + 5,
    duration: 1000,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });

  // Subtle left-right sway
  scene.tweens.add({
    targets: sprite,
    x: baseX + 5,
    duration: 1500,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });
}

// Setup PTY and xterm
function setupPTY() {
  // Initialize xterm
  if (typeof Terminal !== 'undefined') {
    GameState.term = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#ffffff',
        selection: 'rgba(247, 147, 30, 0.3)'
      },
      cols: 80,
      rows: 24,
      scrollback: 1000
    });

    // Initialize fit addon
    if (typeof FitAddon !== 'undefined') {
      GameState.fitAddon = new FitAddon.FitAddon();
      GameState.term.loadAddon(GameState.fitAddon);
    }

    GameState.term.open(document.getElementById('terminal-container'));

    // Fit after a short delay to ensure container is laid out
    if (GameState.fitAddon) {
      // Multiple fit attempts to ensure proper sizing
      const doFit = () => {
        try {
          GameState.fitAddon.fit();
          const dims = GameState.fitAddon.proposeDimensions();
          if (dims && dims.cols > 0 && dims.rows > 0) {
            window.electronAPI.pty.resize(dims.cols, dims.rows);
          }
        } catch (e) {
          console.error('Fit error:', e);
        }
      };

      // Try fitting multiple times with delays
      setTimeout(doFit, 100);
      setTimeout(doFit, 500);
      setTimeout(doFit, 1000);
    }

    // Also handle window resize
    window.addEventListener('resize', () => {
      if (GameState.fitAddon) {
        GameState.fitAddon.fit();
        const dims = GameState.fitAddon.proposeDimensions();
        if (dims) {
          window.electronAPI.pty.resize(dims.cols, dims.rows);
        }
      }
    });

    // Handle terminal input
    GameState.term.onData((data) => {
      if (window.electronAPI && window.electronAPI.pty) {
        window.electronAPI.pty.input(data);
      }
    });

    // Setup PTY event listeners
    if (window.electronAPI && window.electronAPI.pty) {
      // Handle PTY output
      window.electronAPI.pty.onOutput((data) => {
        if (GameState.term) {
          GameState.term.write(data);
        }
      });

      // Handle PTY status changes
      window.electronAPI.pty.onStatus((status) => {
        console.log('[PTY Status]:', status);
        switch (status) {
          case PetStatus.THINKING:
            setAnimation(PetStatus.THINKING);
            break;
          case PetStatus.ANALYZING:
            setAnimation(PetStatus.ANALYZING);
            break;
          case PetStatus.CODING:
            setAnimation(PetStatus.CODING);
            break;
          case PetStatus.EXECUTING:
            setAnimation(PetStatus.EXECUTING);
            break;
          case PetStatus.USING_TOOLS:
            setAnimation(PetStatus.USING_TOOLS);
            break;
          case PetStatus.DOWNLOADING:
            setAnimation(PetStatus.DOWNLOADING);
            break;
          case PetStatus.PERMISSION:
            setAnimation(PetStatus.PERMISSION);
            break;
          case PetStatus.DONE:
            setAnimation(PetStatus.DONE);
            // 短暂延迟后恢复 idle
            setTimeout(() => {
              setAnimation(PetStatus.IDLE);
            }, 2000);
            break;
          case 'ready':
            setAnimation(PetStatus.IDLE);
            break;
          case PetStatus.ERROR:
            setAnimation(PetStatus.ERROR);
            setTimeout(() => setAnimation(PetStatus.IDLE), 2000);
            break;
          case 'stopped':
            setAnimation(PetStatus.SAD);
            break;
        }
      });

      // Handle permission requests
      window.electronAPI.pty.onPermission((data) => {
        showPermissionBubble();
      });

      // Start PTY
      window.electronAPI.pty.start().then((result) => {
        if (result.success) {
          console.log('[PTY] Started successfully');
          // Initial resize
          setTimeout(() => {
            if (fitAddon) {
              fitAddon.fit();
              const dims = fitAddon.proposeDimensions();
              if (dims) {
                window.electronAPI.pty.resize(dims.cols, dims.rows);
              }
            }
          }, 100);
        } else {
          console.error('[PTY] Failed to start:', result.error);
        }
      });
    }
  }
}

// Setup window resize listener
function setupWindowResizeListener() {
  // 处理来自 Electron 的 resize 事件
  if (window.electronAPI && window.electronAPI.onResize) {
    window.electronAPI.onResize((data) => {
      console.log('[Window] Resize event:', data);
      // 延迟执行以确保 DOM 完全更新
      setTimeout(() => {
        resizeGame();
        resizeTerminal();
      }, 50);
    });
  }

  // 备用：原生 window resize 事件
  window.addEventListener('resize', () => {
    console.log('[Window] Native resize');
    resizeGame();
    resizeTerminal();
  });
}

// Setup view toggle
function setupViewToggle() {
  const toggleBtn = document.getElementById('btn-toggle-cli');
  const app = document.getElementById('app');
  const cliPanel = document.getElementById('cli-panel');
  const petPanel = document.getElementById('pet-panel');
  const inputArea = document.getElementById('input-area');
  const quickCommands = document.getElementById('quick-commands');
  const gameContainer = document.getElementById('game-container');

  toggleBtn.addEventListener('click', async () => {
    if (window.electronAPI) {
      // 先切换 Electron 窗口尺寸
      GameState.isCliView = await window.electronAPI.toggleCliView();

      // 使用 requestAnimationFrame 确保 DOM 更新
      requestAnimationFrame(() => {
        if (GameState.isCliView) {
          // 展开 CLI 模式
          app.classList.add('cli-expanded');
          petPanel.classList.remove('hidden');
          cliPanel.classList.remove('hidden');
          inputArea.style.display = 'flex';
          quickCommands.style.display = 'flex';
          toggleBtn.textContent = '🐱';
          toggleBtn.title = '收起 CLI';
        } else {
          // 收起 CLI 模式 - 只显示 Pet
          app.classList.remove('cli-expanded');
          cliPanel.classList.add('hidden');
          petPanel.classList.remove('hidden');
          inputArea.style.display = 'flex';
          quickCommands.style.display = 'flex';
          toggleBtn.textContent = '⚡';
          toggleBtn.title = '打开 CLI';
        }

        // 延迟执行 resize，确保 DOM 完全更新
        setTimeout(() => {
          // 强制重绘
          void app.offsetHeight;
          resizeTerminal();
          resizeGame();
        }, 50);
      });
    }
  });
}

// Resize game canvas function
function resizeGame() {
  const gameContainer = document.getElementById('game-container');
  if (!gameContainer || !game || !game.scene || !game.scene.scenes[0]) return;

  // 获取实际渲染尺寸
  const width = gameContainer.clientWidth;
  const height = gameContainer.clientHeight;

  console.log('[Game] Resize requested:', { width, height });

  if (width <= 0 || height <= 0) {
    console.warn('[Game] Invalid dimensions, skipping resize');
    return;
  }

  const scene = game.scene.scenes[0];

  // 更新 Phaser 内部尺寸
  try {
    scene.scale.resize(width, height);
  } catch (e) {
    console.error('[Game] Resize error:', e);
  }

  // 刷新渲染
  if (game.renderer) {
    game.renderer.resize(width, height);
  }

  // 重新定位和缩放背景
  if (scene.bg) {
    scene.bg.x = width / 2;
    scene.bg.y = height / 2;
    scene.bg.setDisplaySize(width, height);
  }

  // 重新定位和缩放螃蟹
  if (GameState.crab) {
    GameState.crab.x = width / 2;
    GameState.crab.y = height * 0.65;
    const scale = Math.min(width / 300, height / 300, 1.2);
    GameState.crab.setScale(scale * 0.8);
  }
}

// Resize terminal function
function resizeTerminal() {
  if (GameState.fitAddon && GameState.term) {
    try {
      GameState.fitAddon.fit();
      const dims = GameState.fitAddon.proposeDimensions();
      if (dims && dims.cols > 0 && dims.rows > 0) {
        window.electronAPI.pty.resize(dims.cols, dims.rows);
      }
    } catch (e) {
      console.log('[Terminal] Fit error:', e.message);
    }
  }
}

// Setup history panel
function setupHistoryPanel() {
  const historyBtn = document.getElementById('btn-history');
  const historyPanel = document.getElementById('history-panel');
  const closeHistoryBtn = document.getElementById('btn-close-history');
  const historyList = document.getElementById('history-list');
  const clearHistoryBtn = document.getElementById('btn-clear-history');

  // Show/hide history panel
  historyBtn.addEventListener('click', () => {
    const isVisible = historyPanel.classList.contains('visible');
    if (isVisible) {
      historyPanel.classList.remove('visible');
      setTimeout(() => historyPanel.classList.add('hidden'), 300);
    } else {
      loadHistory();
      historyPanel.classList.remove('hidden');
      // Small delay for animation
      requestAnimationFrame(() => {
        historyPanel.classList.add('visible');
      });
    }
  });

  // Close history panel
  closeHistoryBtn.addEventListener('click', () => {
    historyPanel.classList.remove('visible');
    setTimeout(() => historyPanel.classList.add('hidden'), 300);
  });

  // Clear history
  clearHistoryBtn.addEventListener('click', () => {
    if (window.Storage) {
      window.Storage.clearHistory();
      loadHistory();
    }
  });

  // Load and render history
  function loadHistory() {
    if (!window.Storage) {
      historyList.innerHTML = '<div class="history-item"><span class="message">存储模块未加载</span></div>';
      return;
    }

    const history = window.Storage.getHistory();

    if (history.length === 0) {
      historyList.innerHTML = '<div class="history-item"><span class="message">暂无历史记录</span></div>';
      return;
    }

    // 渲染历史记录（倒序显示，最新的在前）
    const reversedHistory = [...history].reverse();
    historyList.innerHTML = reversedHistory.map(item => {
      const time = new Date(item.timestamp);
      const timeStr = time.toLocaleString('zh-CN', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      return `
        <div class="history-item" data-message="${encodeURIComponent(item.message)}">
          <div class="message">${escapeHtml(item.message)}</div>
          <div class="time">${timeStr}</div>
        </div>
      `;
    }).join('');

    // 添加点击事件
    historyList.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', () => {
        const message = decodeURIComponent(item.dataset.message);
        // 将消息填入输入框
        const inputField = document.getElementById('user-input');
        inputField.value = message;
        historyPanel.classList.add('hidden');
      });
    });
  }

  // Escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Setup quick commands
function setupQuickCommands() {
  const quickCommands = document.querySelectorAll('.quick-cmd');

  // Command templates
  const commandTemplates = {
    explain: '请解释这段代码的功能：',
    refactor: '请重构这段代码，使其更简洁、可读性更好：',
    debug: '请帮我调试这段代码，找出并修复问题：',
    comment: '请为这段代码添加详细的中文注释：'
  };

  quickCommands.forEach(btn => {
    btn.addEventListener('click', () => {
      const cmd = btn.dataset.cmd;
      const template = commandTemplates[cmd];

      if (template) {
        const inputField = document.getElementById('user-input');
        inputField.value = template;
        inputField.focus();
      }
    });
  });
}

// Setup input handlers
function setupInputHandlers(scene) {
  const inputField = document.getElementById('user-input');
  const sendBtn = document.getElementById('btn-send');
  const minimizeBtn = document.getElementById('btn-minimize');
  const closeBtn = document.getElementById('btn-close');

  // Permission buttons
  const permitBtn = document.getElementById('btn-permit');
  const permitPermBtn = document.getElementById('btn-permit-perm');
  const denyBtn = document.getElementById('btn-deny');

  // Send message
  async function sendMessage() {
    // 获取原始值
    const rawValue = inputField.value;
    // 清理所有空白字符
    const message = rawValue.replace(/[\s\n\r]+/g, ' ').trim();

    // 先清空输入框（即使消息为空也清空）
    inputField.value = '';
    inputField.style.height = 'auto';

    if (!message) return;

    sendBtn.disabled = true;

    // Show thinking state with preset message
    setAnimation(PetStatus.THINKING);  // setAnimation will show the bubble internally
    GameState.isThinking = true;

    try {
      // Use PTY chat instead of Flask API for full Claude CLI response
      if (window.electronAPI && window.electronAPI.pty) {
        const response = await window.electronAPI.pty.chat(message);

        console.log('[Pet] Received response:', response);

        // 保存到历史记录
        if (window.Storage) {
          window.Storage.addToHistory(message, response);
        }

        // 显示响应内容到气泡（使用打字机效果）
        if (response && response.length > 0) {
          // 使用打字机效果显示完整响应
          // 20秒后才考虑显示预设消息
          showBubbleWithTypewriter(response, '✨', () => {
            // 打字完成后的回调 - 只改变动画状态，不显示预设气泡
            // 使用一个特殊的标记来防止 setAnimation 显示预设消息
            GameState.isResponseDisplayed = true;

            // 20秒后恢复IDLE状态
            setTimeout(() => {
              GameState.isResponseDisplayed = false;
              // 只有在没有新消息的情况下才恢复IDLE
              if (!GameState.isThinking) {
                setAnimation(PetStatus.IDLE);
              }
            }, 20000);
          });
        } else {
          showBubbleWithTypewriter('处理完成~', '✨');
          setAnimation(PetStatus.DONE);
          setTimeout(() => setAnimation(PetStatus.IDLE), 2000);
        }
      } else {
        // Fallback if PTY not available
        showBubble('Claude 未启动，请点击 ⚡ 打开 CLI 面板');
        setAnimation(PetStatus.SAD);
        setTimeout(() => setAnimation(PetStatus.IDLE), 2000);
      }
    } catch (error) {
      console.error('Error:', error);
      showBubble('出错了: ' + error.message);
      setAnimation(PetStatus.SAD);
      setTimeout(() => setAnimation(PetStatus.IDLE), 2000);
    }

    sendBtn.disabled = false;
    GameState.isThinking = false;
  }

  // Event listeners
  sendBtn.addEventListener('click', sendMessage);

  // Handle Enter to send, Ctrl+Enter for new line
  inputField.addEventListener('keydown', (e) => {
    // 如果正在使用输入法，不发送
    if (e.isComposing) {
      return;
    }

    if (e.key === 'Enter') {
      if (e.ctrlKey || e.metaKey) {
        // Ctrl+Enter or Cmd+Enter: insert newline
        e.preventDefault();
        const start = inputField.selectionStart;
        const end = inputField.selectionEnd;
        const value = inputField.value;
        inputField.value = value.substring(0, start) + '\n' + value.substring(end);
        inputField.selectionStart = inputField.selectionEnd = start + 1;
        autoResize();
      } else {
        // Just Enter: send message
        e.preventDefault();
        sendMessage();
      }
    }
  });

  // Auto-resize textarea
  function autoResize() {
    inputField.style.height = 'auto';
    inputField.style.height = Math.min(inputField.scrollHeight, 80) + 'px';
  }

  inputField.addEventListener('input', autoResize);

  // CLI input handler (only in CLI view)
  const cliInput = document.getElementById('cli-input');
  if (cliInput) {
    // CLI 输入框回车发送到 PTY
    cliInput.addEventListener('keydown', (e) => {
      // 如果正在使用输入法，不发送
      if (e.isComposing) {
        return;
      }

      if (e.key === 'Enter') {
        // 直接从输入框获取值
        const input = cliInput.value;
        if (input && window.electronAPI && window.electronAPI.pty) {
          window.electronAPI.pty.input(input + '\r');
        } else {
          // 发送空行（用户只按回车）
          if (window.electronAPI && window.electronAPI.pty) {
            window.electronAPI.pty.input('\r');
          }
        }
        // 清空输入框
        cliInput.value = '';
        e.preventDefault();
      }
    });

    // 额外处理 composition 事件确保输入法状态下不发送
    cliInput.addEventListener('compositionstart', (e) => {
      cliInput.dataset.composing = 'true';
    });

    cliInput.addEventListener('compositionend', (e) => {
      cliInput.dataset.composing = 'false';
    });
  }

  // Window controls
  minimizeBtn.addEventListener('click', () => {
    if (window.electronAPI) {
      window.electronAPI.hideWindow();
    }
  });

  closeBtn.addEventListener('click', () => {
    if (window.electronAPI) {
      window.electronAPI.hideWindow();
    }
  });

  // Permission handlers
  permitBtn.addEventListener('click', () => {
    if (window.electronAPI && window.electronAPI.pty) {
      window.electronAPI.pty.permit();
    }
    hidePermissionBubble();
  });

  permitPermBtn.addEventListener('click', () => {
    if (window.electronAPI && window.electronAPI.pty) {
      window.electronAPI.pty.permitPermanently();
    }
    hidePermissionBubble();
  });

  denyBtn.addEventListener('click', () => {
    if (window.electronAPI && window.electronAPI.pty) {
      window.electronAPI.pty.deny();
    }
    hidePermissionBubble();
  });
}

// Show chat bubble
function showBubble(text, autoHide = true) {
  const bubble = document.getElementById('chat-bubble');
  const content = bubble.querySelector('.bubble-content');

  // Detect message type for styling and icon
  let messageClass = '';
  let icon = '';
  if (GameState.currentAnimation === PetStatus.THINKING) {
    messageClass = 'message-thinking';
    icon = '🤔';
  } else if (GameState.currentAnimation === PetStatus.CODING) {
    messageClass = 'message-coding';
    icon = '⌨️';
  } else if (GameState.currentAnimation === PetStatus.DONE) {
    messageClass = 'message-done';
    icon = '✨';
  } else if (GameState.currentAnimation === PetStatus.ERROR) {
    messageClass = 'message-error';
    icon = '⚠️';
  } else if (GameState.currentAnimation === PetStatus.CLICKED) {
    icon = '🦀';
  }

  // Format text (basic markdown-like)
  const formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');

  // Add icon if exists
  content.innerHTML = icon ? `${icon} ${formatted}` : formatted;
  content.className = 'bubble-content' + (messageClass ? ' ' + messageClass : '');

  // Show with animation
  bubble.classList.remove('hidden', 'fading');
  bubble.classList.add('visible');

  // Auto-hide after 10 seconds (or custom time)
  if (autoHide) {
    setTimeout(() => {
      hideBubble();
    }, 10000);
  }

  // Click to hide
  content.onclick = () => {
    hideBubble();
  };
}

// Hide bubble with animation
function hideBubble() {
  const bubble = document.getElementById('chat-bubble');
  if (bubble.classList.contains('hidden')) return;

  bubble.classList.add('fading');
  bubble.classList.remove('visible');

  setTimeout(() => {
    bubble.classList.add('hidden');
    bubble.classList.remove('fading');
  }, 300);

  // Cancel any typing animation
  if (GameState.typingTimeout) {
    clearTimeout(GameState.typingTimeout);
    GameState.typingTimeout = null;
  }

  // Reset typewriter flag
  GameState.isTypewriterActive = false;
  GameState.isResponseDisplayed = false;
}

// Typewriter effect for bubble
function showBubbleWithTypewriter(text, icon = '', callback = null) {
  const bubble = document.getElementById('chat-bubble');
  const content = bubble.querySelector('.bubble-content');

  // Mark as typewriter active to prevent interruption
  GameState.isTypewriterActive = true;

  // Format text (basic markdown-like)
  const formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');

  // Show bubble first
  bubble.classList.remove('hidden', 'fading');
  bubble.classList.add('visible');

  // If text is short, show immediately
  if (formatted.length < 50) {
    content.innerHTML = icon ? `${icon} ${formatted}` : formatted;
    if (callback) callback();
    return;
  }

  // Typewriter effect for longer text
  let index = 0;
  const typingSpeed = 15; // ms per character

  // Extract plain text for typing (strip HTML tags for character counting)
  const plainText = text;

  function typeNextChar() {
    if (index >= formatted.length) {
      // Mark typewriter as complete
      GameState.isTypewriterActive = false;
      if (callback) callback();
      return;
    }

    // Type by character but render as HTML
    const partialText = formatted.substring(0, index + 1);
    content.innerHTML = icon ? `${icon} ${partialText}` : partialText;

    // Auto-scroll to bottom
    content.scrollTop = content.scrollHeight;

    index++;
    GameState.typingTimeout = setTimeout(typeNextChar, typingSpeed);
  }

  // Start typing
  typeNextChar();
}

// Show permission bubble
function showPermissionBubble() {
  const bubble = document.getElementById('permission-bubble');
  bubble.classList.remove('hidden');
  bubble.classList.add('visible');

  // Update crab animation
  setAnimation(PetStatus.THINKING);
}

// Hide permission bubble
function hidePermissionBubble() {
  const bubble = document.getElementById('permission-bubble');
  bubble.classList.remove('visible');

  setTimeout(() => {
    bubble.classList.add('hidden');
  }, 300);

  // Update crab animation
  setAnimation(PetStatus.IDLE);
}

// Set crab animation - 统一版本
function setAnimation(anim) {
  if (!GameState.crab || GameState.currentAnimation === anim) return;

  GameState.currentAnimation = anim;

  // 使用统一的纹理映射
  GameState.crab.setTexture(TextureMap[anim] || 'crab_idle');

  // Update scene tween based on animation
  const scene = game.scene.scenes[0];
  if (!scene) return;

  // Clear existing tweens on crab
  scene.tweens.killTweensOf(GameState.crab);

  // 如果正在显示打字机效果，跳过气泡显示
  const skipBubble = GameState.isTypewriterActive || GameState.isResponseDisplayed;

  switch (anim) {
    case PetStatus.IDLE:
      createIdleAnimation(scene, GameState.crab, scene?.scale?.height || 200);
      break;

    case PetStatus.THINKING:
      // Blinking effect
      scene.tweens.add({
        targets: GameState.crab,
        scaleY: 0.95,
        y: 185,
        duration: 300,
        yoyo: true,
        repeat: -1
      });
      if (!skipBubble) showBubble(getStatusMessage(PetStatus.THINKING));
      break;

    case PetStatus.CODING:
      // 快速弹跳效果（比 speaking 更快）
      scene.tweens.add({
        targets: GameState.crab,
        y: 165,
        duration: 150,
        yoyo: true,
        repeat: -1
      });
      if (!skipBubble) showBubble(getStatusMessage(PetStatus.CODING));
      break;

    case PetStatus.PERMISSION:
      // 等待效果（慢速上下浮动）
      scene.tweens.add({
        targets: GameState.crab,
        y: 175,
        duration: 800,
        yoyo: true,
        repeat: -1
      });
      if (!skipBubble) showBubble(getStatusMessage(PetStatus.PERMISSION));
      break;

    case PetStatus.DONE:
      // 欢快跳跃
      scene.tweens.add({
        targets: GameState.crab,
        y: 150,
        duration: 300,
        yoyo: true,
        repeat: 3
      });
      // 注意：打字机效果完成后才显示完成气泡
      if (!skipBubble) showBubble(getStatusMessage(PetStatus.DONE));
      break;

    case PetStatus.SPEAKING:
      // Speaking bounce
      scene.tweens.add({
        targets: GameState.crab,
        y: 170,
        duration: 200,
        yoyo: true,
        repeat: -1
      });
      break;

    case PetStatus.HAPPY:
      // Jumping animation
      scene.tweens.add({
        targets: GameState.crab,
        y: 150,
        duration: 300,
        yoyo: true,
        repeat: 3
      });
      break;

    case PetStatus.SAD:
      // Drooping effect
      scene.tweens.add({
        targets: GameState.crab,
        y: 195,
        scaleX: 1.1,
        duration: 500,
        yoyo: true,
        repeat: 2
      });
      break;

    case PetStatus.ERROR:
      // 错误效果 - 摇晃
      scene.tweens.add({
        targets: GameState.crab,
        x: 145,
        duration: 100,
        yoyo: true,
        repeat: 5
      });
      showBubble(getStatusMessage(PetStatus.ERROR));
      break;

    case PetStatus.CRYING:
      // 哭泣效果 - 轻微颤抖
      scene.tweens.add({
        targets: GameState.crab,
        y: 185,
        duration: 800,
        yoyo: true,
        repeat: -1
      });
      showBubble(getStatusMessage(PetStatus.CRYING));
      break;

    case PetStatus.SLEEPING:
      // 睡觉效果 - 轻微呼吸
      scene.tweens.add({
        targets: GameState.crab,
        scaleY: 1.02,
        y: 178,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      // 睡觉时不显示气泡（除非是刚切换过来）
      break;

    case PetStatus.CLICKED:
      // 点击互动 - 弹跳
      scene.tweens.add({
        targets: GameState.crab,
        y: 160,
        scaleX: 1.1,
        scaleY: 0.9,
        duration: 100,
        yoyo: true,
        repeat: 1
      });
      showBubble(getStatusMessage(PetStatus.CLICKED));
      break;

    case PetStatus.ANALYZING:
      // 分析中 - 眼睛转动的效果
      scene.tweens.add({
        targets: GameState.crab,
        scaleY: 0.97,
        y: 182,
        duration: 400,
        yoyo: true,
        repeat: -1
      });
      if (!skipBubble) showBubble(getStatusMessage(PetStatus.ANALYZING));
      break;

    case PetStatus.EXECUTING:
      // 执行中 - 快速抖动
      scene.tweens.add({
        targets: GameState.crab,
        x: '+=3',
        duration: 80,
        yoyo: true,
        repeat: -1
      });
      if (!skipBubble) showBubble(getStatusMessage(PetStatus.EXECUTING));
      break;

    case PetStatus.USING_TOOLS:
      // 使用工具中 - 钳子摆动
      scene.tweens.add({
        targets: GameState.crab,
        scaleX: 1.05,
        duration: 200,
        yoyo: true,
        repeat: -1
      });
      if (!skipBubble) showBubble(getStatusMessage(PetStatus.USING_TOOLS));
      break;

    case PetStatus.DOWNLOADING:
      // 下载中 - 上下浮动
      scene.tweens.add({
        targets: GameState.crab,
        y: 175,
        duration: 500,
        yoyo: true,
        repeat: -1
      });
      if (!skipBubble) showBubble(getStatusMessage(PetStatus.DOWNLOADING));
      break;

    case PetStatus.ANGRY:
      // 生气 - 摇晃
      scene.tweens.add({
        targets: GameState.crab,
        x: '+=5',
        duration: 80,
        yoyo: true,
        repeat: -1
      });
      showBubble(getStatusMessage(PetStatus.ANGRY));
      break;

    case PetStatus.EXCITED:
      // 兴奋 - 快速跳跃
      scene.tweens.add({
        targets: GameState.crab,
        y: 145,
        duration: 150,
        yoyo: true,
        repeat: 5
      });
      break;

    case PetStatus.BORED:
      // 无聊 - 轻微下沉
      scene.tweens.add({
        targets: GameState.crab,
        y: 190,
        scaleY: 0.98,
        duration: 1000,
        yoyo: true,
        repeat: -1
      });
      break;

    case PetStatus.SURPRISED:
      // 惊讶 - 突然变大
      scene.tweens.add({
        targets: GameState.crab,
        scaleX: 1.15,
        scaleY: 1.15,
        duration: 150,
        yoyo: true,
        repeat: 1
      });
      break;
  }
}

// Update game loop
function update() {
  // Game loop logic (if needed)
}

// ============================================
// 游戏容器拖拽调整大小
// ============================================
function setupGameResize() {
  const resizeHandle = document.getElementById('game-resize-handle');
  const gameContainer = document.getElementById('game-container');
  const petPanel = document.getElementById('pet-panel');

  if (!resizeHandle || !gameContainer) return;

  let isDragging = false;
  let startY = 0;
  let startHeight = 0;

  // 鼠标/触摸按下
  const onMouseDown = (e) => {
    isDragging = true;
    startY = e.clientY || e.touches?.[0]?.clientY;
    startHeight = gameContainer.offsetHeight;

    resizeHandle.classList.add('dragging');
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';

    // 添加全局事件监听
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchmove', onMouseMove, { passive: false });
    document.addEventListener('touchend', onMouseUp);
  };

  // 鼠标/触摸移动
  const onMouseMove = (e) => {
    if (!isDragging) return;

    e.preventDefault();

    const currentY = e.clientY || e.touches?.[0]?.clientY;
    const deltaY = currentY - startY;
    const newHeight = Math.max(96, Math.min(startHeight + deltaY, window.innerHeight * 0.5)); // 96px = 6rem ~ 最小高度, 50% = 最大高度

    gameContainer.style.height = newHeight + 'px';

    // 通知 Phaser 游戏调整大小
    if (game && game.scene && game.scene.scenes[0]) {
      const scene = game.scene.scenes[0];
      const canvas = scene.game.canvas;
      if (canvas) {
        canvas.style.height = '100%';
      }
    }
  };

  // 鼠标/触摸释放
  const onMouseUp = () => {
    isDragging = false;
    resizeHandle.classList.remove('dragging');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';

    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    document.removeEventListener('touchmove', onMouseMove);
    document.removeEventListener('touchend', onMouseUp);
  };

  // 绑定事件
  resizeHandle.addEventListener('mousedown', onMouseDown);
  resizeHandle.addEventListener('touchstart', onMouseDown, { passive: true });
}

// 初始化拖拽功能
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(setupGameResize, 100);

  // 监听游戏容器大小变化
  const gameContainer = document.getElementById('game-container');
  if (gameContainer && typeof ResizeObserver !== 'undefined') {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        // 确保尺寸有效
        if (width <= 0 || height <= 0) return;

        // 更新 Phaser 游戏的尺寸
        if (game && game.scene && game.scene.scenes[0]) {
          const scene = game.scene.scenes[0];

          // 更新 Phaser 内部尺寸
          scene.scale.resize(width, height);

          // 重新定位和缩放背景
          if (scene.bg) {
            scene.bg.x = width / 2;
            scene.bg.y = height / 2;
            scene.bg.setDisplaySize(width, height);
          }

          // 重新定位和缩放螃蟹
          if (GameState.crab) {
            GameState.crab.x = width / 2;
            GameState.crab.y = height * 0.65;
            // 根据新尺寸计算缩放比例
            const scale = Math.min(width / 300, height / 300, 1.2);
            GameState.crab.setScale(scale * 0.8);
          }
        }
      }
    });
    resizeObserver.observe(gameContainer);
  }
});
