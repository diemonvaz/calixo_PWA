import { createClient } from '@/lib/supabase/server';
import { AuthPage } from '@/components/auth/auth-page';
import { FeedPage } from '@/components/feed/feed-page';

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si el usuario está autenticado, mostrar el feed
  if (user) {
    return <FeedPage />;
  }

  // Si no está autenticado, mostrar login/signup
  return <AuthPage />;
}
