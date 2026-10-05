import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import RequestCard from '../components/RequestCard';

export default function RunnerMode() {
    const [stores, setStores] = useState([]);
    const [selectedStores, setSelectedStores] = useState([]);
    const [sessions, setSessions] = useState([]); // array of active sessions
    const [activeRequests, setActiveRequests] = useState([]);
    const navigate = useNavigate();
    const [pendingRequests, setPendingRequests] = useState([]);

    useEffect(() => {
        api.get('/stores').then(res => setStores(res.data)).catch(console.error);
    }, []);

    useEffect(() => {
        let interval;
        if (sessions.length > 0) {
            const fetchData = () => {
                // Fetch assigned requests for user
                api.get('/requests/history').then(res => {
                    const active = res.data.filter(r => 
                        (r.status !== 'COMPLETED' && r.status !== 'CANCELLED' && r.status !== 'RATED') && r.runner_id === sessions[0].user_id
                    );
                    setActiveRequests(active);
                });
                
                // Fetch unassigned pending requests at all active stores
                const storeIds = sessions.map(s => s.store_id);
                Promise.all(storeIds.map(id => api.get(`/requests?store_id=${id}`)))
                    .then(responses => {
                        const allPending = responses.flatMap(r => r.data);
                        setPendingRequests(allPending);
                    });
            };
            fetchData();
            interval = setInterval(fetchData, 3000);
        }
        return () => clearInterval(interval);
    }, [sessions]);

    useEffect(() => {
        api.get('/runner/sessions/me').then(res => {
            if (res.data && res.data.length > 0) {
                setSessions(res.data);
                setSelectedStores(res.data.map(s => s.store_id));
            }
        }).catch(console.error);
    }, []);

    const handleToggleStore = (storeId) => {
        setSelectedStores(prev => {
            if (prev.includes(storeId)) return prev.filter(id => id !== storeId);
            if (prev.length >= 3) return prev; // max 3
            return [...prev, storeId];
        });
    };

    const handleEnable = async () => {
        if (selectedStores.length === 0) return;
        try {
            const res = await api.post('/runner/sessions', {
                store_ids: selectedStores,
                latitude: 40.0,
                longitude: -74.0
            });
            setSessions(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleDisable = async () => {
        if (sessions.length === 0) return;
        try {
            await api.delete('/runner/sessions/me');
            setSessions([]);
            // Don't clear selectedStores so they can easily adjust and re-enable
        } catch (e) {
            console.error(e);
        }
    };

    const activeStoreNames = sessions
        .map(session => stores.find(s => s.id === session.store_id)?.name)
        .filter(Boolean)
        .join(', ');

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <button onClick={() => navigate('/')} className="mb-4 text-blue-600">&larr; Back Home</button>
            
            <div className="bg-white p-6 rounded shadow mb-6">
                <h1 className="text-2xl font-bold mb-4">Runner Mode</h1>
                
                {sessions.length === 0 ? (
                    <div>
                        <label className="block mb-2 font-medium">Where are you going? (Select up to 3)</label>
                        <div className="space-y-2 mb-4 border rounded p-3 bg-gray-50 max-h-60 overflow-y-auto">
                            {stores.map(s => (
                                <label key={s.id} className="flex items-center space-x-3 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedStores.includes(s.id)}
                                        onChange={() => handleToggleStore(s.id)}
                                        disabled={!selectedStores.includes(s.id) && selectedStores.length >= 3}
                                        className="w-5 h-5 text-blue-600"
                                    />
                                    <span>{s.name}</span>
                                </label>
                            ))}
                        </div>
                        <button 
                            onClick={handleEnable}
                            disabled={selectedStores.length === 0}
                            className="w-full bg-green-600 text-white p-2 rounded disabled:opacity-50"
                        >
                            Become Discoverable
                        </button>
                    </div>
                ) : (
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
                            <div>
                                <span className="text-green-600 font-bold flex items-center mb-1">
                                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                    Visible at {sessions.length} location(s)
                                </span>
                                <p className="text-sm font-medium text-gray-700">{activeStoreNames}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button onClick={handleDisable} className="text-blue-600 border border-blue-600 px-3 py-1 rounded hover:bg-blue-50 text-sm font-medium">
                                    Change Locations
                                </button>
                                <button onClick={() => { setSelectedStores([]); handleDisable(); }} className="text-red-600 border border-red-600 px-3 py-1 rounded hover:bg-red-50 text-sm font-medium">
                                    Go Offline
                                </button>
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm border-t pt-3 mt-1">Waiting for someone to assign you a request, or pick one from below...</p>
                    </div>
                )}
            </div>

            {sessions.length > 0 && pendingRequests.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4">Available Requests to Accept</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pendingRequests.map(req => (
                            <RequestCard key={req.id} request={req} />
                        ))}
                    </div>
                </div>
            )}

            {sessions.length > 0 && activeRequests.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold mb-4">Your Active Tasks</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeRequests.map(req => (
                            <RequestCard key={req.id} request={req} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
