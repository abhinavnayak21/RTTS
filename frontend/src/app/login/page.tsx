'use client';

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/ui/Logo';
import api from '../../api/axios';
import './login.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await api.post<{ access_token: string; token_type: string }>(
        '/users/login',
        formData,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );

      const token = response.data.access_token;
      const user = await login(token);

      if (user?.role?.toLowerCase() === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/customer/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        setError('Cannot connect to backend API server. Please verify backend is running.');
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Left Branding Hero Panel */}
      <div className="auth-hero">
        <div className="auth-hero-brand">
          <div className="auth-hero-icon-wrapper">
            <Logo size={40} />
          </div>
          <span className="auth-hero-brand-name">RTTS</span>
        </div>

        <div className="auth-hero-content">
          <h1 className="auth-hero-title">
            Real-Time Ticket Management Made Simple.
          </h1>
          <p className="auth-hero-desc">
            Sign in to track issues, collaborate with support teams, and resolve requests seamlessly.
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-card">
          {/* Mobile-only brand header */}
          <div className="auth-mobile-brand">
            <div className="auth-mobile-icon-wrapper">
              <Logo size={36} />
            </div>
            <span className="auth-mobile-title">RTTS Support</span>
          </div>

          <div className="auth-header">
            <h2 className="auth-header-title">Welcome</h2>
            <p className="auth-header-subtitle">
              Please enter your credentials to access your dashboard.
            </p>
          </div>

          {error && (
            <div className="auth-alert-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Email Field */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="auth-input-wrapper">
                <Mail size={18} className="auth-input-icon" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="auth-input"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="auth-input-wrapper">
                <Lock size={18} className="auth-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="auth-input has-toggle"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-toggle-btn"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={isSubmitting} className="auth-submit-btn">
              {isSubmitting ? (
                'Signing in...'
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer-link">
            Need a customer account?{' '}
            <Link href="/register">
              Register as Customer &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
