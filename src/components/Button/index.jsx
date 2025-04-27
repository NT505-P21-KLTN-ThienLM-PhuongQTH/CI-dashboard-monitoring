import PropTypes from 'prop-types';

function Button({ children, onClick, icon, disabled, className, loading, ...props }) {
    return (
        <button
            className={`flex items-center justify-center gap-2 bg-blue-theme text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-all hover:bg-blue-theme/90 ${
                disabled || loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.01] active:scale-[0.98]'
            } ${className}`}
            onClick={onClick}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                    ></path>
                </svg>
            )}
            {icon && !loading && <span>{icon}</span>}
            {children}
        </button>
    );
}

Button.propTypes = {
    onClick: PropTypes.func,
    icon: PropTypes.element,
    children: PropTypes.node,
    disabled: PropTypes.bool,
    className: PropTypes.string,
};

export default Button;