
import React, { useEffect, useState } from 'react';
import {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  getAllBookings,
  approveBooking,
  rejectBooking,
  getAllUsers,
  getAllMaintenanceRequests,
  getAllPayments,
} from '../services/api';

function Dashboard() {
  const [announcements, setAnnouncements] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [processingBookingId, setProcessingBookingId] = useState(null);
  const [userMessage, setUserMessage] = useState('');

  const [summary, setSummary] = useState({
    users: '—',
    bookings: '—',
    maintenance: '—',
    payments: '—',
  });

  const [summaryLoading, setSummaryLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const isAdmin =
    user.roles?.includes('ROLE_ADMIN') ||
    user.role === 'ROLE_ADMIN' ||
    user.authorities?.includes('ROLE_ADMIN');

  const getArrayData = (response) => {
    const data = response?.data;

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    if (Array.isArray(data?.data)) return data.data;

    return null;
  };

  const loadAnnouncements = async () => {
    setLoading(true);

    try {
      const { data } = await getAnnouncements();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to load announcements.'
      );
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    setBookingsLoading(true);

    try {
      const { data } = await getAllBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Could not load bookings. Please check Admin access.'
      );
    } finally {
      setBookingsLoading(false);
    }
  };

  const loadSummary = async () => {
    if (!isAdmin) return;

    setSummaryLoading(true);

    try {
      const results = await Promise.allSettled([
        getAllUsers(),
        getAllBookings(),
        getAllMaintenanceRequests(),
        getAllPayments(),
      ]);

      const nextSummary = {
        users: '—',
        bookings: '—',
        maintenance: '—',
        payments: '—',
      };

      const keys = ['users', 'bookings', 'maintenance', 'payments'];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const items = getArrayData(result.value);

          if (items !== null) {
            nextSummary[keys[index]] = items.length;
          }
        } else {
          console.error(
            `Could not load dashboard ${keys[index]} summary`,
            result.reason
          );
        }
      });

      setSummary(nextSummary);
    } catch (err) {
      console.error('Could not refresh dashboard summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  };

  // Initial load + automatic summary refresh every 15 seconds
  useEffect(() => {
    loadAnnouncements();

    if (!isAdmin) return undefined;

    loadBookings();
    loadSummary();

    const summaryInterval = setInterval(() => {
      loadSummary();
    }, 15000);

    return () => {
      clearInterval(summaryInterval);
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setUserMessage('');

    if (!title.trim() || !content.trim()) {
      setError('Please enter both title and content.');
      return;
    }

    try {
      setSaving(true);

      await createAnnouncement({
        title: title.trim(),
        content: content.trim(),
      });

      setTitle('');
      setContent('');
      setUserMessage('Announcement created successfully!');
      await loadAnnouncements();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Could not create announcement. Please check Admin access.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this announcement?'
    );

    if (!confirmed) return;

    setError('');
    setUserMessage('');

    try {
      setDeletingId(id);
      await deleteAnnouncement(id);

      setAnnouncements((previous) =>
        previous.filter((announcement) => announcement.id !== id)
      );

      setUserMessage('Announcement deleted successfully!');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Could not delete announcement.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleBookingStatus = async (booking, status) => {
    const action = status === 'APPROVED' ? 'approve' : 'reject';

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this booking?`
    );

    if (!confirmed) return;

    setError('');
    setUserMessage('');

    try {
      setProcessingBookingId(booking.id);

      if (status === 'APPROVED') {
        await approveBooking(booking.id);
      } else {
        await rejectBooking(booking.id);
      }

      setBookings((previous) =>
        previous.map((item) =>
          item.id === booking.id ? { ...item, status } : item
        )
      );

      setUserMessage(`Booking ${action}d successfully!`);
      await loadSummary();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        `Could not ${action} booking. Please try again.`
      );
    } finally {
      setProcessingBookingId(null);
    }
  };

  const formatDate = (value) => {
    if (!value) return 'Not available';

    return new Date(value).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (value) => {
    if (!value) return '';

    return new Date(value).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusStyle = (status) => {
    if (status === 'APPROVED') return styles.approved;
    if (status === 'REJECTED') return styles.rejected;
    return styles.pending;
  };

  const summaryCards = [
    {
      key: 'users',
      title: 'Total Users',
      description: 'Registered community users',
      icon: '♙',
    },
    {
      key: 'bookings',
      title: 'Total Bookings',
      description: 'Facility booking records',
      icon: '▦',
    },
    {
      key: 'maintenance',
      title: 'Maintenance Requests',
      description: 'Requests received',
      icon: '⚙',
    },
    {
      key: 'payments',
      title: 'Payments',
      description: 'Payment records',
      icon: '₹',
    },
  ];

  return (
    <main style={styles.container}>
      <header style={styles.pageHeader}>
        <div>
          <p style={styles.eyebrow}>COMMUNITY PORTAL</p>
          <h1 style={styles.pageTitle}>Community Dashboard</h1>
          <p style={styles.subtitle}>
            Stay updated with community announcements and facility bookings.
          </p>
        </div>
      </header>

      {isAdmin && (
        <section style={styles.summarySection}>
          <div style={styles.sectionHeader}>
            <div>
              <p style={styles.eyebrow}>OVERVIEW</p>
              <h2 style={styles.sectionTitle}>Community Summary</h2>
              <p style={styles.subtitle}>
                A quick overview of your community management system.
              </p>
              <p style={styles.autoRefreshText}>
                <span style={styles.liveDot} />
                Auto-refreshes every 15 seconds
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                loadSummary();
                loadBookings();
              }}
              disabled={summaryLoading || bookingsLoading}
              style={{
                ...styles.refreshButton,
                ...(summaryLoading || bookingsLoading
                  ? styles.disabledButton
                  : {}),
              }}
            >
              {summaryLoading || bookingsLoading
                ? 'Refreshing...'
                : '↻ Refresh'}
            </button>
          </div>

          <div style={styles.summaryGrid}>
            {summaryCards.map((card) => (
              <article key={card.key} style={styles.summaryCard}>
                <div style={styles.summaryCardTop}>
                  <span style={styles.summaryIcon}>{card.icon}</span>
                  <span style={styles.summaryDot} />
                </div>

                <p style={styles.summaryTitle}>{card.title}</p>

                <h3 style={styles.summaryValue}>
                  {summaryLoading && summary[card.key] === '—'
                    ? '...'
                    : summary[card.key]}
                </h3>

                <p style={styles.summaryDescription}>
                  {card.description}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      {userMessage && (
        <div style={styles.success} role="status" aria-live="polite">
          <span style={styles.messageIcon}>✓</span>
          <span>{userMessage}</span>
        </div>
      )}

      {error && (
        <div style={styles.error} role="alert" aria-live="assertive">
          <span style={styles.messageIcon}>!</span>
          <span>{error}</span>
        </div>
      )}

      {isAdmin && (
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Manage Facility Bookings</h2>
              <p style={styles.subtitle}>
                Review residents' bookings and approve or reject requests.
              </p>
            </div>
          </div>

          {bookingsLoading ? (
            <p style={styles.center}>Loading bookings...</p>
          ) : bookings.length === 0 ? (
            <div style={styles.emptyState}>
              <h3 style={styles.cardTitle}>No bookings found</h3>
              <p style={styles.cardBody}>
                Facility booking requests will appear here.
              </p>
            </div>
          ) : (
            bookings.map((booking) => (
              <article key={booking.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>
                    {booking.roomName || 'Facility Booking'}
                  </h3>

                  <span
                    style={{
                      ...styles.status,
                      ...getStatusStyle(booking.status),
                    }}
                  >
                    {booking.status || 'PENDING'}
                  </span>
                </div>

                <p style={styles.cardBody}>
                  <strong style={styles.fieldLabel}>Date: </strong>
                  {formatDate(booking.startTime)}
                </p>

                <p style={styles.cardBody}>
                  <strong style={styles.fieldLabel}>Time: </strong>
                  {formatTime(booking.startTime)}
                  {' – '}
                  {formatTime(booking.endTime)}
                </p>

                {booking.status === 'PENDING' && (
                  <div style={styles.actionContainer}>
                    <button
                      type="button"
                      onClick={() =>
                        handleBookingStatus(booking, 'APPROVED')
                      }
                      disabled={processingBookingId === booking.id}
                      style={styles.approveButton}
                    >
                      {processingBookingId === booking.id
                        ? 'Please wait...'
                        : 'Approve'}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleBookingStatus(booking, 'REJECTED')
                      }
                      disabled={processingBookingId === booking.id}
                      style={styles.rejectButton}
                    >
                      {processingBookingId === booking.id
                        ? 'Please wait...'
                        : 'Reject'}
                    </button>
                  </div>
                )}
              </article>
            ))
          )}
        </section>
      )}

      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <p style={styles.eyebrow}>LATEST UPDATES</p>
            <h2 style={styles.sectionTitle}>Latest Announcements</h2>
            <p style={styles.subtitle}>
              Important news and updates for community residents.
            </p>
          </div>
        </div>

        {isAdmin && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <h3 style={styles.formTitle}>Create Announcement</h3>

            <label htmlFor="announcement-title" style={styles.label}>
              Title
            </label>

            <input
              id="announcement-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter announcement title"
              style={styles.input}
            />

            <label htmlFor="announcement-content" style={styles.label}>
              Content
            </label>

            <textarea
              id="announcement-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Enter announcement details"
              rows={4}
              style={{
                ...styles.input,
                resize: 'vertical',
                minHeight: '110px',
              }}
            />

            <div>
              <button
                type="submit"
                disabled={saving}
                style={{
                  ...styles.button,
                  ...(saving ? styles.disabledButton : {}),
                }}
              >
                {saving ? 'Publishing...' : 'Publish Announcement'}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p style={styles.center}>Loading announcements...</p>
        ) : announcements.length === 0 ? (
          <div style={styles.emptyState}>
            <h3 style={styles.cardTitle}>No announcements yet</h3>
            <p style={styles.cardBody}>
              New community announcements will appear here.
            </p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <article key={announcement.id} style={styles.card}>
              <div style={styles.announcementAccent} />

              <div style={styles.announcementContent}>
                <h3 style={styles.cardTitle}>
                  {announcement.title}
                </h3>

                <p style={styles.cardBody}>
                  {announcement.content}
                </p>

                <small style={styles.meta}>
                  {announcement.postedBy?.fullName
                    ? `Posted by ${announcement.postedBy.fullName} • `
                    : ''}
                  {announcement.postedAt
                    ? new Date(announcement.postedAt).toLocaleDateString(
                        'en-IN',
                        {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        }
                      )
                    : ''}
                </small>

                {isAdmin && (
                  <div style={styles.deleteContainer}>
                    <button
                      type="button"
                      onClick={() => handleDelete(announcement.id)}
                      disabled={deletingId === announcement.id}
                      style={styles.rejectButton}
                    >
                      {deletingId === announcement.id
                        ? 'Deleting...'
                        : 'Delete Announcement'}
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}

const styles = {
  container: {
    boxSizing: 'border-box',
    maxWidth: '1100px',
    width: '100%',
    margin: '0 auto',
    padding: '32px 24px 48px',
    color: '#FAFAFA',
    minHeight: 'calc(100vh - 65px)',
    background: '#18181B',
  },

  pageHeader: {
    marginBottom: '30px',
  },

  pageTitle: {
    color: '#FAFAFA',
    fontSize: '30px',
    fontWeight: '750',
    letterSpacing: '-0.7px',
    margin: '0 0 8px',
  },

  eyebrow: {
    color: '#A78BFA',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '1.5px',
    margin: '0 0 8px',
  },

  section: {
    marginBottom: '36px',
  },

  summarySection: {
    marginBottom: '36px',
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '18px',
  },

  sectionTitle: {
    color: '#FAFAFA',
    fontSize: '22px',
    margin: '0 0 8px',
  },

  subtitle: {
    color: '#A1A1AA',
    margin: '0 0 16px',
    lineHeight: 1.6,
  },

  autoRefreshText: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#A1A1AA',
    fontSize: '12px',
    margin: '0 0 8px',
  },

  liveDot: {
    display: 'inline-block',
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#A78BFA',
    boxShadow: '0 0 8px rgba(167, 139, 250, 0.65)',
  },

  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
    gap: '16px',
  },

  summaryCard: {
    minWidth: 0,
    background: 'linear-gradient(145deg, #2E293B, #27272A 72%)',
    border: '1px solid #49405F',
    borderRadius: '14px',
    padding: '20px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
  },

  summaryCardTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '18px',
  },

  summaryIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: '#3B2D59',
    color: '#DDD6FE',
    fontSize: '24px',
    fontWeight: '700',
  },

  summaryDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#A78BFA',
  },

  summaryTitle: {
    color: '#D4D4D8',
    fontSize: '14px',
    fontWeight: '600',
    margin: '0 0 8px',
  },

  summaryValue: {
    color: '#FAFAFA',
    fontSize: '32px',
    fontWeight: '750',
    letterSpacing: '-0.5px',
    margin: '0 0 8px',
  },

  summaryDescription: {
    color: '#A1A1AA',
    fontSize: '12px',
    lineHeight: 1.5,
    margin: 0,
  },

  refreshButton: {
    padding: '9px 14px',
    background: '#3B2D59',
    color: '#EDE9FE',
    border: '1px solid #8B5CF6',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    background: '#27272A',
    border: '1px solid #3F3F46',
    borderRadius: '14px',
    padding: '22px',
    marginBottom: '24px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
  },

  formTitle: {
    color: '#FAFAFA',
    fontSize: '18px',
    margin: '0 0 8px',
  },

  label: {
    color: '#E4E4E7',
    fontSize: '14px',
    fontWeight: '600',
    marginTop: '4px',
  },

  input: {
    boxSizing: 'border-box',
    width: '100%',
    padding: '11px 13px',
    background: '#18181B',
    color: '#FAFAFA',
    border: '1px solid #52525B',
    borderRadius: '8px',
    font: 'inherit',
    outlineColor: '#8B5CF6',
  },

  button: {
    padding: '11px 16px',
    background: '#8B5CF6',
    color: '#FFFFFF',
    border: '1px solid #8B5CF6',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    marginTop: '8px',
  },

  disabledButton: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },

  card: {
    position: 'relative',
    display: 'flex',
    gap: '16px',
    overflow: 'hidden',
    background: '#27272A',
    border: '1px solid #3F3F46',
    borderRadius: '12px',
    padding: '20px',
    marginTop: '14px',
    marginBottom: '16px',
    boxShadow: '0 6px 18px rgba(0,0,0,0.16)',
  },

  announcementAccent: {
    flexShrink: 0,
    width: '4px',
    alignSelf: 'stretch',
    background: '#8B5CF6',
    borderRadius: '4px',
  },

  announcementContent: {
    flex: 1,
    minWidth: 0,
  },

  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '12px',
  },

  cardTitle: {
    color: '#F4F4F5',
    margin: '0 0 12px',
    fontSize: '18px',
    fontWeight: '650',
    overflowWrap: 'anywhere',
  },

  cardBody: {
    margin: '0 0 12px',
    color: '#E4E4E7',
    lineHeight: 1.75,
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
  },

  fieldLabel: {
    color: '#C4B5FD',
  },

  meta: {
    display: 'block',
    color: '#A1A1AA',
    fontSize: '12px',
    marginTop: '12px',
  },

  status: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '5px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
    border: '1px solid transparent',
  },

  approved: {
    color: '#BBF7D0',
    background: '#14532D',
    borderColor: '#22C55E',
  },

  rejected: {
    color: '#FECACA',
    background: '#7F1D1D',
    borderColor: '#EF4444',
  },

  pending: {
    color: '#FDE68A',
    background: '#78350F',
    borderColor: '#F59E0B',
  },

  actionContainer: {
    display: 'flex',
    gap: '10px',
    marginTop: '16px',
    flexWrap: 'wrap',
  },

  approveButton: {
    padding: '9px 15px',
    background: '#166534',
    color: '#DCFCE7',
    border: '1px solid #22C55E',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
  },

  rejectButton: {
    padding: '9px 15px',
    background: '#7F1D1D',
    color: '#FECACA',
    border: '1px solid #EF4444',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
  },

  deleteContainer: {
    marginTop: '16px',
  },

  center: {
    textAlign: 'center',
    color: '#D4D4D8',
    marginTop: '20px',
    padding: '16px',
  },

  emptyState: {
    background: '#27272A',
    border: '1px dashed #52525B',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center',
    marginTop: '14px',
  },

  success: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#BBF7D0',
    background: '#14532D',
    border: '1px solid #22C55E',
    borderRadius: '9px',
    padding: '12px 16px',
    margin: '0 0 20px',
    fontWeight: '500',
    overflowWrap: 'anywhere',
  },

  error: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#FECACA',
    background: '#7F1D1D',
    border: '1px solid #EF4444',
    borderRadius: '9px',
    padding: '12px 16px',
    margin: '0 0 20px',
    fontWeight: '500',
    overflowWrap: 'anywhere',
  },

  messageIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '23px',
    height: '23px',
    border: '1px solid currentColor',
    borderRadius: '50%',
    fontWeight: '800',
  },
};

export default Dashboard;
