import { useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import Form from '../../components/TextForm';
import FullLayout from '../../layouts/FullLayout';

const LoginPage = () => {
  const { user } = useContext(UserContext);

  if (user.auth) window.location.href = '/';

  const handleSubmit = (response) => {
    if (response.success) {
      window.location.href = '/';
    }
  };

  return (
    <FullLayout>
      <Form
        formType="login"
        heading={'Login to your account'}
        subHeading={'Welcome back! Please enter you details.'}
        handleResponse={handleSubmit}
      />
    </FullLayout>
  );
}

export default LoginPage;
