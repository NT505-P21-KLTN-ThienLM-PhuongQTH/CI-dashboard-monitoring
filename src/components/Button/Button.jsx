import PropTypes from 'prop-types';

function Button({ children, onClick, ...props }) {
    return (
        <button className="bg-black text-body-M text-white text-lg font-bold p-[6px] rounded-xl transition-all hover:scale-[1.01] active:scale-[.98] active:duration-75 ease-in-out transform py-4" onClick={onClick} {...props}>
            <span>{props.icon || null}</span>
            {children}
        </button>
    );
}

Button.propTypes = {
    onClick: PropTypes.func,
    icon: PropTypes.element,
    children: PropTypes.node,
};

export default Button;