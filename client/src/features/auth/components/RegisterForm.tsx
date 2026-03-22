import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@sme-insightx/shared';
import { useRegister } from '../../../hooks/useAuth';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { ROUTES } from '../../../config/routes';

export function RegisterForm() {
  const navigate = useNavigate();
  const register = useRegister();

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterInput) => {
    register.mutate(data, {
      onSuccess: () => navigate(ROUTES.DASHBOARD),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {register.error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {(register.error as any)?.response?.data?.error || 'Registration failed'}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          placeholder="John Doe"
          {...formRegister('name')}
        />
        {errors.name && (
          <p className="text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          {...formRegister('email')}
        />
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="organizationName">Organization Name</Label>
        <Input
          id="organizationName"
          placeholder="Acme Inc."
          {...formRegister('organizationName')}
        />
        {errors.organizationName && (
          <p className="text-xs text-red-500">{errors.organizationName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          {...formRegister('password')}
        />
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password.message}</p>
        )}
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Min 8 chars, uppercase, lowercase, number
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting || register.isPending}>
        {register.isPending ? 'Creating account…' : 'Create Account'}
      </Button>
    </form>
  );
}
