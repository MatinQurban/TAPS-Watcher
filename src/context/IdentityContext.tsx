import React, { createContext, useContext, useState, useCallback } from 'react';

interface Identity {
  nickname: string;
  reportCount: number;
}

interface IdentityContextType {
  identity: Identity | null;
  setNickname: (name: string) => void;
  incrementReportCount: () => void;
  trustLevel: string;
}

const IdentityContext = createContext<IdentityContextType | null>(null);

function getTrustLevel(count: number): string {
  if (count >= 20) return 'Veteran';
  if (count >= 10) return 'Trusted';
  if (count >= 5) return 'Regular';
  if (count >= 1) return 'Newcomer';
  return 'New';
}

export function IdentityProvider({ children }: { children: React.ReactNode }) {
  const [identity, setIdentity] = useState<Identity | null>(() => {
    const saved = localStorage.getItem('parkwatch-identity');
    return saved ? JSON.parse(saved) : null;
  });

  const setNickname = useCallback((name: string) => {
    const updated = { nickname: name, reportCount: identity?.reportCount ?? 0 };
    setIdentity(updated);
    localStorage.setItem('parkwatch-identity', JSON.stringify(updated));
  }, [identity]);

  const incrementReportCount = useCallback(() => {
    setIdentity((prev) => {
      const updated = { nickname: prev?.nickname ?? 'Anonymous', reportCount: (prev?.reportCount ?? 0) + 1 };
      localStorage.setItem('parkwatch-identity', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const trustLevel = getTrustLevel(identity?.reportCount ?? 0);

  return (
    <IdentityContext.Provider value={{ identity, setNickname, incrementReportCount, trustLevel }}>
      {children}
    </IdentityContext.Provider>
  );
}

export function useIdentity() {
  const ctx = useContext(IdentityContext);
  if (!ctx) throw new Error('useIdentity must be used within IdentityProvider');
  return ctx;
}
