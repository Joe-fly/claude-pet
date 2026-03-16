# -*- coding: utf-8 -*-
from flask import Flask, request, jsonify
import subprocess
import os

app = Flask(__name__)

# Import Claude wrapper
from claude import ClaudeClient

# Initialize Claude client
claude = ClaudeClient()


@app.route('/api/chat', methods=['POST'])
def chat():
    """Handle chat requests"""
    data = request.get_json()

    if not data or 'message' not in data:
        return jsonify({'error': 'No message provided'}), 400

    user_message = data['message']

    try:
        # Call Claude API
        response = claude.chat(user_message)
        return jsonify({'response': response})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/status', methods=['GET'])
def status():
    """Check if the service is running"""
    return jsonify({'status': 'online', 'service': 'claude-pet'})


if __name__ == '__main__':
    # Wait for Flask to be ready
    import time
    time.sleep(1)

    print("Flask backend starting on http://localhost:5001")
    # Only bind to localhost for security
    app.run(host='127.0.0.1', port=5001, debug=False, use_reloader=False)
