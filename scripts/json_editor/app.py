from __future__ import annotations

import json
import threading
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, urlparse

HOST = '127.0.0.1'
PORT = 5050
BASE_DIR = Path(__file__).resolve().parents[2]
PUBLIC_MODELS_PATH = BASE_DIR / 'public' / 'models.json'
DIST_MODELS_PATH = BASE_DIR / 'dist' / 'models.json'
WRITE_TARGETS = [PUBLIC_MODELS_PATH, DIST_MODELS_PATH]
SAVE_LOCK = threading.Lock()


def _json_bytes(payload: Any) -> bytes:
    return json.dumps(payload, ensure_ascii=False, indent=2).encode('utf-8') + b'\n'


def _read_models_payload() -> Any:
    target = PUBLIC_MODELS_PATH if PUBLIC_MODELS_PATH.exists() else DIST_MODELS_PATH
    if not target.exists():
        raise FileNotFoundError('未找到 public/models.json 或 dist/models.json')

    with target.open('r', encoding='utf-8') as file:
        return json.load(file)


def _should_create_backup(handler: BaseHTTPRequestHandler) -> bool:
    parsed = urlparse(handler.path)
    query = parse_qs(parsed.query)
    backup_query = query.get('backup', ['1'])[-1].strip().lower()
    backup_header = handler.headers.get('X-Create-Backup', 'true').strip().lower()
    false_values = {'0', 'false', 'no', 'off'}
    return backup_query not in false_values and backup_header not in false_values


def _backup_path(path: Path) -> Path:
    timestamp = datetime.now().strftime('%Y%m%d-%H%M%S')
    return path.with_name(f'{path.stem}.backup.{timestamp}{path.suffix}')


def _write_models_payload(payload: Any, *, create_backup: bool) -> None:
    content = _json_bytes(payload)

    with SAVE_LOCK:
        for target in WRITE_TARGETS:
            if not target.parent.exists():
                target.parent.mkdir(parents=True, exist_ok=True)

            if create_backup and target.exists():
                target.replace(_backup_path(target))
                target.write_bytes(content)
            else:
                target.write_bytes(content)


def _error_payload(message: str, *, errors: list[str] | None = None) -> dict[str, Any]:
    payload: dict[str, Any] = {'ok': False, 'error': message}
    if errors:
        payload['errors'] = errors
    return payload


class ModelsRequestHandler(BaseHTTPRequestHandler):
    server_version = 'ModelsJsonEditor/1.0'

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self._send_common_headers('application/json; charset=utf-8')
        self.end_headers()

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == '/api/models':
            try:
                payload = _read_models_payload()
                self._send_json(200, payload)
            except FileNotFoundError as error:
                self._send_json(404, _error_payload(str(error)))
            except json.JSONDecodeError as error:
                self._send_json(500, _error_payload(f'models.json 解析失败：{error}'))
            except Exception as error:
                self._send_json(500, _error_payload(f'读取失败：{error}'))
            return

        self._send_json(404, _error_payload('接口不存在'))

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path != '/api/models':
            self._send_json(404, _error_payload('接口不存在'))
            return

        try:
            content_length = int(self.headers.get('Content-Length', '0'))
        except ValueError:
            self._send_json(400, _error_payload('无效的 Content-Length'))
            return

        raw_body = self.rfile.read(content_length) if content_length > 0 else b''
        if not raw_body:
            self._send_json(400, _error_payload('请求体不能为空'))
            return

        try:
            payload = json.loads(raw_body.decode('utf-8'))
        except json.JSONDecodeError as error:
            self._send_json(400, _error_payload(f'JSON 格式错误：{error}'))
            return

        if not isinstance(payload, dict):
            self._send_json(400, _error_payload('根结构必须是 JSON 对象'))
            return

        try:
            _write_models_payload(payload, create_backup=_should_create_backup(self))
        except Exception as error:
            self._send_json(500, _error_payload(f'保存失败：{error}'))
            return

        self._send_json(200, {'ok': True, 'message': '保存成功'})

    def log_message(self, format: str, *args: Any) -> None:
        print(f'[{self.log_date_time_string()}] {self.address_string()} - {format % args}')

    def _send_common_headers(self, content_type: str) -> None:
        self.send_header('Content-Type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type,X-Create-Backup')
        self.send_header('Cache-Control', 'no-store')

    def _send_json(self, status_code: int, payload: Any) -> None:
        body = _json_bytes(payload)
        self.send_response(status_code)
        self._send_common_headers('application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main() -> None:
    server = ThreadingHTTPServer((HOST, PORT), ModelsRequestHandler)
    print(f'Python models 后端已启动：http://{HOST}:{PORT}')
    print(f'读取文件：{PUBLIC_MODELS_PATH}')
    print('按 Ctrl+C 停止服务')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n服务已停止')
    finally:
        server.server_close()


if __name__ == '__main__':
    main()
