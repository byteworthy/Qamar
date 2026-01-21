import json
import subprocess
import threading
import queue
import time

server_path = r"C:\Users\richa\OneDrive\Documents\Cline\MCP\design-to-code\plugins\mcp\design-to-code\dist\servers\design-converter.js"

proc = subprocess.Popen(
    ["node", server_path],
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True,
    bufsize=1,
)

stdout_queue = queue.Queue()

def reader():
    for line in proc.stdout:
        stdout_queue.put(line)

threading.Thread(target=reader, daemon=True).start()

def send(msg):
    proc.stdin.write(json.dumps(msg) + "\n")
    proc.stdin.flush()

def read_response(target_id, timeout=5):
    start = time.time()
    while time.time() - start < timeout:
        try:
            line = stdout_queue.get(timeout=0.1)
        except queue.Empty:
            continue
        try:
            msg = json.loads(line)
        except json.JSONDecodeError:
            continue
        if msg.get("id") == target_id:
            return msg
    return None

send({
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
        "protocolVersion": "2024-11-05",
        "capabilities": {},
        "clientInfo": {"name": "demo-client", "version": "1.0"},
    },
})

init_resp = read_response(1, timeout=5)

send({
    "jsonrpc": "2.0",
    "method": "initialized",
    "params": {},
})

send({
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
        "name": "parse_figma",
        "arguments": {
            "json": "{\"name\":\"Button\",\"type\":\"COMPONENT\"}",
            "framework": "react",
        },
    },
})

parse_resp = read_response(2, timeout=5)

print(json.dumps({"initialize": init_resp, "parse_figma": parse_resp}, indent=2))

proc.terminate()
try:
    proc.wait(timeout=2)
except subprocess.TimeoutExpired:
    proc.kill()
