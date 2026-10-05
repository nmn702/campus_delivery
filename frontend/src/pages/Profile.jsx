import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const [user, setUser] = useState(null);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/me').then(res => {
            setUser(res.data);
            setName(res.data.name || '');
            setPhone(res.data.phone_number || '');
        });
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await api.patch('/me', { name, phone_number: phone });
            alert('Profile updated');
            navigate('/');
        } catch (error) {
            console.error(error);
            alert('Failed to update profile');
        }
    };

    if (!user) return <div className="p-4">Loading...</div>;

    return (
        <div className="p-4 max-w-lg mx-auto">
            <button onClick={() => navigate('/')} className="mb-4 text-blue-600">&larr; Back Home</button>
            <div className="bg-white p-6 rounded shadow">
                <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
                <form onSubmit={handleSave}>
                    <div className="mb-4">
                        <label className="block mb-1 font-medium">Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full border p-2 rounded" />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1 font-medium">Phone Number</label>
                        <input type="text" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="e.g. 9876543210" className="w-full border p-2 rounded" />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Save Profile</button>
                </form>
            </div>
        </div>
    );
}
