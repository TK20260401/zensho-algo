"use client";

import { useAuth } from "./AuthProvider";

export default function AuthButton() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-10 w-24 bg-white/20 rounded-lg animate-pulse" />
    );
  }

  if (user) {
    return (
      <a
        href="/mypage"
        className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm
                   text-white text-sm font-bold rounded-lg hover:bg-white/30 transition-colors"
      >
        <span aria-hidden="true" className="text-lg">👤</span>
        <span className="hidden sm:inline max-w-[120px] truncate">
          {user.email?.split("@")[0]}
        </span>
        <span className="sm:hidden">マイページ</span>
      </a>
    );
  }

  return (
    <a
      href="/login"
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-600
                 text-sm font-bold rounded-lg shadow-md hover:shadow-lg hover:bg-indigo-50
                 transition-all active:scale-95"
    >
      <span aria-hidden="true" className="text-base">🔑</span>
      ログイン
    </a>
  );
}
