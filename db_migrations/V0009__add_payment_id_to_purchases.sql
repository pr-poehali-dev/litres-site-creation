-- Добавляем колонку для хранения ID платежа из ЮMoney
ALTER TABLE t_p48697888_litres_site_creation.purchases 
ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255);