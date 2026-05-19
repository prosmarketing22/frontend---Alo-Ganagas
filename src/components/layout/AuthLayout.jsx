import '../../styles/components/login.css';
import logo from '../../assets/logo.png';

export const AuthLayout = ({ children }) => {
  return (
    <div className="auth-layout">
      <div className="auth-layout__side">
        <div className="auth-layout__brand">
          <img src={logo} alt="Aló Ganagas" className="auth-layout__logo-img" />
          <div className="auth-layout__tagline">Siempre en tu hogar</div>
        </div>
      </div>
      <div className="auth-layout__main">
        <div className="auth-layout__container">
          {children}
        </div>
      </div>
    </div>
  );
};
