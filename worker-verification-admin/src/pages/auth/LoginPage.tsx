import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { ErrorAlert } from "@/components/common/ErrorAlert";
import { Eye, EyeOff, LogIn, Sun, Moon } from "lucide-react";

export const LoginPage = () => {
  const { login, isLoggingIn } = useAuth();
  const { error, clearError, handleError, getFieldError } = useErrorHandler();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [darkMode, setDarkMode] = useState<boolean>(
    () => localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    // Validación del lado del cliente
    if (!formData.username.trim()) {
      handleError(new Error("Por favor, ingresa tu usuario"), false);
      return;
    }

    if (!formData.password.trim()) {
      handleError(new Error("Por favor, ingresa tu contraseña"), false);
      return;
    }

    if (formData.password.length < 6) {
      handleError(new Error("La contraseña debe tener al menos 6 caracteres"), false);
      return;
    }

    login(formData, {
      onError: (err: any) => {
        handleError(err, false); // No mostrar toast, usaremos el ErrorAlert
      },
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Limpiar error al empezar a escribir
    if (error) {
      clearError();
    }
    
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-neutral-900 dark:to-neutral-950 transition-colors duration-300">
      {/* Toggle de tema */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute top-5 right-5 p-2 rounded-full bg-white dark:bg-neutral-800 shadow-md border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-200 hover:scale-105 transition-transform"
        aria-label={darkMode ? "Activar modo claro" : "Activar modo oscuro"}
      >
        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="w-full max-w-md px-4">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-neutral-800 transition-colors duration-300">
          {/* Logo / Título */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              ADS Admin
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Panel de Administración
            </p>
          </div>

          {/* Alerta de Error */}
          {error && (
            <div className="mb-6">
              <ErrorAlert
                variant="error"
                message={error.message}
                onClose={clearError}
              />
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Usuario */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                disabled={isLoggingIn}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                  getFieldError('username')
                    ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/20'
                    : 'border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800'
                } text-gray-900 dark:text-gray-100`}
                placeholder="Ingresa tu usuario"
                autoComplete="username"
              />
              {getFieldError('username') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {getFieldError('username')}
                </p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoggingIn}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                    getFieldError('password')
                      ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/20'
                      : 'border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800'
                  } text-gray-900 dark:text-gray-100`}
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoggingIn}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition disabled:opacity-50"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {getFieldError('password') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {getFieldError('password')}
                </p>
              )}
            </div>

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-primary hover:brightness-110 text-primary-foreground py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              {isLoggingIn ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Iniciar Sesión</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sistema de administración del equipo de ADS
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              ¿Problemas para iniciar sesión? Contacta al administrador
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};