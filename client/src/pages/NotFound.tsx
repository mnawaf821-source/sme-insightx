import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ROUTES } from '../config/routes';

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="mt-4 text-lg text-[hsl(var(--muted-foreground))]">
        The page you're looking for doesn't exist.
      </p>
      <Link to={ROUTES.HOME} className="mt-6">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
}
