import './NotificationBadge.css';

export const NotificationBadge = ({ count }) => {
  if (!count || count === 0) return null;

  const displayCount = count > 99 ? '99+' : count;

  return (
    <span className="notification-badge">
      {displayCount}
    </span>
  );
};
