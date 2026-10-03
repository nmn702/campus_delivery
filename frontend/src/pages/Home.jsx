import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const [stores, setStores] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/stores').then(res => setStores(res.data)).catch(console.error);
        api.get('/runner/sessions/me').then(res => setActiveSession(res.data)).catch(console.error);
    }, []);

    const handleDisableRunner = async () => {
        if (activeSession) {
            try {
                await api.delete(`/runner/sessions/${activeSession.id}`);
                setActiveSession(null);
            } catch (e) {
                console.error(e);
            }
        }
    };

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Campus Pickup</h1>
                <div>
                    <button onClick={() => navigate('/profile')} className="mr-4 text-blue-600">Profile</button>
                    <button onClick={() => navigate('/history')} className="mr-4 text-blue-600">History</button>
                    <button onClick={logout} className="text-red-600">Logout</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-semibold mb-4">I want to be a Runner</h2>
                    {activeSession ? (
                        <div>
                            <p className="mb-4 text-green-700 font-medium flex items-center">
                                <span className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                You are currently running on {activeSession.store_name}
                            </p>
                            <button 
                                onClick={() => navigate('/runner-mode')}
                                className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 mb-2"
                            >
                                View Runner Dashboard
                            </button>
                            <button 
                                onClick={handleDisableRunner}
                                className="w-full bg-red-100 text-red-600 p-2 rounded hover:bg-red-200"
                            >
                                Turn Off Runner Mode
                            </button>
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

                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-semibold mb-4">Request a Pickup</h2>
                    <p className="mb-4 text-gray-600">Need something? Find a runner heading to your store.</p>
                    
                    <h3 className="font-medium mb-2">Available Stores:</h3>
                    <ul className="space-y-2">
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
        </div>
    );
}
