import PropTypes from 'prop-types';

function TextField({ label, type, name, placeholder = '', required = false, onChange, value }) {
    return (
        <div className='flex flex-col w-full mb-3'>
            <label className="text-lg font-medium">
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
                className="w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent placeholder:text-gray-500"
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