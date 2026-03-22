import { Link, Navigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { LoginForm } from '../features/auth/components/LoginForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useAuthStore } from '../stores/authStore';
import { ROUTES } from '../config/routes';

export function Login() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--muted))]/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary))]">
            <Zap className="h-5 w-5 text-[hsl(var(--primary-foreground))]" />
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your SME InsightX account</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <p className="mt-4 text-center text-sm text-[hsl(var(--muted-foreground))]">
            Don't have an account?{' '}
            <Link to={ROUTES.REGISTER} className="text-[hsl(var(--primary))] hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
