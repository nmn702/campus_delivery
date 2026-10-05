import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RequestCard from '../components/RequestCard';

export default function Home() {
    const [stores, setStores] = useState([]);
    const [activeSessions, setActiveSessions] = useState([]);
    const [dbUser, setDbUser] = useState(null);
    const [history, setHistory] = useState([]);
    const [errorMsg, setErrorMsg] = useState(null);
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/me')
            .then(res => setDbUser(res.data))
            .catch(console.error);

        api.get('/requests/history')
            .then(res => setHistory(res.data))
            .catch(console.error);

        api.get('/stores')
            .then(res => {
                setStores(res.data);
                if (!Array.isArray(res.data)) {
                    setErrorMsg("API did not return an array: " + JSON.stringify(res.data));
                }
            })
            .catch(err => {
                console.error("Error fetching stores:", err);
                setErrorMsg(err.response?.data?.error || err.message);
            });
        
        api.get('/runner/sessions/me')
            .then(res => setActiveSessions(res.data || []))
            .catch(console.error);
    }, []);

    const handleDisableRunner = async () => {
        if (activeSessions.length > 0) {
            try {
                await api.delete('/runner/sessions/me');
                setActiveSessions([]);
            } catch (e) {
                console.error(e);
            }
        }
    };

    const pendingAsRequester = history.filter(req => dbUser && req.requester_id === dbUser.id && !['COMPLETED', 'CANCELLED'].includes(req.status));
    const activeAsRunner = history.filter(req => dbUser && req.runner_id === dbUser.id && !['COMPLETED', 'CANCELLED'].includes(req.status));

    return (
        <div className="p-4 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Campus Pickup</h1>
                <div>
                    <button onClick={() => navigate('/profile')} className="mr-4 text-blue-600">Profile</button>
                    <button onClick={() => navigate('/history')} className="mr-4 text-blue-600">History</button>
                    <button onClick={logout} className="text-red-600">Logout</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Left Section: Runner Mode */}
                <div className="bg-white p-6 rounded shadow flex flex-col">
                    <h2 className="text-xl font-semibold mb-4">I want to be a Runner</h2>
                    {activeSessions.length > 0 ? (
                        <div className="flex flex-col flex-grow">
                            <p className="mb-4 text-green-700 font-medium flex items-center">
                                <span className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                You are currently visible at {activeSessions.length} location(s)
                            </p>
                            <button 
                                onClick={() => navigate('/runner-mode')}
                                className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 mb-2"
                            >
                                View Runner Dashboard
                            </button>
                            <button 
                                onClick={handleDisableRunner}
                                className="w-full bg-red-100 text-red-600 p-2 rounded hover:bg-red-200 mb-4"
                            >
                                Turn Off Runner Mode
                            </button>
                            
                            {activeAsRunner.length > 0 && (
                                <div className="mt-4 pt-4 border-t">
                                    <h3 className="font-semibold text-gray-700 mb-2">Your Accepted Requests:</h3>
                                    <div className="space-y-3">
                                        {activeAsRunner.map(req => (
                                            <RequestCard key={req.id} request={req} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <p className="mb-4 text-gray-600">Going somewhere? Pick up items for others and earn.</p>
                            <button 
                                onClick={() => navigate('/runner-mode')}
                                className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
                            >
                                Enable Runner Mode
                            </button>
                        </div>
                    )}
                </div>

                {/* Middle Section: Request Pickup */}
                <div className="bg-white p-6 rounded shadow flex flex-col">
                    <h2 className="text-xl font-semibold mb-4">Request a Pickup</h2>
                    <p className="mb-4 text-gray-600">Need something? Find a runner heading to your store.</p>
                    
                    <h3 className="font-medium mb-2">Available Stores:</h3>
                    {errorMsg && <div className="text-red-500 font-bold mb-2">Error loading stores: {errorMsg}</div>}
                    <ul className="space-y-2 overflow-y-auto max-h-80">
                        {stores.map(store => (
                            <li key={store.id} className="flex justify-between items-center p-3 border rounded hover:bg-gray-50 cursor-pointer"
                                onClick={() => navigate(`/request/${store.id}`)}>
                                <span>{store.name}</span>
                                <span className="text-blue-600 text-sm">Find Runner &rarr;</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Bottom Section (3rd Section): Active Pending Orders */}
            <div className="bg-white p-6 rounded shadow">
                <h2 className="text-xl font-semibold mb-4">Your Active Orders</h2>
                {pendingAsRequester.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pendingAsRequester.map(req => (
                            <RequestCard key={req.id} request={req} />
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 italic">You don't have any active orders right now.</p>
                )}
            </div>
        </div>
    );
}
