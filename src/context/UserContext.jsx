import { createContext, useContext, useEffect, useState } from 'react';

const UserContext = createContext({ id: '', name: '', role: '', auth: false });

export const useUser = () => useContext(UserContext);

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(
    sessionStorage.getItem('user')
      ? JSON.parse(sessionStorage.getItem('user'))
      : { id: '', name: '', role: '', auth: false }
  );

  useEffect(() => {
    if (!user.auth) {
      const allowedPaths = ['/login', '/register'];
      if (!allowedPaths.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
  }, [user.auth]);

  const login = (user) => {
    setUser({
      id: user.id,
      name: user.name,
      role: user.role[0],
      auth: true,
    });
    sessionStorage.setItem(
      'user',
      JSON.stringify({
        id: user.id,
        name: user.name,
        role: user.role[0],
        auth: true,
      })
    );
  };

  const logout = () => {
    setUser({ id: '', name: '', role: '', auth: false });
    sessionStorage.removeItem('user');
  };

  return <UserContext.Provider value={{ user, login, logout }}>{children}</UserContext.Provider>;
};

export { UserContext, UserProvider };
