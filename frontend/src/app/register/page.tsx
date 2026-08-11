'use client';

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Ticket, User, Mail, Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../api/axios';
import './register.css';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'admin'>('customer');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await api.post('/users/', {
        name,
        email,
        password,
        role,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(
        err.response?.data?.detail || 'Registration failed. Email might be already in use.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Left Hero Panel */}
      <div className="auth-hero">
        <div className="auth-hero-brand">
          <div className="auth-hero-icon">
            <Ticket size={24} color="#ffffff" />
          </div>
          <span className="auth-hero-brand-name">RTTS</span>
        </div>

        <div className="auth-hero-content">
          <h1 className="auth-hero-title">
            Create Your Customer Account.
          </h1>
          <p className="auth-hero-desc">
            Get access to 24/7 technical support, submit tickets, and track resolution progress in real-time.
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-card">
          {/* Mobile-only brand header */}
          <div className="auth-mobile-brand">
            <div className="auth-mobile-icon">
              <Ticket size={22} />
            </div>
            <span className="auth-mobile-title">RTTS Support</span>
          </div>

          <div className="auth-header">
            <h2 className="auth-header-title">Create Account</h2>
            <p className="auth-header-subtitle">
              Select your role and enter your details to create an account.
            </p>
          </div>

          {error && (
            <div className="auth-alert-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="auth-alert-success">
              <CheckCircle size={18} />
              <span>Account created successfully! Redirecting to login...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Account Role Dropdown */}
            <div className="form-group">
              <label className="form-label">Account Type / Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'customer' | 'admin')}
                className="auth-select"
              >
                <option value="customer">Customer Account</option>
                <option value="admin">Administrator Account</option>
              </select>
            </div>

            {/* Full Name */}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="auth-input-wrapper">
                <User size={18} className="auth-input-icon" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="auth-input"
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="auth-input-wrapper">
                <Mail size={18} className="auth-input-icon" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="auth-input"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="auth-input-wrapper">
                <Lock size={18} className="auth-input-icon" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="auth-input"
                />
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={isSubmitting} className="auth-submit-btn">
              {isSubmitting ? (
                'Creating Account...'
              ) : (
                <>
                  <span>Register Account</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer-link">
            Already registered?{' '}
            <Link href="/login">
              Sign in &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
