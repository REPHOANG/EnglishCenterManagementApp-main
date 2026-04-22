import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Toast from '../UI/Toast';
import useToast from '../UI/useToast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      showToast('Please enter your email address.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:9999/api'}/users/forgot-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );
      const data = await res.json();
      showToast(data.message || 'If that email is registered, a reset link has been sent.', 'success', 5000);
      setEmail('');
    } catch (err) {
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toast toasts={toasts} onRemove={removeToast} />

      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sky-100 mb-4">
              <svg className="w-8 h-8 text-sky-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
            <p className="text-gray-500 mt-1 text-sm">Enter your email and we'll send you a reset link.</p>
          </div>

          {/* Card */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm shadow transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </>
                ) : 'Send Reset Link'}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Remember your password?{' '}
            <Link to="/login" className="text-sky-600 hover:text-sky-500 font-medium transition">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
