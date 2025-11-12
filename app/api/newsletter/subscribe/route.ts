import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { contacts } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const subscribeSchema = z.object({
  email: z.string().email('Email inválido'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = subscribeSchema.parse(body);

    // Verificar si el email ya existe
    const existingContact = await db
      .select()
      .from(contacts)
      .where(eq(contacts.email, email.toLowerCase()))
      .limit(1);

    if (existingContact.length > 0) {
      // Si ya existe pero no está suscrito, actualizar
      if (!existingContact[0].subscribed) {
        await db
          .update(contacts)
          .set({ subscribed: true, updatedAt: new Date() })
          .where(eq(contacts.email, email.toLowerCase()));

        return NextResponse.json(
          { message: 'Te has vuelto a suscribir correctamente' },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { error: 'Este email ya está suscrito a nuestra newsletter' },
        { status: 400 }
      );
    }

    // Crear nuevo contacto
    await db.insert(contacts).values({
      email: email.toLowerCase(),
      subscribed: true,
      source: 'newsletter',
    });

    return NextResponse.json(
      { message: 'Te has suscrito correctamente a nuestra newsletter' },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error al suscribirse a newsletter:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

