import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import formConfig from '../../common/form.type';
import useForm from '../../hook/useForm';
import useAuthentication from '../../hook/useAuthentication';
import TextField from '../TextField';
import Button from '../Button';
import { Link } from 'react-router-dom';

Form.propTypes = {
    formType: PropTypes.oneOf(['login', 'register']).isRequired,
    heading: PropTypes.string.isRequired,
    subHeading: PropTypes.string,
    handleResponse: PropTypes.func,
};

function Form({ formType, heading, subHeading, handleResponse }) {
    const initialValues = formConfig[formType];
    const { values, handleChange } = useForm(initialValues);
    const { authenticate, loading, error, setError } = useAuthentication(formType);

    const isPasswordStrong = (password) => {
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        return strongPasswordRegex.test(password);
    };

    const onSubmit = async (event) => {
        event.preventDefault();
        console.log('Form values:', values);
        if (formType === 'register') {
            if (values.password !== values.confirmPassword) {
                toast.error('Passwords do not match!', {
                    position: 'top-right',
                    autoClose: 3000,
                    theme: 'light',
                });
                return;
            }
            if (!isPasswordStrong(values.password)) {
                toast.error(
                    'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.',
                    {
                        position: 'top-right',
                        autoClose: 3000,
                        theme: 'light',
                    }
                );
                return;
            }
        }
        try {
            const response = await authenticate(values);
            console.log('Response:', response);
            if (response.success) {
                handleResponse(response);
                setError(null);
                toast.success(`${formType === 'login' ? 'Login' : 'Registration'} successful!`, {
                    position: 'top-right',
                    autoClose: 3000,
                    theme: 'light',
                });
            }
        } catch (err) {
            console.error(`${formType === 'login' ? 'Login' : 'Registration'} failed:`, err);
            toast.error('Authentication failed. Please try again.', {
                position: 'top-right',
                autoClose: 3000,
                theme: 'light',
            });
        }
    };

    return (
        <div className="flex flex-col flex-1 justify-center w-full max-w-md mx-auto">
            <form
            className="w-full max-w-md mx-auto p-8 rounded-2xl bg-white shadow-lg border border-gray-100"
            onSubmit={onSubmit}
            >
                <h1 className="text-3xl font-bold text-gray-900">{heading}</h1>
                <p className="text-sm text-gray-500 mt-2">{subHeading}</p>
                <div className="mt-6 space-y-4">
                    {formType === 'register' && (
                        <TextField
                            label="Full Name"
                            placeholder="Full Name"
                            name="name"
                            type="text"
                            value={values.name}
                            onChange={(e) => handleChange(e)}
                            required={true}
                        />
                    )}
                    <TextField
                        label="Email"
                        placeholder="Enter your email"
                        name="email"
                        type="email"
                        value={values.email}
                        onChange={(e) => handleChange(e)}
                        required={true}
                    />
                    <TextField
                        label="Password"
                        placeholder="Enter your password"
                        name="password"
                        type="password"
                        value={values.password}
                        onChange={(e) => handleChange(e)}
                        required={true}
                    />
                    {formType === 'register' && (
                        <TextField
                            label="Confirm Password"
                            placeholder="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            value={values.confirmPassword}
                            onChange={(e) => handleChange(e)}
                            required={true}
                        />
                    )}
                    {formType === 'login' && (
                        <div className="mt-4 flex justify-between items-center text-sm">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    className="h-4 w-4 text-blue-theme focus:ring-blue-theme border-gray-300 rounded"
                                />
                                <label htmlFor="remember" className="ml-2 text-gray-700">
                                    Remember me
                                </label>
                            </div>
                            <button
                                type="button"
                                className="text-blue-theme hover:underline font-medium"
                            >
                                Forgot password?
                            </button>
                        </div>
                    )}
                    <div className="mt-6 space-y-4">
                        {error && (
                            <p className="text-red-theme text-sm font-medium">
                                {error.message}
                            </p>
                        )}
                        <Button
                            type="submit"
                            disabled={loading}
                            loading={loading}
                            className="w-full"
                        >
                            {loading ? 'Loading...' : formType === 'login' ? 'Login' : 'Register'}
                        </Button>
                    </div>
                    <div className="mt-6 text-center text-sm">
                        {formType === 'login' ? (
                            <div className="flex justify-center items-center gap-1">
                                <p className="text-gray-600">Don't have an account?</p>
                                <Link
                                    to="/register"
                                    className="text-blue-theme hover:underline font-medium"
                                >
                                    Sign up
                                </Link>
                            </div>
                        ) : (
                            <div className="flex justify-center items-center gap-1">
                                <p className="text-gray-600">Already have an account?</p>
                                <Link
                                    to="/login"
                                    className="text-blue-theme hover:underline font-medium"
                                >
                                    Sign in
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}

export default Form;