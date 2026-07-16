/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GraduationCap, Lock, Mail, ChevronRight, AlertCircle, Sparkles } from 'lucide-react';

interface LoginViewProps {
  onLogin: (username: string, password: string) => Promise<any>;
  isLoading: boolean;
  error: string | null;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, isLoading, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-xl shadow-slate-100 border border-slate-100 flex flex-col md:flex-row">
        
        {/* Left decoration column */}
        <div className="w-full md:w-1/2 bg-slate-900 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Overlay grid lines for tech look */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] opacity-60"></div>
          
          <div className="relative z-10 flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest text-blue-400">HƯNG NHÂN</p>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Smart Study Portal</p>
            </div>
          </div>

          <div className="relative z-10 my-12">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/10 mb-4">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span className="text-xs font-medium text-slate-200">Hệ thống chuyển đổi số toàn diện</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight mb-4">
              Quản lý & Hỗ trợ Học tập Hưng Nhân
            </h2>
            <p className="text-sm text-slate-350 text-slate-400 leading-relaxed max-w-sm">
              Nền tảng MVVM hiện đại kết nối trực tiếp Sinh viên - Giảng viên - Nhà trường để tối ưu hóa tiến trình đào tạo.
            </p>
          </div>

          <div className="relative z-10 text-xs text-slate-500">
            © 2026 Hưng Nhân Smart Education. All rights reserved.
          </div>
        </div>

        {/* Right form column */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Chào mừng quay trở lại</h3>
            <p className="text-sm text-slate-400 mt-1">Vui lòng đăng nhập bằng tài khoản được cấp</p>
          </div>

          {(error || formError) && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 text-xs flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Lỗi đăng nhập</p>
                <p className="mt-0.5 leading-relaxed">{formError || error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tên đăng nhập</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="admin, gv_nguyenvana, sv_nguyenxuanmanh..."
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 bg-slate-50/50 text-sm font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="admin123 hoặc 123"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 bg-slate-50/50 text-sm font-medium transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-sm shadow-md shadow-blue-100 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? 'Đang xác thực...' : 'Đăng nhập vào cổng'}
              {!isLoading && <ChevronRight className="h-4 w-4" />}
            </button>
          </form>

          {/* Quick Demo logins - critical for prototype testing! */}
          <div className="mt-8 pt-8 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Thử nghiệm nhanh hệ thống (Click chọn)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin', 'admin123')}
                disabled={isLoading}
                className="p-3 text-left rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/20 text-xs font-semibold text-slate-700 transition-all cursor-pointer"
              >
                <p className="text-red-600 font-bold mb-0.5">Admin Portal</p>
                <p className="text-[10px] text-slate-400 font-normal">admin / admin123</p>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('gv_nguyenvana', '123')}
                disabled={isLoading}
                className="p-3 text-left rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/20 text-xs font-semibold text-slate-700 transition-all cursor-pointer"
              >
                <p className="text-blue-600 font-bold mb-0.5">Giảng viên</p>
                <p className="text-[10px] text-slate-400 font-normal">gv_nguyenvana / 123</p>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('sv_nguyenxuanmanh', '123')}
                disabled={isLoading}
                className="p-3 text-left rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/20 text-xs font-semibold text-slate-700 transition-all cursor-pointer"
              >
                <p className="text-emerald-600 font-bold mb-0.5">Sinh viên</p>
                <p className="text-[10px] text-slate-400 font-normal">sv_nguyenxuanmanh / 123</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
