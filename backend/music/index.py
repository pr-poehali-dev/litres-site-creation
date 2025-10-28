import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для управления музыкальными треками - получение, добавление, удаление
    Args: event с httpMethod (GET/POST/DELETE), body для POST, queryStringParameters для DELETE
    Returns: HTTP response с данными треков или статусом операции
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
            'body': '',
            'isBase64Encoded': False
        }
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor()
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            stats = params.get('stats')
            
            if stats == 'true':
                cursor.execute('SELECT COUNT(*) FROM music_tracks')
                tracks_count = cursor.fetchone()[0]
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'tracksCount': tracks_count}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('''
                SELECT id, title, artist, duration, cover, audio_url, is_adult_content
                FROM music_tracks ORDER BY created_at DESC
            ''')
            
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
                    'isAdultContent': row[6]
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'tracks': tracks}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            title = body_data['title'].replace("'", "''")
            artist = body_data['artist'].replace("'", "''")
            duration = body_data['duration'].replace("'", "''") if body_data.get('duration') else ''
            cover = body_data.get('cover', '').replace("'", "''")
            audio_url = body_data['audioUrl'].replace("'", "''")
            is_adult = 'true' if body_data.get('isAdultContent', False) else 'false'
            
            cursor.execute(f'''
                INSERT INTO music_tracks (title, artist, duration, cover, audio_url, is_adult_content)
                VALUES ('{title}', '{artist}', '{duration}', '{cover}', '{audio_url}', {is_adult})
                RETURNING id
            ''')
            
            track_id = cursor.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': track_id, 'message': 'Track created'}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters') or {}
            track_id = params.get('id')
            
            if not track_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Track ID required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(f'DELETE FROM music_tracks WHERE id = {int(track_id)}')
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Track deleted'}),
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