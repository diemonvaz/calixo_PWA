'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NotificationItem } from '@/components/notifications/notification-item';
import { useToast } from '@/components/ui/toast';
import { Spinner } from '@/components/ui/spinner';

interface Notification {
  id: number;
  type: string;
  title?: string;
  message?: string;
  payload: any;
  seen: boolean;
  createdAt: Date | string;
}

interface NotificationsData {
  notifications: Notification[];
  unseenCount: number;
  readCount?: number;
  total: number;
}

export default function NotificationsPage() {
  const router = useRouter();
  const toast = useToast();
  const [data, setData] = useState<NotificationsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'unread' | 'read'>('unread');

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      const params = new URLSearchParams();
      if (filter === 'unread') {
        params.append('unseenOnly', 'true');
      } else if (filter === 'read') {
        params.append('seenOnly', 'true');
      }
      
      const response = await fetch(`/api/notifications?${params}`);
      if (!response.ok) {
        throw new Error('Error al cargar notificaciones');
      }
      
      const notificationsData = await response.json();
      setData(notificationsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Error al marcar notificación');
      }

      // Refresh notifications
      await fetchNotifications();
    } catch (err) {
      console.error('Error marking notification:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Error al marcar todas');
      }

      toast.success('Todas las notificaciones marcadas como leídas');
      await fetchNotifications();
    } catch (err) {
      toast.error('Error al marcar notificaciones');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pb-20 md:pb-0">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8 px-4 md:px-6 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-4 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-2">
                Notificaciones
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                {data?.unseenCount ? `${data.unseenCount} sin leer` : 'Al día con todo'}
              </p>
            </div>
            {data && data.unseenCount > 0 && (
              <Button
                variant="outline"
                onClick={handleMarkAllRead}
                size="sm"
                className="w-full sm:w-auto shrink-0"
              >
                Marcar todas leídas
              </Button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            {error}
          </div>
        )}

        {/* Filters */}
        <Card className="mb-4 md:mb-6">
          <CardContent className="pt-4 md:pt-6 px-4 md:px-6">
            <div className="flex gap-2 overflow-x-auto">
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('unread')}
                className="whitespace-nowrap shrink-0"
              >
                Nuevas ({data?.unseenCount || 0})
              </Button>
              <Button
                variant={filter === 'read' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('read')}
                className="whitespace-nowrap shrink-0"
              >
                Leídas ({filter === 'read' ? (data?.total || 0) : (data?.readCount || 0)})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        {!data || data.notifications.length === 0 ? (
          <Card>
            <CardContent className="py-8 md:py-12 px-4 md:px-6 text-center">
              <div className="text-4xl md:text-6xl mb-3 md:mb-4">📭</div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
                {filter === 'unread' 
                  ? 'No tienes notificaciones nuevas'
                  : 'No tienes notificaciones leídas'}
              </h2>
              <p className="text-sm md:text-base text-gray-600 mb-4">
                {filter === 'unread'
                  ? '¡Estás al día con todo!'
                  : 'Las notificaciones leídas aparecerán aquí'}
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button onClick={() => router.push('/challenges/daily')} className="w-full sm:w-auto">
                  🎯 Hacer Retos
                </Button>
                {filter === 'read' && (
                  <Button 
                    variant="outline"
                    onClick={() => setFilter('unread')}
                    className="w-full sm:w-auto"
                  >
                    Ver Nuevas
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2 md:space-y-3">
            {data.notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={handleMarkRead}
                onRefresh={fetchNotifications}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}






