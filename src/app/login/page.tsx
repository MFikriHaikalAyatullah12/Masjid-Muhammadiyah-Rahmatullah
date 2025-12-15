'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Mail, Lock, User } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    nama: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();

      if (data.success) {
        router.push('/');
        router.refresh();
      } else {
        setError(data.error || 'Login gagal');
      }
    } catch (error) {
      setError('Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (registerData.password !== registerData.confirmPassword) {
      setError('Password tidak cocok');
      setLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setError('Password minimal 6 karakter');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: registerData.nama,
          email: registerData.email,
          password: registerData.password
        })
      });

      const data = await response.json();

      if (data.success) {
        setIsLogin(true);
        setError('');
        setRegisterData({ nama: '', email: '', password: '', confirmPassword: '' });
        alert('Registrasi berhasil! Silakan login.');
      } else {
        setError(data.error || 'Registrasi gagal');
      }
    } catch (error) {
      setError('Terjadi kesalahan saat registrasi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/30 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/50 backdrop-blur-xl border border-white/20 animate-float">
            <LogIn className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-3">
            Sistem Administrasi Masjid
          </h1>
          <p className="text-gray-300 text-lg">
            {isLogin ? 'Selamat datang kembali' : 'Buat akun baru Anda'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Toggle */}
          <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                isLogin
                  ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-white shadow-lg shadow-emerald-500/50'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
              suppressHydrationWarning
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                !isLogin
                  ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-white shadow-lg shadow-emerald-500/50'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
              suppressHydrationWarning
            >
              Register
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 backdrop-blur-xl border border-red-500/30 rounded-xl text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-400 transition-colors" />
                  <input
                    type="email"
                    required
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 backdrop-blur-xl transition-all"
                    placeholder="email@example.com"
                    suppressHydrationWarning
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-400 transition-colors" />
                  <input
                    type="password"
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 backdrop-blur-xl transition-all"
                    placeholder="••••••••"
                    suppressHydrationWarning
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-3 rounded-xl font-medium hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-lg shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                suppressHydrationWarning
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Nama Lengkap
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-400 transition-colors" />
                  <input
                    type="text"
                    required
                    value={registerData.nama}
                    onChange={(e) => setRegisterData({ ...registerData, nama: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 backdrop-blur-xl transition-all"
                    placeholder="Nama Anda"
                    suppressHydrationWarning
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-400 transition-colors" />
                  <input
                    type="email"
                    required
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 backdrop-blur-xl transition-all"
                    placeholder="email@example.com"
                    suppressHydrationWarning
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-400 transition-colors" />
                  <input
                    type="password"
                    required
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 backdrop-blur-xl transition-all"
                    placeholder="Minimal 6 karakter"
                    suppressHydrationWarning
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Konfirmasi Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-400 transition-colors" />
                  <input
                    type="password"
                    required
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 backdrop-blur-xl transition-all"
                    placeholder="Ulangi password"
                    suppressHydrationWarning
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-3 rounded-xl font-medium hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-lg shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                suppressHydrationWarning
              >
                {loading ? 'Memproses...' : 'Daftar'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          © 2025 Sistem Administrasi Masjid
        </p>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
