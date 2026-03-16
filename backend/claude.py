# -*- coding: utf-8 -*-
"""
Claude API wrapper - calls local Claude Code CLI
"""
import subprocess
import json
import os
import tempfile
import time


class ClaudeClient:
    """Client for interacting with Claude Code CLI"""

    def __init__(self):
        self.claude_path = self._find_claude_path()

    def _find_claude_path(self):
        """Find the Claude Code CLI executable"""
        # Try common locations
        possible_paths = [
            '/usr/local/bin/claude',
            '/usr/bin/claude',
            os.path.expanduser('~/.local/bin/claude'),
            'claude'  # In PATH
        ]

        for path in possible_paths:
            try:
                result = subprocess.run(
                    ['which', path] if path != 'claude' else ['which', 'claude'],
                    capture_output=True,
                    text=True
                )
                if result.returncode == 0:
                    return result.stdout.strip()
            except:
                pass

        # Default to 'claude' and hope it's in PATH
        return 'claude'

    def chat(self, message, system_prompt=None):
        """
        Send a message to Claude and get the response

        Args:
            message: User message
            system_prompt: Optional system prompt

        Returns:
            Claude's response as a string
        """
        # Build the prompt
        if system_prompt:
            full_prompt = f"{system_prompt}\n\nUser: {message}"
        else:
            full_prompt = message

        # Try using Claude CLI with --print flag
        try:
            # First, check if claude CLI is available
            result = subprocess.run(
                [self.claude_path, '--version'],
                capture_output=True,
                text=True,
                timeout=10
            )

            if result.returncode != 0:
                raise Exception("Claude CLI not available")

        except FileNotFoundError:
            # Claude CLI not found, try using a simpler approach
            return self._fallback_response(message)

        # Create a temp file for the conversation
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
            f.write(full_prompt)
            temp_file = f.name

        try:
            # Try using claude CLI with --print
            # This is a simplified approach - in production you'd want
            # proper conversation handling
            process = subprocess.Popen(
                [self.claude_path, '--print', '-p', full_prompt],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                stdin=subprocess.PIPE
            )

            stdout, stderr = process.communicate(timeout=60)

            if process.returncode == 0 and stdout:
                return self._process_response(stdout)
            else:
                # If CLI fails, use fallback
                return self._fallback_response(message, stderr)

        except subprocess.TimeoutExpired:
            process.kill()
            return self._fallback_response(message, "Request timed out")
        except Exception as e:
            return self._fallback_response(message, str(e))
        finally:
            # Clean up temp file
            if os.path.exists(temp_file):
                os.remove(temp_file)

    def _process_response(self, response):
        """Process and clean up Claude's response"""
        # Remove any ANSI codes
        import re
        ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')
        clean = ansi_escape.sub('', response)

        # Trim whitespace
        clean = clean.strip()

        # If response is empty or too short, use fallback
        if len(clean) < 10:
            return self._fallback_response("", "Response too short")

        return clean

    def _fallback_response(self, message, error=None):
        """
        Generate a fallback response when Claude CLI is not available
        This provides basic functionality for testing
        """
        message_lower = message.lower()

        # Simple pattern matching for common queries
        if any(word in message_lower for word in ['hello', 'hi', 'hey', '你好', '嗨']):
            responses = [
                "你好！我是 Claude Pet，很高兴见到你！🐚",
                "嗨！有什么我可以帮你的吗？",
                "你好呀！我是 Claude Code 的小宠物～"
            ]
        elif any(word in message_lower for word in ['who are you', '你是谁', 'what are you']):
            responses = [
                "我是 Claude Pet，基于 Claude Code Logo 的桌面小宠物！",
                "我是 Claude Code 的像素螃蟹形象，很可爱吧！",
                "我是你的桌面助手 Claude Pet，有问题尽管问我！"
            ]
        elif any(word in message_lower for word in ['help', '帮助', '能做什么']):
            responses = [
                "我可以陪你聊天、回答问题！虽然我现在还是测试版本，但我会越来越聪明的！",
                "作为 Claude Pet，我可以帮你：\n• 回答各种问题\n• 陪你聊天解闷\n• 提供编程帮助"
            ]
        elif any(word in message_lower for word in ['thanks', 'thank', '谢谢']):
            responses = [
                "不客气！很高兴能帮到你！",
                "不用谢！随时可以找我聊天哦～",
                "哈哈，不客气！继续问我问题吧！"
            ]
        elif any(word in message_lower for word in ['cute', 'cool', '好可爱', '厉害']):
            responses = [
                "谢谢夸奖！🦀",
                "嘿嘿，我也觉得我挺可爱的！",
                "谬赞了！我会继续努力的！"
            ]
        elif '?' in message or any(word in message_lower for word in ['how', 'what', 'why', '如何', '怎么', '什么']):
            responses = [
                "这是个有趣的问题！虽然我现在用的是简化版本，但真正的 Claude Code 可以帮你解答很多问题！",
                "关于这个问题，让我思考一下...（实际上我正在使用简化回复）",
                "很好的问题！Claude Code 可以帮你解答这个，不过我现在还在学习阶段～"
            ]
        else:
            responses = [
                "我收到了你的消息！虽然我现在用的是简化版本，但真正的 Claude Code 可以帮你做很多事！",
                "嗯嗯，我听到了！作为 Claude Pet，我会一直陪着你～",
                "消息已收到！如果你想体验完整的 Claude Code 功能，可以直接使用 Claude Code CLI 哦！",
                "有意思！我现在用的是测试版本，但已经可以和你聊天了！"
            ]

        # Add error note if there was an error
        if error and "Request timed out" not in str(error):
            responses.append(f"\n\n💡 提示：当前使用简化回复模式。如需完整功能，请确保 Claude Code CLI 已正确安装。")

        import random
        return random.choice(responses)


if __name__ == '__main__':
    # Test the client
    client = ClaudeClient()
    print("Testing Claude Client...")
    response = client.chat("你好！")
    print(f"Response: {response}")
