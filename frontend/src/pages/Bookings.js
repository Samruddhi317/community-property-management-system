
import React, { useEffect, useState, useCallback } from 'react';
import {
  getMyBookings,
  getAllBookings,
  createBooking,
  cancelBooking,
  approveBooking,
  rejectBooking
} from '../services/api';
import { useAuth } from '../context/AuthContext';

function Bookings() {
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole('ROLE_ADMIN') || hasRole('ADMIN');

  const [bookings, setBookings] = useState([]);
  const [facility, setFacility] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  // Load bookings for resident or admin
  const loadBookings = useCallback(async (showLoading = true) => {
    if (!user?.id) {
      setBookings([]);
      setLoading(false);
      setError('User information is missing. Please log in again.');
      return false;
    }

    if (showLoading) setLoading(true);

    try {
      const response = isAdmin
        ? await getAllBookings()
        : await getMyBookings(user.id);

      setBookings(Array.isArray(response.data) ? response.data : []);
      setLastUpdated(new Date());
      setError('');
      return true;
    } catch (err) {
      console.error('Loading bookings failed:', err.response?.data || err);
      setError('Could not load bookings. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id, isAdmin]);

  // Initial load + automatic refresh every 15 seconds
  useEffect(() => {
    loadBookings();

    const intervalId = setInterval(() => {
      loadBookings(false);
    }, 15000);

    return () => clearInterval(intervalId);
  }, [loadBookings]);

  const formatDate = (value) => {
    if (!value) return 'Not specified';

    const [year, month, day] = value.split('T')[0].split('-');

    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    ).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (value) => {
    if (!value) return 'Not specified';

    const time = value.split('T')[1];
    if (!time) return 'Not specified';

    const [hours, minutes] = time.split(':');
    const parsedHours = Number(hours);

    return `${parsedHours % 12 || 12}:${minutes} ${
      parsedHours >= 12 ? 'PM' : 'AM'
    }`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isAdmin) {
      setError('Please use a resident account to create a booking.');
      return;
    }

    if (!facility.trim() || !date || !startTime || !endTime) {
      setError('Please fill in all booking details.');
      return;
    }

    const today = new Date();
    const localToday = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0')
    ].join('-');

    if (date < localToday) {
      setError('Please select today or a future date.');
      return;
    }

    if (endTime <= startTime) {
      setError('End time must be later than start time.');
      return;
    }

    try {
      setSubmitting(true);

      await createBooking({
        roomName: facility.trim(),
        startTime: `${date}T${startTime}:00`,
        endTime: `${date}T${endTime}:00`
      });

      setFacility('');
      setDate('');
      setStartTime('');
      setEndTime('');

      const refreshed = await loadBookings(false);

      setSuccess(
        refreshed
          ? 'Booking created successfully!'
          : 'Booking created, but the list could not refresh. Please reload.'
      );
    } catch (err) {
      console.error('Booking creation failed:', err.response?.data || err);
      const message = err.response?.data?.message || '';

      setError(
        message.toLowerCase().includes('already booked')
          ? 'This room is already booked for that time. Choose another time.'
          : message || 'Could not create booking. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (booking) => {
    if (booking.status !== 'PENDING') return;

    if (!window.confirm(
      `Are you sure you want to cancel the booking for ${booking.roomName}?`
    )) return;

    setError('');
    setSuccess('');

    try {
      setActionId(booking.id);
      await cancelBooking(booking.id);

      const refreshed = await loadBookings(false);

      setSuccess(
        refreshed
          ? 'Booking cancelled successfully!'
          : 'Booking cancelled, but the list could not refresh.'
      );
    } catch (err) {
      console.error('Cancellation failed:', err.response?.data || err);
      setError(err.response?.data?.message || 'Could not cancel booking.');
    } finally {
      setActionId(null);
    }
  };

  const handleAdminDecision = async (booking, decision) => {
    if (booking.status !== 'PENDING') return;

    setError('');
    setSuccess('');

    try {
      setActionId(booking.id);

      if (decision === 'APPROVED') {
        await approveBooking(booking.id);
      } else {
        await rejectBooking(booking.id);
      }

      const refreshed = await loadBookings(false);

      setSuccess(
        refreshed
          ? `Booking ${decision.toLowerCase()} successfully!`
          : 'Action completed, but the list could not refresh.'
      );
    } catch (err) {
      console.error('Booking update failed:', err.response?.data || err);
      setError(
        err.response?.data?.message ||
        `Could not ${decision.toLowerCase()} booking.`
      );
    } finally {
      setActionId(null);
    }
  };

  const statusStyle = (status) => {
    switch ((status || 'PENDING').toUpperCase()) {
      case 'APPROVED':
        return {
          color: '#86EFAC',
          background: 'rgba(34, 197, 94, 0.13)',
          border: '1px solid rgba(34, 197, 94, 0.35)'
        };
      case 'REJECTED':
      case 'CANCELLED':
        return {
          color: '#FCA5A5',
          background: 'rgba(239, 68, 68, 0.13)',
          border: '1px solid rgba(239, 68, 68, 0.35)'
        };
      default:
        return {
          color: '#FCD34D',
          background: 'rgba(245, 158, 11, 0.13)',
          border: '1px solid rgba(245, 158, 11, 0.35)'
        };
    }
  };

  const inputStyle = {
    display: 'block',
    width: '100%',
    padding: '12px 14px',
    marginTop: '8px',
    boxSizing: 'border-box',
    background: '#18181B',
    color: '#F4F4F5',
    border: '1px solid #52525B',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    colorScheme: 'dark'
  };

  const labelStyle = {
    display: 'block',
    marginTop: '16px',
    color: '#D4D4D8',
    fontSize: '14px',
    fontWeight: 600
  };

  const primaryButton = {
    padding: '12px 18px',
    background: '#8B5CF6',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background 0.2s ease'
  };

  const secondaryButton = {
    padding: '10px 16px',
    color: '#EDE9FE',
    background: '#3F3F46',
    border: '1px solid #52525B',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '13px',
    cursor: 'pointer'
  };

  const panelStyle = {
    background: '#27272A',
    border: '1px solid #3F3F46',
    borderRadius: '14px',
    padding: '22px',
    marginBottom: '20px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '28px 20px 40px',
      boxSizing: 'border-box',
      color: '#F4F4F5',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        marginBottom: '26px',
        paddingBottom: '20px',
        borderBottom: '1px solid #3F3F46'
      }}>
        <p style={{
          margin: '0 0 8px',
          color: '#A78BFA',
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '1.5px',
          textTransform: 'uppercase'
        }}>
          Community Facilities
        </p>

        <h2 style={{
          margin: 0,
          color: '#FAFAFA',
          fontSize: 'clamp(24px, 4vw, 30px)',
          fontWeight: 700
        }}>
          {isAdmin ? 'Manage Community Bookings' : 'Community Bookings'}
        </h2>

        <p style={{
          margin: '10px 0 0',
          color: '#A1A1AA',
          fontSize: '14px',
          lineHeight: 1.6
        }}>
          {isAdmin
            ? 'Review booking requests and manage facility reservations.'
            : 'Reserve community facilities and keep track of your bookings.'}
        </p>
      </div>

      {!isAdmin && (
        <form onSubmit={handleSubmit} style={panelStyle}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{
              margin: '0 0 6px',
              fontSize: '19px',
              color: '#FAFAFA'
            }}>
              Create a Booking
            </h3>
            <p style={{
              margin: 0,
              color: '#A1A1AA',
              fontSize: '13px',
              lineHeight: 1.5
            }}>
              Choose a facility, date and time for your reservation.
            </p>
          </div>

          <label htmlFor="facility" style={labelStyle}>
            Room / Facility Name
          </label>
          <input
            id="facility"
            value={facility}
            onChange={(e) => setFacility(e.target.value)}
            placeholder="e.g. Community Hall"
            required
            style={inputStyle}
          />

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: '0 18px'
          }}>
            <div>
              <label htmlFor="booking-date" style={labelStyle}>
                Booking Date
              </label>
              <input
                id="booking-date"
                type="date"
                value={date}
                min={(() => {
                  const d = new Date();
                  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                })()}
                onChange={(e) => setDate(e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="start-time" style={labelStyle}>
                Start Time
              </label>
              <input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label htmlFor="end-time" style={labelStyle}>
                End Time
              </label>
              <input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                style={inputStyle}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              ...primaryButton,
              marginTop: '22px',
              opacity: submitting ? 0.65 : 1,
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}
          >
            {submitting ? 'Creating Booking...' : '+ Create Booking'}
          </button>
        </form>
      )}

      {success && (
        <div role="status" style={{
          marginBottom: '18px',
          padding: '13px 16px',
          borderRadius: '9px',
          border: '1px solid #166534',
          background: 'rgba(22, 163, 74, 0.12)',
          color: '#86EFAC',
          fontSize: '14px',
          lineHeight: 1.5
        }}>
          ✓ {success}
        </div>
      )}

      {error && (
        <div role="alert" style={{
          marginBottom: '18px',
          padding: '13px 16px',
          borderRadius: '9px',
          border: '1px solid #991B1B',
          background: 'rgba(220, 38, 38, 0.12)',
          color: '#FCA5A5',
          fontSize: '14px',
          lineHeight: 1.5
        }}>
          {error}
        </div>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        margin: '28px 0 16px'
      }}>
        <div>
          <h3 style={{
            margin: 0,
            color: '#FAFAFA',
            fontSize: '20px'
          }}>
            {isAdmin ? 'All Resident Bookings' : 'My Bookings'}
          </h3>
          <p style={{
            margin: '6px 0 0',
            color: '#A1A1AA',
            fontSize: '13px'
          }}>
            {loading
              ? 'Loading reservations...'
              : `${bookings.length} booking${bookings.length === 1 ? '' : 's'} found`}
          </p>

          <p style={{
            margin: '6px 0 0',
            color: '#A78BFA',
            fontSize: '12px'
          }}>
            Auto-refreshes every 15 seconds
            {lastUpdated
              ? ` · Updated at ${lastUpdated.toLocaleTimeString('en-IN')}`
              : ' · Waiting for first refresh'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadBookings()}
          disabled={loading}
          style={{
            ...secondaryButton,
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Loading...' : '↻ Refresh'}
        </button>
      </div>

      {loading && (
        <div style={{
          ...panelStyle,
          textAlign: 'center',
          color: '#C4B5FD',
          padding: '32px 18px'
        }}>
          Loading bookings...
        </div>
      )}

      {!loading && bookings.length === 0 && !error && (
        <div style={{
          ...panelStyle,
          textAlign: 'center',
          padding: '38px 20px'
        }}>
          <div style={{
            fontSize: '34px',
            marginBottom: '12px'
          }}>
            ◷
          </div>
          <h3 style={{
            color: '#E4E4E7',
            margin: '0 0 8px',
            fontSize: '18px'
          }}>
            {isAdmin ? 'No community bookings found' : 'No bookings yet'}
          </h3>
          <p style={{
            color: '#A1A1AA',
            margin: 0,
            fontSize: '14px',
            lineHeight: 1.6
          }}>
            {isAdmin
              ? 'Resident booking requests will appear here.'
              : 'Your facility reservations will appear here after you create one.'}
          </p>
        </div>
      )}

      {!loading && bookings.map((booking) => {
        const status = (booking.status || 'PENDING').toUpperCase();
        const badgeStyle = statusStyle(status);
        const isProcessing = actionId === booking.id;

        return (
          <article
            key={booking.id}
            style={{
              ...panelStyle,
              padding: '20px',
              transition: 'border-color 0.2s ease'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '18px'
            }}>
              <div>
                <h3 style={{
                  margin: '0 0 7px',
                  color: '#F4F4F5',
                  fontSize: '19px',
                  overflowWrap: 'anywhere'
                }}>
                  {booking.roomName || 'Facility Booking'}
                </h3>
                <span style={{
                  color: '#A1A1AA',
                  fontSize: '12px'
                }}>
                  Booking ID: #{booking.id}
                </span>
              </div>

              <span style={{
                ...badgeStyle,
                display: 'inline-block',
                padding: '6px 11px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.5px',
                whiteSpace: 'nowrap'
              }}>
                {status}
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '12px',
              marginBottom: '18px'
            }}>
              <div style={{
                padding: '13px',
                borderRadius: '9px',
                background: '#18181B',
                border: '1px solid #3F3F46'
              }}>
                <p style={{
                  margin: '0 0 7px',
                  color: '#A1A1AA',
                  fontSize: '12px'
                }}>
                  Booking Date
                </p>
                <p style={{
                  margin: 0,
                  color: '#E4E4E7',
                  fontSize: '14px',
                  fontWeight: 600
                }}>
                  {formatDate(booking.startTime)}
                </p>
              </div>

              <div style={{
                padding: '13px',
                borderRadius: '9px',
                background: '#18181B',
                border: '1px solid #3F3F46'
              }}>
                <p style={{
                  margin: '0 0 7px',
                  color: '#A1A1AA',
                  fontSize: '12px'
                }}>
                  Reserved Time
                </p>
                <p style={{
                  margin: 0,
                  color: '#E4E4E7',
                  fontSize: '14px',
                  fontWeight: 600
                }}>
                  {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                </p>
              </div>
            </div>

            {isAdmin && status === 'PENDING' && (
              <div style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
                paddingTop: '16px',
                borderTop: '1px solid #3F3F46'
              }}>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleAdminDecision(booking, 'APPROVED')}
                  style={{
                    ...primaryButton,
                    background: '#166534',
                    opacity: isProcessing ? 0.65 : 1,
                    cursor: isProcessing ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isProcessing ? 'Processing...' : '✓ Approve'}
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleAdminDecision(booking, 'REJECTED')}
                  style={{
                    ...primaryButton,
                    background: '#991B1B',
                    opacity: isProcessing ? 0.65 : 1,
                    cursor: isProcessing ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isProcessing ? 'Processing...' : '✕ Reject'}
                </button>
              </div>
            )}

            {!isAdmin && status === 'PENDING' && (
              <div style={{
                paddingTop: '16px',
                borderTop: '1px solid #3F3F46'
              }}>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleCancel(booking)}
                  style={{
                    ...primaryButton,
                    background: '#991B1B',
                    opacity: isProcessing ? 0.65 : 1,
                    cursor: isProcessing ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isProcessing ? 'Cancelling...' : 'Cancel Booking'}
                </button>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

export default Bookings;
