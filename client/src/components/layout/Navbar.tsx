import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, Bell } from 'lucide-react';
import { Button } from '../ui/button';
import { useLogout } from '../../hooks/useAuth';
import { useAuthStore } from '../../stores/authStore';
import { getInitials } from '../../lib/utils';
import { ROUTES } from '../../config/routes';

export function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => navigate(ROUTES.LOGIN),
    });
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-xs font-medium text-[hsl(var(--primary-foreground))]">
            {user ? getInitials(user.name) : '?'}
          </div>
          <span className="hidden text-sm font-medium md:block">
            {user?.name}
          </span>
        </div>

        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
