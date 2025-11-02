import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для регистрации и авторизации пользователей
    Args: event с httpMethod (GET/POST), body для POST с email и name
    Returns: HTTP response с данными пользователя или ошибкой
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Email',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor()
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            email = params.get('email')
            password = params.get('password')
            all_users = params.get('all')
            stats = params.get('stats')
            
            if stats == 'true':
                cursor.execute('SELECT COUNT(*) FROM users')
                users_count = cursor.fetchone()[0]
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'usersCount': users_count}),
                    'isBase64Encoded': False
                }
            
            if all_users == 'true':
                cursor.execute('''
                    SELECT id, email, name, is_admin, created_at
                    FROM users ORDER BY created_at DESC
                ''')
                
                rows = cursor.fetchall()
                users = []
                for row in rows:
                    users.append({
                        'id': row[0],
                        'email': row[1],
                        'name': row[2],
                        'isAdmin': row[3],
                        'createdAt': row[4].isoformat()
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'users': users}),
                    'isBase64Encoded': False
                }
            
            if not email:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Email required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('''
                SELECT id, email, name, is_admin, created_at, password_hash
                FROM users WHERE email = %s
            ''', (email,))
            
            row = cursor.fetchone()
            
            if not row:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'User not found'}),
                    'isBase64Encoded': False
                }
            
            if password:
                stored_password = row[5]
                if stored_password and password != stored_password:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Invalid password'}),
                        'isBase64Encoded': False
                    }
            
            user = {
                'id': row[0],
                'email': row[1],
                'name': row[2],
                'isAdmin': row[3],
                'createdAt': row[4].isoformat()
            }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'user': user}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            email = body_data.get('email')
            name = body_data.get('name')
            
            if not email or not name:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Email and name required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('SELECT id, email, name, is_admin FROM users WHERE email = %s', (email,))
            existing_user = cursor.fetchone()
            
            if existing_user:
                user = {
                    'id': existing_user[0],
                    'email': existing_user[1],
                    'name': existing_user[2],
                    'isAdmin': existing_user[3]
                }
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'user': user, 'message': 'User already exists'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('''
                INSERT INTO users (email, name, is_admin)
                VALUES (%s, %s, %s)
                RETURNING id, email, name, is_admin, created_at
            ''', (email, name, False))
            
            row = cursor.fetchone()
            conn.commit()
            
            user = {
                'id': row[0],
                'email': row[1],
                'name': row[2],
                'isAdmin': row[3],
                'createdAt': row[4].isoformat()
            }
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'user': user, 'message': 'User created'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
        
    finally:
        cursor.close()
        conn.close()