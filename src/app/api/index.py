from http.server import BaseHTTPRequestHandler, HTTPServer
from tiktoken import encoding_for_model, get_encoding
import json
from typing import Dict, Any


class TokenizerHandler(BaseHTTPRequestHandler):
    def count_tokens(self, text: str, model: str) -> int:
        try:
            encoder = encoding_for_model(model)
        except KeyError:
            encoder = get_encoding("cl100k_base")  # fallback encoding
        
        return len(encoder.encode(text))

    def set_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        request = {
            'method': 'POST',
            'body': post_data.decode('utf-8')
        }
        response = self.handler(request)

        self.send_response(response['statusCode'])
        self.set_cors_headers()
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(response['body'].encode('utf-8'))

    def do_OPTIONS(self):
        response = self.handler({'method': 'OPTIONS'})

        self.send_response(response['statusCode'])
        self.set_cors_headers()
        self.end_headers()

    def do_GET(self):
        response = self.handler({'method': 'GET'})

        self.send_response(response['statusCode'])
        self.set_cors_headers()
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(response['body'].encode('utf-8'))

    def handler(self, request: Dict[str, Any]):
        if request['method'] == 'POST':
            body = json.loads(request['body'])
            text = body.get('text', '')
            model = body.get('model', 'gpt-4')
            
            token_count = self.count_tokens(text, model)
            
            return {
                'statusCode': 200,
                'body': json.dumps({'token_count': token_count}),
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
            }
        elif request['method'] == 'OPTIONS':
            return {
                'statusCode': 204,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
            }
        elif request['method'] == 'GET':
            return {
                'statusCode': 200,
                'body': json.dumps({'message': 'GET request received'}),
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
            }
        else:
            print(request)
            return {
                'statusCode': 405,
                'body': json.dumps({'error': 'Method not allowed'}),
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
            }


def run(server_class=HTTPServer, handler_class=TokenizerHandler, port=8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting server on port {port}...')
    httpd.serve_forever()


if __name__ == '__main__':
    run()
