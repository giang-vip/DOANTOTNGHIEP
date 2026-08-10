/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GraduationCap, Lock, Mail, ChevronRight, AlertCircle, Sparkles, Loader2, Eye, EyeOff } from 'lucide-react';

interface LoginViewProps {
  onLogin: (username: string, password: string) => Promise<any>;
  isLoading: boolean;
  error: string | null;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, isLoading, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!username.trim() || !password) {
      setFormError('Vui lòng điền đầy đủ tài khoản và mật khẩu.');
      return;
    }

    await onLogin(username, password);
  };

  const handleDemoLogin = async (demoUser: string, demoPass: string) => {
    setUsername(demoUser);
    setPassword(demoPass);
    setFormError(null);
    await onLogin(demoUser, demoPass);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 blur-[100px] pointer-events-none" />

      <div 
        className="w-full max-w-5xl bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/5 border border-white flex flex-col md:flex-row relative z-10"
        style={{ animation: 'fadeInUp 0.6s ease-out forwards' }}
      >
        
        {/* Left decoration column */}
        <div className="w-full md:w-1/2 bg-slate-900 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden group">
          {/* Overlay grid lines for tech look */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] opacity-60"></div>
          
          {/* Animated gradient orb */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/30 rounded-full blur-[80px] group-hover:bg-blue-400/40 transition-colors duration-700"></div>

          <div className="relative z-10 flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30 border border-blue-400/20">
              <GraduationCap className="h-7 w-7 text-white drop-shadow-md" />
            </div>
            <div>
              <p className="text-sm font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">HƯNG NHÂN</p>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">Smart Study Portal</p>
            </div>
          </div>

          <div className="relative z-10 my-12 transform transition-transform duration-500 group-hover:scale-[1.02]">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/10 mb-6 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
              <span className="text-xs font-medium text-slate-200">Hệ thống chuyển đổi số toàn diện</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight mb-6">
              Quản lý & Hỗ trợ<br/>Học tập Hưng Nhân
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm font-medium">
              Nền tảng đào tạo hiện đại kết nối trực tiếp Sinh viên - Giảng viên - Nhà trường để tối ưu hóa tiến trình học tập.
            </p>
          </div>

          <div className="relative z-10 text-xs text-slate-500 font-medium">
            © 2026 Hưng Nhân Smart Education.
          </div>
        </div>

        {/* Right form column */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Chào mừng quay trở lại</h3>
            <p className="text-sm text-slate-500 mt-1.5 font-medium">Vui lòng đăng nhập bằng tài khoản được cấp</p>
          </div>

          {(error || formError) && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-800 text-sm flex items-start gap-3 animate-[shake_0.5s_ease-in-out]">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-700">Lỗi đăng nhập</p>
                <p className="mt-1 leading-relaxed text-rose-600/90">{formError || error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="group/input">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 group-focus-within/input:text-blue-600 transition-colors">Tên đăng nhập</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within/input:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="admin, gv_nguyenvana..."
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-slate-50/50 hover:bg-slate-50 text-sm font-semibold text-slate-800 transition-all placeholder:font-medium placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="group/input">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 group-focus-within/input:text-blue-600 transition-colors">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within/input:text-blue-500 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu..."
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-12 pr-12 py-3.5 rounded-2xl border-2 border-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 bg-slate-50/50 hover:bg-slate-50 text-sm font-semibold text-slate-800 transition-all placeholder:font-medium placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-blue-500 focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-4 mt-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 text-white font-bold text-sm shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <span>Đăng nhập vào hệ thống</span>
                  <ChevronRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo logins */}
          <div className="mt-10 pt-8 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="h-px bg-slate-100 flex-1"></span>
              Thử nghiệm nhanh
              <span className="h-px bg-slate-100 flex-1"></span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin', 'admin123')}
                disabled={isLoading}
                className="p-3.5 text-center rounded-2xl border-2 border-slate-100 hover:border-red-200 hover:bg-red-50/50 text-xs transition-all cursor-pointer group"
              >
                <p className="text-red-600 font-bold mb-1 group-hover:scale-105 transition-transform">Admin</p>
                <p className="text-[10px] text-slate-400 font-medium">admin123</p>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('gv_nguyenvana', '123')}
                disabled={isLoading}
                className="p-3.5 text-center rounded-2xl border-2 border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 text-xs transition-all cursor-pointer group"
              >
                <p className="text-blue-600 font-bold mb-1 group-hover:scale-105 transition-transform">Giảng viên</p>
                <p className="text-[10px] text-slate-400 font-medium">123</p>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('sv_nguyenxuanmanh', '123')}
                disabled={isLoading}
                className="p-3.5 text-center rounded-2xl border-2 border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 text-xs transition-all cursor-pointer group"
              >
                <p className="text-emerald-600 font-bold mb-1 group-hover:scale-105 transition-transform">Sinh viên</p>
                <p className="text-[10px] text-slate-400 font-medium">123</p>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Inline styles for custom animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
};

