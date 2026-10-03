import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function RequestPickup() {
    const { storeId } = useParams();
    const navigate = useNavigate();
    const [runners, setRunners] = useState([]);
    const [items, setItems] = useState('');
    const [commissionType, setCommissionType] = useState('FLAT');
    const [commissionAmount, setCommissionAmount] = useState('');
    const [location, setLocation] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchRunners = () => {
            api.get(`/runners?store_id=${storeId}`)
                .then(res => setRunners(res.data))
                .catch(console.error);
        };
        fetchRunners();
        const interval = setInterval(fetchRunners, 3000);
        return () => clearInterval(interval);
    }, [storeId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/requests', {
                store_id: storeId,
                items,
                commission_type: commissionType,
                commission_amount: parseFloat(commissionAmount),
                pickup_location: location,
                notes
            });
            navigate(`/request-details/${res.data.id}`);
        } catch (error) {
            console.error(error);
            alert('Failed to create request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <button onClick={() => navigate('/')} className="mb-4 text-blue-600">&larr; Back Home</button>
            
            <div className="bg-white p-6 rounded shadow mb-6">
                <h1 className="text-2xl font-bold mb-2">Create Pickup Request</h1>
                
                <div className="mb-6 p-4 bg-blue-50 rounded">
                    <h3 className="font-bold text-blue-800">Available Runners at this Store: {runners.length}</h3>
                    {runners.length === 0 && <p className="text-sm text-blue-600 mt-1">You can still create a request, runners will see it when they become available.</p>}
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-1 font-medium">Items to buy</label>
                        <textarea required value={items} onChange={e => setItems(e.target.value)} className="w-full border p-2 rounded" placeholder="e.g. 2 Milk packets + Bread" />
                    </div>
                    <div className="mb-4 grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 font-medium">Commission Type</label>
                            <select value={commissionType} onChange={e => setCommissionType(e.target.value)} className="w-full border p-2 rounded">
                                <option value="FLAT">Flat Amount (₹)</option>
                                <option value="PERCENTAGE">Percentage (%)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Commission Amount</label>
                            <input required type="number" value={commissionAmount} onChange={e => setCommissionAmount(e.target.value)} className="w-full border p-2 rounded" placeholder={commissionType === 'FLAT' ? "20" : "10"} />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1 font-medium">Delivery Location</label>
                        <input required type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full border p-2 rounded" placeholder="Hostel Gate 2" />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1 font-medium">Notes (Optional)</label>
                        <input type="text" value={notes} onChange={e => setNotes(e.target.value)} className="w-full border p-2 rounded" placeholder="Any brand is fine" />
                    </div>
                    
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                        {loading ? 'Creating...' : 'Submit Request'}
                    </button>
                </form>
            </div>
        </div>
    );
}
