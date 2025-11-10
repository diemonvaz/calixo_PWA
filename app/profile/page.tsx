'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Profile = {
  userId: string;
  displayName: string;
  avatarEnergy: number;
  isPrivate: boolean;
  isPremium: boolean;
  coins: number;
  streak: number;
  createdAt: Date;
  updatedAt: Date;
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [displayName, setDisplayName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

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
      setDisplayName(data.profile.displayName);
      setIsPrivate(data.profile.isPrivate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName,
          isPrivate,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al actualizar el perfil');
      }

      const data = await response.json();
      setProfile(data.profile);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setDisplayName(profile.displayName);
      setIsPrivate(profile.isPrivate);
    }
    setEditing(false);
    setError(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
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

  const energyLevel = 
    profile.avatarEnergy >= 70 ? 'Alta' :
    profile.avatarEnergy >= 40 ? 'Media' : 'Baja';

  const energyColor =
    profile.avatarEnergy >= 70 ? 'text-green-600' :
    profile.avatarEnergy >= 40 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <Button onClick={() => router.push('/dashboard')} variant="outline">
            Volver al Dashboard
          </Button>
        </div>

        {error && (
          <Card className="border-red-300 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>
                  Gestiona tu perfil y preferencias
                </CardDescription>
              </div>
              {!editing && (
                <Button onClick={() => setEditing(true)} variant="outline" size="sm">
                  Editar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de Usuario
              </label>
              {editing ? (
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tu nombre"
                />
              ) : (
                <p className="text-gray-900">{profile.displayName}</p>
              )}
            </div>

            {/* Privacy */}
            <div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  disabled={!editing}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Perfil Privado
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Los perfiles privados solo son visibles para tus seguidores
              </p>
            </div>

            {editing && (
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
                <Button onClick={handleCancel} variant="outline" disabled={saving}>
                  Cancelar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estadísticas</CardTitle>
            <CardDescription>
              Tu progreso en Calixo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{profile.coins}</p>
                <p className="text-sm text-gray-600">Monedas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{profile.streak}</p>
                <p className="text-sm text-gray-600">Racha (días)</p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-bold ${energyColor}`}>
                  {profile.avatarEnergy}
                </p>
                <p className="text-sm text-gray-600">Energía ({energyLevel})</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {profile.isPremium ? '✓' : '✗'}
                </p>
                <p className="text-sm text-gray-600">
                  {profile.isPremium ? 'Premium' : 'Gratuito'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información de la Cuenta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Cuenta Creada:</span>
              <span className="text-gray-900">
                {new Date(profile.createdAt).toLocaleDateString('es-ES')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Última Actualización:</span>
              <span className="text-gray-900">
                {new Date(profile.updatedAt).toLocaleDateString('es-ES')}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

