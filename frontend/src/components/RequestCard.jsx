import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';

export default function RequestCard({ request }) {
    const navigate = useNavigate();

    return (
        <div 
            onClick={() => navigate(`/request-details/${request.id}`)} 
            className="p-4 bg-white border rounded shadow-sm cursor-pointer hover:shadow-md hover:bg-gray-50 transition-all relative overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="font-bold text-gray-800">
                        {request.store_name ? `📍 ${request.store_name}` : `Request #${request.id}`}
                    </h3>
                </div>
                <StatusBadge status={request.status} />
            </div>
            <p className="text-sm text-gray-700 mb-2 truncate font-medium">{request.items}</p>
            <div className="flex justify-between items-end text-xs text-gray-500">
                <span>To: {request.pickup_location}</span>
                {request.commission_type && (
                    <span className="font-semibold text-green-600">
                        Commission: {request.commission_type === 'FLAT' ? `₹${request.commission_amount}` : `${request.commission_amount}%`}
                    </span>
                )}
            </div>
        </div>
    );
}
