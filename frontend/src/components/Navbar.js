
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, hasRole } = useAuth();

  const isAdmin = hasRole('ROLE_ADMIN');

  const getLinkStyle = ({ isActive }) => ({
    color: isActive ? '#EDE9FE' : '#D4D4D8',
    background: isActive ? '#6D28D9' : 'transparent',
    textDecoration: 'none',
    padding: '9px 12px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: isActive ? '600' : '500',
    border: isActive
      ? '1px solid #8B5CF6'
      : '1px solid transparent',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap'
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <NavLink to="/dashboard" style={styles.brand}>
        <span style={styles.logo}>C</span>
        <span>Community Management</span>
      </NavLink>

      <div style={styles.right}>
        {isAuthenticated ? (
          <>
            {user?.fullName && (
              <span style={styles.name}>
                <span style={styles.avatar}>
                  {user.fullName.charAt(0).toUpperCase()}
                </span>
                <span>{user.fullName}</span>
              </span>
            )}

            <NavLink to="/dashboard" style={getLinkStyle}>
              Dashboard
            </NavLink>

            <NavLink to="/posts" style={getLinkStyle}>
              Posts
            </NavLink>

            <NavLink to="/bookings" style={getLinkStyle}>
              Bookings
            </NavLink>

            <NavLink to="/maintenance" style={getLinkStyle}>
              Maintenance
            </NavLink>

            <NavLink to="/payments" style={getLinkStyle}>
              Payments
            </NavLink>

            {isAdmin && (
              <NavLink to="/users" style={getLinkStyle}>
                Users
              </NavLink>
            )}

            <button
              type="button"
              onClick={handleLogout}
              style={styles.logout}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#7F1D1D';
                e.currentTarget.style.borderColor = '#EF4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = '#52525B';
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" style={getLinkStyle}>
              Login
            </NavLink>

            <NavLink to="/register" style={getLinkStyle}>
              Register
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    padding: '14px 24px',
    background: '#18181B',
    color: '#FAFAFA',
    borderBottom: '1px solid #3F3F46',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
    position: 'relative',
    zIndex: 10
  },

  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#FAFAFA',
    textDecoration: 'none',
    fontSize: '17px',
    fontWeight: '700',
    letterSpacing: '-0.3px',
    whiteSpace: 'nowrap'
  },

  logo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
    color: '#FFFFFF',
    fontSize: '19px',
    fontWeight: '800',
    boxShadow: '0 3px 10px rgba(139, 92, 246, 0.25)'
  },

  right: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: '6px'
  },

  name: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#E4E4E7',
    fontSize: '13px',
    fontWeight: '500',
    marginRight: '8px',
    padding: '5px 10px',
    background: '#27272A',
    border: '1px solid #3F3F46',
    borderRadius: '10px',
    whiteSpace: 'nowrap'
  },

  avatar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '27px',
    height: '27px',
    borderRadius: '8px',
    background: '#4C1D95',
    color: '#EDE9FE',
    fontSize: '13px',
    fontWeight: '700'
  },

  logout: {
    padding: '9px 13px',
    marginLeft: '4px',
    background: 'transparent',
    color: '#FCA5A5',
    border: '1px solid #52525B',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap'
  }
};

export default Navbar;
