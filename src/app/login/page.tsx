'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User } from 'lucide-react';

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
      // First, clear any existing cookies that might have wrong signature
      console.log('Clearing existing cookies...');
      await fetch('/api/auth/clear-cookies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('Attempting login...');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();

      if (data.success) {
        console.log('Login successful, redirecting to dashboard...');
        // Add a small delay to ensure cookie is set
        setTimeout(() => {
          window.location.href = '/';
        }, 200);
      } else {
        setError(data.error || 'Login gagal');
      }
    } catch (error) {
      console.error('Login error:', error);
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
        setError('');
        setIsLogin(true);
        setRegisterData({ nama: '', email: '', password: '', confirmPassword: '' });
        alert('Pendaftaran berhasil! Silakan login.');
      } else {
        setError(data.error || 'Pendaftaran gagal');
      }
    } catch (error) {
      setError('Terjadi kesalahan saat pendaftaran');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4 relative">
      {/* Muhammadiyah Logo Watermark untuk halaman login */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 opacity-25">
          <svg 
            viewBox="0 0 400 400" 
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Sinar-sinar matahari */}
            <g stroke="#2d5016" strokeWidth="8" strokeLinecap="round" opacity="0.4">
              {/* Sinar panjang */}
              <line x1="200" y1="20" x2="200" y2="80" />
              <line x1="200" y1="320" x2="200" y2="380" />
              <line x1="20" y1="200" x2="80" y2="200" />
              <line x1="320" y1="200" x2="380" y2="200" />
              
              {/* Sinar diagonal */}
              <line x1="56.86" y1="56.86" x2="113.72" y2="113.72" />
              <line x1="343.14" y1="56.86" x2="286.28" y2="113.72" />
              <line x1="56.86" y1="343.14" x2="113.72" y2="286.28" />
              <line x1="343.14" y1="343.14" x2="286.28" y2="286.28" />
              
              {/* Sinar medium */}
              <line x1="200" y1="30" x2="200" y2="70" />
              <line x1="200" y1="330" x2="200" y2="370" />
              <line x1="30" y1="200" x2="70" y2="200" />
              <line x1="330" y1="200" x2="370" y2="200" />
              
              {/* Sinar pendek */}
              <g strokeWidth="6">
                <line x1="85" y1="40" x2="105" y2="60" />
                <line x1="315" y1="40" x2="295" y2="60" />
                <line x1="40" y1="85" x2="60" y2="105" />
                <line x1="360" y1="85" x2="340" y2="105" />
                <line x1="85" y1="360" x2="105" y2="340" />
                <line x1="315" y1="360" x2="295" y2="340" />
                <line x1="40" y1="315" x2="60" y2="295" />
                <line x1="360" y1="315" x2="340" y2="295" />
              </g>
              
              {/* Sinar tambahan */}
              <g strokeWidth="5">
                <line x1="150" y1="25" x2="160" y2="45" />
                <line x1="250" y1="25" x2="240" y2="45" />
                <line x1="150" y1="375" x2="160" y2="355" />
                <line x1="250" y1="375" x2="240" y2="355" />
                <line x1="25" y1="150" x2="45" y2="160" />
                <line x1="25" y1="250" x2="45" y2="240" />
                <line x1="375" y1="150" x2="355" y2="160" />
                <line x1="375" y1="250" x2="355" y2="240" />
              </g>
            </g>
            
            {/* Lingkaran utama */}
            <circle cx="200" cy="200" r="85" fill="#ffffff" stroke="#2d5016" strokeWidth="4" opacity="0.7"/>
            
            {/* Kaligrafi Muhammadiyah */}
            <g fill="#2d5016" opacity="0.6">
              <path d="M140 180 Q150 160 160 180 Q170 175 180 180 Q190 165 200 180 Q210 175 220 180 Q230 160 240 180 Q250 175 260 180 L255 190 Q245 195 235 190 Q225 200 215 190 Q205 195 195 190 Q185 200 175 190 Q165 195 155 190 Q145 200 135 190 Z"/>
              <path d="M150 195 Q165 185 180 195 Q195 190 210 195 Q225 185 240 195 L235 205 Q220 210 205 205 Q190 215 175 205 Q160 210 145 205 Z"/>
              <path d="M170 205 Q180 200 190 205 Q200 202 210 205 Q220 200 230 205 L225 215 Q210 218 195 215 Q180 220 165 215 Z"/>
              <circle cx="155" cy="175" r="2"/>
              <circle cx="245" cy="175" r="2"/>
              <circle cx="200" cy="220" r="2"/>
              <circle cx="180" cy="170" r="1.5"/>
              <circle cx="220" cy="170" r="1.5"/>
            </g>
            
            {/* Figur manusia di bawah dengan tangan terangkat */}
            <g fill="#2d5016" opacity="0.5">
              {/* Figur tengah */}
              <g transform="translate(200, 290)">
                <circle cx="0" cy="-10" r="8"/>
                <rect x="-8" y="-2" width="16" height="25" rx="3"/>
                <path d="M-8 5 Q-20 -5 -25 5 Q-20 10 -12 8 M8 5 Q20 -5 25 5 Q20 10 12 8"/>
                <rect x="-6" y="23" width="4" height="15" rx="2"/>
                <rect x="2" y="23" width="4" height="15" rx="2"/>
                <path d="M-15 15 Q-20 20 -18 30 L-12 35 L-8 25 M15 15 Q20 20 18 30 L12 35 L8 25"/>
              </g>
              
              {/* Figur kiri */}
              <g transform="translate(150, 295)">
                <circle cx="0" cy="-8" r="6"/>
                <rect x="-6" y="-2" width="12" height="20" rx="2"/>
                <path d="M-6 3 Q-15 -3 -18 3 Q-15 8 -9 6 M6 3 Q15 -3 18 3 Q15 8 9 6"/>
                <rect x="-4" y="18" width="3" height="12" rx="1.5"/>
                <rect x="1" y="18" width="3" height="12" rx="1.5"/>
                <path d="M-12 12 Q-15 15 -14 22 L-9 25 L-6 20 M12 12 Q15 15 14 22 L9 25 L6 20"/>
              </g>
              
              {/* Figur kanan */}
              <g transform="translate(250, 295)">
                <circle cx="0" cy="-8" r="6"/>
                <rect x="-6" y="-2" width="12" height="20" rx="2"/>
                <path d="M-6 3 Q-15 -3 -18 3 Q-15 8 -9 6 M6 3 Q15 -3 18 3 Q15 8 9 6"/>
                <rect x="-4" y="18" width="3" height="12" rx="1.5"/>
                <rect x="1" y="18" width="3" height="12" rx="1.5"/>
                <path d="M-12 12 Q-15 15 -14 22 L-9 25 L-6 20 M12 12 Q15 15 14 22 L9 25 L6 20"/>
              </g>
              
              {/* Base/platform di bawah */}
              <rect x="120" y="330" width="160" height="40" rx="5"/>
              <rect x="130" y="340" width="140" height="20" rx="3" fill="#ffffff"/>
              <rect x="140" y="345" width="120" height="10" rx="2" fill="#2d5016"/>
            </g>
          </svg>
        </div>
        
        {/* Additional corner watermarks */}
        <div className="absolute top-8 right-8 w-20 h-20 opacity-20">
          <svg viewBox="0 0 400 400" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <g stroke="#2d5016" strokeWidth="4" strokeLinecap="round" opacity="0.6">
              <line x1="200" y1="80" x2="200" y2="120" />
              <line x1="200" y1="280" x2="200" y2="320" />
              <line x1="80" y1="200" x2="120" y2="200" />
              <line x1="280" y1="200" x2="320" y2="200" />
            </g>
            <circle cx="200" cy="200" r="50" fill="#ffffff" stroke="#2d5016" strokeWidth="3" opacity="0.8"/>
            <g fill="#2d5016" opacity="0.7">
              <path d="M185 195 Q190 190 195 195 Q200 193 205 195 Q210 190 215 195 L213 205 Q205 207 197 205 Q190 210 183 205 Z"/>
            </g>
          </svg>
        </div>
        
        <div className="absolute bottom-8 left-8 w-20 h-20 opacity-20">
          <svg viewBox="0 0 400 400" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <g stroke="#2d5016" strokeWidth="4" strokeLinecap="round" opacity="0.6">
              <line x1="200" y1="80" x2="200" y2="120" />
              <line x1="200" y1="280" x2="200" y2="320" />
              <line x1="80" y1="200" x2="120" y2="200" />
              <line x1="280" y1="200" x2="320" y2="200" />
            </g>
            <circle cx="200" cy="200" r="50" fill="#ffffff" stroke="#2d5016" strokeWidth="3" opacity="0.8"/>
            <g fill="#2d5016" opacity="0.7">
              <path d="M185 195 Q190 190 195 195 Q200 193 205 195 Q210 190 215 195 L213 205 Q205 207 197 205 Q190 210 183 205 Z"/>
            </g>
          </svg>
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Sistem Administrasi Masjid
          </h1>
          <p className="text-gray-600">
            {isLogin ? 'Selamat datang kembali' : 'Buat akun baru'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-emerald-100">
          {/* Toggle */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                isLogin
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              suppressHydrationWarning
            >
              Masuk
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                !isLogin
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              suppressHydrationWarning
            >
              Daftar
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          {/* Login Form */}
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    placeholder="email@example.com"
                    suppressHydrationWarning
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    placeholder="Masukkan password"
                    suppressHydrationWarning
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 text-white py-3 rounded-xl font-medium hover:bg-emerald-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                suppressHydrationWarning
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={registerData.nama}
                    onChange={(e) => setRegisterData({ ...registerData, nama: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    placeholder="Nama lengkap Anda"
                    suppressHydrationWarning
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    placeholder="email@example.com"
                    suppressHydrationWarning
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    placeholder="Minimal 6 karakter"
                    suppressHydrationWarning
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    placeholder="Ulangi password"
                    suppressHydrationWarning
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 text-white py-3 rounded-xl font-medium hover:bg-emerald-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                suppressHydrationWarning
              >
                {loading ? 'Memproses...' : 'Daftar'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          © 2025 Sistem Administrasi Masjid
        </p>
      </div>
    </div>
  );
}
