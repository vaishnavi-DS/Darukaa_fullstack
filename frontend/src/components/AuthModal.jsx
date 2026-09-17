import React, { useState } from 'react';
import { X, Lock, UserPlus, LogIn, ArrowRight, AlertCircle } from 'lucide-react';
import api from '../api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    const endpoint = isLoginMode ? '/auth/login' : '/auth/register';
    const payload = isLoginMode
      ? { email: cleanEmail, password }
      : { email: cleanEmail, password, full_name: fullName || undefined, role: 'admin' };

    api.post(endpoint, payload)
      .then(res => {
        setLoading(false);
        localStorage.setItem('token', res.data.access_token);
        onAuthSuccess(res.data.user);
        onClose();
      })
      .catch(err => {
        setLoading(false);
        if (!err.response) {
          // Network Error / Backend not running
          setError('Backend server is offline. Please start the backend with: uvicorn app.main:app --port 8000');
          return;
        }

        const detail = err.response?.data?.detail;
        if (typeof detail === 'string') {
          setError(detail);
        } else if (Array.isArray(detail)) {
          setError(detail.map(d => d.msg).join(', '));
        } else {
          setError('Authentication failed. Please check your email and password.');
        }
      });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isLoginMode ? 'Sign In to Darukaa.Earth' : 'Register Account'}
              </h3>
              <p className="text-xs text-slate-500">Zero-config SQLite DB Enabled</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Sign In vs Register */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => { setIsLoginMode(true); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center space-x-1.5 transition-all ${
              isLoginMode ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => { setIsLoginMode(false); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center space-x-1.5 transition-all ${
              !isLoginMode ? 'bg-white text-emerald-700 shadow-xs border border-slate-200' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
            <span>Register Account</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium space-y-1.5 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p>{error}</p>
                  {isLoginMode && error.includes('No account found') && (
                    <button
                      type="button"
                      onClick={() => { setIsLoginMode(false); setError(''); }}
                      className="inline-flex items-center text-xs font-bold text-emerald-800 underline hover:text-emerald-900 mt-1"
                    >
                      Switch to Register with {email || 'this email'} <ArrowRight className="w-3 h-3 ml-1" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {!isLoginMode && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Full Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Elena Vance"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Gmail / Email Address</label>
              <input
                type="email"
                required
                placeholder="e.g. yourname@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-md transition-colors shadow-xs mt-2"
            >
              {loading ? 'Processing...' : (isLoginMode ? 'Sign In' : 'Create & Sign In Account')}
            </button>
          </form>

          <div className="text-center pt-1">
            <p className="text-[11px] text-slate-400">
              {isLoginMode ? 'New user?' : 'Existing user?'}{' '}
              <button
                type="button"
                onClick={() => { setIsLoginMode(!isLoginMode); setError(''); }}
                className="text-emerald-700 hover:underline font-semibold"
              >
                {isLoginMode ? 'Register with Gmail' : 'Sign in to account'}
              </button>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
