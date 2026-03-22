import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'fallback_secret',
  providers: [
    CredentialsProvider({
      name: 'Email & Şifre',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'ornek@email.com' },
        password: { label: 'Şifre', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Demo mod: test kullanıcıları
        const demoUsers = [
          { id: '1', email: 'test@gollazim.com', password: 'test123', name: 'Test Kullanıcı', role: 'premium' },
          { id: '2', email: 'uye@gollazim.com', password: 'uye123', name: 'Üye', role: 'free' },
        ];

        const user = demoUsers.find(
          u => u.email === credentials.email && u.password === credentials.password
        );

        if (user) {
          return { id: user.id, email: user.email, name: user.name, role: user.role };
        }

        // Gerçek uygulamada Supabase'den kontrol et
        return null;
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id_here'
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role || 'free';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = (token.role as string) || 'free';
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 gün
  },
};
