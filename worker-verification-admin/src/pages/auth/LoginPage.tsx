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
    // Optimizacion: usar requestAnimationFrame para evitar lag
    requestAnimationFrame(() => {
      document.documentElement.classList.toggle("dark", darkMode);
      localStorage.setItem("theme", darkMode ? "dark" : "light");
    });
  }, [darkMode]);

  const toggleTheme = () => {
    // Transicion suave sin lag en móviles
    document.documentElement.style.transition = 'none';
    setDarkMode(!darkMode);
    setTimeout(() => {
      document.documentElement.style.transition = '';
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    // Validación del lado del cliente
    if (!formData.username.trim()) {
      handleError(new Error("Por favor, ingresa tu usuario"), { showToast: false });
      return;
    }

    if (!formData.password.trim()) {
      handleError(new Error("Por favor, ingresa tu contraseña"), { showToast: false });
      return;
    }

    if (formData.password.length < 6) {
      handleError(new Error("La contraseña debe tener al menos 6 caracteres"), { showToast: false });
      return;
    }

    login(formData, {
      onError: (err: any) => {
        handleError(err, { showToast: false }); // No mostrar toast, usaremos el ErrorAlert
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 relative overflow-hidden" style={{ willChange: 'background-color' }}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-300/20 dark:bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-300/20 dark:bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Toggle de tema */}
      <button
        onClick={toggleTheme}
        className="absolute top-5 right-5 p-3 rounded-full bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm shadow-lg border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-200 hover:scale-110 hover:rotate-12 transition-all duration-300 z-10"
        aria-label={darkMode ? "Activar modo claro" : "Activar modo oscuro"}
      >
        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="w-full max-w-md px-4 relative z-10 animate-fade-in">
        <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-neutral-800 hover:shadow-3xl transform hover:scale-[1.01] transition-all duration-300" style={{ willChange: 'transform, box-shadow' }}>
          {/* Logo / Título */}
          <div className="text-center mb-8 animate-slide-up">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-orange-500/30 rounded-2xl blur-xl animate-pulse"></div>
              <img
                src="/favicon.png"
                alt="ADS Logo"
                className="w-20 h-20 mx-auto relative z-10 drop-shadow-2xl transform hover:scale-110 hover:rotate-6 transition-all duration-300"
              />
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent animate-gradient">
              ADS Admin
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 font-medium">
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
          <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {/* Usuario */}
            <div className="transform transition-all duration-300 hover:translate-x-1">
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
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
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md focus:shadow-lg ${
                  getFieldError('username')
                    ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/20'
                    : 'border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:bg-orange-50 dark:focus:bg-neutral-800'
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
            <div className="transform transition-all duration-300 hover:translate-x-1">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
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
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md focus:shadow-lg ${
                    getFieldError('password')
                      ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/20'
                      : 'border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:bg-orange-50 dark:focus:bg-neutral-800'
                  } text-gray-900 dark:text-gray-100`}
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoggingIn}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-300 disabled:opacity-50 hover:scale-110"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 transition-transform duration-300" />
                  ) : (
                    <Eye className="w-5 h-5 transition-transform duration-300" />
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
              className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white py-3.5 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              {isLoggingIn ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span className="relative z-10">Iniciando sesión...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 relative z-10" />
                  <span className="relative z-10">Iniciar Sesión</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
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