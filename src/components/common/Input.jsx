import '../../styles/components/login.css';

export const Input = ({
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  disabled = false,
  error = false,
  autoComplete,
  required = false
}) => {
  const className = 'input' + (error ? ' input--error' : '');

  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      autoComplete={autoComplete}
      required={required}
    />
  );
};
