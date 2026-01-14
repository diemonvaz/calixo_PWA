import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const subscribeSchema = z.object({
  email: z.string().email('Email inválido'),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { email } = subscribeSchema.parse(body);

    // Verificar si el email ya existe
    const { data: existingContact } = await supabase
      .from('contacts')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (existingContact) {
      // Si ya existe pero no está suscrito, actualizar
      if (!existingContact.subscribed) {
        const { error: updateError } = await supabase
          .from('contacts')
          .update({ subscribed: true, updated_at: new Date().toISOString() })
          .eq('email', email.toLowerCase());

        if (updateError) {
          throw updateError;
        }

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
    const { error: insertError } = await supabase
      .from('contacts')
      .insert({
        email: email.toLowerCase(),
        subscribed: true,
        source: 'newsletter',
      });

    if (insertError) {
      throw insertError;
    }

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

