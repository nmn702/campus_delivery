import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function RunnerMode() {
    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState('');
    const [session, setSession] = useState(null);
    const [activeRequests, setActiveRequests] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/stores').then(res => setStores(res.data)).catch(console.error);
    }, []);

    const [pendingRequests, setPendingRequests] = useState([]);

    useEffect(() => {
        let interval;
        if (session) {
            const fetchData = () => {
                // Fetch assigned requests
                api.get('/requests/history').then(res => {
                    const active = res.data.filter(r => 
                        (r.status !== 'COMPLETED' && r.status !== 'CANCELLED' && r.status !== 'RATED') && r.runner_id === session.user_id
                    );
                    setActiveRequests(active);
                });
                
                // Fetch unassigned pending requests at this store
                api.get(`/requests?store_id=${session.store_id}`).then(res => {
                    setPendingRequests(res.data);
                });
            };
            fetchData();
            interval = setInterval(fetchData, 3000);
        }
        return () => clearInterval(interval);
    }, [session]);

    // Also need to fetch session on mount if user is already a runner
    useEffect(() => {
        api.get('/runner/sessions/me').then(res => {
            if (res.data) {
                setSession(res.data);
                setSelectedStore(res.data.store_id);
            }
        }).catch(console.error);
    }, []);

    const handleEnable = async () => {
        if (!selectedStore) return;
        try {
            // In a real app, get geolocation here
            const res = await api.post('/runner/sessions', {
                store_id: selectedStore,
                latitude: 40.0,
                longitude: -74.0
            });
            setSession(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleDisable = async () => {
        if (!session) return;
        try {
            await api.delete(`/runner/sessions/${session.id}`);
            setSession(null);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <button onClick={() => navigate('/')} className="mb-4 text-blue-600">&larr; Back Home</button>
            
            <div className="bg-white p-6 rounded shadow mb-6">
                <h1 className="text-2xl font-bold mb-4">Runner Mode</h1>
                
                {!session ? (
                    <div>
                        <label className="block mb-2 font-medium">Where are you going?</label>
                        <select 
                            value={selectedStore} 
                            onChange={(e) => setSelectedStore(e.target.value)}
                            className="w-full border p-2 rounded mb-4"
                        >
                            <option value="">Select a store...</option>
                            {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <button 
                            onClick={handleEnable}
                            disabled={!selectedStore}
                            className="w-full bg-green-600 text-white p-2 rounded disabled:opacity-50"
                        >
                            Become Discoverable
                        </button>
                    </div>
                ) : (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-green-600 font-bold flex items-center">
                                <span className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                You are visible to requesters!
                            </span>
                            <button onClick={handleDisable} className="text-red-600 border border-red-600 px-3 py-1 rounded">
                                Go Offline
                            </button>
                        </div>
                        <p className="text-gray-600 text-sm">Waiting for someone to assign you a request, or pick one from below...</p>
                    </div>
                )}
            </div>

            {session && pendingRequests.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4">Available Requests to Accept</h2>
                    {pendingRequests.map(req => (
                        <div key={req.id} className="bg-white border-l-4 border-yellow-400 p-4 rounded shadow mb-4 cursor-pointer hover:bg-yellow-50" onClick={() => navigate(`/request-details/${req.id}`)}>
                            <div className="flex justify-between">
                                <span className="font-bold">Request #{req.id}</span>
                                <span className="bg-yellow-100 text-yellow-800 px-2 rounded text-sm">{req.status}</span>
                            </div>
                            <p className="text-gray-600 mt-2">{req.items}</p>
                            <p className="text-sm mt-1">Deliver to: {req.pickup_location}</p>
                            <p className="text-sm font-medium mt-1 text-green-700">Commission: {req.commission_type === 'FLAT' ? `₹${req.commission_amount}` : `${req.commission_amount}%`}</p>
                        </div>
                    ))}
                </div>
            )}

            {session && activeRequests.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold mb-4">Your Active Tasks</h2>
                    {activeRequests.map(req => (
                        <div key={req.id} className="bg-white border-l-4 border-green-500 p-4 rounded shadow mb-4 cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/request-details/${req.id}`)}>
                            <div className="flex justify-between">
                                <span className="font-bold">Request #{req.id}</span>
                                <span className="bg-blue-100 text-blue-800 px-2 rounded text-sm">{req.status}</span>
                            </div>
                            <p className="text-gray-600 mt-2">{req.items}</p>
                            <p className="text-sm mt-1">Deliver to: {req.pickup_location}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
