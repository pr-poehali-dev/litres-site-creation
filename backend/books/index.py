import json
import os
import hashlib
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
    wallet_id = os.environ.get('YOOMONEY_WALLET_ID')
    secret_key = os.environ.get('YOOMONEY_SECRET_KEY')
    
    schema_name = 't_p48697888_litres_site_creation'
    
    if '/yoomoney-webhook' in path and method == 'POST':
        body_str = event.get('body', '')
        params = {}
        
        if body_str:
            for pair in body_str.split('&'):
                if '=' in pair:
                    key, value = pair.split('=', 1)
                    params[key] = value
        
        notification_type = params.get('notification_type')
        operation_id = params.get('operation_id')
        amount = params.get('amount')
        currency = params.get('currency')
        datetime_str = params.get('datetime')
        sender = params.get('sender')
        codepro = params.get('codepro')
        label = params.get('label')
        sha1_hash = params.get('sha1_hash')
        
        hash_string = f"{notification_type}&{operation_id}&{amount}&{currency}&{datetime_str}&{sender}&{codepro}&{secret_key}&{label}"
        calculated_hash = hashlib.sha1(hash_string.encode()).hexdigest()
        
        if calculated_hash != sha1_hash:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'text/plain'},
                'body': 'Invalid signature',
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        try:
            if label:
                parts = label.split('_')
                if len(parts) >= 3:
                    user_email = parts[0]
                    book_id = int(parts[1])
                    purchase_type = parts[2]
                    
                    cursor.execute(f'''
                        SELECT id FROM {schema_name}.purchases 
                        WHERE user_email = %s AND book_id = %s AND purchase_type = %s
                    ''', (user_email, book_id, purchase_type))
                    
                    if not cursor.fetchone():
                        cursor.execute(f'''
                            INSERT INTO {schema_name}.purchases (user_email, book_id, purchase_type, price, payment_id)
                            VALUES (%s, %s, %s, %s, %s)
                        ''', (user_email, book_id, purchase_type, float(amount), operation_id))
                        
                        conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'text/plain'},
                'body': 'OK',
                'isBase64Encoded': False
            }
            
        finally:
            cursor.close()
            conn.close()
    
    if '/yoomoney-form' in path and method == 'GET':
        params = event.get('queryStringParameters') or {}
        book_id = params.get('bookId')
        user_email = params.get('userEmail')
        purchase_type = params.get('purchaseType', 'download')
        amount = params.get('amount')
        
        if not all([book_id, user_email, amount, wallet_id]):
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing required parameters'}),
                'isBase64Encoded': False
            }
        
        label = f"{user_email}_{book_id}_{purchase_type}"
        
        payment_data = {
            'receiver': wallet_id,
            'quickpay_form': 'shop',
            'targets': f'Оплата книги #{book_id}',
            'paymentType': 'AC',
            'sum': amount,
            'label': label,
            'successURL': f'https://pulsebook.ru/payment-success?bookId={book_id}',
            'formUrl': 'https://yoomoney.ru/quickpay/confirm'
        }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(payment_data),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor()
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            book_id = params.get('id')
            stats = params.get('stats')
            
            if stats == 'true':
                cursor.execute(f'SELECT COUNT(*) FROM {schema_name}.books')
                books_count = cursor.fetchone()[0]
                
                cursor.execute(f'SELECT COUNT(*) FROM {schema_name}.purchases')
                purchases_count = cursor.fetchone()[0]
                
                cursor.execute(f'SELECT COALESCE(SUM(price), 0) FROM {schema_name}.purchases')
                total_revenue = float(cursor.fetchone()[0])
                
                cursor.execute(f'''
                    SELECT 
                        DATE(purchased_at) as date,
                        COUNT(*) as count,
                        COALESCE(SUM(price), 0) as revenue
                    FROM {schema_name}.purchases
                    WHERE purchased_at >= CURRENT_DATE - INTERVAL '30 days'
                    GROUP BY DATE(purchased_at)
                    ORDER BY date ASC
                ''')
                
                sales_by_day = []
                for row in cursor.fetchall():
                    sales_by_day.append({
                        'date': row[0].isoformat(),
                        'count': row[1],
                        'revenue': float(row[2])
                    })
                
                cursor.execute(f'''
                    SELECT 
                        DATE_TRUNC('week', purchased_at) as week,
                        COUNT(*) as count,
                        COALESCE(SUM(price), 0) as revenue
                    FROM {schema_name}.purchases
                    WHERE purchased_at >= CURRENT_DATE - INTERVAL '12 weeks'
                    GROUP BY week
                    ORDER BY week ASC
                ''')
                
                sales_by_week = []
                for row in cursor.fetchall():
                    sales_by_week.append({
                        'week': row[0].isoformat(),
                        'count': row[1],
                        'revenue': float(row[2])
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'booksCount': books_count,
                        'purchasesCount': purchases_count,
                        'totalRevenue': total_revenue,
                        'salesByDay': sales_by_day,
                        'salesByWeek': sales_by_week
                    }),
                    'isBase64Encoded': False
                }
            
            if book_id:
                cursor.execute(f'''
                    SELECT id, title, author, genre, rating, price, discount_price, cover, description, 
                           badges, ebook_text, ebook_price, ebook_discount_price, is_adult_content
                    FROM {schema_name}.books WHERE id = %s
                ''', (book_id,))
                row = cursor.fetchone()
                
                if not row:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Book not found'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute(f'SELECT format, file_url FROM {schema_name}.book_formats WHERE book_id = %s', (book_id,))
                formats = [{'format': f[0], 'fileUrl': f[1]} for f in cursor.fetchall()]
                
                book = {
                    'id': row[0],
                    'title': row[1],
                    'author': row[2],
                    'genre': row[3],
                    'rating': float(row[4]),
                    'price': float(row[5]),
                    'discountPrice': float(row[6]) if row[6] else None,
                    'cover': row[7],
                    'description': row[8],
                    'badges': row[9] or [],
                    'ebookText': row[10],
                    'ebookPrice': float(row[11]) if row[11] else None,
                    'ebookDiscountPrice': float(row[12]) if row[12] else None,
                    'isAdultContent': row[13],
                    'formats': formats
                }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'book': book}),
                    'isBase64Encoded': False
                }
            else:
                cursor.execute(f'''
                    SELECT id, title, author, genre, rating, price, discount_price, cover, description, 
                           badges, ebook_text, ebook_price, ebook_discount_price, is_adult_content
                    FROM {schema_name}.books ORDER BY created_at DESC
                ''')
                rows = cursor.fetchall()
                
                books = []
                for row in rows:
                    cursor.execute(f'SELECT format, file_url FROM {schema_name}.book_formats WHERE book_id = %s', (row[0],))
                    formats = [{'format': f[0], 'fileUrl': f[1]} for f in cursor.fetchall()]
                    
                    books.append({
                        'id': row[0],
                        'title': row[1],
                        'author': row[2],
                        'genre': row[3],
                        'rating': float(row[4]),
                        'price': float(row[5]),
                        'discountPrice': float(row[6]) if row[6] else None,
                        'cover': row[7],
                        'description': row[8],
                        'badges': row[9] or [],
                        'ebookText': row[10],
                        'ebookPrice': float(row[11]) if row[11] else None,
                        'ebookDiscountPrice': float(row[12]) if row[12] else None,
                        'isAdultContent': row[13],
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
            
            cursor.execute(f'''
                INSERT INTO {schema_name}.books (title, author, genre, rating, price, discount_price, cover, description, 
                                 badges, ebook_text, ebook_price, ebook_discount_price, is_adult_content)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            ''', (
                body_data['title'],
                body_data['author'],
                body_data['genre'],
                body_data.get('rating', 0),
                body_data['price'],
                body_data.get('discountPrice'),
                body_data.get('cover', ''),
                body_data.get('description', ''),
                body_data.get('badges', []),
                body_data.get('ebookText'),
                body_data.get('ebookPrice'),
                body_data.get('ebookDiscountPrice'),
                body_data.get('isAdultContent', False)
            ))
            
            book_id = cursor.fetchone()[0]
            
            for fmt in body_data.get('formats', []):
                cursor.execute(f'''
                    INSERT INTO {schema_name}.book_formats (book_id, format, file_url)
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
            
            cursor.execute(f'''
                UPDATE {schema_name}.books 
                SET title = %s, author = %s, genre = %s, rating = %s, price = %s, discount_price = %s,
                    cover = %s, description = %s, badges = %s, ebook_text = %s,
                    ebook_price = %s, ebook_discount_price = %s, is_adult_content = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            ''', (
                body_data['title'],
                body_data['author'],
                body_data['genre'],
                body_data.get('rating', 0),
                body_data['price'],
                body_data.get('discountPrice'),
                body_data.get('cover', ''),
                body_data.get('description', ''),
                body_data.get('badges', []),
                body_data.get('ebookText'),
                body_data.get('ebookPrice'),
                body_data.get('ebookDiscountPrice'),
                body_data.get('isAdultContent', False),
                book_id
            ))
            
            cursor.execute(f'DELETE FROM {schema_name}.book_formats WHERE book_id = %s', (book_id,))
            
            for fmt in body_data.get('formats', []):
                cursor.execute(f'''
                    INSERT INTO {schema_name}.book_formats (book_id, format, file_url)
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
            
            cursor.execute(f'DELETE FROM {schema_name}.book_formats WHERE book_id = %s', (book_id,))
            cursor.execute(f'DELETE FROM {schema_name}.books WHERE id = %s', (book_id,))
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
                
                cursor.execute(f'''
                    SELECT p.id, p.book_id, p.purchase_type, p.price, p.purchased_at,
                           b.title, b.author, b.cover, b.genre
                    FROM {schema_name}.purchases p
                    JOIN {schema_name}.books b ON p.book_id = b.id
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
                
                cursor.execute(f'''
                    SELECT id FROM {schema_name}.purchases 
                    WHERE user_email = %s AND book_id = %s AND purchase_type = %s
                ''', (user_email, book_id, purchase_type))
                
                if cursor.fetchone():
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Already purchased'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute(f'''
                    INSERT INTO {schema_name}.purchases (user_email, book_id, purchase_type, price)
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