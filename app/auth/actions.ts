'use server';

import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { z } from 'zod';
import { loginSchema, signupSchema, resetPasswordSchema } from '@/lib/validations/auth';

export type AuthActionState = {
  error?: string;
  success?: boolean;
  message?: string;
};

/**
 * Sign in with email/username and password
 */
export async function login(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  try {
    // Validate input
    const validatedFields = loginSchema.safeParse({
      emailOrUsername: formData.get('emailOrUsername'),
      password: formData.get('password'),
    });

    if (!validatedFields.success) {
      return {
        error: validatedFields.error.errors[0].message,
        success: false,
      };
    }

    const { emailOrUsername, password } = validatedFields.data;
    const supabase = await createClient();

    // Determine if input is email or username
    const isEmail = emailOrUsername.includes('@');
    let email = emailOrUsername;

    // If it's a username, find the user's email
    if (!isEmail) {
      // Search for user by display_name
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('display_name', emailOrUsername)
        .single();

      if (userError || !userData) {
        return {
          error: 'Credenciales inválidas. Por favor verifica tu nombre de usuario y contraseña.',
          success: false,
        };
      }

      // Get email from auth.users using Admin API
      try {
        const adminClient = createServiceRoleClient();
        const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(userData.id);
        
        if (authError || !authUser?.user?.email) {
          return {
            error: 'Credenciales inválidas. Por favor verifica tu nombre de usuario y contraseña.',
            success: false,
          };
        }

        email = authUser.user.email;
      } catch (adminError) {
        console.error('Error getting user email:', adminError);
        return {
          error: 'Error al obtener la información del usuario. Por favor intenta de nuevo.',
          success: false,
        };
      }
    }

    // Sign in with email
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        error: 'Credenciales inválidas. Por favor verifica tus credenciales.',
        success: false,
      };
    }

    // Get redirect URL from form data or headers
    const redirectParam = formData.get('redirect') as string | null;
    let redirectTo = '/';
    
    if (redirectParam) {
      redirectTo = redirectParam;
    } else {
      // Fallback to checking referer header
      try {
        const headersList = await headers();
        const referer = headersList.get('referer') || '';
        if (referer) {
          const refererUrl = new URL(referer);
          const redirectFromUrl = refererUrl.searchParams.get('redirect');
          if (redirectFromUrl) {
            redirectTo = redirectFromUrl;
          }
        }
      } catch {
        // If headers() fails, use default
      }
    }

    // Revalidate paths to ensure fresh data after login
    revalidatePath('/');
    revalidatePath('/feed');
    revalidatePath('/profile');
    revalidatePath(redirectTo);

    redirect(redirectTo);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: error.errors[0].message,
        success: false,
      };
    }

    // Don't catch redirect errors
    throw error;
  }
}

/**
 * Sign up with email and password
 */
export async function signup(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  try {
    // Validate input
    const validatedFields = signupSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
      displayName: formData.get('displayName'),
      acceptTerms: formData.get('acceptTerms') === 'on',
    });

    if (!validatedFields.success) {
      return {
        error: validatedFields.error.errors[0].message,
        success: false,
      };
    }

    const { email, password, displayName } = validatedFields.data;
    const supabase = await createClient();

    // Sign up
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    if (error) {
      return {
        error: error.message || 'Error al crear la cuenta. Por favor intenta de nuevo.',
        success: false,
      };
    }

    if (!data.user) {
      return {
        error: 'Error al crear la cuenta. Por favor intenta de nuevo.',
        success: false,
      };
    }

    // Create user record (Supabase trigger should handle this, but we do it here as backup)
    try {
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          display_name: displayName,
          avatar_energy: 100,
          is_private: false,
          is_premium: false,
          coins: 0,
          streak: 0,
        });

      if (userError) {
        console.error('Error creating user:', userError);
        // El usuario de auth se creó pero el registro falló - esto no debería bloquear el registro
        // El registro se puede crear más tarde si es necesario
      }
    } catch (userError) {
      console.error('Error creating user:', userError);
      // El usuario de auth se creó pero el registro falló - esto no debería bloquear el registro
      // El registro se puede crear más tarde si es necesario
    }

    return {
      success: true,
      message: 'Cuenta creada exitosamente. Por favor verifica tu correo electrónico.',
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: error.errors[0].message,
        success: false,
      };
    }

    return {
      error: 'Error inesperado. Por favor intenta de nuevo.',
      success: false,
    };
  }
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle() {
  const supabase = await createClient();
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    redirect('/auth/login?error=oauth_failed');
  }

  if (data.url) {
    redirect(data.url);
  }
}

/**
 * Sign out
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/auth/login');
}

/**
 * Request password reset
 */
export async function resetPassword(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  try {
    // Validate input
    const validatedFields = resetPasswordSchema.safeParse({
      email: formData.get('email'),
    });

    if (!validatedFields.success) {
      return {
        error: validatedFields.error.errors[0].message,
        success: false,
      };
    }

    const { email } = validatedFields.data;
    const supabase = await createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password/confirm`,
    });

    if (error) {
      return {
        error: 'Error al enviar el correo de recuperación. Por favor intenta de nuevo.',
        success: false,
      };
    }

    return {
      success: true,
      message: 'Correo de recuperación enviado. Por favor revisa tu bandeja de entrada.',
    };
  } catch (error) {
    return {
      error: 'Error inesperado. Por favor intenta de nuevo.',
      success: false,
    };
  }
}

