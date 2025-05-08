import { useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import Form from "../../components/TextForm";
import FullLayout from '../../layouts/FullLayout';

const RegisterPage = () => {

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
        formType="register"
        heading={'Create your account'}
        subHeading={'Welcome! Please enter your details.'}
        handleResponse={handleSubmit}
      />
    </FullLayout>
  );
};

export default RegisterPage;
