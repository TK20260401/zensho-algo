"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { signOut } from "@/lib/auth";
import { getSessionStats } from "@/lib/supabase";

export default function MyPage() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<{
    total: number;
    correct: number;
    rate: number;
    tile: { total: number; correct: number };
    algorithm: { total: number; correct: number };
  } | null>(null);

  useEffect(() => {
    getSessionStats().then((s) => {
      if (s) setStats(s);
    });
  }, []);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-lg font-bold">読み込み中...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-sm w-full">
          <p className="text-gray-700 font-bold mb-4">ログインが必要です</p>
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all"
          >
            ログインページへ
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-6 sm:py-8 px-3 sm:px-4">
      <div className="max-w-lg mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-6">
          <a href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-white">LogicRiichi</h1>
          </a>
        </div>

        {/* プロフィールカード */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl">👤</span>
            </div>
            <p className="text-lg font-bold text-gray-800">{user.email}</p>
            <p className="text-xs text-gray-400 mt-1">
              <ruby>登録日<rp>(</rp><rt>とうろくび</rt><rp>)</rp></ruby>: {new Date(user.created_at).toLocaleDateString("ja-JP")}
            </p>
          </div>

          {/* 学習統計 */}
          {stats && stats.total > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-gray-500">
                <ruby>今回<rp>(</rp><rt>こんかい</rt><rp>)</rp></ruby>のセッション
              </h2>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-indigo-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-indigo-700">{stats.total}</div>
                  <div className="text-xs text-indigo-500 font-bold">
                    <ruby>回答数<rp>(</rp><rt>かいとうすう</rt><rp>)</rp></ruby>
                  </div>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-green-700">{stats.correct}</div>
                  <div className="text-xs text-green-500 font-bold">
                    <ruby>正解数<rp>(</rp><rt>せいかいすう</rt><rp>)</rp></ruby>
                  </div>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-bold text-amber-700">{stats.rate}%</div>
                  <div className="text-xs text-amber-500 font-bold">
                    <ruby>正答率<rp>(</rp><rt>せいとうりつ</rt><rp>)</rp></ruby>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-purple-50 rounded-xl p-3 text-center">
                  <div className="text-sm font-bold text-purple-700">
                    <ruby>待<rp>(</rp><rt>ま</rt><rp>)</rp></ruby>ち<ruby>牌<rp>(</rp><rt>はい</rt><rp>)</rp></ruby>
                  </div>
                  <div className="text-lg font-bold text-purple-800">
                    {stats.tile.correct}/{stats.tile.total}
                  </div>
                </div>
                <div className="bg-pink-50 rounded-xl p-3 text-center">
                  <div className="text-sm font-bold text-pink-700">アルゴリズム</div>
                  <div className="text-lg font-bold text-pink-800">
                    {stats.algorithm.correct}/{stats.algorithm.total}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* アクションボタン */}
          <div className="space-y-3 pt-2">
            <a
              href="/"
              className="block w-full py-3 bg-indigo-600 text-white font-bold text-center rounded-xl
                         hover:bg-indigo-700 transition-all"
            >
              <ruby>学習<rp>(</rp><rt>がくしゅう</rt><rp>)</rp></ruby>をつづける
            </a>
            <button
              onClick={handleSignOut}
              className="w-full py-3 bg-gray-100 text-gray-600 font-bold rounded-xl
                         hover:bg-gray-200 transition-all"
            >
              ログアウト
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
