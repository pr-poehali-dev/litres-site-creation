import json
import os
import psycopg2
from typing import Dict, Any, List, Optional

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для управления книгами - получение, добавление, обновление, удаление
    Args: event с httpMethod (GET/POST/PUT/DELETE), body для POST/PUT, queryStringParameters
    Returns: HTTP response с данными книг или статусом операции
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
            book_id = params.get('id')
            
            if book_id:
                cursor.execute('''
                    SELECT id, title, author, genre, rating, price, cover, description, 
                           badges, ebook_text, ebook_price, is_adult_content
                    FROM books WHERE id = %s
                ''', (book_id,))
                row = cursor.fetchone()
                
                if not row:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Book not found'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute('SELECT format, file_url FROM book_formats WHERE book_id = %s', (book_id,))
                formats = [{'format': f[0], 'fileUrl': f[1]} for f in cursor.fetchall()]
                
                book = {
                    'id': row[0],
                    'title': row[1],
                    'author': row[2],
                    'genre': row[3],
                    'rating': float(row[4]),
                    'price': float(row[5]),
                    'cover': row[6],
                    'description': row[7],
                    'badges': row[8] or [],
                    'ebookText': row[9],
                    'ebookPrice': float(row[10]) if row[10] else None,
                    'isAdultContent': row[11],
                    'formats': formats
                }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'book': book}),
                    'isBase64Encoded': False
                }
            else:
                cursor.execute('''
                    SELECT id, title, author, genre, rating, price, cover, description, 
                           badges, ebook_text, ebook_price, is_adult_content
                    FROM books ORDER BY created_at DESC
                ''')
                rows = cursor.fetchall()
                
                books = []
                for row in rows:
                    cursor.execute('SELECT format, file_url FROM book_formats WHERE book_id = %s', (row[0],))
                    formats = [{'format': f[0], 'fileUrl': f[1]} for f in cursor.fetchall()]
                    
                    books.append({
                        'id': row[0],
                        'title': row[1],
                        'author': row[2],
                        'genre': row[3],
                        'rating': float(row[4]),
                        'price': float(row[5]),
                        'cover': row[6],
                        'description': row[7],
                        'badges': row[8] or [],
                        'ebookText': row[9],
                        'ebookPrice': float(row[10]) if row[10] else None,
                        'isAdultContent': row[11],
                        'formats': formats
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'books': books}),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            cursor.execute('''
                INSERT INTO books (title, author, genre, rating, price, cover, description, 
                                 badges, ebook_text, ebook_price, is_adult_content)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            ''', (
                body_data['title'],
                body_data['author'],
                body_data['genre'],
                body_data.get('rating', 0),
                body_data['price'],
                body_data.get('cover', ''),
                body_data.get('description', ''),
                body_data.get('badges', []),
                body_data.get('ebookText'),
                body_data.get('ebookPrice'),
                body_data.get('isAdultContent', False)
            ))
            
            book_id = cursor.fetchone()[0]
            
            for fmt in body_data.get('formats', []):
                cursor.execute('''
                    INSERT INTO book_formats (book_id, format, file_url)
                    VALUES (%s, %s, %s)
                ''', (book_id, fmt['format'], fmt['fileUrl']))
            
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': book_id, 'message': 'Book created'}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            book_id = body_data.get('id')
            
            if not book_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Book ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('''
                UPDATE books 
                SET title = %s, author = %s, genre = %s, rating = %s, price = %s,
                    cover = %s, description = %s, badges = %s, ebook_text = %s,
                    ebook_price = %s, is_adult_content = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            ''', (
                body_data['title'],
                body_data['author'],
                body_data['genre'],
                body_data.get('rating', 0),
                body_data['price'],
                body_data.get('cover', ''),
                body_data.get('description', ''),
                body_data.get('badges', []),
                body_data.get('ebookText'),
                body_data.get('ebookPrice'),
                body_data.get('isAdultContent', False),
                book_id
            ))
            
            cursor.execute('DELETE FROM book_formats WHERE book_id = %s', (book_id,))
            
            for fmt in body_data.get('formats', []):
                cursor.execute('''
                    INSERT INTO book_formats (book_id, format, file_url)
                    VALUES (%s, %s, %s)
                ''', (book_id, fmt['format'], fmt['fileUrl']))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Book updated'}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters') or {}
            book_id = params.get('id')
            
            if not book_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Book ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('DELETE FROM book_formats WHERE book_id = %s', (book_id,))
            cursor.execute('DELETE FROM books WHERE id = %s', (book_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Book deleted'}),
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
