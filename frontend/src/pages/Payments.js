
import React, { useEffect, useState, useCallback } from 'react';
import {
    getMyPayments,
    getAllPayments,
    markAsPaid,
    getAllUsers,
    createPayment
} from '../services/api';
import { useAuth } from '../context/AuthContext';

function Payments() {
    const { user, hasRole } = useAuth();
    const isAdmin = hasRole('ROLE_ADMIN');

    const [payments, setPayments] = useState([]);
    const [users, setUsers] = useState([]);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [residentId, setResidentId] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const loadPayments = useCallback(async () => {
        if (!user?.id) {
            setLoading(false);
            setError('User information is unavailable. Please log in again.');
            return;
        }

        try {
            setLoading(true);
            setError('');

            if (isAdmin) {
                const [usersResponse, paymentsResponse] = await Promise.all([
                    getAllUsers(),
                    getAllPayments()
                ]);

                setUsers(
                    Array.isArray(usersResponse.data)
                        ? usersResponse.data
                        : []
                );

                setPayments(
                    Array.isArray(paymentsResponse.data)
                        ? paymentsResponse.data
                        : []
                );
            } else {
                const response = await getMyPayments(user.id);

                setPayments(
                    Array.isArray(response.data) ? response.data : []
                );
            }
        } catch (err) {
            console.error('Payment loading error:', err.response?.data || err);
            setError(
                err.response?.data?.message ||
                'Could not load payment information. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    }, [user?.id, isAdmin]);

    useEffect(() => {
        loadPayments();
    }, [loadPayments]);

    const handleCreatePayment = async (event) => {
        event.preventDefault();

        if (!residentId || !amount || !description.trim()) {
            setError(
                'Please select a resident and enter amount and description.'
            );
            setMessage('');
            return;
        }

        const numericAmount = Number(amount);

        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            setError('Amount must be greater than zero.');
            setMessage('');
            return;
        }

        try {
            setSaving(true);
            setError('');
            setMessage('');

            await createPayment({
                amount: numericAmount,
                description: description.trim(),
                paidBy: {
                    id: Number(residentId)
                }
            });

            setAmount('');
            setDescription('');
            setResidentId('');
            setMessage('Payment created successfully.');

            await loadPayments();
        } catch (err) {
            console.error('Create payment error:', err.response?.data || err);
            setError(
                err.response?.data?.message ||
                'Could not create payment. Please try again.'
            );
        } finally {
            setSaving(false);
        }
    };

    const handleMarkAsPaid = async (paymentId) => {
        try {
            setUpdatingId(paymentId);
            setError('');
            setMessage('');

            await markAsPaid(paymentId);

            setMessage('Payment marked as PAID successfully.');
            await loadPayments();
        } catch (err) {
            console.error('Update payment error:', err.response?.data || err);
            setError(
                err.response?.data?.message ||
                'Could not update payment status.'
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const getUserName = (resident) =>
        resident.fullName ||
        resident.name ||
        resident.email ||
        `User ${resident.id}`;

    const getResidentName = (payment) => {
        const resident = payment.paidBy;

        if (!resident) {
            return 'Resident';
        }

        return (
            resident.fullName ||
            resident.name ||
            resident.email ||
            (resident.id ? `User ${resident.id}` : 'Resident')
        );
    };

    const getStatusStyle = (status) => {
        if (status === 'PAID') {
            return {
                color: '#86EFAC',
                background: 'rgba(34, 197, 94, 0.14)',
                border: '1px solid rgba(34, 197, 94, 0.35)'
            };
        }

        return {
            color: '#FCD34D',
            background: 'rgba(245, 158, 11, 0.13)',
            border: '1px solid rgba(245, 158, 11, 0.35)'
        };
    };

    const inputStyle = {
        display: 'block',
        width: '100%',
        padding: '12px 14px',
        marginTop: '7px',
        boxSizing: 'border-box',
        background: '#18181B',
        color: '#F4F4F5',
        border: '1px solid #52525B',
        borderRadius: '8px',
        outline: 'none',
        fontSize: '14px'
    };

    const primaryButtonStyle = {
        padding: '11px 18px',
        background: '#8B5CF6',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'background 0.2s ease',
        opacity: saving || updatingId !== null ? 0.65 : 1
    };

    const renderPayment = (payment) => {
        const status = (payment.status || 'PENDING').toUpperCase();

        return (
            <div
                key={payment.id}
                style={{
                    background: '#27272A',
                    border: '1px solid #3F3F46',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '14px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)'
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '12px',
                        flexWrap: 'wrap',
                        marginBottom: '16px'
                    }}
                >
                    <div style={{ minWidth: 0, flex: '1 1 200px' }}>
                        <h3
                            style={{
                                margin: '0 0 7px',
                                color: '#F4F4F5',
                                fontSize: '17px',
                                overflowWrap: 'anywhere'
                            }}
                        >
                            {payment.description || 'Community Payment'}
                        </h3>

                        <p
                            style={{
                                margin: 0,
                                color: '#A1A1AA',
                                fontSize: '13px'
                            }}
                        >
                            Payment ID: #{payment.id}
                        </p>
                    </div>

                    <span
                        style={{
                            ...getStatusStyle(status),
                            display: 'inline-block',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '700',
                            letterSpacing: '0.4px',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {status}
                    </span>
                </div>

                <div
                    style={{
                        background: '#18181B',
                        borderRadius: '9px',
                        padding: '15px',
                        marginBottom: '14px'
                    }}
                >
                    <p
                        style={{
                            margin: '0 0 5px',
                            color: '#A1A1AA',
                            fontSize: '13px'
                        }}
                    >
                        Amount
                    </p>

                    <p
                        style={{
                            margin: 0,
                            color: '#C4B5FD',
                            fontSize: '25px',
                            fontWeight: '700'
                        }}
                    >
                        ₹
                        {payment.amount != null
                            ? Number(payment.amount).toLocaleString('en-IN', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                              })
                            : 'N/A'}
                    </p>
                </div>

                {isAdmin && (
                    <p
                        style={{
                            margin: '10px 0',
                            color: '#D4D4D8',
                            fontSize: '14px',
                            overflowWrap: 'anywhere'
                        }}
                    >
                        <strong style={{ color: '#A1A1AA' }}>
                            Resident:{' '}
                        </strong>
                        {getResidentName(payment)}
                    </p>
                )}

                {payment.paidAt && (
                    <p
                        style={{
                            margin: '10px 0',
                            color: '#A1A1AA',
                            fontSize: '13px'
                        }}
                    >
                        <strong style={{ color: '#D4D4D8' }}>
                            Paid At:{' '}
                        </strong>
                        {new Date(payment.paidAt).toLocaleString()}
                    </p>
                )}

                {isAdmin && status === 'PENDING' && (
                    <button
                        type="button"
                        onClick={() => handleMarkAsPaid(payment.id)}
                        disabled={updatingId !== null}
                        style={{
                            ...primaryButtonStyle,
                            marginTop: '8px',
                            cursor:
                                updatingId !== null ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {updatingId === payment.id
                            ? 'Updating...'
                            : '✓ Mark as Paid'}
                    </button>
                )}
            </div>
        );
    };

    return (
        <div
            style={{
                maxWidth: '1000px',
                width: '100%',
                boxSizing: 'border-box',
                margin: '0 auto',
                padding: '28px 20px 40px',
                color: '#F4F4F5'
            }}
        >
            <div style={{ marginBottom: '25px' }}>
                <p
                    style={{
                        margin: '0 0 8px',
                        color: '#A78BFA',
                        fontSize: '12px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '1.5px'
                    }}
                >
                    Community Finance
                </p>

                <h2
                    style={{
                        margin: '0 0 8px',
                        fontSize: '28px',
                        fontWeight: '750',
                        color: '#F4F4F5'
                    }}
                >
                    {isAdmin ? 'Payment Management' : 'My Payments'}
                </h2>

                <p style={{ margin: 0, color: '#A1A1AA', fontSize: '14px' }}>
                    {isAdmin
                        ? 'Create resident payments and manage payment statuses.'
                        : 'View your community payment records and their current status.'}
                </p>
            </div>

            {error && (
                <div
                    role="alert"
                    style={{
                        padding: '13px 15px',
                        marginBottom: '16px',
                        borderRadius: '9px',
                        background: 'rgba(239, 68, 68, 0.12)',
                        border: '1px solid rgba(239, 68, 68, 0.35)',
                        color: '#FCA5A5',
                        fontSize: '14px'
                    }}
                >
                    {error}
                </div>
            )}

            {message && (
                <div
                    role="status"
                    style={{
                        padding: '13px 15px',
                        marginBottom: '16px',
                        borderRadius: '9px',
                        background: 'rgba(34, 197, 94, 0.12)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        color: '#86EFAC',
                        fontSize: '14px'
                    }}
                >
                    {message}
                </div>
            )}

            {isAdmin && (
                <section
                    style={{
                        background: '#27272A',
                        border: '1px solid #3F3F46',
                        borderRadius: '14px',
                        padding: '22px',
                        marginBottom: '30px',
                        boxShadow: '0 6px 18px rgba(0, 0, 0, 0.12)'
                    }}
                >
                    <div style={{ marginBottom: '20px' }}>
                        <h3
                            style={{
                                margin: '0 0 6px',
                                color: '#F4F4F5',
                                fontSize: '19px'
                            }}
                        >
                            Create Resident Payment
                        </h3>

                        <p
                            style={{
                                margin: 0,
                                color: '#A1A1AA',
                                fontSize: '13px'
                            }}
                        >
                            Assign a payment to a resident.
                        </p>
                    </div>

                    {loading && users.length === 0 ? (
                        <p style={{ color: '#A1A1AA' }}>
                            Loading residents...
                        </p>
                    ) : (
                        <form onSubmit={handleCreatePayment}>
                            <div style={{ marginBottom: '17px' }}>
                                <label
                                    htmlFor="resident"
                                    style={{
                                        display: 'block',
                                        color: '#D4D4D8',
                                        fontSize: '14px',
                                        fontWeight: '600'
                                    }}
                                >
                                    Select Resident
                                </label>

                                <select
                                    id="resident"
                                    value={residentId}
                                    onChange={(e) =>
                                        setResidentId(e.target.value)
                                    }
                                    required
                                    style={inputStyle}
                                >
                                    <option value="">
                                        Choose a resident
                                    </option>

                                    {users
                                        .filter((resident) =>
                                            resident.roles?.some((role) =>
                                                (typeof role === 'string'
                                                    ? role
                                                    : role.name || role.authority
                                                ) === 'ROLE_RESIDENT'
                                            )
                                        )
                                        .map((resident) => (
                                            <option
                                                key={resident.id}
                                                value={resident.id}
                                            >
                                                {getUserName(resident)}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '17px' }}>
                                <label
                                    htmlFor="amount"
                                    style={{
                                        display: 'block',
                                        color: '#D4D4D8',
                                        fontSize: '14px',
                                        fontWeight: '600'
                                    }}
                                >
                                    Amount (₹)
                                </label>

                                <input
                                    id="amount"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    required
                                    style={inputStyle}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label
                                    htmlFor="description"
                                    style={{
                                        display: 'block',
                                        color: '#D4D4D8',
                                        fontSize: '14px',
                                        fontWeight: '600'
                                    }}
                                >
                                    Description
                                </label>

                                <input
                                    id="description"
                                    type="text"
                                    maxLength="100"
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    placeholder="e.g. Monthly Maintenance"
                                    required
                                    style={inputStyle}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                style={{
                                    ...primaryButtonStyle,
                                    width: '100%',
                                    padding: '13px 18px',
                                    cursor: saving ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {saving
                                    ? 'Creating Payment...'
                                    : '+ Create Payment'}
                            </button>
                        </form>
                    )}
                </section>
            )}

            <section>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '12px',
                        flexWrap: 'wrap',
                        marginBottom: '17px'
                    }}
                >
                    <div>
                        <h3
                            style={{
                                margin: '0 0 5px',
                                color: '#F4F4F5',
                                fontSize: '20px'
                            }}
                        >
                            {isAdmin ? 'All Payments' : 'My Payment History'}
                        </h3>

                        <p
                            style={{
                                margin: 0,
                                color: '#A1A1AA',
                                fontSize: '13px'
                            }}
                        >
                            {loading
                                ? 'Loading payment records...'
                                : `${payments.length} payment record${payments.length === 1 ? '' : 's'}`}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={loadPayments}
                        disabled={loading}
                        style={{
                            padding: '9px 14px',
                            background: '#3F3F46',
                            color: '#E4E4E7',
                            border: '1px solid #52525B',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.65 : 1
                        }}
                    >
                        ↻ Refresh
                    </button>
                </div>

                {loading && (
                    <div
                        style={{
                            padding: '28px 20px',
                            textAlign: 'center',
                            background: '#27272A',
                            border: '1px solid #3F3F46',
                            borderRadius: '12px',
                            color: '#A1A1AA'
                        }}
                    >
                        Loading payments...
                    </div>
                )}

                {!loading && payments.length === 0 && !error && (
                    <div
                        style={{
                            padding: '36px 20px',
                            textAlign: 'center',
                            background: '#27272A',
                            border: '1px dashed #52525B',
                            borderRadius: '12px'
                        }}
                    >
                        <div
                            style={{
                                fontSize: '32px',
                                marginBottom: '12px'
                            }}
                        >
                            ₹
                        </div>

                        <h3
                            style={{
                                margin: '0 0 8px',
                                color: '#E4E4E7',
                                fontSize: '17px'
                            }}
                        >
                            No Payments Yet
                        </h3>

                        <p
                            style={{
                                margin: 0,
                                color: '#A1A1AA',
                                fontSize: '14px'
                            }}
                        >
                            Payment records will appear here when available.
                        </p>
                    </div>
                )}

                {!loading && payments.map(renderPayment)}
            </section>
        </div>
    );
}

export default Payments;
