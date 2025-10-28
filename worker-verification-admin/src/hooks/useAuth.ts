import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/api/services/authService';
import { useAuthStore } from '@/store/authStore';
import { LoginCredentials } from '@/types/auth.types';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const navigate = useNavigate();
  const { setTokens, setUser, logout: logoutStore, isAuthenticated } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      setTokens(data);
      setUser({
        id: 'admin',
        username: 'admin',
        email: 'admin@example.com',
      });
      toast.success('¡Bienvenido!');
      navigate('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Error al iniciar sesión');
    },
  });

  const logout = () => {
    logoutStore();
    toast.success('Sesión cerrada');
    navigate('/login');
  };

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    logout,
    isAuthenticated,
  };
};