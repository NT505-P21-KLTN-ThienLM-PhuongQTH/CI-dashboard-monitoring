import { useState } from 'react';
import { useUser } from '../contexts/UserContext';

const useAuthentication = (formType) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { register, loginWithCredentials } = useUser();

    const authenticate = async (credentials) => {
        setLoading(true);
        try {
            const result =
                formType === 'login'
                    ? await loginWithCredentials(credentials.email, credentials.password)
                    : await register(credentials.name, credentials.email, credentials.password);

            console.log('Authentication result:', result);

            setLoading(false);
            if (result.success) {
                return result;
            } else {
                setError({ message: result.message });
                throw new Error(result.message);
            }
        } catch (err) {
            console.error('Authentication error:', err);
            setLoading(false);
            setError(err.response ? err.response.data : { message: err.message });
            throw err;
        }
    };

    return {
        authenticate,
        loading,
        error,
        setError,
    };
};

export default useAuthentication;