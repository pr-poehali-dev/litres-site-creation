import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для управления покупками - создание и получение истории покупок
    Args: event с httpMethod (GET/POST), body для POST, headers с X-User-Email
    Returns: HTTP response с данными покупок или статусом операции
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
            headers = event.get('headers', {})
            user_email = headers.get('x-user-email') or headers.get('X-User-Email')
            
            if not user_email:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'User email required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('''
                SELECT p.id, p.book_id, p.purchase_type, p.price, p.purchased_at,
                       b.title, b.author, b.cover, b.genre
                FROM purchases p
                JOIN books b ON p.book_id = b.id
                WHERE p.user_email = %s
                ORDER BY p.purchased_at DESC
            ''', (user_email,))
            
            purchases = []
            for row in cursor.fetchall():
                purchases.append({
                    'id': row[0],
                    'bookId': row[1],
                    'purchaseType': row[2],
                    'price': float(row[3]),
                    'purchasedAt': row[4].isoformat(),
                    'book': {
                        'title': row[5],
                        'author': row[6],
                        'cover': row[7],
                        'genre': row[8]
                    }
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'purchases': purchases}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            headers = event.get('headers', {})
            user_email = headers.get('x-user-email') or headers.get('X-User-Email')
            
            if not user_email:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'User email required'}),
                    'isBase64Encoded': False
                }
            
            book_id = body_data.get('bookId')
            purchase_type = body_data.get('purchaseType', 'download')
            price = body_data.get('price', 0)
            
            cursor.execute('''
                SELECT id FROM purchases 
                WHERE user_email = %s AND book_id = %s AND purchase_type = %s
            ''', (user_email, book_id, purchase_type))
            
            if cursor.fetchone():
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Already purchased'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('''
                INSERT INTO purchases (user_email, book_id, purchase_type, price)
                VALUES (%s, %s, %s, %s)
                RETURNING id
            ''', (user_email, book_id, purchase_type, price))
            
            purchase_id = cursor.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': purchase_id, 'message': 'Purchase created'}),
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
