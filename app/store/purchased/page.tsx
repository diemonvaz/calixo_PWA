'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';

interface PurchasedCoupon {
  purchase: {
    id: number;
    purchasedAt: string;
  };
  coupon: {
    id: number;
    code: string;
    discountPercent: number;
    partnerName: string;
    description: string | null;
    price: number;
    validUntil: string;
  } | null;
  transaction: {
    id: number;
    amount: number;
    description: string | null;
    createdAt: string;
  } | null;
}

interface PurchasedData {
  items: PurchasedCoupon[];
  total: number;
}

export default function PurchasedCouponsPage() {
  const router = useRouter();
  const [data, setData] = useState<PurchasedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);

  useEffect(() => {
    fetchPurchasedCoupons();
  }, [selectedPartner]);

  const fetchPurchasedCoupons = async () => {
    try {
      const response = await fetch('/api/store/purchased');
      if (!response.ok) {
        throw new Error('Error al cargar cupones comprados');
      }
      const purchasedData = await response.json();
      setData(purchasedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredItems = selectedPartner
    ? data?.items.filter(item => item.coupon?.partnerName === selectedPartner) || []
    : data?.items || [];

  const partners = Array.from(
    new Set(data?.items.map(item => item.coupon?.partnerName).filter(Boolean)) || []
  ) as string[];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-red-600">{error || 'Error al cargar datos'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-gray-900">
              Mi Colección
            </h1>
            <Link href="/store">
              <Button variant="outline">
                Ir a Tienda
              </Button>
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">{data.total}</CardTitle>
              <CardDescription>Cupones Comprados</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl text-blue-600">
                {partners.length}
              </CardTitle>
              <CardDescription>Socios Diferentes</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl text-green-600">
                {data.items.filter(item => {
                  if (!item.coupon) return false;
                  const validUntil = new Date(item.coupon.validUntil);
                  return validUntil > new Date();
                }).length}
              </CardTitle>
              <CardDescription>Válidos Actualmente</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Partner Filters */}
        {partners.length > 0 && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedPartner === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPartner(null)}
                >
                  Todos ({data.total})
                </Button>
                {partners.map((partner) => {
                  const count = data.items.filter(item => item.coupon?.partnerName === partner).length;
                  return (
                    <Button
                      key={partner}
                      variant={selectedPartner === partner ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPartner(partner)}
                    >
                      {partner} ({count})
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Purchased Coupons Grid */}
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {selectedPartner ? 'No hay cupones de este socio' : 'No has comprado ningún cupón'}
              </h2>
              <p className="text-gray-600 mb-4">
                {selectedPartner 
                  ? 'Intenta seleccionar otro socio o compra más cupones'
                  : 'Visita la tienda para comenzar a comprar cupones de descuento'}
              </p>
              <Link href="/store">
                <Button>
                  Ir a Tienda
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(({ purchase, coupon, transaction }) => {
              if (!coupon) return null;
              
              const isValid = new Date(coupon.validUntil) > new Date();
              
              return (
                <Card
                  key={purchase.id}
                  className={`
                    relative transition-all hover:shadow-lg
                    ${!isValid ? 'opacity-60 border-gray-300' : 'border-blue-200'}
                  `}
                >
                  {/* Expired badge */}
                  {!isValid && (
                    <div className="absolute top-2 right-2 bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
                      ⏰ Expirado
                    </div>
                  )}

                  {/* Discount badge */}
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                    -{coupon.discountPercent}%
                  </div>

                  <CardHeader>
                    <div className="text-center mb-2">
                      <div className="text-5xl mb-2">🎟️</div>
                    </div>
                    <CardTitle className="text-center text-lg">
                      {coupon.partnerName}
                    </CardTitle>
                    <div className="text-center">
                      <p className="text-sm font-mono font-semibold text-blue-600">
                        {coupon.code}
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {coupon.description && (
                      <p className="text-sm text-gray-600 text-center mb-4">
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

                      {transaction && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Precio pagado:</span>
                          <span className="font-bold text-yellow-600">
                            🪙 {Math.abs(transaction.amount)}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Comprado:</span>
                        <span className="text-gray-600">
                          {formatDate(purchase.purchasedAt)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Válido hasta:</span>
                        <span className={isValid ? 'text-green-600' : 'text-red-600'}>
                          {formatDate(coupon.validUntil)}
                        </span>
                      </div>
                    </div>
                  </CardContent>

                  <CardContent className="pt-0">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs font-semibold text-blue-800 mb-1">
                        🎟️ Código: {coupon.code}
                      </p>
                      <p className="text-xs text-blue-700">
                        Usa este código en {coupon.partnerName} para obtener un {coupon.discountPercent}% de descuento
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
