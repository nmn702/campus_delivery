import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function RequestDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRequest = () => {
            api.get(`/requests/${id}`)
               .then(res => setRequest(res.data))
               .catch(err => console.error(err))
               .finally(() => setLoading(false));
        };
        fetchRequest();
        const interval = setInterval(fetchRequest, 3000);
        return () => clearInterval(interval);
    }, [id]);

    if (loading) return <div className="p-4 text-center">Loading...</div>;
    if (!request) return <div className="p-4 text-center">Request not found or unauthorized</div>;

    const isRequester = request.requester_firebase_uid === currentUser.uid;
    const isRunner = request.runner_firebase_uid === currentUser.uid;
    
    // Derived values
    const commissionVal = request.commission_type === 'FLAT' 
        ? parseFloat(request.commission_amount)
        : (parseFloat(request.cost_of_goods || 0) * (parseFloat(request.commission_amount) / 100));
        
    const finalAmount = parseFloat(request.cost_of_goods || 0) + commissionVal;

    const handleAccept = () => {
        api.post(`/requests/${id}/accept`).then(() => alert('Accepted!')).catch(e => alert(e.response?.data?.error || 'Error'));
    };
    
    const handleSetCost = () => {
        const cost = prompt('Enter the exact cost of the goods you purchased (₹):');
        if (!cost || isNaN(cost)) return;
        api.post(`/requests/${id}/cost`, { cost_of_goods: cost })
           .then(() => alert('Cost submitted!'))
           .catch(e => alert(e.response?.data?.error || 'Error'));
    };

    const handleRequesterConfirmPayment = () => {
        api.post(`/requests/${id}/payment/requester-confirm`, { declared_amount: finalAmount })
           .then(() => alert('Payment confirmed sent!'))
           .catch(e => alert(e.response?.data?.error || 'Error'));
    };

    const handleRunnerVerifyPayment = () => {
        api.post(`/requests/${id}/payment/runner-confirm`)
           .then(() => alert('Payment verified!'))
           .catch(e => alert(e.response?.data?.error || 'Error'));
    };

    const handleComplete = () => {
        api.post(`/requests/${id}/complete`)
           .then(() => alert('Request completed!'))
           .catch(e => alert(e.response?.data?.error || 'Error'));
    };
    
    const handleCancel = () => {
        api.post(`/requests/${id}/cancel`)
           .then(() => navigate('/'))
           .catch(e => alert(e.response?.data?.error || 'Error'));
    };

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <button onClick={() => navigate(-1)} className="mb-4 text-blue-600">&larr; Back</button>
            
            <div className="bg-white p-6 rounded shadow">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Request #{request.id}</h1>
                    <span className="bg-gray-200 px-3 py-1 rounded text-sm font-bold">{request.status}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <p className="text-sm text-gray-500">Requester</p>
                        <p className="font-medium">{request.requester_name}</p>
                        {request.requester_phone && <p className="text-xs text-gray-500">📞 {request.requester_phone}</p>}
                    </div>
                    {request.runner_name && (
                        <div>
                            <p className="text-sm text-gray-500">Runner</p>
                            <p className="font-medium">{request.runner_name}</p>
                            {request.runner_phone && <p className="text-xs text-gray-500">📞 {request.runner_phone}</p>}
                        </div>
                    )}
                    <div>
                        <p className="text-sm text-gray-500">Store</p>
                        <p className="font-medium">{request.store_name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium">{request.pickup_location}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Commission</p>
                        <p className="font-medium text-green-700">{request.commission_type === 'FLAT' ? `₹${request.commission_amount}` : `${request.commission_amount}%`}</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-sm text-gray-500">Items</p>
                        <p className="font-medium">{request.items}</p>
                    </div>
                    {request.notes && (
                        <div className="col-span-2">
                            <p className="text-sm text-gray-500">Notes</p>
                            <p className="font-medium">{request.notes}</p>
                        </div>
                    )}
                </div>
                
                {request.cost_of_goods && (
                    <div className="bg-gray-50 p-4 rounded mb-6 border">
                        <h3 className="font-bold mb-2">Payment Details</h3>
                        <div className="flex justify-between mb-1">
                            <span>Cost of Goods:</span>
                            <span>₹{request.cost_of_goods}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                            <span>Commission:</span>
                            <span>₹{commissionVal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                            <span>Total to Pay:</span>
                            <span>₹{finalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                )}

                <div className="border-t pt-4">
                    <h3 className="font-bold mb-3">Actions</h3>
                    
                    {request.status === 'PENDING' && (
                        <div className="flex space-x-2">
                            {!isRequester && (
                                <button onClick={handleAccept} className="bg-green-600 text-white px-4 py-2 rounded">Accept as Runner</button>
                            )}
                            {isRequester && (
                                <button onClick={handleCancel} className="bg-red-100 text-red-600 px-4 py-2 rounded">Cancel Request</button>
                            )}
                        </div>
                    )}

                    {request.status === 'ACCEPTED' && (
                        <div className="space-y-4">
                            <div className="p-3 bg-yellow-50 rounded text-yellow-800">
                                Runner is purchasing items. 
                            </div>
                            {isRunner && (
                                <button onClick={handleSetCost} className="w-full bg-blue-600 text-white px-4 py-2 rounded">
                                    Set Cost of Goods
                                </button>
                            )}
                        </div>
                    )}
                    
                    {request.status === 'COST_SUBMITTED' && (
                        <div className="space-y-4">
                            <div className="p-3 bg-yellow-50 rounded text-yellow-800">
                                Runner has submitted the cost. Requester must pay ₹{finalAmount.toFixed(2)}.
                            </div>
                            {isRequester && (
                                <button onClick={handleRequesterConfirmPayment} className="w-full bg-blue-600 text-white px-4 py-2 rounded">
                                    I have sent ₹{finalAmount.toFixed(2)}
                                </button>
                            )}
                        </div>
                    )}

                    {request.status === 'PAYMENT_PENDING' && (
                        <div className="space-y-4">
                            <div className="p-3 bg-blue-50 rounded text-blue-800">
                                Requester has marked payment as sent. Runner must verify.
                            </div>
                            {isRunner && (
                                <button onClick={handleRunnerVerifyPayment} className="w-full bg-green-600 text-white px-4 py-2 rounded">
                                    Verify Payment Received
                                </button>
                            )}
                        </div>
                    )}

                    {request.status === 'PAID' && (
                        <div className="space-y-4">
                            <div className="p-3 bg-green-50 rounded text-green-800">
                                Payment verified. Proceed to handoff.
                            </div>
                            {isRunner && (
                                <button onClick={handleComplete} className="w-full bg-purple-600 text-white px-4 py-2 rounded">
                                    Mark as Completed
                                </button>
                            )}
                        </div>
                    )}

                    {request.status === 'COMPLETED' && (
                        <div className="p-4 bg-gray-50 rounded text-center">
                            <p className="text-green-600 font-bold mb-2">Request Complete!</p>
                            <button onClick={() => navigate('/')} className="text-blue-600 underline">Go Home</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
