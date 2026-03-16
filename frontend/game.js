// Phaser game configuration
const config = {
  type: Phaser.AUTO,
  width: 300,
  height: 300,
  parent: 'game-container',
  transparent: true,
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let game = new Phaser.Game(config);

// Game state
let crab;
let currentAnimation = 'idle';
let bubble;
let isThinking = false;

// PTY state
let isCliView = false;
let term = null;
let fitAddon = null;

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

  // Generate background gradient texture
  const bgGraphics = scene.make.graphics({ x: 0, y: 0, add: false });
  bgGraphics.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x0f3460, 1);
  bgGraphics.fillRect(0, 0, 300, 300);
  bgGraphics.generateTexture('bg', 300, 300);
}

// Create game objects
function create() {
  // Add background
  this.add.image(150, 150, 'bg');

  // Add crab sprite
  crab = this.add.sprite(150, 180, 'crab_idle');

  // Create idle animation using tweens
  createIdleAnimation(this, crab);

  // Setup input handlers
  setupInputHandlers(this);

  // Setup PTY
  setupPTY();

  // Setup view toggle
  setupViewToggle();
}

// Create idle breathing animation
function createIdleAnimation(scene, sprite) {
  // Breathing effect
  scene.tweens.add({
    targets: sprite,
    scaleY: 1.05,
    y: 175,
    duration: 1000,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });

  // Subtle left-right sway
  scene.tweens.add({
    targets: sprite,
    x: 155,
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
    term = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#ffffff',
        selection: 'rgba(247, 147, 30, 0.3)'
      },
      convertEol: true,
      scrollback: 1000
    });

    // Initialize fit addon
    if (typeof FitAddon !== 'undefined') {
      fitAddon = new FitAddon.FitAddon();
      term.loadAddon(fitAddon);
    }

    term.open(document.getElementById('terminal-container'));

    if (fitAddon) {
      fitAddon.fit();
    }

    // Handle terminal input
    term.onData((data) => {
      if (window.electronAPI && window.electronAPI.pty) {
        window.electronAPI.pty.input(data);
      }
    });

    // Handle resize
    window.addEventListener('resize', () => {
      if (fitAddon) {
        fitAddon.fit();
        if (window.electronAPI && window.electronAPI.pty) {
          const dims = fitAddon.proposeDimensions();
          if (dims) {
            window.electronAPI.pty.resize(dims.cols, dims.rows);
          }
        }
      }
    });

    // Setup PTY event listeners
    if (window.electronAPI && window.electronAPI.pty) {
      // Handle PTY output
      window.electronAPI.pty.onOutput((data) => {
        if (term) {
          term.write(data);
        }
      });

      // Handle PTY status changes
      window.electronAPI.pty.onStatus((status) => {
        console.log('[PTY Status]:', status);
        switch (status) {
          case 'thinking':
            setAnimation('thinking');
            break;
          case 'ready':
            setAnimation('idle');
            break;
          case 'error':
            setAnimation('sad');
            setTimeout(() => setAnimation('idle'), 2000);
            break;
          case 'stopped':
            setAnimation('sad');
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

// Setup view toggle
function setupViewToggle() {
  const toggleBtn = document.getElementById('btn-toggle-cli');
  const app = document.getElementById('app');

  toggleBtn.addEventListener('click', async () => {
    if (window.electronAPI) {
      isCliView = await window.electronAPI.toggleCliView();

      // Update UI
      if (isCliView) {
        app.classList.add('cli-expanded');
        toggleBtn.textContent = '🐱';
        toggleBtn.title = '收起 CLI';

        // Resize terminal after transition
        setTimeout(() => {
          if (fitAddon) {
            fitAddon.fit();
            const dims = fitAddon.proposeDimensions();
            if (dims) {
              window.electronAPI.pty.resize(dims.cols, dims.rows);
            }
          }
        }, 350);
      } else {
        app.classList.remove('cli-expanded');
        toggleBtn.textContent = '⚡';
        toggleBtn.title = '打开 CLI';
      }
    }
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
    const message = inputField.value.trim();
    if (!message) return;

    // Clear input
    inputField.value = '';
    sendBtn.disabled = true;

    // Show thinking state
    setAnimation('thinking');
    isThinking = true;

    try {
      const response = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      const data = await response.json();

      if (data.response) {
        // Show response in bubble
        showBubble(data.response);
        setAnimation('speaking');

        // After speaking, go back to happy then idle
        setTimeout(() => {
          setAnimation('happy');
          setTimeout(() => {
            setAnimation('idle');
          }, 1500);
        }, 2000);
      }
    } catch (error) {
      console.error('Error:', error);
      showBubble('抱歉，我遇到了一些问题。让我再试一次。');
      setAnimation('sad');
      setTimeout(() => setAnimation('idle'), 2000);
    }

    sendBtn.disabled = false;
    isThinking = false;
  }

  // Event listeners
  sendBtn.addEventListener('click', sendMessage);

  // Handle Enter to send, Ctrl+Enter for new line
  inputField.addEventListener('keydown', (e) => {
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

  // Sync input between Pet input and CLI input
  const cliInput = document.getElementById('cli-input');
  if (cliInput) {
    inputField.addEventListener('input', (e) => {
      cliInput.value = e.target.value;
    });

    cliInput.addEventListener('input', (e) => {
      inputField.value = e.target.value;
    });

    // Sync on Enter key
    cliInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        // In CLI view, Enter sends to PTY
        if (isCliView && window.electronAPI && window.electronAPI.pty) {
          window.electronAPI.pty.input('\r');
        }
        cliInput.value = '';
        inputField.value = '';
      }
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
function showBubble(text) {
  const bubble = document.getElementById('chat-bubble');
  const content = bubble.querySelector('.bubble-content');

  // Format text (basic markdown-like)
  const formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');

  content.innerHTML = formatted;
  bubble.classList.remove('hidden');

  // Auto-hide after 10 seconds
  setTimeout(() => {
    bubble.classList.add('hidden');
  }, 10000);

  // Click to hide
  content.addEventListener('click', () => {
    bubble.classList.add('hidden');
  });
}

// Show permission bubble
function showPermissionBubble() {
  const bubble = document.getElementById('permission-bubble');
  bubble.classList.remove('hidden');

  // Update crab animation
  setAnimation('thinking');
}

// Hide permission bubble
function hidePermissionBubble() {
  const bubble = document.getElementById('permission-bubble');
  bubble.classList.add('hidden');

  // Update crab animation
  setAnimation('idle');
}

// Set crab animation
function setAnimation(anim) {
  if (!crab || currentAnimation === anim) return;

  currentAnimation = anim;
  crab.setTexture('crab_' + anim);

  // Update scene tween based on animation
  const scene = game.scene.scenes[0];
  if (!scene) return;

  // Clear existing tweens on crab
  scene.tweens.killTweensOf(crab);

  switch (anim) {
    case 'idle':
      createIdleAnimation(scene, crab);
      break;

    case 'thinking':
      // Blinking effect
      scene.tweens.add({
        targets: crab,
        scaleY: 0.95,
        y: 185,
        duration: 300,
        yoyo: true,
        repeat: -1
      });
      break;

    case 'speaking':
      // Speaking bounce
      scene.tweens.add({
        targets: crab,
        y: 170,
        duration: 200,
        yoyo: true,
        repeat: -1
      });
      break;

    case 'happy':
      // Jumping animation
      scene.tweens.add({
        targets: crab,
        y: 150,
        duration: 300,
        yoyo: true,
        repeat: 3
      });
      break;

    case 'sad':
      // Drooping effect
      scene.tweens.add({
        targets: crab,
        y: 195,
        scaleX: 1.1,
        duration: 500,
        yoyo: true,
        repeat: 2
      });
      break;
  }
}

// Update game loop
function update() {
  // Game loop logic (if needed)
}
