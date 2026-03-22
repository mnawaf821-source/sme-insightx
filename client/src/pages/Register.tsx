import { Link, Navigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { RegisterForm } from '../features/auth/components/RegisterForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useAuthStore } from '../stores/authStore';
import { ROUTES } from '../config/routes';

export function Register() {
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
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Get started with SME InsightX in minutes</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
          <p className="mt-4 text-center text-sm text-[hsl(var(--muted-foreground))]">
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="text-[hsl(var(--primary))] hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
