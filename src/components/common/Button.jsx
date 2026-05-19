import '../../styles/components/login.css';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'default',
  fullWidth = false,
  disabled = false,
  onClick
}) => {
  const sizeClass = size === 'large' ? 'button--large' : size === 'small' ? 'button--small' : '';
  const widthClass = fullWidth ? 'button--full' : '';
  const className = ['button', 'button--' + variant, sizeClass, widthClass].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={className}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
