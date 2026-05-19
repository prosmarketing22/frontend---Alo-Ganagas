import { useAuth } from '../../features/auth/useAuth';
import { DashboardBasePage } from './DashboardBasePage';
import { DashboardGerentePage } from './DashboardGerentePage';

export const DashboardPage = () => {
  const { user, getUserRole } = useAuth();
  const userRole = getUserRole();

  if (userRole === 'GERENTE') {
    return <DashboardGerentePage />;
  }

  return <DashboardBasePage />;
};

export default DashboardPage;
