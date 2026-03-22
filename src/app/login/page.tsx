'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email veya şifre hatalı. Demo: test@gollazim.com / test123');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('Giriş yapılırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full border-2 border-green-400 bg-[#1a1a35] flex items-center justify-center mx-auto mb-3 shadow-lg shadow-green-400/20">
            <span className="text-white font-black text-xs leading-none text-center">GOL<br/>LAZIM</span>
          </div>
          <h1 className="text-2xl font-black text-white">
            HOŞ GEL<span className="text-green-400">DİN</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">AI destekli futbol analizine giriş yap</p>
        </div>

        {/* Demo info */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-3 mb-4">
          <p className="text-blue-300 text-xs font-medium mb-1">Demo Hesapları</p>
          <div className="space-y-1">
            <p className="text-blue-400/70 text-xs">Premium: <code>test@gollazim.com</code> / <code>test123</code></p>
            <p className="text-blue-400/70 text-xs">Ücretsiz: <code>uye@gollazim.com</code> / <code>uye123</code></p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email adresi"
                required
                className="w-full bg-[#13132a] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 text-sm outline-none focus:border-green-500/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Şifre"
                required
                className="w-full bg-[#13132a] border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white placeholder-gray-600 text-sm outline-none focus:border-green-500/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-900/20 border border-red-500/30 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-gray-500 text-xs hover:text-gray-300 transition-colors">
            ← Giriş yapmadan devam et
          </Link>
        </div>
      </div>
    </div>
  );
}
