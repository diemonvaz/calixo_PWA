import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { signOut } from '../auth/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { db, profiles, userChallenges, challenges } from '@/db';
import { eq, and, count } from 'drizzle-orm';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get user profile
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  // Get completed challenges count
  const completedChallenges = await db
    .select({ count: count() })
    .from(userChallenges)
    .where(
      and(
        eq(userChallenges.userId, user.id),
        eq(userChallenges.status, 'completed')
      )
    );

  const completedCount = completedChallenges[0]?.count || 0;

  // Get active challenges
  const activeChallenges = await db
    .select({
      userChallenge: userChallenges,
      challenge: challenges,
    })
    .from(userChallenges)
    .leftJoin(challenges, eq(userChallenges.challengeId, challenges.id))
    .where(
      and(
        eq(userChallenges.userId, user.id),
        eq(userChallenges.status, 'in_progress')
      )
    )
    .limit(5);

  // Calculate energy level
  const energyLevel = profile
    ? profile.avatarEnergy >= 70
      ? 'Alta'
      : profile.avatarEnergy >= 40
      ? 'Media'
      : 'Baja'
    : 'Media';

  const energyColor = profile
    ? profile.avatarEnergy >= 70
      ? 'text-accent-green'
      : profile.avatarEnergy >= 40
      ? 'text-yellow-600'
      : 'text-accent-red'
    : 'text-yellow-600';

  return (
    <div className="min-h-screen bg-beige p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-dark-navy">
              ¡Bienvenido de vuelta! 👋
            </h1>
            <p className="text-neutral-gray mt-2">
              {profile?.displayName || user.email}
            </p>
            {profile?.isPremium && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                ✓ Premium
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Link href="/profile">
              <Button variant="outline">
                Mi Perfil
              </Button>
            </Link>
            <form action={signOut}>
              <Button variant="outline">
                Cerrar Sesión
              </Button>
            </form>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-soft-blue">{completedCount}</CardTitle>
              <CardDescription>Retos Completados</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-accent-green">{profile?.coins || 0}</CardTitle>
              <CardDescription>Monedas Ganadas</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-dark-navy">{profile?.streak || 0}</CardTitle>
              <CardDescription>Días de Racha</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className={energyColor}>
                {profile?.avatarEnergy || 100}
              </CardTitle>
              <CardDescription>Energía CALI ({energyLevel})</CardDescription>
            </CardHeader>
          </Card>

          <Card className={`${profile?.isPremium ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300' : 'border-gray-200'}`}>
            <CardHeader>
              {profile?.isPremium ? (
                <>
                  <CardTitle className="text-purple-600">⭐ Premium</CardTitle>
                  <CardDescription>
                    <Link href="/subscription" className="text-xs hover:underline">
                      Gestionar →
                    </Link>
                  </CardDescription>
                </>
              ) : (
                <>
                  <CardTitle className="text-gray-600">💎 Gratuito</CardTitle>
                  <CardDescription>
                    <Link href="/pricing" className="text-xs hover:underline text-purple-600 font-semibold">
                      Upgrade →
                    </Link>
                  </CardDescription>
                </>
              )}
            </CardHeader>
          </Card>
        </div>

        {/* Active Challenges */}
        {activeChallenges.length > 0 && (
          <Card className="border-yellow-500">
            <CardHeader>
              <CardTitle>⚡ Retos en Progreso</CardTitle>
              <CardDescription>
                Tienes {activeChallenges.length} reto{activeChallenges.length > 1 ? 's' : ''} activo{activeChallenges.length > 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeChallenges.map(({ userChallenge, challenge }) => (
                  <div
                    key={userChallenge.id}
                    className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-dark-navy">
                          {challenge?.title || 'Reto'}
                        </h3>
                        <p className="text-sm text-neutral-gray mt-1">
                          Iniciado: {new Date(userChallenge.startedAt || '').toLocaleString('es-ES')}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full">
                        En progreso
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>🚀 Acciones Rápidas</CardTitle>
            <CardDescription>
              Todo lo que necesitas en un solo lugar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <Link href="/challenges/daily">
                <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl hover:border-blue-400 transition-colors cursor-pointer h-full">
                  <div className="text-3xl mb-2">📅</div>
                  <h3 className="font-semibold text-dark-navy text-sm mb-1">Retos Diarios</h3>
                  <p className="text-xs text-neutral-gray">
                    Desconéctate con retos cortos
                  </p>
                </div>
              </Link>

              <Link href="/challenges/focus">
                <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-xl hover:border-purple-400 transition-colors cursor-pointer h-full">
                  <div className="text-3xl mb-2">🎯</div>
                  <h3 className="font-semibold text-dark-navy text-sm mb-1">Modo Enfoque</h3>
                  <p className="text-xs text-neutral-gray">
                    Sesiones concentración
                  </p>
                </div>
              </Link>

              <Link href="/challenges/social">
                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl hover:border-green-400 transition-colors cursor-pointer h-full">
                  <div className="text-3xl mb-2">👥</div>
                  <h3 className="font-semibold text-dark-navy text-sm mb-1">Retos Sociales</h3>
                  <p className="text-xs text-neutral-gray">
                    Desconéctate con amigos
                  </p>
                </div>
              </Link>

              <Link href="/store">
                <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl hover:border-yellow-400 transition-colors cursor-pointer h-full">
                  <div className="text-3xl mb-2">🏪</div>
                  <h3 className="font-semibold text-dark-navy text-sm mb-1">Tienda CALI</h3>
                  <p className="text-xs text-neutral-gray">
                    Compra items únicos
                  </p>
                </div>
              </Link>

              <Link href="/feed">
                <div className="p-4 bg-pink-50 border-2 border-pink-200 rounded-xl hover:border-pink-400 transition-colors cursor-pointer h-full">
                  <div className="text-3xl mb-2">📱</div>
                  <h3 className="font-semibold text-dark-navy text-sm mb-1">Feed Social</h3>
                  <p className="text-xs text-neutral-gray">
                    Ver posts de amigos
                  </p>
                </div>
              </Link>

              <Link href="/notifications">
                <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-xl hover:border-orange-400 transition-colors cursor-pointer h-full relative">
                  <div className="text-3xl mb-2">🔔</div>
                  <h3 className="font-semibold text-dark-navy text-sm mb-1">Notificaciones</h3>
                  <p className="text-xs text-neutral-gray">
                    Ver actualizaciones
                  </p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Avatar CALI Card */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>🎨 Tu Avatar CALI</span>
              <Link href="/avatar">
                <Button variant="outline" size="sm">
                  Personalizar →
                </Button>
              </Link>
            </CardTitle>
            <CardDescription>
              Expresa tu personalidad con accesorios únicos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Nivel de Energía:</span>
                  <span className={`text-sm font-bold ${energyColor}`}>
                    {energyLevel} ({profile?.avatarEnergy}/100)
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Completa retos para aumentar la energía de tu CALI
                </p>
                <div className="flex gap-2">
                  <Link href="/avatar">
                    <Button size="sm" variant="outline">
                      Ver Editor
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="text-6xl">
                {profile?.avatarEnergy && profile.avatarEnergy >= 70 ? '😊' : 
                 profile?.avatarEnergy && profile.avatarEnergy >= 40 ? '😐' : '😴'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Welcome Message */}
        <Card>
          <CardHeader>
            <CardTitle>Tu Viaje de Desconexión Digital</CardTitle>
            <CardDescription>
              Estás a punto de comenzar una experiencia transformadora
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-neutral-gray">
              Calixo te ayudará a desconectarte del mundo digital de manera saludable.
              Completa retos diarios, personaliza tu avatar CALI y comparte tu progreso
              con una comunidad que valora el bienestar.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-beige rounded-xl">
                <div className="text-2xl mb-2">🎯</div>
                <h3 className="font-semibold text-dark-navy mb-1">Retos Diarios</h3>
                <p className="text-sm text-neutral-gray">
                  Completa desafíos de desconexión y gana monedas
                </p>
              </div>

              <div className="p-4 bg-beige rounded-xl">
                <div className="text-2xl mb-2">🎨</div>
                <h3 className="font-semibold text-dark-navy mb-1">Avatar CALI</h3>
                <p className="text-sm text-neutral-gray">
                  Personaliza tu avatar con accesorios únicos
                </p>
              </div>

              <div className="p-4 bg-beige rounded-xl">
                <div className="text-2xl mb-2">👥</div>
                <h3 className="font-semibold text-dark-navy mb-1">Comunidad</h3>
                <p className="text-sm text-neutral-gray">
                  Comparte tu progreso y sigue a otros usuarios
                </p>
              </div>

              <div className="p-4 bg-beige rounded-xl">
                <div className="text-2xl mb-2">🏆</div>
                <h3 className="font-semibold text-dark-navy mb-1">Logros</h3>
                <p className="text-sm text-neutral-gray">
                  Desbloquea hitos y mantén tu racha
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle>Información de la Cuenta</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-neutral-gray">Email:</dt>
                <dd className="font-medium">{user.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-gray">Nombre:</dt>
                <dd className="font-medium">{profile?.displayName || 'No configurado'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-gray">Tipo de Cuenta:</dt>
                <dd className="font-medium">
                  {profile?.isPremium ? 'Premium ✓' : 'Gratuita'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-gray">Privacidad:</dt>
                <dd className="font-medium">
                  {profile?.isPrivate ? 'Perfil Privado 🔒' : 'Perfil Público 🌍'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-gray">Miembro desde:</dt>
                <dd className="font-medium">
                  {new Date(user.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="border-soft-blue">
          <CardHeader>
            <CardTitle>✅ Fases 4, 5 y 6 Completadas</CardTitle>
            <CardDescription>
              Sistema completo de retos, avatar y tienda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="font-semibold text-green-700 mb-2">Fase 4: Sistema de Retos</div>
              <div className="flex items-center gap-2 text-green-600 text-sm ml-4">
                <span>✅</span>
                <span>Retos Diarios, Enfoque y Sociales</span>
              </div>
              
              <div className="font-semibold text-green-700 mb-2 mt-4">Fase 5: Avatar CALI</div>
              <div className="flex items-center gap-2 text-green-600 text-sm ml-4">
                <span>✅</span>
                <span>Editor de avatar con 6 categorías</span>
              </div>
              
              <div className="font-semibold text-green-700 mb-2 mt-4">Fase 6: Tienda y Monedas</div>
              <div className="flex items-center gap-2 text-green-600 text-sm ml-4">
                <span>✅</span>
                <span>Tienda completa con filtros</span>
              </div>
              
              <div className="font-semibold text-green-700 mb-2 mt-4">Fase 7: Feed Social</div>
              <div className="flex items-center gap-2 text-green-600 text-sm ml-4">
                <span>✅</span>
                <span>Feed con posts de retos</span>
              </div>
              
              <div className="font-semibold text-green-700 mb-2 mt-4">Fase 8: Subscripciones</div>
              <div className="flex items-center gap-2 text-green-600 text-sm ml-4">
                <span>✅</span>
                <span>Integración completa con Stripe</span>
              </div>
              
              <div className="font-semibold text-green-700 mb-2 mt-4">Fase 9: Notificaciones</div>
              <div className="flex items-center gap-2 text-green-600 text-sm ml-4">
                <span>✅</span>
                <span>Sistema de notificaciones completo</span>
              </div>
              <div className="flex items-center gap-2 text-green-600 text-sm ml-4">
                <span>✅</span>
                <span>Badges y contadores en tiempo real</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-neutral-gray font-semibold mb-2">Próximas fases:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-neutral-gray">
                <li>Admin Panel (Fase 10)</li>
                <li>PWA Optimización (Fase 11)</li>
                <li>Analytics (Fase 12)</li>
                <li>Testing & Deploy (Fase 13)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

