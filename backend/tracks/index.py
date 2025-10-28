import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для управления музыкальными треками (получение, добавление, удаление)
    Args: event с httpMethod (GET/POST/DELETE), body для POST, queryStringParameters для DELETE
    Returns: HTTP response с списком треков или статусом операции
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor()
    
    try:
        if method == 'GET':
            cursor.execute(
                "SELECT id, title, artist, duration, cover, audio_url, genre, year, price, is_adult_content "
                "FROM tracks ORDER BY created_at DESC"
            )
            rows = cursor.fetchall()
            
            tracks = []
            for row in rows:
                tracks.append({
                    'id': row[0],
                    'title': row[1],
                    'artist': row[2],
                    'duration': row[3],
                    'cover': row[4],
                    'audioUrl': row[5],
                    'genre': row[6],
                    'year': row[7],
                    'price': row[8],
                    'isAdultContent': row[9]
                })
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'tracks': tracks})
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            title = body_data['title'].replace("'", "''")
            artist = body_data['artist'].replace("'", "''")
            duration = body_data.get('duration', '').replace("'", "''")
            cover = body_data.get('cover', '').replace("'", "''")
            audio_url = body_data['audioUrl'].replace("'", "''")
            genre = body_data.get('genre', '').replace("'", "''")
            year = body_data.get('year', 2024)
            price = body_data.get('price', 0)
            is_adult = body_data.get('isAdultContent', False)
            
            cursor.execute(
                f"INSERT INTO tracks (title, artist, duration, cover, audio_url, genre, year, price, is_adult_content) "
                f"VALUES ('{title}', '{artist}', '{duration}', '{cover}', '{audio_url}', '{genre}', {year}, {price}, {is_adult}) "
                f"RETURNING id"
            )
            track_id = cursor.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'id': track_id, 'message': 'Track added successfully'})
            }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters', {})
            track_id = params.get('id')
            
            if not track_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Track ID is required'})
                }
            
            cursor.execute(f"DELETE FROM tracks WHERE id = {int(track_id)}")
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Track deleted successfully'})
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'})
            }
    
    finally:
        cursor.close()
        conn.close()