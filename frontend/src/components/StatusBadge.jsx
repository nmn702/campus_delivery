import React from 'react';

export default function StatusBadge({ status }) {
    const getStyles = (status) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'ACCEPTED':
            case 'COST_SUBMITTED':
            case 'PAYMENT_PENDING':
                return 'bg-blue-100 text-blue-800';
            case 'PAID':
                return 'bg-purple-100 text-purple-800';
            case 'COMPLETED':
            case 'RATED':
                return 'bg-green-100 text-green-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <span className={`text-xs font-semibold px-2 py-1 rounded-full uppercase ${getStyles(status)}`}>
            {status.replace('_', ' ')}
        </span>
    );
}
