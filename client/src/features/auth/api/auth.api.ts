import { api } from '../../../lib/api';
import type {
  LoginInput,
  RegisterInput,
  AuthResponse,
  User,
  ApiResponse,
} from '@sme-insightx/shared';

export const authApi = {
  async register(data: RegisterInput): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return res.data.data!;
  },

  async login(data: LoginInput): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return res.data.data!;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async getMe(): Promise<User> {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data.data!;
  },
};
