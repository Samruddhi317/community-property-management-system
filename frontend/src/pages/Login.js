import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../services/api';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
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
      const { data } = await loginApi(form);
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
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
              Community <span style={styles.purpleText}>Portal</span>
            </h1>
            <p style={styles.subtitle}>Login to your account</p>
          </div>
        </div>

        <div style={styles.divider} />

        {error && <p style={styles.error}>{error}</p>}

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
          autoComplete="username"
          required
        />

        <label style={styles.label} htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={handleChange}
          style={styles.input}
          autoComplete="current-password"
          required
        />

        <button
          type="submit"
          style={{
            ...styles.button,
            ...(loading ? styles.buttonLoading : {}),
          }}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p style={styles.registerText}>
          No account?{' '}
          <Link to="/register" style={styles.registerLink}>
            Register
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
    padding: 'clamp(24px, 5vw, 48px)',
    background: 'rgba(24, 24, 32, 0.96)',
    border: '1px solid #6D3FE8',
    borderRadius: '22px',
    boxShadow: '0 0 35px rgba(139, 92, 246, 0.10)',
  },

  heading: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '28px',
  },

  logo: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '64px',
    height: '64px',
    color: '#A78BFA',
    fontSize: '64px',
    lineHeight: 1,
  },

  title: {
    margin: '0 0 8px',
    fontSize: 'clamp(23px, 4vw, 32px)',
    fontWeight: 700,
    color: '#F4F4F5',
  },

  purpleText: {
    color: '#A78BFA',
  },

  subtitle: {
    margin: 0,
    color: '#A1A1C4',
    fontSize: '16px',
  },

  divider: {
    height: '1px',
    background: 'linear-gradient(to right, #3F365F, #272033)',
    marginBottom: '28px',
  },

  label: {
    color: '#C4B5FD',
    fontSize: '15px',
    marginBottom: '9px',
    fontWeight: 500,
  },

  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '16px 18px',
    marginBottom: '24px',
    background: '#191921',
    color: '#F4F4F5',
    border: '1px solid #555577',
    borderRadius: '11px',
    outline: 'none',
    fontSize: '16px',
    transition: 'border-color 0.2s ease',
    colorScheme: 'dark',
  },

  button: {
    width: '100%',
    padding: '17px',
    marginTop: '8px',
    background: 'linear-gradient(100deg, #7C3AED, #8B5CF6)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '11px',
    fontSize: '17px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 5px 18px rgba(124, 58, 237, 0.22)',
    transition: 'opacity 0.2s ease',
  },

  buttonLoading: {
    opacity: 0.7,
    cursor: 'wait',
  },

  registerText: {
    margin: '28px 0 0',
    textAlign: 'center',
    color: '#B4B4D0',
    fontSize: '15px',
  },

  registerLink: {
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

export default Login;