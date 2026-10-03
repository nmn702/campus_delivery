import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function History() {
    const [history, setHistory] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/requests/history').then(res => setHistory(res.data)).catch(console.error);
    }, []);

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <button onClick={() => navigate('/')} className="mb-4 text-blue-600">&larr; Back Home</button>
            <h1 className="text-2xl font-bold mb-6">Your History</h1>
            
            {history.length === 0 ? (
                <p>No past requests found.</p>
            ) : (
                <div className="space-y-4">
                    {history.map(req => (
                        <div key={req.id} className="bg-white p-4 rounded shadow flex justify-between items-center cursor-pointer hover:bg-gray-50"
                             onClick={() => navigate(`/request-details/${req.id}`)}>
                            <div>
                                <h3 className="font-bold">Request #{req.id}</h3>
                                <p className="text-sm text-gray-600">{req.store_name} - {req.items}</p>
                                <p className="text-xs text-gray-400">{new Date(req.created_at).toLocaleString()}</p>
                            </div>
                            <span className="bg-gray-100 px-3 py-1 rounded text-sm font-medium">
                                {req.status}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
