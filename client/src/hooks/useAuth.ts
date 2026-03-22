import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { authApi } from '../features/auth/api/auth.api';
import { QUERY_KEYS } from '@sme-insightx/shared';
import type { LoginInput, RegisterInput } from '@sme-insightx/shared';

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (data: LoginInput) => authApi.login(data),
    onSuccess: ({ user, token }) => {
      setAuth(token, user);
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (data: RegisterInput) => authApi.register(data),
    onSuccess: ({ user, token }) => {
      setAuth(token, user);
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      logout();
    },
    onError: () => {
      // Even if the API call fails, clear local state
      logout();
    },
  });
}

export function useMe() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: QUERY_KEYS.ME,
    queryFn: authApi.getMe,
    enabled: isAuthenticated,
    retry: false,
  });
}
