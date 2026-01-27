'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface CouponCardProps {
  coupon: {
    id: number;
    code: string;
    discountPercent: number;
    partnerName: string;
    description: string | null;
    price: number;
    validUntil: string;
    owned?: boolean;
    canPurchase?: boolean;
  };
  onPurchase: (couponId: number) => void;
  isPurchasing: boolean;
}

export function CouponCard({ coupon, onPurchase, isPurchasing }: CouponCardProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className={`
      relative transition-all hover:shadow-lg
      ${coupon.owned ? 'opacity-60 border-green-300' : 'border-blue-200'}
    `}>
      {/* Owned badge */}
      {coupon.owned && (
        <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
          ✓ Comprado
        </div>
      )}

      {/* Discount badge */}
      <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold">
        -{coupon.discountPercent}%
      </div>

      <CardHeader>
        <div className="text-center mb-2">
          <div className="text-5xl mb-2">🎟️</div>
        </div>
        <CardTitle className="text-center text-lg">
          {coupon.partnerName}
        </CardTitle>
        {/* Solo mostrar código si está comprado */}
        {coupon.owned && (
          <div className="text-center mt-2">
            <p className="text-sm font-mono font-semibold text-blue-600">
              {coupon.code}
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {coupon.description && (
          <p className="text-sm text-gray-600 text-center mb-4 line-clamp-2">
            {coupon.description}
          </p>
        )}

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Descuento:</span>
            <span className="font-bold text-green-600">
              {coupon.discountPercent}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Válido hasta:</span>
            <span className="text-gray-700">
              {formatDate(coupon.validUntil)}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <div className="text-center w-full">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl font-bold text-yellow-600">
              🪙 {coupon.price === 0 ? 'Gratis' : coupon.price}
            </span>
          </div>
        </div>

        {coupon.owned ? (
          <div className="w-full space-y-2">
            <Button variant="outline" disabled className="w-full">
              ✓ Ya lo tienes
            </Button>
            <Link href="/store/purchased" className="block">
              <Button variant="ghost" size="sm" className="w-full text-xs">
                Ver en mi colección →
              </Button>
            </Link>
          </div>
        ) : coupon.canPurchase ? (
          <Button
            onClick={() => onPurchase(coupon.id)}
            disabled={isPurchasing}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold"
          >
            {isPurchasing ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                Comprando...
              </span>
            ) : (
              <span>Comprar cupón</span>
            )}
          </Button>
        ) : (
          <div className="w-full">
            <Button variant="outline" disabled className="w-full">
              No disponible
            </Button>
            <p className="text-xs text-gray-500 text-center mt-1">
              💸 Monedas insuficientes
            </p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
