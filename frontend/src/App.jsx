import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Home from './pages/Home';
import RunnerMode from './pages/RunnerMode';
import RequestPickup from './pages/RequestPickup';
import RequestDetails from './pages/RequestDetails';
import History from './pages/History';
import Profile from './pages/Profile';

const PrivateRoute = ({ children }) => {
    const { currentUser } = useAuth();
    return currentUser ? children : <Navigate to="/login" />;
};

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
                        <Route path="/runner-mode" element={<PrivateRoute><RunnerMode /></PrivateRoute>} />
                        <Route path="/request/:storeId" element={<PrivateRoute><RequestPickup /></PrivateRoute>} />
                        <Route path="/request-details/:id" element={<PrivateRoute><RequestDetails /></PrivateRoute>} />
                        <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
                        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}
