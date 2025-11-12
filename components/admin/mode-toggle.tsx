'use client';

import { useState } from 'react';
import { AdminRole } from '@/lib/permissions';
import { Button } from '@/components/ui/button';

interface ModeToggleProps {
  currentRole: AdminRole;
}

export function ModeToggle({ currentRole }: ModeToggleProps) {
  const [mode, setMode] = useState<'admin' | 'moderator'>(
    currentRole === 'admin' ? 'admin' : 'moderator'
  );

  // Only show toggle if user is admin (can switch to moderator mode)
  if (currentRole !== 'admin') {
    return (
      <div className="px-4 py-2 bg-neutral-gray/10 rounded-lg text-sm text-neutral-gray">
        Modo Moderador
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-neutral-gray mr-2">Modo:</span>
      <div className="flex bg-neutral-gray/10 rounded-lg p-1">
        <Button
          variant={mode === 'admin' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setMode('admin')}
          className={mode === 'admin' ? 'bg-soft-blue text-white' : ''}
        >
          Admin
        </Button>
        <Button
          variant={mode === 'moderator' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setMode('moderator')}
          className={mode === 'moderator' ? 'bg-soft-blue text-white' : ''}
        >
          Moderador
        </Button>
      </div>
    </div>
  );
}

