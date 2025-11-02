-- Добавляем поле для хранения пароля
ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);

-- Устанавливаем пароль для администратора (простой хеш для примера)
UPDATE users SET password_hash = 'admin123' WHERE email = 'swi79@bk.ru';