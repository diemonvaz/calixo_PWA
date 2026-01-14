'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useToast } from '@/components/ui/toast';

interface NotificationItemProps {
  notification: {
    id: number;
    type: string;
    title?: string;
    message?: string;
    payload: any;
    seen: boolean;
    createdAt: Date | string;
  };
  onMarkRead: (id: number) => void;
  onRefresh?: () => void;
}

export function NotificationItem({ notification, onMarkRead, onRefresh }: NotificationItemProps) {
  const toast = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const { type, payload } = notification;

  const formatDate = (date: Date | string) => {
    const now = new Date();
    const notifDate = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(notifDate.getTime())) {
      return 'Fecha inválida';
    }
    
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    
    return notifDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
  };

  const handleFollowRequest = async (action: 'accept' | 'reject') => {
    if (!payload?.requestId) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/follow/requests/${payload.requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error('Error al procesar la solicitud');
      }

      toast.success(action === 'accept' ? 'Solicitud aceptada' : 'Solicitud rechazada');
      
      // Hide notification immediately for better UX
      setIsHidden(true);
      
      // Mark as read
      onMarkRead(notification.id);
      
      // Refresh notifications list to remove the processed notification
      if (onRefresh) {
        // Refresh immediately and then again after a short delay to ensure sync
        setTimeout(() => {
          onRefresh();
        }, 300);
      }
    } catch (error) {
      toast.error('Error al procesar la solicitud');
      console.error('Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getNotificationContent = () => {
    // Notificaciones sociales con mensajes específicos
    if (type === 'social' && payload?.type) {
      switch (payload.type) {
        case 'follow_request':
          const requesterName = payload.requesterName || 'Alguien';
          return {
            icon: '👤',
            title: 'Nueva solicitud de seguimiento',
            message: `${requesterName} te ha solicitado seguir, ¿deseas aceptar?`,
            link: null,
            hasActions: true,
            actionType: 'follow_request' as const,
          };

        case 'new_follower':
          const followerName = payload.followerName || 'Alguien';
          return {
            icon: '👤',
            title: 'Nuevo seguidor',
            message: `${followerName} comenzó a seguirte`,
            link: '/profile',
            hasActions: false,
          };

        case 'feed_like':
          const likerName = payload.likerName || 'Alguien';
          return {
            icon: '❤️',
            title: 'Le gustó tu post',
            message: `A ${likerName} le gustó tu reto completado`,
            link: '/feed',
            hasActions: false,
          };

        case 'feed_comment':
          const commenterName = payload.commenterName || 'Alguien';
          const commentText = payload.comment || '';
          return {
            icon: '💬',
            title: 'Nuevo comentario',
            message: `${commenterName} ha comentado tu post: "${commentText.substring(0, 100)}${commentText.length > 100 ? '...' : ''}"`,
            link: '/feed',
            hasActions: false,
          };

        case 'follow_request_accepted':
          const accepterName = payload.requestedName || 'Alguien';
          return {
            icon: '✅',
            title: 'Solicitud aceptada',
            message: `${accepterName} aceptó tu solicitud de seguimiento`,
            link: '/profile',
            hasActions: false,
          };
      }
    }

    // Notificaciones de retos
    if (type === 'challenge') {
      if (payload?.type === 'reminder') {
        return {
          icon: '⏰',
          title: 'Recordatorio de reto',
          message: payload.message || 'Tienes un reto pendiente',
          link: '/challenges/daily',
          hasActions: false,
        };
      }
      if (payload?.type === 'completed') {
        return {
          icon: '🎉',
          title: '¡Reto completado!',
          message: `Completaste: ${payload.challengeName}. +${payload.reward} monedas`,
          link: '/',
          hasActions: false,
        };
      }
    }

    // Notificaciones de tienda
    if (type === 'store' && payload?.type === 'item_purchased') {
      return {
        icon: '🛍️',
        title: 'Compra exitosa',
        message: `Compraste: ${payload.itemName}`,
        link: '/avatar',
        hasActions: false,
      };
    }

    // Notificaciones de suscripción
    if (type === 'subscription') {
      if (payload?.type === 'activated') {
        return {
          icon: '⭐',
          title: 'Premium activado',
          message: '¡Bienvenido a Premium! Disfruta de todas las funciones',
          link: '/subscription',
          hasActions: false,
        };
      }
      if (payload?.type === 'expired') {
        return {
          icon: '⚠️',
          title: 'Premium expirado',
          message: 'Tu subscripción Premium ha expirado',
          link: '/pricing',
          hasActions: false,
        };
      }
    }

    // Notificaciones de logros
    if (type === 'achievement') {
      return {
        icon: '🏆',
        title: 'Nuevo logro',
        message: payload.achievement || 'Desbloqueaste un nuevo logro',
        link: '/profile',
        hasActions: false,
      };
    }

    // Fallback: usar title y message si están disponibles
    if (notification.title || notification.message) {
      const getIconAndLink = () => {
        switch (type) {
          case 'challenge':
            return { icon: '🎯', link: '/challenges/daily' };
          case 'social':
            return { icon: '👥', link: '/feed' };
          case 'store':
            return { icon: '🛍️', link: '/store' };
          case 'subscription':
            return { icon: '⭐', link: '/subscription' };
          case 'achievement':
            return { icon: '🏆', link: '/profile' };
          case 'reward':
            return { icon: '💰', link: '/profile' };
          default:
            return { icon: '🔔', link: '/notifications' };
        }
      };

      const { icon, link } = getIconAndLink();
      return {
        icon,
        title: notification.title || 'Notificación',
        message: notification.message || 'Tienes una nueva notificación',
        link,
        hasActions: false,
      };
    }

    // Último fallback
    return {
      icon: '🔔',
      title: 'Notificación',
      message: 'Tienes una nueva notificación',
      link: '/notifications',
      hasActions: false,
    };
  };

  const content = getNotificationContent();

  // Hide notification if it's been processed
  if (isHidden) {
    return null;
  }

  return (
    <div
      className={`
        p-3 md:p-4 border rounded-lg transition-colors
        ${notification.seen ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'}
      `}
    >
      <div className="flex items-start gap-2 md:gap-3">
        <div className="text-2xl md:text-3xl shrink-0">{content?.icon}</div>
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm md:text-base font-semibold text-gray-900 break-words">
                {content?.title}
              </h3>
              <p className="text-xs md:text-sm text-gray-600 mt-1 break-words">
                {content?.message}
              </p>
              <p className="text-xs text-gray-500 mt-1 md:mt-2">
                {formatDate(notification.createdAt)}
              </p>
            </div>

            {!notification.seen && !content?.hasActions && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkRead(notification.id)}
                className="shrink-0 self-start sm:self-auto text-xs"
              >
                Marcar leída
              </Button>
            )}
          </div>

          {/* Botones de acción para solicitudes de seguimiento */}
          {content?.hasActions && content.actionType === 'follow_request' && (
            <div className="flex flex-col sm:flex-row gap-2 mt-3">
              <Button
                variant="default"
                size="sm"
                onClick={() => handleFollowRequest('accept')}
                disabled={isProcessing}
                className="flex-1 sm:flex-1 text-xs md:text-sm"
              >
                {isProcessing ? 'Procesando...' : 'Aceptar'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFollowRequest('reject')}
                disabled={isProcessing}
                className="flex-1 sm:flex-1 text-xs md:text-sm"
              >
                Rechazar
              </Button>
              {!notification.seen && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkRead(notification.id)}
                  className="shrink-0 text-xs md:text-sm sm:w-auto w-full"
                >
                  Marcar leída
                </Button>
              )}
            </div>
          )}

          {/* Botón de ver para notificaciones sin acciones */}
          {content?.link && !content?.hasActions && (
            <div className="flex gap-2 mt-3">
              <Link href={content.link} className="flex-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs md:text-sm"
                >
                  Ver →
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}






