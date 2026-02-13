'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { ProfilePhotoModal } from '@/components/profile/profile-photo-modal';
import { ProfileSettingsModal } from '@/components/profile/profile-settings-modal';
import { FollowersModal } from '@/components/profile/followers-modal';
import { EnergyBanner } from '@/components/profile/energy-banner';
import { PremiumBadge } from '@/components/profile/premium-badge';
import Image from 'next/image';

type Profile = {
  userId: string;
  displayName: string;
  avatarEnergy: number;
  isPrivate: boolean;
  isPremium: boolean;
  coins: number;
  createdAt: Date;
  updatedAt: Date;
  profilePhotoUrl?: string | null;
  profilePhotoPath?: string | null;
  email?: string | null;
  gender?: string | null;
  birthDate?: string | null;
};

type ProfileStats = {
  challengesCompleted: number;
  followersCount: number;
  followingCount: number;
};

type UserChallenge = {
  id: number;
  challengeId: number;
  challengeTitle: string;
  challengeType: string;
  reward: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'canceled';
  statusDate: string;
  startedAt?: string;
  completedAt?: string;
  failedAt?: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [loadingChallenges, setLoadingChallenges] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followersModalType, setFollowersModalType] = useState<'followers' | 'following'>('followers');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    fetchUserChallenges();
  }, [currentPage]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/profile');
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Error al cargar el perfil');
      }

      const data = await response.json();
      setProfile(data.profile);
      setStats(data.stats || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserChallenges = async () => {
    try {
      setLoadingChallenges(true);
      const response = await fetch(`/api/profile/challenges?page=${currentPage}&limit=5`);
      
      if (!response.ok) {
        if (response.status === 401) {
          return;
        }
        throw new Error('Error al cargar los retos');
      }

      const data = await response.json();
      setUserChallenges(data.challenges || []);
      setPagination(data.pagination || {
        page: 1,
        limit: 5,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      });
    } catch (err) {
      console.error('Error fetching challenges:', err);
    } finally {
      setLoadingChallenges(false);
    }
  };

  const getChallengeTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      daily: 'Diario',
      focus: 'Enfoque',
      social: 'Social',
    };
    return labels[type] || type;
  };

  const getChallengeTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      daily: 'bg-blue-100 text-blue-800',
      focus: 'bg-purple-100 text-purple-800',
      social: 'bg-green-100 text-green-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      in_progress: 'En Progreso',
      completed: 'Completado',
      failed: 'Fallido',
      canceled: 'Cancelado',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      canceled: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusDateLabel = (challenge: UserChallenge) => {
    if (challenge.status === 'completed' && challenge.completedAt) {
      return 'Completado el';
    } else if (challenge.status === 'failed' && challenge.failedAt) {
      return 'Fallido el';
    } else if (challenge.status === 'canceled' && challenge.failedAt) {
      return 'Cancelado el';
    } else if (challenge.startedAt) {
      return 'Iniciado el';
    }
    return 'Creado el';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-red-600">
                {error || 'No se pudo cargar el perfil'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header - Layout optimizado para móvil y desktop */}
        <div className="mb-6 relative">
          {/* Botón ajustes - esquina superior derecha en móvil */}
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="absolute top-0 right-0 p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:hidden z-10"
            aria-label="Ajustes del perfil"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Fila superior: foto + info en móvil, todo en línea en desktop */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
            {/* Foto - monedas debajo solo en móvil */}
            <div className="flex flex-col items-center sm:items-start gap-3 flex-shrink-0">
              <button
                onClick={() => setIsPhotoModalOpen(true)}
                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-neutral/20 hover:border-primary/50 transition-colors cursor-pointer bg-gray-100"
                aria-label="Cambiar foto de perfil"
              >
                {profile.profilePhotoUrl ? (
                  <Image
                    src={profile.profilePhotoUrl}
                    alt="Foto de perfil"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400" />
                )}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                  <span className="text-white text-xs font-medium opacity-0 hover:opacity-100 transition-opacity">
                    Cambiar
                  </span>
                </div>
              </button>
              {/* Monedas debajo de la foto - solo móvil */}
              <div className="flex sm:hidden items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <span className="text-primary font-semibold text-sm">{profile.coins}</span>
                <span className="text-neutral text-xs">monedas</span>
              </div>
            </div>

            {/* Nombre + badge + ajustes + monedas (desktop) + stats */}
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                  {profile.displayName}
                </h1>
                {profile.isPremium && (
                  <PremiumBadge size={20} className="flex-shrink-0" />
                )}
                <button
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="hidden sm:flex p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label="Ajustes del perfil"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
                </div>
                {/* Monedas a la derecha - solo desktop */}
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 flex-shrink-0">
                  <span className="text-primary font-semibold text-base">{profile.coins}</span>
                  <span className="text-neutral text-sm">monedas</span>
                </div>
              </div>

              {/* Stats: Retos, Seguidores, Siguiendo - compactos en móvil */}
              <div className="flex justify-center sm:justify-start gap-6 sm:gap-8 mt-4 text-sm">
                <div className="flex flex-col items-center sm:items-start gap-0.5">
                  <span className="font-semibold text-gray-900 text-base">
                    {stats?.challengesCompleted ?? 0}
                  </span>
                  <span className="text-gray-600 text-xs sm:text-sm">Retos</span>
                </div>
                <button
                  onClick={() => {
                    setFollowersModalType('followers');
                    setFollowersModalOpen(true);
                  }}
                  className="hover:opacity-80 transition-opacity flex flex-col items-center sm:items-start gap-0.5"
                >
                  <span className="font-semibold text-gray-900 text-base">
                    {stats?.followersCount ?? 0}
                  </span>
                  <span className="text-gray-600 text-xs sm:text-sm">Seguidores</span>
                </button>
                <button
                  onClick={() => {
                    setFollowersModalType('following');
                    setFollowersModalOpen(true);
                  }}
                  className="hover:opacity-80 transition-opacity flex flex-col items-center sm:items-start gap-0.5"
                >
                  <span className="font-semibold text-gray-900 text-base">
                    {stats?.followingCount ?? 0}
                  </span>
                  <span className="text-gray-600 text-xs sm:text-sm">Siguiendo</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Banner de energía */}
        <EnergyBanner energy={profile.avatarEnergy} />

        {/* Profile Photo Modal */}
        <ProfilePhotoModal
          isOpen={isPhotoModalOpen}
          currentPhotoUrl={profile.profilePhotoUrl || null}
          onClose={() => setIsPhotoModalOpen(false)}
          onPhotoUpdated={(newPhotoUrl) => {
            // Update profile immediately if URL is provided
            if (newPhotoUrl !== undefined) {
              setProfile(prev => prev ? { ...prev, profilePhotoUrl: newPhotoUrl || null } : null);
            }
            // Always refresh profile to get latest data
            fetchProfile();
            setIsPhotoModalOpen(false);
          }}
        />

        {/* Profile Settings Modal */}
        <ProfileSettingsModal
          isOpen={isSettingsModalOpen}
          currentProfile={{
            displayName: profile.displayName,
            email: profile.email || null,
            gender: profile.gender || null,
            birthDate: profile.birthDate || null,
            isPrivate: profile.isPrivate,
          }}
          onClose={() => setIsSettingsModalOpen(false)}
          onProfileUpdated={() => {
            fetchProfile();
            setIsSettingsModalOpen(false);
          }}
        />

        <FollowersModal
          isOpen={followersModalOpen}
          type={followersModalType}
          onClose={() => setFollowersModalOpen(false)}
        />

        {/* Error Message */}
        {error && (
          <Card className="border-red-300 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Mis Retos</CardTitle>
            <CardDescription>
              Historial de todos tus retos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingChallenges ? (
              <div className="text-center py-8">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
                </div>
              </div>
            ) : userChallenges.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No has iniciado ningún reto aún.</p>
                <p className="text-sm mt-2">¡Comienza un reto para verlo aquí!</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {userChallenges.map((challenge) => (
                    <div
                      key={challenge.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getChallengeTypeColor(challenge.challengeType)}`}>
                            {getChallengeTypeLabel(challenge.challengeType)}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(challenge.status)}`}>
                            {getStatusLabel(challenge.status)}
                          </span>
                          <h3 className="font-semibold text-gray-900">
                            {challenge.challengeTitle}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-500">
                          {getStatusDateLabel(challenge)} {new Date(challenge.statusDate).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      {challenge.status === 'completed' && (
                        <div className="ml-4 text-right">
                          <p className="text-lg font-bold text-green-600">
                            +{challenge.reward}
                          </p>
                          <p className="text-xs text-gray-500">monedas</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Paginación */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Mostrando {((currentPage - 1) * pagination.limit) + 1} - {Math.min(currentPage * pagination.limit, pagination.total)} de {pagination.total} retos
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={!pagination.hasPrevPage || loadingChallenges}
                      >
                        Anterior
                      </Button>
                      <span className="text-sm text-gray-600 px-2">
                        Página {currentPage} de {pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={!pagination.hasNextPage || loadingChallenges}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

