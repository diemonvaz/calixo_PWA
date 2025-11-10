/**
 * Database Seeding Script for Calixo PWA
 * Este script popula la base de datos con datos iniciales
 * 
 * Ejecutar con: npm run db:seed
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Verificar que DATABASE_URL esté configurado
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL no está configurado en las variables de entorno');
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client, { schema });

async function seed() {
  console.log('🌱 Iniciando seeding de la base de datos...\n');

  try {
    // ============================================
    // 1. CONFIGURACIÓN GLOBAL
    // ============================================
    console.log('📝 Insertando configuración global...');
    
    await db.insert(schema.config).values([
      {
        key: 'daily_free_challenges',
        value: { count: 1 },
        description: 'Número de retos diarios gratuitos para usuarios normales',
      },
      {
        key: 'daily_premium_challenges',
        value: { count: 3 },
        description: 'Número de retos diarios para usuarios premium',
      },
      {
        key: 'focus_max_duration_hours',
        value: { hours: 23 },
        description: 'Duración máxima de retos de enfoque en horas',
      },
      {
        key: 'default_challenge_reward',
        value: { coins: 10 },
        description: 'Recompensa por defecto en monedas por completar un reto',
      },
      {
        key: 'premium_price_monthly',
        value: { amount: 2.99, currency: 'EUR' },
        description: 'Precio de suscripción premium mensual',
      },
      {
        key: 'premium_price_annual',
        value: { amount: 26.99, currency: 'EUR' },
        description: 'Precio de suscripción premium anual',
      },
      {
        key: 'avatar_initial_energy',
        value: { energy: 100 },
        description: 'Energía inicial del avatar CALI',
      },
      {
        key: 'avatar_energy_high_threshold',
        value: { threshold: 70 },
        description: 'Umbral de energía alta del avatar',
      },
      {
        key: 'avatar_energy_medium_threshold',
        value: { threshold: 40 },
        description: 'Umbral de energía media del avatar',
      },
    ]).onConflictDoNothing();

    console.log('✅ Configuración global insertada\n');

    // ============================================
    // 2. RETOS DIARIOS
    // ============================================
    console.log('🎯 Insertando retos diarios...');

    await db.insert(schema.challenges).values([
      {
        type: 'daily',
        title: 'Desconexión Matutina',
        description: 'No uses tu teléfono durante la primera hora después de despertar',
        reward: 15,
        durationMinutes: 60,
        isActive: true,
      },
      {
        type: 'daily',
        title: 'Almuerzo Consciente',
        description: 'Come sin usar dispositivos electrónicos durante 30 minutos',
        reward: 10,
        durationMinutes: 30,
        isActive: true,
      },
      {
        type: 'daily',
        title: 'Paseo sin Pantallas',
        description: 'Da un paseo de 20 minutos sin usar tu teléfono',
        reward: 12,
        durationMinutes: 20,
        isActive: true,
      },
      {
        type: 'daily',
        title: 'Lectura Analógica',
        description: 'Lee un libro físico durante 30 minutos',
        reward: 15,
        durationMinutes: 30,
        isActive: true,
      },
      {
        type: 'daily',
        title: 'Conversación Real',
        description: 'Mantén una conversación cara a cara de 15 minutos sin interrupciones digitales',
        reward: 10,
        durationMinutes: 15,
        isActive: true,
      },
      {
        type: 'daily',
        title: 'Meditación Desconectada',
        description: 'Medita o practica mindfulness durante 15 minutos sin dispositivos',
        reward: 12,
        durationMinutes: 15,
        isActive: true,
      },
      {
        type: 'daily',
        title: 'Ejercicio al Aire Libre',
        description: 'Haz ejercicio fuera de casa sin usar dispositivos durante 30 minutos',
        reward: 15,
        durationMinutes: 30,
        isActive: true,
      },
      {
        type: 'daily',
        title: 'Cena en Familia',
        description: 'Cena con tu familia o amigos sin dispositivos durante 45 minutos',
        reward: 18,
        durationMinutes: 45,
        isActive: true,
      },
      {
        type: 'daily',
        title: 'Hobby Creativo',
        description: 'Dedica 30 minutos a un hobby creativo sin pantallas (dibujar, cocinar, etc.)',
        reward: 15,
        durationMinutes: 30,
        isActive: true,
      },
      {
        type: 'daily',
        title: 'Desconexión Nocturna',
        description: 'No uses dispositivos electrónicos 1 hora antes de dormir',
        reward: 20,
        durationMinutes: 60,
        isActive: true,
      },
    ]).onConflictDoNothing();

    console.log('✅ Retos diarios insertados\n');

    // ============================================
    // 3. RETOS DE ENFOQUE (FOCUS)
    // ============================================
    console.log('🎯 Insertando retos de enfoque...');

    await db.insert(schema.challenges).values([
      {
        type: 'focus',
        title: 'Sesión de Trabajo Profundo',
        description: 'Trabaja en una tarea importante sin interrupciones digitales',
        reward: 25,
        durationMinutes: 120,
        isActive: true,
      },
      {
        type: 'focus',
        title: 'Estudio Concentrado',
        description: 'Estudia sin distracciones digitales',
        reward: 20,
        durationMinutes: 90,
        isActive: true,
      },
      {
        type: 'focus',
        title: 'Proyecto Personal',
        description: 'Dedica tiempo a un proyecto personal sin pantallas',
        reward: 30,
        durationMinutes: 180,
        isActive: true,
      },
    ]).onConflictDoNothing();

    console.log('✅ Retos de enfoque insertados\n');

    // ============================================
    // 4. RETOS SOCIALES
    // ============================================
    console.log('🎯 Insertando retos sociales...');

    await db.insert(schema.challenges).values([
      {
        type: 'social',
        title: 'Tarde sin Pantallas',
        description: 'Pasa una tarde completa sin dispositivos junto a tus amigos',
        reward: 35,
        durationMinutes: 180,
        isActive: true,
      },
      {
        type: 'social',
        title: 'Juego de Mesa',
        description: 'Juega juegos de mesa con amigos sin interrupciones digitales',
        reward: 25,
        durationMinutes: 120,
        isActive: true,
      },
      {
        type: 'social',
        title: 'Excursión Digital Detox',
        description: 'Sal de excursión con amigos dejando los dispositivos en casa',
        reward: 40,
        durationMinutes: 240,
        isActive: true,
      },
    ]).onConflictDoNothing();

    console.log('✅ Retos sociales insertados\n');

    // ============================================
    // 5. ITEMS DE LA TIENDA - COLORES BASE
    // ============================================
    console.log('🛍️ Insertando items de la tienda (colores)...');

    await db.insert(schema.storeItems).values([
      {
        name: 'Color Azul Cielo',
        category: 'color',
        itemId: 'color_blue_sky',
        price: 0,
        premiumOnly: false,
        description: 'Color base azul cielo para tu avatar CALI',
        isActive: true,
      },
      {
        name: 'Color Rosa Suave',
        category: 'color',
        itemId: 'color_pink_soft',
        price: 50,
        premiumOnly: false,
        description: 'Color rosa suave para tu avatar CALI',
        isActive: true,
      },
      {
        name: 'Color Verde Menta',
        category: 'color',
        itemId: 'color_mint_green',
        price: 50,
        premiumOnly: false,
        description: 'Color verde menta para tu avatar CALI',
        isActive: true,
      },
      {
        name: 'Color Amarillo Sol',
        category: 'color',
        itemId: 'color_yellow_sun',
        price: 50,
        premiumOnly: false,
        description: 'Color amarillo brillante para tu avatar CALI',
        isActive: true,
      },
      {
        name: 'Color Morado Galaxy',
        category: 'color',
        itemId: 'color_purple_galaxy',
        price: 100,
        premiumOnly: true,
        description: 'Color morado exclusivo premium',
        isActive: true,
      },
    ]).onConflictDoNothing();

    console.log('✅ Items de colores insertados\n');

    // ============================================
    // 6. ITEMS DE LA TIENDA - CAMISETAS
    // ============================================
    console.log('🛍️ Insertando items de la tienda (camisetas)...');

    await db.insert(schema.storeItems).values([
      {
        name: 'Camiseta Básica',
        category: 'shirt',
        itemId: 'shirt_basic',
        price: 0,
        premiumOnly: false,
        description: 'Camiseta básica para tu avatar',
        isActive: true,
      },
      {
        name: 'Camiseta Rayas',
        category: 'shirt',
        itemId: 'shirt_stripes',
        price: 75,
        premiumOnly: false,
        description: 'Camiseta con rayas horizontales',
        isActive: true,
      },
      {
        name: 'Camiseta Deportiva',
        category: 'shirt',
        itemId: 'shirt_sport',
        price: 100,
        premiumOnly: false,
        description: 'Camiseta deportiva para tu avatar',
        isActive: true,
      },
      {
        name: 'Camiseta Premium',
        category: 'shirt',
        itemId: 'shirt_premium',
        price: 150,
        premiumOnly: true,
        description: 'Camiseta exclusiva para usuarios premium',
        isActive: true,
      },
    ]).onConflictDoNothing();

    console.log('✅ Items de camisetas insertados\n');

    // ============================================
    // 7. ITEMS DE LA TIENDA - SOMBREROS
    // ============================================
    console.log('🛍️ Insertando items de la tienda (sombreros)...');

    await db.insert(schema.storeItems).values([
      {
        name: 'Sin Sombrero',
        category: 'hat',
        itemId: 'hat_none',
        price: 0,
        premiumOnly: false,
        description: 'Sin sombrero',
        isActive: true,
      },
      {
        name: 'Gorra Deportiva',
        category: 'hat',
        itemId: 'hat_cap',
        price: 80,
        premiumOnly: false,
        description: 'Gorra deportiva casual',
        isActive: true,
      },
      {
        name: 'Sombrero de Sol',
        category: 'hat',
        itemId: 'hat_sun',
        price: 90,
        premiumOnly: false,
        description: 'Sombrero perfecto para días soleados',
        isActive: true,
      },
      {
        name: 'Corona Real',
        category: 'hat',
        itemId: 'hat_crown',
        price: 200,
        premiumOnly: true,
        description: 'Corona dorada exclusiva premium',
        isActive: true,
      },
    ]).onConflictDoNothing();

    console.log('✅ Items de sombreros insertados\n');

    // ============================================
    // 8. ITEMS DE LA TIENDA - GAFAS
    // ============================================
    console.log('🛍️ Insertando items de la tienda (gafas)...');

    await db.insert(schema.storeItems).values([
      {
        name: 'Sin Gafas',
        category: 'glasses',
        itemId: 'glasses_none',
        price: 0,
        premiumOnly: false,
        description: 'Sin gafas',
        isActive: true,
      },
      {
        name: 'Gafas de Sol',
        category: 'glasses',
        itemId: 'glasses_sun',
        price: 70,
        premiumOnly: false,
        description: 'Gafas de sol con estilo',
        isActive: true,
      },
      {
        name: 'Gafas de Lectura',
        category: 'glasses',
        itemId: 'glasses_reading',
        price: 60,
        premiumOnly: false,
        description: 'Gafas de lectura clásicas',
        isActive: true,
      },
      {
        name: 'Gafas Futuristas',
        category: 'glasses',
        itemId: 'glasses_future',
        price: 150,
        premiumOnly: true,
        description: 'Gafas futuristas exclusivas',
        isActive: true,
      },
    ]).onConflictDoNothing();

    console.log('✅ Items de gafas insertados\n');

    // ============================================
    // 9. ITEMS DE LA TIENDA - FONDOS
    // ============================================
    console.log('🛍️ Insertando items de la tienda (fondos)...');

    await db.insert(schema.storeItems).values([
      {
        name: 'Fondo Simple',
        category: 'background',
        itemId: 'bg_simple',
        price: 0,
        premiumOnly: false,
        description: 'Fondo simple y limpio',
        isActive: true,
      },
      {
        name: 'Fondo Naturaleza',
        category: 'background',
        itemId: 'bg_nature',
        price: 100,
        premiumOnly: false,
        description: 'Fondo con paisaje natural',
        isActive: true,
      },
      {
        name: 'Fondo Ciudad',
        category: 'background',
        itemId: 'bg_city',
        price: 100,
        premiumOnly: false,
        description: 'Fondo urbano moderno',
        isActive: true,
      },
      {
        name: 'Fondo Espacio',
        category: 'background',
        itemId: 'bg_space',
        price: 200,
        premiumOnly: true,
        description: 'Fondo espacial exclusivo premium',
        isActive: true,
      },
    ]).onConflictDoNothing();

    console.log('✅ Items de fondos insertados\n');

    // ============================================
    // 10. CUPONES DE EJEMPLO
    // ============================================
    console.log('🎟️ Insertando cupones de ejemplo...');

    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);

    await db.insert(schema.coupons).values([
      {
        code: 'WELCOME25',
        discountPercent: 25,
        maxUses: 100,
        usedCount: 0,
        validUntil: futureDate,
        isActive: true,
      },
      {
        code: 'PREMIUM50',
        discountPercent: 50,
        maxUses: 50,
        usedCount: 0,
        validUntil: futureDate,
        isActive: true,
      },
    ]).onConflictDoNothing();

    console.log('✅ Cupones insertados\n');

    console.log('🎉 ¡Seeding completado exitosamente!\n');
    console.log('📊 Resumen:');
    console.log('  - 9 configuraciones globales');
    console.log('  - 16 retos (10 diarios, 3 enfoque, 3 sociales)');
    console.log('  - 21 items de tienda (5 colores, 4 camisetas, 4 sombreros, 4 gafas, 4 fondos)');
    console.log('  - 2 cupones de ejemplo\n');

  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Ejecutar el seeding
seed()
  .then(() => {
    console.log('✅ Proceso de seeding finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });

