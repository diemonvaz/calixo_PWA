-- ============================================
-- Calixo PWA - Datos Iniciales (Seed)
-- Ejecutar después de aplicar RLS policies
-- ============================================

-- ============================================
-- 1. CONFIGURACIÓN GLOBAL
-- ============================================

INSERT INTO config (key, value, description) VALUES
  ('daily_free_challenges', '{"count": 1}', 'Número de retos diarios gratuitos para usuarios normales'),
  ('daily_premium_challenges', '{"count": 3}', 'Número de retos diarios para usuarios premium'),
  ('focus_max_duration_hours', '{"hours": 23}', 'Duración máxima de retos de enfoque en horas'),
  ('default_challenge_reward', '{"coins": 10}', 'Recompensa por defecto en monedas por completar un reto'),
  ('premium_price_monthly', '{"amount": 4.99, "currency": "USD"}', 'Precio de suscripción premium mensual'),
  ('premium_price_annual', '{"amount": 49.99, "currency": "USD"}', 'Precio de suscripción premium anual'),
  ('avatar_initial_energy', '{"energy": 100}', 'Energía inicial del avatar CALI'),
  ('avatar_energy_high_threshold', '{"threshold": 70}', 'Umbral de energía alta del avatar'),
  ('avatar_energy_medium_threshold', '{"threshold": 40}', 'Umbral de energía media del avatar'),
  ('reward_daily', '50', 'Recompensa base para retos diarios'),
  ('reward_focus', '1', 'Recompensa por minuto en modo enfoque'),
  ('reward_social', '75', 'Recompensa base para retos sociales'),
  ('max_focus_duration_minutes', '1380', 'Duración máxima de focus mode en minutos')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- ============================================
-- 2. RETOS DIARIOS
-- ============================================

INSERT INTO challenges (type, title, description, reward, duration_minutes, is_active) VALUES
  ('daily', 'Desconexión Matutina', 'No uses tu teléfono durante la primera hora después de despertar', 15, 60, true),
  ('daily', 'Almuerzo Consciente', 'Come sin usar dispositivos electrónicos durante 30 minutos', 10, 30, true),
  ('daily', 'Paseo sin Pantallas', 'Da un paseo de 20 minutos sin usar tu teléfono', 12, 20, true),
  ('daily', 'Lectura Analógica', 'Lee un libro físico durante 30 minutos', 15, 30, true),
  ('daily', 'Conversación Real', 'Mantén una conversación cara a cara de 15 minutos sin interrupciones digitales', 10, 15, true),
  ('daily', 'Meditación Desconectada', 'Medita o practica mindfulness durante 15 minutos sin dispositivos', 12, 15, true),
  ('daily', 'Ejercicio al Aire Libre', 'Haz ejercicio fuera de casa sin usar dispositivos durante 30 minutos', 15, 30, true),
  ('daily', 'Cena en Familia', 'Cena con tu familia o amigos sin dispositivos durante 45 minutos', 18, 45, true),
  ('daily', 'Hobby Creativo', 'Dedica 30 minutos a un hobby creativo sin pantallas (dibujar, cocinar, etc.)', 15, 30, true),
  ('daily', 'Desconexión Nocturna', 'No uses dispositivos electrónicos 1 hora antes de dormir', 20, 60, true),
  ('daily', 'Mañana sin Notificaciones', 'Desactiva todas las notificaciones durante las primeras 2 horas del día', 25, 120, true),
  ('daily', 'Cocina Sin Pantallas', 'Cocina una comida completa sin consultar recetas en dispositivos', 20, 45, true),
  ('daily', 'Escritura Manual', 'Escribe una carta o diario a mano durante 20 minutos', 15, 20, true),
  ('daily', 'Juego de Mesa', 'Juega un juego de mesa con amigos o familia sin usar dispositivos', 18, 60, true),
  ('daily', 'Jardinería o Plantas', 'Cuida tus plantas o jardín durante 30 minutos sin distracciones digitales', 15, 30, true),
  ('daily', 'Arte Manual', 'Crea algo con tus manos (dibujo, manualidades, etc.) durante 30 minutos', 18, 30, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. RETOS DE ENFOQUE (FOCUS)
-- ============================================

INSERT INTO challenges (type, title, description, reward, duration_minutes, is_active) VALUES
  ('focus', 'Sesión de Trabajo Profundo', 'Trabaja en una tarea importante sin interrupciones digitales', 25, 120, true),
  ('focus', 'Estudio Concentrado', 'Estudia sin distracciones digitales', 20, 90, true),
  ('focus', 'Proyecto Personal', 'Dedica tiempo a un proyecto personal sin pantallas', 30, 180, true),
  ('focus', 'Lectura Intensiva', 'Lee un libro completo sin interrupciones digitales', 35, 240, true),
  ('focus', 'Escritura Creativa', 'Escribe sin distracciones durante una sesión prolongada', 40, 180, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. RETOS SOCIALES
-- ============================================

INSERT INTO challenges (type, title, description, reward, duration_minutes, is_active) VALUES
  ('social', 'Tarde sin Pantallas', 'Pasa una tarde completa sin dispositivos junto a tus amigos', 35, 180, true),
  ('social', 'Juego de Mesa', 'Juega juegos de mesa con amigos sin interrupciones digitales', 25, 120, true),
  ('social', 'Excursión Digital Detox', 'Sal de excursión con amigos dejando los dispositivos en casa', 40, 240, true),
  ('social', 'Picnic Sin Tecnología', 'Organiza un picnic con amigos sin usar dispositivos', 30, 150, true),
  ('social', 'Noche de Juegos', 'Pasa una noche completa jugando con amigos sin pantallas', 35, 180, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. ITEMS DE LA TIENDA - COLORES BASE
-- ============================================

INSERT INTO store_items (name, category, item_id, price, premium_only, description, is_active) VALUES
  ('Color Azul Cielo', 'color', 'color_blue_sky', 0, false, 'Color base azul cielo para tu avatar CALI', true),
  ('Color Rosa Suave', 'color', 'color_pink_soft', 50, false, 'Color rosa suave para tu avatar CALI', true),
  ('Color Verde Menta', 'color', 'color_mint_green', 50, false, 'Color verde menta para tu avatar CALI', true),
  ('Color Amarillo Sol', 'color', 'color_yellow_sun', 50, false, 'Color amarillo brillante para tu avatar CALI', true),
  ('Color Morado Galaxy', 'color', 'color_purple_galaxy', 100, true, 'Color morado exclusivo premium', true),
  ('Color Naranja Vibrante', 'color', 'color_orange_vibrant', 75, false, 'Color naranja vibrante y energético', true),
  ('Color Turquesa Océano', 'color', 'color_turquoise_ocean', 75, false, 'Color turquesa refrescante', true),
  ('Color Dorado Premium', 'color', 'color_golden_premium', 150, true, 'Color dorado exclusivo para premium', true)
ON CONFLICT (item_id) DO NOTHING;

-- ============================================
-- 6. ITEMS DE LA TIENDA - CAMISETAS
-- ============================================

INSERT INTO store_items (name, category, item_id, price, premium_only, description, is_active) VALUES
  ('Camiseta Básica', 'shirt', 'shirt_basic', 0, false, 'Camiseta básica para tu avatar', true),
  ('Camiseta Rayas', 'shirt', 'shirt_stripes', 75, false, 'Camiseta con rayas horizontales', true),
  ('Camiseta Deportiva', 'shirt', 'shirt_sport', 100, false, 'Camiseta deportiva para tu avatar', true),
  ('Camiseta Premium', 'shirt', 'shirt_premium', 150, true, 'Camiseta exclusiva para usuarios premium', true),
  ('Camiseta Casual', 'shirt', 'shirt_casual', 60, false, 'Camiseta casual y cómoda', true),
  ('Camiseta Formal', 'shirt', 'shirt_formal', 80, false, 'Camiseta formal elegante', true),
  ('Camiseta Estampada', 'shirt', 'shirt_patterned', 90, false, 'Camiseta con estampado único', true),
  ('Camiseta VIP', 'shirt', 'shirt_vip', 200, true, 'Camiseta VIP exclusiva premium', true)
ON CONFLICT (item_id) DO NOTHING;

-- ============================================
-- 7. ITEMS DE LA TIENDA - SOMBREROS
-- ============================================

INSERT INTO store_items (name, category, item_id, price, premium_only, description, is_active) VALUES
  ('Sin Sombrero', 'hat', 'hat_none', 0, false, 'Sin sombrero', true),
  ('Gorra Deportiva', 'hat', 'hat_cap', 80, false, 'Gorra deportiva casual', true),
  ('Sombrero de Sol', 'hat', 'hat_sun', 90, false, 'Sombrero perfecto para días soleados', true),
  ('Corona Real', 'hat', 'hat_crown', 200, true, 'Corona dorada exclusiva premium', true),
  ('Gorro de Invierno', 'hat', 'hat_winter', 70, false, 'Gorro cálido para invierno', true),
  ('Sombrero Vaquero', 'hat', 'hat_cowboy', 100, false, 'Sombrero vaquero con estilo', true),
  ('Boina Elegante', 'hat', 'hat_beret', 85, false, 'Boina elegante y sofisticada', true),
  ('Tiara Premium', 'hat', 'hat_tiara', 250, true, 'Tiara brillante exclusiva premium', true)
ON CONFLICT (item_id) DO NOTHING;

-- ============================================
-- 8. ITEMS DE LA TIENDA - GAFAS
-- ============================================

INSERT INTO store_items (name, category, item_id, price, premium_only, description, is_active) VALUES
  ('Sin Gafas', 'glasses', 'glasses_none', 0, false, 'Sin gafas', true),
  ('Gafas de Sol', 'glasses', 'glasses_sun', 70, false, 'Gafas de sol con estilo', true),
  ('Gafas de Lectura', 'glasses', 'glasses_reading', 60, false, 'Gafas de lectura clásicas', true),
  ('Gafas Futuristas', 'glasses', 'glasses_future', 150, true, 'Gafas futuristas exclusivas', true),
  ('Gafas Redondas', 'glasses', 'glasses_round', 65, false, 'Gafas redondas vintage', true),
  ('Gafas Rectangulares', 'glasses', 'glasses_rectangular', 70, false, 'Gafas rectangulares modernas', true),
  ('Gafas Aviador', 'glasses', 'glasses_aviator', 80, false, 'Gafas aviador clásicas', true),
  ('Gafas Holográficas', 'glasses', 'glasses_holographic', 180, true, 'Gafas holográficas premium', true)
ON CONFLICT (item_id) DO NOTHING;

-- ============================================
-- 9. ITEMS DE LA TIENDA - FONDOS
-- ============================================

INSERT INTO store_items (name, category, item_id, price, premium_only, description, is_active) VALUES
  ('Fondo Simple', 'background', 'bg_simple', 0, false, 'Fondo simple y limpio', true),
  ('Fondo Naturaleza', 'background', 'bg_nature', 100, false, 'Fondo con paisaje natural', true),
  ('Fondo Ciudad', 'background', 'bg_city', 100, false, 'Fondo urbano moderno', true),
  ('Fondo Espacio', 'background', 'bg_space', 200, true, 'Fondo espacial exclusivo premium', true),
  ('Fondo Playa', 'background', 'bg_beach', 120, false, 'Fondo de playa relajante', true),
  ('Fondo Montaña', 'background', 'bg_mountain', 120, false, 'Fondo montañoso impresionante', true),
  ('Fondo Abstracto', 'background', 'bg_abstract', 90, false, 'Fondo abstracto artístico', true),
  ('Fondo Neon', 'background', 'bg_neon', 250, true, 'Fondo neon futurista premium', true)
ON CONFLICT (item_id) DO NOTHING;

-- ============================================
-- 10. ITEMS DE LA TIENDA - ACCESORIOS
-- ============================================

INSERT INTO store_items (name, category, item_id, price, premium_only, description, is_active) VALUES
  ('Sin Accesorios', 'accessories', 'acc_none', 0, false, 'Sin accesorios', true),
  ('Collar Simple', 'accessories', 'acc_necklace_simple', 60, false, 'Collar simple y elegante', true),
  ('Pulsera Deportiva', 'accessories', 'acc_bracelet_sport', 50, false, 'Pulsera deportiva funcional', true),
  ('Reloj Clásico', 'accessories', 'acc_watch_classic', 100, false, 'Reloj clásico elegante', true),
  ('Mochila Casual', 'accessories', 'acc_backpack_casual', 80, false, 'Mochila casual y práctica', true),
  ('Bufanda de Lujo', 'accessories', 'acc_scarf_luxury', 120, true, 'Bufanda de lujo premium', true),
  ('Guitarra', 'accessories', 'acc_guitar', 150, false, 'Guitarra para tu avatar', true),
  ('Corona de Diamantes', 'accessories', 'acc_diamond_crown', 300, true, 'Corona de diamantes exclusiva', true)
ON CONFLICT (item_id) DO NOTHING;

-- ============================================
-- 11. CUPONES DE EJEMPLO
-- ============================================

INSERT INTO coupons (code, discount_percent, max_uses, used_count, valid_from, valid_until, is_active) VALUES
  ('WELCOME25', 25, 100, 0, NOW(), NOW() + INTERVAL '1 year', true),
  ('PREMIUM50', 50, 50, 0, NOW(), NOW() + INTERVAL '1 year', true),
  ('LAUNCH30', 30, 200, 0, NOW(), NOW() + INTERVAL '6 months', true),
  ('FRIEND20', 20, NULL, 0, NOW(), NOW() + INTERVAL '1 year', true)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- ============================================

SELECT 'Config' as tabla, COUNT(*) as registros FROM config
UNION ALL
SELECT 'Challenges', COUNT(*) FROM challenges
UNION ALL
SELECT 'Store Items', COUNT(*) FROM store_items
UNION ALL
SELECT 'Coupons', COUNT(*) FROM coupons;

