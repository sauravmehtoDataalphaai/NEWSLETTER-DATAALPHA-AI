import logo from '../assets/da_logo_dark.png';

/**
 * DataAlpha brand mark (white logo for dark navy backgrounds).
 */
function BrandLogo({ className = '', showAdmin = false }) {
  return (
    <div className={`brand-lockup ${className}`.trim()}>
      <img
        src={logo}
        alt="DataAlpha"
        className="brand-logo"
        width={200}
        height={56}
      />
      {showAdmin && <span className="brand-admin-label">Admin</span>}
    </div>
  );
}

export default BrandLogo;
