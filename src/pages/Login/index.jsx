import { useState, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
// import { Link } from 'react-router-dom';
import Classes from './Login.module.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [message, setMessage] = useState('');

  const { login, user } = useContext(UserContext);

  if (user.auth) window.location.href = '/';

  const toggleShowPassword = () => {
    setIsShowPassword(!isShowPassword);
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (username && password) {
  //     console.log('Login with: ', username, password);
  //     try {
  //       let response = await fetch('http://localhost:8080/api/auth/login', {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({ username, password }),
  //       }); //.then((res) => res.json());

  //       console.log(response);
  //       if (response.ok) {
  //         const user = await response.json();
  //         console.log();
  //         console.log(user);
  //         if (user.role === 'admin') {
  //           login(user);
  //           setMessage('Đăng nhập thành công');
  //         } else {
  //           setMessage('Tài khoản không có quyền truy cập');
  //         }
  //       } else {
  //         setMessage('Tên người dùng hoặc mật khẩu không hợp lệ');
  //       }
  //     } catch (error) {
  //       console.error('Error:', error);
  //       setMessage('Có lỗi xảy ra trong quá trình đăng nhập');
  //     }
  //   }
  // };

  // I wanna fake the login process
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (username && password) {
      console.log('Login with: ', username, password);
      try {
        if (username === 'admin' && password === 'admin') {
          login({ username: 'admin', role: 'admin' });
          setMessage('Đăng nhập thành công');
        } else {
          setMessage('Tên người dùng hoặc mật khẩu không hợp lệ');
        }
      } catch (error) {
        console.error('Error:', error);
        setMessage('Có lỗi xảy ra trong quá trình đăng nhập');
      }
    }
  }

  return (
    <div className={Classes.LoginWrapper}>
      <div className="max-w-md w-full space-y-8 p-6 ">
        <div>
          <h2 className={Classes.LoginTitle}>Đăng nhập trang quản trị</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm space-y-1">
            <div>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className={Classes.Input}
                placeholder="Tên người dùng"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type={isShowPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className={Classes.Input}
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button className="hidden" type="button" onClick={toggleShowPassword}>
                {isShowPassword ? 'Hide' : 'Show'}{' '}
              </button>
            </div>
          </div>
          {message && <p>{message}</p>}
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Đăng nhập
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
