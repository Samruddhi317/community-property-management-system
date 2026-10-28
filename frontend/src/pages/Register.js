import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register as registerApi } from '../services/api';

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await registerApi(form);
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.glowTop} />
      <div style={styles.glowBottom} />

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.heading}>
          <div style={styles.logo}>⌂</div>
          <div>
            <h1 style={styles.title}>
              Join Our <span style={styles.purpleText}>Community</span>
            </h1>
            <p style={styles.subtitle}>Create your account to get started</p>
          </div>
        </div>

        <div style={styles.divider} />

        {error && <p style={styles.error}>{error}</p>}

        <label style={styles.label} htmlFor="fullName">
          Full Name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          placeholder="Enter your full name"
          value={form.fullName}
          onChange={handleChange}
          style={styles.input}
          autoComplete="name"
          required
        />

        <label style={styles.label} htmlFor="email">
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={form.email}
          onChange={handleChange}
          style={styles.input}
          autoComplete="email"
          required
        />

        <label style={styles.label} htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Minimum 6 characters"
          value={form.password}
          onChange={handleChange}
          style={styles.input}
          autoComplete="new-password"
          minLength={6}
          required
        />

        <label style={styles.label} htmlFor="phone">
          Phone Number <span style={styles.optional}>(Optional)</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="Enter your phone number"
          value={form.phone}
          onChange={handleChange}
          style={styles.input}
          autoComplete="tel"
        />

        <button
          type="submit"
          style={{
            ...styles.button,
            ...(loading ? styles.buttonLoading : {}),
          }}
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>

        <p style={styles.loginText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.loginLink}>
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    padding: '32px 20px',
    background: '#18181B',
    color: '#F4F4F5',
    fontFamily: 'Arial, sans-serif',
  },

  glowTop: {
    position: 'absolute',
    top: '-100px',
    left: '-100px',
    width: '250px',
    height: '250px',
    borderRadius: '50%',
    background: 'rgba(139, 92, 246, 0.12)',
    filter: 'blur(60px)',
    pointerEvents: 'none',
  },

  glowBottom: {
    position: 'absolute',
    bottom: '-100px',
    right: '-100px',
    width: '250px',
    height: '250px',
    borderRadius: '50%',
    background: 'rgba(139, 92, 246, 0.12)',
    filter: 'blur(60px)',
    pointerEvents: 'none',
  },

  form: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '520px',
    boxSizing: 'border-box',
    padding: 'clamp(24px, 5vw, 44px)',
    background: 'rgba(24, 24, 32, 0.96)',
    border: '1px solid #6D3FE8',
    borderRadius: '22px',
    boxShadow: '0 0 35px rgba(139, 92, 246, 0.10)',
  },

  heading: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
  },

  logo: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '54px',
    height: '54px',
    color: '#A78BFA',
    fontSize: '54px',
    lineHeight: 1,
  },

  title: {
    margin: '0 0 8px',
    fontSize: 'clamp(21px, 4vw, 29px)',
    fontWeight: 700,
    color: '#F4F4F5',
    lineHeight: 1.3,
  },

  purpleText: {
    color: '#A78BFA',
  },

  subtitle: {
    margin: 0,
    color: '#A1A1C4',
    fontSize: '14px',
    lineHeight: 1.5,
  },

  divider: {
    height: '1px',
    background: 'linear-gradient(to right, #3F365F, #272033)',
    marginBottom: '24px',
  },

  label: {
    color: '#C4B5FD',
    fontSize: '14px',
    marginBottom: '8px',
    fontWeight: 500,
  },

  optional: {
    color: '#A1A1AA',
    fontWeight: 400,
    fontSize: '12px',
  },

  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '14px 16px',
    marginBottom: '18px',
    background: '#191921',
    color: '#F4F4F5',
    border: '1px solid #555577',
    borderRadius: '10px',
    outline: 'none',
    fontSize: '15px',
    colorScheme: 'dark',
  },

  button: {
    width: '100%',
    padding: '16px',
    marginTop: '8px',
    background: 'linear-gradient(100deg, #7C3AED, #8B5CF6)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '11px',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 5px 18px rgba(124, 58, 237, 0.22)',
  },

  buttonLoading: {
    opacity: 0.7,
    cursor: 'wait',
  },

  loginText: {
    margin: '24px 0 0',
    textAlign: 'center',
    color: '#B4B4D0',
    fontSize: '14px',
    lineHeight: 1.6,
  },

  loginLink: {
    color: '#A78BFA',
    fontWeight: 700,
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
  },

  error: {
    padding: '12px',
    color: '#FCA5A5',
    background: 'rgba(239, 68, 68, 0.10)',
    border: '1px solid rgba(239, 68, 68, 0.35)',
    borderRadius: '8px',
    fontSize: '14px',
  },
};

export default Register;