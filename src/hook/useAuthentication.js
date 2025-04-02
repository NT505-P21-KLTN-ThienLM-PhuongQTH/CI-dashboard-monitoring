import { useState } from 'react';
import axiosInstance from '../api/axiosConfig';

const useAuthentication = (formType) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const authenticate = async (url, credentials) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post(url, credentials);
            localStorage.setItem('token', response.data.token);
            setLoading(false);
            return response.data;
        } catch (err) {
            setLoading(false);
            setError(err.response ? err.response.data : 'An error occurred');
            throw err;
        }
    };

    const login = (credentials) => authenticate('/login', credentials);
    const register = (credentials) => authenticate('/register', credentials);

    return {
        authenticate: formType === 'login' ? login : register,
        loading,
        error,
        setError,
    };
};

export default useAuthentication;