'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Home, Trophy, BookOpen, MessageCircle, LogIn, LogOut, User } from 'lucide-react';

const NAV_LINKS = [
  { href: '/', label: 'Analizler', icon: Home },
  { href: '/results', label: 'Sonuçlar', icon: Trophy },
  { href: '/assistant', label: 'AI Asistan', icon: MessageCircle },
  { href: '/guide', label: 'Rehber', icon: BookOpen },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-[#0a0a1a]/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-6xl mx-auto w-full px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full border-2 border-green-400 bg-[#1a1a35] flex items-center justify-center">
              <span className="text-white font-black text-[8px] leading-none text-center">GOL<br/>EBU</span>
            </div>
            <span className="text-white font-black text-xl">
              GOL<span className="text-green-400">EBU</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === href
                    ? 'bg-green-400/10 text-green-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div className="flex items-center gap-2">
            {session ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">{session.user?.name || session.user?.email}</span>
                  {(session.user as { role?: string })?.role === 'premium' && (
                    <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-0.5 rounded-full">Premium</span>
                  )}
                </div>
                <button
                  onClick={() => signOut()}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-400 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Giriş Yap
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a1a]/95 backdrop-blur-sm border-t border-white/5">
        <div className="flex items-center justify-around h-16 px-2">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors',
                pathname === href ? 'text-green-400' : 'text-gray-500'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          ))}
          {session ? (
            <button
              onClick={() => signOut()}
              className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-gray-500"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-[10px] font-medium">Çıkış</span>
            </button>
          ) : (
            <Link
              href="/login"
              className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-gray-500"
            >
              <LogIn className="w-5 h-5" />
              <span className="text-[10px] font-medium">Giriş</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0a0a1a]/95 backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-green-400 bg-[#1a1a35] flex items-center justify-center">
              <span className="text-white font-black text-[7px] leading-none text-center">GOL<br/>EBU</span>
            </div>
            <span className="text-white font-black text-lg">
              GOL<span className="text-green-400">EBU</span>
            </span>
          </Link>
          {session ? (
            <span className="text-xs text-gray-400">{session.user?.name?.split(' ')[0]}</span>
          ) : (
            <Link href="/login" className="text-xs text-green-400 font-semibold">Giriş Yap</Link>
          )}
        </div>
      </div>
    </>
  );
}
