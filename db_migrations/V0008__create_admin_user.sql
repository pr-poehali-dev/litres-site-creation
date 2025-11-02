-- Создаем администратора с паролем admin123
INSERT INTO users (email, name, is_admin, password_hash)
VALUES ('swi79@bk.ru', 'Администратор', true, 'admin123')
ON CONFLICT DO NOTHING;