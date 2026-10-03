import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock checking local storage for a token
        const token = localStorage.getItem('mock_token');
        if (token) {
            setCurrentUser({ uid: token });
        }
        setLoading(false);
    }, []);

    const login = (uid) => {
        localStorage.setItem('mock_token', uid);
        setCurrentUser({ uid });
    };

    const logout = () => {
        localStorage.removeItem('mock_token');
        setCurrentUser(null);
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
