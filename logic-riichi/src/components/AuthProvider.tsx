"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@/lib/auth";
import { onAuthStateChange, getUser } from "@/lib/auth";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 初回: 現在のユーザーを取得
    getUser().then((u) => {
      setUser(u ?? null);
      setLoading(false);
    });

    // 変更を監視
    const { data } = onAuthStateChange((u) => {
      setUser(u);
      setLoading(false);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext value={{ user, loading }}>
      {children}
    </AuthContext>
  );
}
