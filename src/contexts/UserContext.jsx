import { createContext, useContext, useEffect, useState } from 'react';
import axiosInstance from '../api/axiosConfig';

const UserContext = createContext({
  user: { id: '', name: '', email: '', role: '', auth: false },
  login: () => {},
  logout: () => {},
  register: () => {},
  loginWithCredentials: () => {},
});

export const useUser = () => useContext(UserContext);

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(
    sessionStorage.getItem('user')
      ? JSON.parse(sessionStorage.getItem('user'))
      : { id: '', name: '', email: '', role: '', auth: false }
  );

  useEffect(() => {
    if (!user.auth) {
      const allowedPaths = ['/login', '/register'];
      if (!allowedPaths.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
  }, [user.auth]);

  const setUserState = (userData) => {
    const newUser = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        auth: true,
    };
    setUser(newUser);
    sessionStorage.setItem('user', JSON.stringify(newUser));
  };

  const register = async (name, email, password) => {
    try {
        const response = await axiosInstance.post('/api/auth/register', {
            name,
            email,
            password,
        });

        const { user: userData, token } = response.data;

        localStorage.setItem('token', token);
        setUserState(userData);

        return { success: true, message: 'Registration successful' };
    } catch (error) {
        const errorDetails = {
          message: error.response?.data?.message || error.message || 'Registration failed',
          status: error.response?.status,
          data: error.response?.data,
          error: error.toString(),
        };
        console.error('Register error details:', errorDetails);
        const errorMessage = error.response?.data?.message || 'Registration failed';
        return { success: false, message: errorMessage };
    }
  };

  const login = (userData) => {
    setUserState(userData);
  };

  const loginWithCredentials = async (email, password) => {
    try {
        const response = await axiosInstance.post('/api/auth/login', {
            email,
            password,
        });
        const { user: userData, token } = response.data;

        localStorage.setItem('token', token);
        setUserState(userData);

        return { success: true, message: 'Login successful' };
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Login failed';
        return { success: false, message: errorMessage };
    }
  };

  const logout = () => {
    setUser({ id: '', name: '', role: '', auth: false });
    sessionStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <UserContext.Provider value={{ user, register, login, loginWithCredentials, logout }}>
        {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
