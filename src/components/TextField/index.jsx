import PropTypes from 'prop-types';

function TextField({ label, type, name, placeholder = '', required = false, onChange, value }) {
    return (
        <div className='flex flex-col w-full mb-4'>
            <label className="text-sm font-medium text-gray-700 mb-1 dark:text-gray-300" htmlFor={name}>
                {label}
            </label>
            <input
                name={name}
                id={name}
                type={type}
                placeholder={placeholder}
                required={required}
                onChange={(e) => onChange(e)}
                value={value}
                className="w-full border-2 border-gray-200 rounded-lg p-3 text-sm bg-transparent dark:bg-gray-800 placeholder:text-gray-400 focus:border-blue-theme focus:ring-2 focus:ring-blue-theme/20 transition-all duration-200 dark:border-gray-600 dark:placeholder:text-gray-500 dark:focus:border-blue-theme dark:focus:ring-blue-theme/20 dark:text-gray-300"
            />
        </div>
    );
}

TextField.propTypes = {
    label: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
};

export default TextField;