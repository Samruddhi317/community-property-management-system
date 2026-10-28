
import React, { useEffect, useState, useCallback } from 'react';
import { getAllUsers, deleteUser } from '../services/api';
import axios from 'axios';

function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [updatingId, setUpdatingId] = useState(null);

    const [editingPhoneId, setEditingPhoneId] = useState(null);
    const [phoneValues, setPhoneValues] = useState({});
    const [savingPhoneId, setSavingPhoneId] = useState(null);

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const response = await getAllUsers();
            const userList = Array.isArray(response.data)
                ? response.data
                : [];

            setUsers(userList);

            const phones = {};
            userList.forEach((user) => {
                phones[user.id] = user.phone || '';
            });
            setPhoneValues(phones);
        } catch (err) {
            console.error('Load users error:', err.response?.data || err);
            setError(
                err.response?.data?.message ||
                'Could not load users. Admin access may be required.'
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handlePhoneSave = async (user) => {
        const phone = (phoneValues[user.id] || '').trim();
        const digits = phone.replace(/\D/g, '');

        if (!phone) {
            setError('Please enter a phone number.');
            setMessage('');
            return;
        }

        if (!/^[0-9+\-\s()]+$/.test(phone) ||
            digits.length < 10 ||
            digits.length > 13) {
            setError('Enter a valid phone number with 10 to 13 digits.');
            setMessage('');
            return;
        }

        try {
            setSavingPhoneId(user.id);
            setError('');
            setMessage('');

            const token = localStorage.getItem('token');

            await axios.put(
                `http://localhost:8081/api/users/${user.id}`,
                {
                    ...user,
                    phone
                },
                {
                    headers: token
                        ? { Authorization: `Bearer ${token}` }
                        : {}
                }
            );

            setUsers((currentUsers) =>
                currentUsers.map((item) =>
                    item.id === user.id
                        ? { ...item, phone }
                        : item
                )
            );

            setEditingPhoneId(null);
            setMessage('Phone number updated successfully.');
        } catch (err) {
            console.error('Save phone error:', err.response?.data || err);
            setError(
                err.response?.data?.message ||
                'Could not save phone number. Backend update support may be required.'
            );
        } finally {
            setSavingPhoneId(null);
        }
    };

    const handleStatusChange = async (user) => {
        const isActive = user.enabled !== false;
        const action = isActive ? 'deactivate' : 'activate';

        const confirmed = window.confirm(
            isActive
                ? `Deactivate ${user.fullName}? Their booking history will be preserved.`
                : `Activate ${user.fullName} again?`
        );

        if (!confirmed) return;

        try {
            setUpdatingId(user.id);
            setError('');
            setMessage('');

            if (isActive) {
                await deleteUser(user.id);
            } else {
                const token = localStorage.getItem('token');

                await axios.patch(
                    `http://localhost:8081/api/users/${user.id}/activate`,
                    {},
                    {
                        headers: token
                            ? { Authorization: `Bearer ${token}` }
                            : {}
                    }
                );
            }

            setUsers((currentUsers) =>
                currentUsers.map((item) =>
                    item.id === user.id
                        ? { ...item, enabled: !isActive }
                        : item
                )
            );

            setMessage(
                isActive
                    ? 'User deactivated successfully. Related records are preserved.'
                    : 'User activated successfully.'
            );
        } catch (err) {
            console.error('Change user status error:', err.response?.data || err);
            setError(
                err.response?.data?.message ||
                `Could not ${action} user. Please try again.`
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const cancelPhoneEdit = (user) => {
        setPhoneValues((current) => ({
            ...current,
            [user.id]: user.phone || ''
        }));
        setEditingPhoneId(null);
        setError('');
        setMessage('');
    };

    const getInitials = (name) => {
        if (!name || !name.trim()) return 'U';

        return name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part.charAt(0).toUpperCase())
            .join('');
    };

    const cellStyle = {
        padding: '15px 16px',
        textAlign: 'left',
        borderBottom: '1px solid #3F3F46',
        color: '#D4D4D8',
        fontSize: '14px',
        whiteSpace: 'nowrap'
    };

    const headerStyle = {
        ...cellStyle,
        background: '#18181B',
        color: '#A78BFA',
        fontSize: '12px',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.7px'
    };

    const buttonStyle = {
        padding: '8px 12px',
        borderRadius: '7px',
        border: 'none',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer'
    };

    const statusStyle = (enabled) => ({
        display: 'inline-block',
        padding: '5px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '700',
        background: enabled
            ? 'rgba(34, 197, 94, 0.12)'
            : 'rgba(245, 158, 11, 0.12)',
        color: enabled ? '#86EFAC' : '#FCD34D',
        border: enabled
            ? '1px solid rgba(34, 197, 94, 0.3)'
            : '1px solid rgba(245, 158, 11, 0.3)'
    });

    return (
        <div style={{
            maxWidth: '1150px',
            width: '100%',
            boxSizing: 'border-box',
            margin: '0 auto',
            padding: '28px 20px 40px',
            color: '#F4F4F5'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '25px'
            }}>
                <div>
                    <p style={{
                        margin: '0 0 8px',
                        color: '#A78BFA',
                        fontSize: '12px',
                        fontWeight: '700',
                        letterSpacing: '1.5px',
                        textTransform: 'uppercase'
                    }}>
                        Administration
                    </p>

                    <h2 style={{
                        margin: '0 0 8px',
                        color: '#F4F4F5',
                        fontSize: '28px',
                        fontWeight: '750'
                    }}>
                        User Management
                    </h2>

                    <p style={{ margin: 0, color: '#A1A1AA', fontSize: '14px' }}>
                        View and manage community members.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadUsers}
                    disabled={loading || updatingId !== null || savingPhoneId !== null}
                    style={{
                        ...buttonStyle,
                        background: '#8B5CF6',
                        color: '#FFFFFF',
                        padding: '11px 16px'
                    }}
                >
                    ↻ Refresh Users
                </button>
            </div>

            {error && (
                <div role="alert" style={{
                    padding: '13px 15px',
                    marginBottom: '18px',
                    borderRadius: '9px',
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    color: '#FCA5A5',
                    fontSize: '14px'
                }}>
                    {error}
                </div>
            )}

            {message && (
                <div role="status" style={{
                    padding: '13px 15px',
                    marginBottom: '18px',
                    borderRadius: '9px',
                    background: 'rgba(34, 197, 94, 0.12)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    color: '#86EFAC',
                    fontSize: '14px'
                }}>
                    {message}
                </div>
            )}

            <div style={{
                padding: '20px',
                marginBottom: '20px',
                background: '#27272A',
                border: '1px solid #3F3F46',
                borderRadius: '12px'
            }}>
                <p style={{ margin: '0 0 5px', color: '#A1A1AA', fontSize: '13px' }}>
                    Total Community Members
                </p>
                <h3 style={{ margin: 0, color: '#F4F4F5', fontSize: '25px' }}>
                    {loading ? '...' : users.length}
                </h3>
            </div>

            <div style={{
                background: '#27272A',
                border: '1px solid #3F3F46',
                borderRadius: '12px',
                overflow: 'hidden'
            }}>
                <div style={{ padding: '19px 20px', borderBottom: '1px solid #3F3F46' }}>
                    <h3 style={{ margin: '0 0 5px', color: '#F4F4F5', fontSize: '18px' }}>
                        Community Members
                    </h3>
                    <p style={{ margin: 0, color: '#A1A1AA', fontSize: '13px' }}>
                        Manage account status without deleting booking history.
                    </p>
                </div>

                {loading ? (
                    <div style={{ padding: '45px 20px', textAlign: 'center', color: '#A1A1AA' }}>
                        Loading users...
                    </div>
                ) : users.length === 0 ? (
                    <div style={{ padding: '45px 20px', textAlign: 'center', color: '#A1A1AA' }}>
                        <h3 style={{ color: '#E4E4E7' }}>No Users Found</h3>
                        Community member records will appear here.
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto', width: '100%' }}>
                        <table style={{
                            width: '100%',
                            minWidth: '950px',
                            borderCollapse: 'collapse'
                        }}>
                            <thead>
                                <tr>
                                    <th style={headerStyle}>ID</th>
                                    <th style={headerStyle}>Full Name</th>
                                    <th style={headerStyle}>Email</th>
                                    <th style={headerStyle}>Phone</th>
                                    <th style={headerStyle}>Status</th>
                                    <th style={headerStyle}>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {users.map((user) => {
                                    const enabled = user.enabled !== false;
                                    const isEditing = editingPhoneId === user.id;

                                    return (
                                        <tr
                                            key={user.id}
                                            style={{
                                                background: enabled
                                                    ? 'transparent'
                                                    : 'rgba(245, 158, 11, 0.035)'
                                            }}
                                        >
                                            <td style={cellStyle}>
                                                <span style={{ color: '#A78BFA', fontWeight: '700' }}>
                                                    #{user.id}
                                                </span>
                                            </td>

                                            <td style={cellStyle}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                                                    <div style={{
                                                        width: '36px',
                                                        height: '36px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0,
                                                        borderRadius: '50%',
                                                        background: 'rgba(139, 92, 246, 0.18)',
                                                        color: '#C4B5FD',
                                                        fontSize: '12px',
                                                        fontWeight: '700'
                                                    }}>
                                                        {getInitials(user.fullName)}
                                                    </div>
                                                    <span style={{ color: '#F4F4F5', fontWeight: '600' }}>
                                                        {user.fullName || '—'}
                                                    </span>
                                                </div>
                                            </td>

                                            <td style={{ ...cellStyle, color: '#A1A1AA' }}>
                                                {user.email || '—'}
                                            </td>

                                            <td style={{ ...cellStyle, minWidth: '190px' }}>
                                                {isEditing ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '7px' }}>
                                                        <input
                                                            type="tel"
                                                            value={phoneValues[user.id] ?? ''}
                                                            onChange={(e) => setPhoneValues((current) => ({
                                                                ...current,
                                                                [user.id]: e.target.value
                                                            }))}
                                                            placeholder="Enter phone number"
                                                            maxLength={15}
                                                            aria-label={`Phone number for ${user.fullName}`}
                                                            style={{
                                                                width: '155px',
                                                                boxSizing: 'border-box',
                                                                padding: '9px 10px',
                                                                border: '1px solid #52525B',
                                                                borderRadius: '7px',
                                                                background: '#18181B',
                                                                color: '#F4F4F5',
                                                                fontSize: '13px'
                                                            }}
                                                        />

                                                        <div style={{ display: 'flex', gap: '6px' }}>
                                                            <button
                                                                type="button"
                                                                onClick={() => handlePhoneSave(user)}
                                                                disabled={savingPhoneId !== null}
                                                                style={{
                                                                    ...buttonStyle,
                                                                    background: '#8B5CF6',
                                                                    color: '#FFFFFF'
                                                                }}
                                                            >
                                                                {savingPhoneId === user.id ? 'Saving...' : 'Save'}
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => cancelPhoneEdit(user)}
                                                                disabled={savingPhoneId !== null}
                                                                style={{
                                                                    ...buttonStyle,
                                                                    background: '#3F3F46',
                                                                    color: '#E4E4E7'
                                                                }}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '7px' }}>
                                                        <span>{user.phone || 'Not added'}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setPhoneValues((current) => ({
                                                                    ...current,
                                                                    [user.id]: user.phone || ''
                                                                }));
                                                                setEditingPhoneId(user.id);
                                                                setError('');
                                                                setMessage('');
                                                            }}
                                                            disabled={savingPhoneId !== null}
                                                            style={{
                                                                ...buttonStyle,
                                                                background: user.phone ? '#3F3F46' : '#8B5CF6',
                                                                color: '#FFFFFF'
                                                            }}
                                                        >
                                                            {user.phone ? '✎ Edit' : '+ Add Phone'}
                                                        </button>
                                                    </div>
                                                )}
                                            </td>

                                            <td style={cellStyle}>
                                                <span style={statusStyle(enabled)}>
                                                    {enabled ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>

                                            <td style={cellStyle}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleStatusChange(user)}
                                                    disabled={updatingId !== null || savingPhoneId !== null}
                                                    style={{
                                                        ...buttonStyle,
                                                        padding: '9px 13px',
                                                        background: enabled
                                                            ? 'rgba(245, 158, 11, 0.12)'
                                                            : 'rgba(34, 197, 94, 0.12)',
                                                        color: enabled ? '#FCD34D' : '#86EFAC',
                                                        border: enabled
                                                            ? '1px solid rgba(245, 158, 11, 0.35)'
                                                            : '1px solid rgba(34, 197, 94, 0.35)'
                                                    }}
                                                >
                                                    {updatingId === user.id
                                                        ? 'Please wait...'
                                                        : enabled ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && users.length > 0 && (
                    <div style={{
                        padding: '13px 18px',
                        background: '#202023',
                        borderTop: '1px solid #3F3F46',
                        color: '#A1A1AA',
                        fontSize: '12px'
                    }}>
                        Showing {users.length} community member{users.length === 1 ? '' : 's'}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Users;
