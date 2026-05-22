/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/MockAuthContext';
import { motion } from 'motion/react';
import { LogIn, Rocket } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    login();
    navigate('/');
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-2xl shadow-gray-200/50"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Rocket size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-sm text-gray-500">
            Login to your ArenaHub account to book your favorite slots instantly.
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Mock Credentials</p>
            <p className="mt-1 text-sm text-gray-600">Username: <span className="font-mono font-medium">exam_candidate</span></p>
            <p className="text-sm text-gray-600">Password: <span className="font-mono font-medium">••••••••</span></p>
          </div>

          <button
            onClick={handleLogin}
            className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-indigo-600 py-4 text-lg font-bold text-white transition-all hover:bg-indigo-700 active:scale-[0.98]"
          >
            <LogIn size={20} className="transition-transform group-hover:translate-x-1" />
            Sign In (Mock)
          </button>
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
