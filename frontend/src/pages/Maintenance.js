
import React, { useCallback, useEffect, useState } from 'react';
import {
  getMyRequests,
  createRequest,
  getAllMaintenanceRequests,
  updateMaintenanceStatus
} from '../services/api';
import { useAuth } from '../context/AuthContext';

function Maintenance() {
  const { user, hasRole } = useAuth();

  const isAdmin = hasRole('ROLE_ADMIN');
  const isStaff = hasRole('ROLE_STAFF');
  const canManage = isAdmin || isStaff;

  const [requests, setRequests] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadRequests = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }

    setError('');

    try {
      const response = canManage
        ? await getAllMaintenanceRequests()
        : await getMyRequests();

      setRequests(Array.isArray(response.data) ? response.data : []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Maintenance loading error:', err);

      setError(
        err.response?.data?.message ||
        'Could not load maintenance requests.'
      );
    } finally {
      setLoading(false);
    }
  }, [canManage]);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      setError('User information is unavailable. Please log in again.');
      return;
    }

    loadRequests();

    const intervalId = setInterval(() => {
      loadRequests(false);
    }, 15000);

    return () => clearInterval(intervalId);
  }, [user?.id, loadRequests]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim() || !description.trim()) {
      setError('Please enter both title and description.');
      return;
    }

    try {
      setSubmitting(true);

      await createRequest({
        title: title.trim(),
        description: description.trim()
      });

      setTitle('');
      setDescription('');
      setSuccess('Maintenance request submitted successfully!');

      await loadRequests(false);
    } catch (err) {
      console.error('Maintenance creation error:', err);

      setError(
        err.response?.data?.message ||
        'Could not create request. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    setError('');
    setSuccess('');
    setUpdatingId(id);

    try {
      await updateMaintenanceStatus(id, status);

      setSuccess(`Request #${id} status updated to ${status}.`);
      await loadRequests(false);
    } catch (err) {
      console.error('Maintenance status update error:', err);

      setError(
        err.response?.data?.message ||
        'Could not update status. Please try again.'
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (value) => {
    if (!value) return 'N/A';

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? 'N/A'
      : date.toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
  };

  const statusStyle = (status) => {
    switch ((status || 'OPEN').toUpperCase()) {
      case 'RESOLVED':
        return {
          color: '#86EFAC',
          background: 'rgba(34, 197, 94, 0.13)',
          border: '1px solid rgba(34, 197, 94, 0.35)'
        };

      case 'IN_PROGRESS':
        return {
          color: '#FCD34D',
          background: 'rgba(245, 158, 11, 0.13)',
          border: '1px solid rgba(245, 158, 11, 0.35)'
        };

      case 'CLOSED':
        return {
          color: '#D4D4D8',
          background: 'rgba(113, 113, 122, 0.2)',
          border: '1px solid #52525B'
        };

      default:
        return {
          color: '#C4B5FD',
          background: 'rgba(139, 92, 246, 0.13)',
          border: '1px solid rgba(139, 92, 246, 0.35)'
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
    outline: 'none'
  };

  const labelStyle = {
    display: 'block',
    color: '#D4D4D8',
    fontSize: '14px',
    fontWeight: 600,
    marginTop: '16px'
  };

  const panelStyle = {
    background: '#27272A',
    border: '1px solid #3F3F46',
    borderRadius: '14px',
    padding: '22px',
    marginBottom: '18px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
  };

  const primaryButtonStyle = {
    padding: '12px 18px',
    background: '#8B5CF6',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer'
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
          Community Services
        </p>

        <h2 style={{
          margin: 0,
          color: '#FAFAFA',
          fontSize: 'clamp(24px, 4vw, 30px)',
          fontWeight: 700
        }}>
          {canManage ? 'Maintenance Management' : 'Maintenance Requests'}
        </h2>

        <p style={{
          margin: '10px 0 0',
          color: '#A1A1AA',
          fontSize: '14px',
          lineHeight: 1.6
        }}>
          {canManage
            ? 'Review maintenance issues and keep residents updated on their progress.'
            : 'Report community issues and track the progress of your requests.'}
        </p>
      </div>

      {!canManage && (
        <form onSubmit={handleSubmit} style={panelStyle}>
          <h3 style={{
            margin: '0 0 6px',
            color: '#FAFAFA',
            fontSize: '19px'
          }}>
            Submit a Maintenance Request
          </h3>

          <p style={{
            margin: '0 0 18px',
            color: '#A1A1AA',
            fontSize: '13px',
            lineHeight: 1.6
          }}>
            Describe the issue clearly so the maintenance team can address it.
          </p>

          <label htmlFor="maintenance-title" style={labelStyle}>
            Issue Title
          </label>

          <input
            id="maintenance-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Water leakage, lift problem"
            required
            maxLength={200}
            style={inputStyle}
          />

          <label htmlFor="maintenance-description" style={labelStyle}>
            Description
          </label>

          <textarea
            id="maintenance-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your maintenance issue..."
            required
            rows={4}
            style={{
              ...inputStyle,
              resize: 'vertical',
              minHeight: '110px',
              lineHeight: 1.6
            }}
          />

          <button
            type="submit"
            disabled={submitting}
            style={{
              ...primaryButtonStyle,
              marginTop: '20px',
              opacity: submitting ? 0.65 : 1,
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}
          >
            {submitting ? 'Submitting Request...' : '+ Submit Request'}
          </button>
        </form>
      )}

      {success && (
        <div
          role="status"
          style={{
            marginBottom: '18px',
            padding: '13px 16px',
            borderRadius: '9px',
            border: '1px solid #166534',
            background: 'rgba(22, 163, 74, 0.12)',
            color: '#86EFAC',
            fontSize: '14px',
            lineHeight: 1.5
          }}
        >
          ✓ {success}
        </div>
      )}

      {error && (
        <div
          role="alert"
          style={{
            marginBottom: '18px',
            padding: '13px 16px',
            borderRadius: '9px',
            border: '1px solid #991B1B',
            background: 'rgba(220, 38, 38, 0.12)',
            color: '#FCA5A5',
            fontSize: '14px',
            lineHeight: 1.5
          }}
        >
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
            {canManage ? 'All Maintenance Requests' : 'My Requests'}
          </h3>

          <p style={{
            margin: '6px 0 0',
            color: '#A1A1AA',
            fontSize: '13px'
          }}>
            {loading
              ? 'Loading requests...'
              : `${requests.length} request${requests.length === 1 ? '' : 's'} found`}
          </p>

          <p style={{
            margin: '7px 0 0',
            color: '#A78BFA',
            fontSize: '12px'
          }}>
            <span style={{
              display: 'inline-block',
              width: '7px',
              height: '7px',
              background: '#A78BFA',
              borderRadius: '50%',
              marginRight: '6px'
            }} />
            Auto-refreshes every 15 seconds
            {lastUpdated && ` · Updated at ${lastUpdated.toLocaleTimeString('en-IN')}`}
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadRequests()}
          disabled={loading}
          style={{
            padding: '10px 14px',
            background: '#3F3F46',
            color: '#EDE9FE',
            border: '1px solid #52525B',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.65 : 1
          }}
        >
          {loading ? 'Loading...' : '↻ Refresh'}
        </button>
      </div>

      {loading && (
        <div style={{
          ...panelStyle,
          textAlign: 'center',
          padding: '32px 18px',
          color: '#C4B5FD'
        }}>
          Loading maintenance requests...
        </div>
      )}

      {!loading && requests.length === 0 && !error && (
        <div style={{
          ...panelStyle,
          textAlign: 'center',
          padding: '38px 20px'
        }}>
          <div style={{
            fontSize: '34px',
            marginBottom: '12px'
          }}>
            ⚙
          </div>

          <h3 style={{
            margin: '0 0 8px',
            color: '#E4E4E7',
            fontSize: '18px'
          }}>
            No maintenance requests yet
          </h3>

          <p style={{
            margin: 0,
            color: '#A1A1AA',
            fontSize: '14px',
            lineHeight: 1.6
          }}>
            {canManage
              ? 'New requests submitted by residents will appear here.'
              : 'Your submitted maintenance requests will appear here.'}
          </p>
        </div>
      )}

      {!loading && requests.map((request) => {
        const status = (request.status || 'OPEN').toUpperCase();
        const badge = statusStyle(status);
        const isUpdating = updatingId === request.id;

        return (
          <article
            key={request.id}
            style={{
              ...panelStyle,
              padding: '20px'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                <h3 style={{
                  margin: '0 0 7px',
                  color: '#F4F4F5',
                  fontSize: '19px',
                  overflowWrap: 'anywhere'
                }}>
                  {request.title || 'Maintenance request'}
                </h3>

                <span style={{
                  color: '#A1A1AA',
                  fontSize: '12px'
                }}>
                  Request ID: #{request.id}
                </span>
              </div>

              <span style={{
                ...badge,
                display: 'inline-block',
                padding: '6px 11px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.4px',
                whiteSpace: 'nowrap'
              }}>
                {status.replace('_', ' ')}
              </span>
            </div>

            <p style={{
              margin: '0 0 18px',
              color: '#D4D4D8',
              fontSize: '14px',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
              overflowWrap: 'anywhere'
            }}>
              {request.description || 'No description provided.'}
            </p>

            {request.location && (
              <div style={{
                marginBottom: '12px',
                color: '#D4D4D8',
                fontSize: '13px',
                overflowWrap: 'anywhere'
              }}>
                <strong style={{ color: '#A1A1AA' }}>Location: </strong>
                {request.location}
              </div>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: '12px',
              marginBottom: request.resolvedAt || canManage ? '16px' : 0
            }}>
              <div style={{
                padding: '12px',
                borderRadius: '9px',
                background: '#18181B',
                border: '1px solid #3F3F46'
              }}>
                <p style={{
                  margin: '0 0 6px',
                  color: '#A1A1AA',
                  fontSize: '12px'
                }}>
                  Submitted
                </p>

                <p style={{
                  margin: 0,
                  color: '#E4E4E7',
                  fontSize: '13px',
                  lineHeight: 1.5
                }}>
                  {formatDate(request.submittedAt)}
                </p>
              </div>

              {request.resolvedAt && (
                <div style={{
                  padding: '12px',
                  borderRadius: '9px',
                  background: '#18181B',
                  border: '1px solid #3F3F46'
                }}>
                  <p style={{
                    margin: '0 0 6px',
                    color: '#A1A1AA',
                    fontSize: '12px'
                  }}>
                    Resolved
                  </p>

                  <p style={{
                    margin: 0,
                    color: '#86EFAC',
                    fontSize: '13px',
                    lineHeight: 1.5
                  }}>
                    {formatDate(request.resolvedAt)}
                  </p>
                </div>
              )}
            </div>

            {canManage && (
              <div style={{
                paddingTop: '16px',
                borderTop: '1px solid #3F3F46'
              }}>
                <label
                  htmlFor={`status-${request.id}`}
                  style={{
                    display: 'block',
                    marginBottom: '9px',
                    color: '#D4D4D8',
                    fontSize: '13px',
                    fontWeight: 600
                  }}
                >
                  Update Request Status
                </label>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <select
                    id={`status-${request.id}`}
                    value={status}
                    disabled={isUpdating}
                    onChange={(e) =>
                      handleStatusChange(request.id, e.target.value)
                    }
                    style={{
                      ...inputStyle,
                      width: 'auto',
                      minWidth: '180px',
                      marginTop: 0,
                      cursor: isUpdating ? 'not-allowed' : 'pointer',
                      colorScheme: 'dark'
                    }}
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>

                  {isUpdating && (
                    <span style={{
                      color: '#C4B5FD',
                      fontSize: '13px'
                    }}>
                      Updating status...
                    </span>
                  )}
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

export default Maintenance;
