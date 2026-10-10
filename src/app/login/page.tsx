'use client';

import { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ShieldCheck, Loader2, AlertCircle, CheckCircle2, Landmark } from 'lucide-react';

const inputClass =
  'w-full h-12 pl-11 pr-4 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 ' +
  'transition-[border-color,box-shadow] duration-200 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/15 ' +
  'disabled:bg-slate-50 disabled:text-slate-500';

const toggleClass =
  'absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-md text-slate-500 ' +
  'hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600';

const iconClass = 'absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none';

const submitClass =
  'w-full h-12 inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-lg ' +
  'font-semibold shadow-sm transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-600/30 ' +
  'disabled:opacity-60 disabled:cursor-not-allowed';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const allowRegistration = process.env.NEXT_PUBLIC_ALLOW_REGISTRATION === 'true';

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
    setSuccess('');

    try {
      // First, clear any existing cookies that might have wrong signature
      await fetch('/api/auth/clear-cookies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();

      if (data.success) {
        // Keep loading state on until redirect so the button doesn't flicker back
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 200);
      } else {
        setError(data.error || 'Login gagal');
        setLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Terjadi kesalahan saat login');
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

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
        setRegisterData({ nama: '', email: '', password: '', confirmPassword: '' });
        setSuccess('Pendaftaran berhasil. Silakan masuk dengan akun Anda.');
      } else {
        setError(data.error || 'Pendaftaran gagal');
      }
    } catch {
      setError('Terjadi kesalahan saat pendaftaran');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (login: boolean) => {
    setIsLogin(login);
    setError('');
    setSuccess('');
  };

  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Brand panel (desktop) */}
      <aside
        className="hidden lg:flex lg:w-[48%] xl:w-1/2 relative flex-col justify-between p-12 xl:p-16 text-white overflow-hidden bg-emerald-950"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(16,185,129,0.35),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(5,150,105,0.25),_transparent_55%)]" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '48px 48px'
          }}
        />

        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/10 ring-1 ring-white/20 flex items-center justify-center">
            <Landmark className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-semibold leading-tight">Masjid Muhammadiyah Rahmatullah</p>
            <p className="text-sm text-emerald-200/80">Sistem Administrasi</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-4xl xl:text-5xl font-bold leading-[1.1] tracking-tight text-balance">
            Kelola amanah umat dengan tertib dan transparan.
          </h2>
          <p className="mt-5 text-lg text-emerald-100/80 leading-relaxed">
            Pencatatan zakat, infaq, kas harian, dan tabungan qurban dalam satu sistem yang terpadu.
          </p>
          <ul className="mt-8 space-y-3 text-emerald-50/90">
            {['Laporan keuangan real-time', 'Data tersimpan aman dan terenkripsi', 'Akses khusus pengurus terdaftar'].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-emerald-200/60">&copy; {year} Masjid Muhammadiyah Rahmatullah</p>
      </aside>

      {/* Form panel */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-[400px]">
            {/* Brand (mobile/tablet) */}
            <div className="flex items-center gap-3 mb-8 lg:hidden">
              <div className="w-11 h-11 rounded-xl bg-emerald-950 flex items-center justify-center">
                <Landmark className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 leading-tight">Masjid Muhammadiyah Rahmatullah</p>
                <p className="text-sm text-slate-500">Sistem Administrasi</p>
              </div>
            </div>

            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {isLogin ? 'Masuk ke akun Anda' : 'Buat akun pengurus'}
              </h1>
              <p className="mt-2 text-slate-600">
                {isLogin
                  ? 'Gunakan email dan password yang terdaftar untuk melanjutkan.'
                  : 'Lengkapi data berikut untuk mendaftar sebagai pengurus.'}
              </p>
            </div>

            {/* Pendaftaran publik dinonaktifkan; aktifkan via NEXT_PUBLIC_ALLOW_REGISTRATION=true */}
            {allowRegistration && (
              <div className="grid grid-cols-2 p-1 mb-6 bg-slate-100 rounded-lg" role="tablist" aria-label="Mode autentikasi">
                {[
                  { label: 'Masuk', value: true },
                  { label: 'Daftar', value: false }
                ].map((tab) => (
                  <button
                    key={tab.label}
                    type="button"
                    role="tab"
                    aria-selected={isLogin === tab.value}
                    onClick={() => switchMode(tab.value)}
                    className={`h-10 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                      isLogin === tab.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                    suppressHydrationWarning
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {error && (
              <div role="alert" className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 rounded-lg mb-5">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-600" aria-hidden="true" />
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div role="status" className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-4 py-3 rounded-lg mb-5">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" aria-hidden="true" />
                <p>{success}</p>
              </div>
            )}

            {isLogin ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className={iconClass} aria-hidden="true" />
                    <input
                      id="login-email"
                      type="email"
                      required
                      autoComplete="email"
                      inputMode="email"
                      disabled={loading}
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className={inputClass}
                      placeholder="nama@masjid.id"
                      suppressHydrationWarning
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className={iconClass} aria-hidden="true" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      disabled={loading}
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className={`${inputClass} pr-12`}
                      placeholder="Masukkan password"
                      suppressHydrationWarning
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                      aria-pressed={showPassword}
                      className={toggleClass}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} aria-busy={loading} className={submitClass} suppressHydrationWarning>
                  {loading && <Loader2 className="w-5 h-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
                  {loading ? 'Memverifikasi...' : 'Masuk'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label htmlFor="reg-nama" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className={iconClass} aria-hidden="true" />
                    <input
                      id="reg-nama"
                      type="text"
                      required
                      autoComplete="name"
                      disabled={loading}
                      value={registerData.nama}
                      onChange={(e) => setRegisterData({ ...registerData, nama: e.target.value })}
                      className={inputClass}
                      placeholder="Nama lengkap Anda"
                      suppressHydrationWarning
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className={iconClass} aria-hidden="true" />
                    <input
                      id="reg-email"
                      type="email"
                      required
                      autoComplete="email"
                      inputMode="email"
                      disabled={loading}
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      className={inputClass}
                      placeholder="nama@masjid.id"
                      suppressHydrationWarning
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-password" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className={iconClass} aria-hidden="true" />
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      aria-describedby="reg-password-help"
                      disabled={loading}
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      className={`${inputClass} pr-12`}
                      placeholder="Minimal 6 karakter"
                      suppressHydrationWarning
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                      aria-pressed={showPassword}
                      className={toggleClass}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
                    </button>
                  </div>
                  <p id="reg-password-help" className="mt-1.5 text-xs text-slate-500">
                    Gunakan minimal 6 karakter.
                  </p>
                </div>

                <div>
                  <label htmlFor="reg-confirm" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <Lock className={iconClass} aria-hidden="true" />
                    <input
                      id="reg-confirm"
                      type={showConfirm ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      disabled={loading}
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      className={`${inputClass} pr-12`}
                      placeholder="Ulangi password"
                      suppressHydrationWarning
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      aria-label={showConfirm ? 'Sembunyikan konfirmasi password' : 'Tampilkan konfirmasi password'}
                      aria-pressed={showConfirm}
                      className={toggleClass}
                    >
                      {showConfirm ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} aria-busy={loading} className={submitClass} suppressHydrationWarning>
                  {loading && <Loader2 className="w-5 h-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
                  {loading ? 'Memproses...' : 'Daftar'}
                </button>
              </form>
            )}

            <div className="mt-8 flex items-start gap-2.5 text-xs text-slate-500 leading-relaxed">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-700" aria-hidden="true" />
              <p>Halaman ini khusus untuk pengurus masjid. Jangan bagikan kredensial Anda kepada siapa pun.</p>
            </div>
          </div>
        </div>

        <footer className="px-5 py-5 sm:px-8 text-center text-xs text-slate-400 lg:hidden">
          &copy; {year} Masjid Muhammadiyah Rahmatullah
        </footer>
      </main>
    </div>
  );
}
