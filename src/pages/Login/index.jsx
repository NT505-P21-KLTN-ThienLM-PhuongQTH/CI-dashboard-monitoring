import { useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import Form from '../../components/Form/Form';

const LoginPage = () => {
  const { user } = useContext(UserContext);

  if (user.auth) window.location.href = '/';

  const handleSubmit = (response) => {
    if (response.success) {
      window.location.href = '/';
    }
  };

  return (
    <div className='flex w-full h-screen'>
      <div className="w-full flex items-center justify-center lg:w-1/2">
        <Form
          formType="login"
          heading={'Login to your account'}
          subHeading={'Welcome back! Please enter you details.'}
          handleResponse={handleSubmit}
        />
      </div>
      <img
        src="/assets/images/devops.svg"
        alt="login"
        className="hidden lg:block w-1/2 h-screen object-cover object-center"
      />
    </div>
  );
}

export default LoginPage;
