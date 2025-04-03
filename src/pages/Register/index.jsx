import { useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import Form from "../../components/Form/Form";

const RegisterPage = () => {

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
          formType="register"
          heading={'Create your account'}
          subHeading={'Welcome! Please enter your details.'}
          handleResponse={handleSubmit}
        />
      </div>
      <img
        src="/assets/images/devops.svg"
        alt="register"
        className="hidden lg:block w-1/2 h-screen object-cover object-center"
      />
    </div>
  );
};

export default RegisterPage;
