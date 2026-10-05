import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import RequestCard from '../components/RequestCard';

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {history.map(req => (
                        <RequestCard key={req.id} request={req} />
                    ))}
                </div>
            )}
        </div>
    );
}
