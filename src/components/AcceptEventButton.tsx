'use client';

import { useState } from 'react';
import { Check, ShieldCheck, X, Eye, EyeOff, Loader2 } from 'lucide-react';
import { acceptEvent } from '@/lib/actions';

interface AcceptEventButtonProps {
  eventId: string;
  eventName: string;
  eventTime: string;
  eventRoom: string;
}

export default function AcceptEventButton({
  eventId,
  eventName,
  eventTime,
  eventRoom,
}: AcceptEventButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    setPassword('');
    setError(null);
  };

  const handleClose = () => {
    if (loading) return;
    setIsOpen(false);
    setPassword('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter the verification password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await acceptEvent(eventId, password);
      if (res && res.error) {
        setError(res.error);
        setLoading(false);
      } else {
        setIsOpen(false);
        setPassword('');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Verification failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        title="Accept Event (Requires Verification Password)"
        className="p-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
      >
        <Check className="h-3 w-3 stroke-[3]" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-gray-900 border border-gray-700/80 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-800 flex items-start justify-between bg-gray-950/50">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-emerald-950/70 border border-emerald-700/60 rounded-xl text-emerald-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Security Verification</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Authorized approval required to confirm event
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="text-gray-400 hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Event Preview Card */}
              <div className="bg-gray-950/60 border border-gray-800 rounded-xl p-3 text-xs space-y-1">
                <div className="font-semibold text-white truncate text-sm">{eventName}</div>
                <div className="text-gray-400 flex items-center space-x-2">
                  <span>{eventTime}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-medium">{eventRoom}</span>
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold text-gray-300">
                  Admin Verification Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Enter verification password"
                    autoFocus
                    required
                    disabled={loading}
                    className="w-full px-3.5 py-2.5 pr-10 bg-gray-950 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-800 text-xs text-red-300 font-medium animate-in fade-in">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition-colors flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                      <span>Verify &amp; Accept</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
