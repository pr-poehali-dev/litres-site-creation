import json
import os
import psycopg2
from typing import Dict, Any, List, Optional

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для управления книгами и покупками - получение, добавление, обновление, удаление
    Args: event с httpMethod (GET/POST/PUT/DELETE), body для POST/PUT, queryStringParameters
    Returns: HTTP response с данными книг, покупок или статусом операции
    '''
    method: str = event.get('httpMethod', 'GET')
    path: str = event.get('path', '')
    
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
            stats = params.get('stats')
            
            if stats == 'true':
                cursor.execute('SELECT COUNT(*) FROM books')
                books_count = cursor.fetchone()[0]
                
                cursor.execute('SELECT COUNT(*) FROM purchases')
                purchases_count = cursor.fetchone()[0]
                
                cursor.execute('SELECT COALESCE(SUM(price), 0) FROM purchases')
                total_revenue = float(cursor.fetchone()[0])
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'booksCount': books_count,
                        'purchasesCount': purchases_count,
                        'totalRevenue': total_revenue
                    }),
                    'isBase64Encoded': False
                }
            
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
        
        if '/purchases' in event.get('path', ''):
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