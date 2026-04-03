"use client";

import { useState } from "react";
import { signIn, signUp } from "@/lib/auth";

type Mode = "login" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (mode === "login") {
      const { error: err } = await signIn(email, password);
      if (err) {
        setError("メールアドレスまたはパスワードが正しくありません");
      } else {
        window.location.href = "/";
      }
    } else {
      const { error: err } = await signUp(email, password);
      if (err) {
        setError(err.message);
      } else {
        setSuccess("確認メールを送信しました。メールを確認してください。");
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <a href="/" className="inline-block">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">LogicRiichi</h1>
          </a>
          <p className="text-white/80 text-sm mt-2">
            {mode === "login" ? "ログインして学習を記録しよう" : "アカウントを作成しよう"}
          </p>
        </div>

        {/* カード */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          {/* モード切り替えタブ */}
          <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                mode === "login"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              ログイン
            </button>
            <button
              onClick={() => { setMode("signup"); setError(""); setSuccess(""); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                mode === "signup"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <ruby>新規登録<rp>(</rp><rt>しんきとうろく</rt><rp>)</rp></ruby>
            </button>
          </div>

          {/* フォーム */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base
                           focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                           transition-all outline-none"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6文字以上"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base
                           focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                           transition-all outline-none"
              />
            </div>

            {/* エラー・成功メッセージ */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-bold rounded-xl px-4 py-3" role="alert">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-bold rounded-xl px-4 py-3" role="status">
                {success}
              </div>
            )}

            {/* 送信ボタン */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 text-white font-bold text-base rounded-xl
                         hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-lg
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "..."
                : mode === "login"
                  ? "ログイン"
                  : "アカウントを作成"}
            </button>
          </form>

          {/* 区切り線 */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 border-t border-gray-200" />
            <span className="text-xs text-gray-400 font-bold">または</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          {/* ゲストモード */}
          <a
            href="/"
            className="block w-full py-3.5 bg-gray-100 text-gray-700 font-bold text-base text-center rounded-xl
                       hover:bg-gray-200 transition-all"
          >
            ゲストのまま<ruby>使<rp>(</rp><rt>つか</rt><rp>)</rp></ruby>う
          </a>

          <p className="text-xs text-gray-400 text-center mt-4 leading-relaxed">
            ログインすると、<ruby>学習<rp>(</rp><rt>がくしゅう</rt><rp>)</rp></ruby><ruby>記録<rp>(</rp><rt>きろく</rt><rp>)</rp></ruby>が<ruby>端末<rp>(</rp><rt>たんまつ</rt><rp>)</rp></ruby>をまたいで<ruby>保存<rp>(</rp><rt>ほぞん</rt><rp>)</rp></ruby>されます。
          </p>
        </div>
      </div>
    </div>
  );
}
