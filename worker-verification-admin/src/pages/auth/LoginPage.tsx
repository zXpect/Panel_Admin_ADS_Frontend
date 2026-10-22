import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { ErrorAlert } from "@/components/common/ErrorAlert";
import { Eye, EyeOff, LogIn, Sun, Moon } from "lucide-react";
import { AdsLogo } from "@/components/layout/AdsLogo";

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

  const fieldClass = (field: string) =>
    `field ${getFieldError(field) ? 'border-[hsl(var(--destructive))] bg-[hsl(var(--danger-soft))]' : ''}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] px-4 py-10 relative">
      {/* Modo claro u oscuro */}
      <button
        onClick={toggleTheme}
        className="absolute top-5 right-5 w-11 h-11 rounded-full border-[1.5px] border-[hsl(var(--border))]
                   bg-[hsl(var(--card))] flex items-center justify-center text-[hsl(var(--foreground))]"
        aria-label={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      >
        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="panel w-full max-w-[430px] p-8">
        {/* Logo y título (mockup A1) */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <AdsLogo size={72} />
          </div>
          <h1 className="text-[28px] leading-9 font-extrabold text-[hsl(var(--secondary-foreground))] dark:text-[hsl(var(--foreground))]">
            ADS Admin
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Panel de administración</p>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorAlert variant="error" message={error.message} onClose={clearError} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="field-label">Usuario</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleChange}
              disabled={isLoggingIn}
              className={fieldClass('username')}
              placeholder="Ingresa tu usuario"
              autoComplete="username"
            />
            {getFieldError('username') && (
              <p className="mt-1 text-sm text-[hsl(var(--danger-foreground))]">{getFieldError('username')}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="field-label">Contraseña</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleChange}
                disabled={isLoggingIn}
                className={`${fieldClass('password')} pr-12`}
                placeholder="Ingresa tu contraseña"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoggingIn}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center
                           text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {getFieldError('password') && (
              <p className="mt-1 text-sm text-[hsl(var(--danger-foreground))]">{getFieldError('password')}</p>
            )}
          </div>

          <button type="submit" disabled={isLoggingIn} className="btn-primary w-full min-h-[52px] text-base">
            {isLoggingIn ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                Iniciando sesión…
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Iniciar sesión
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs">
          <p className="font-semibold text-[hsl(var(--secondary-foreground))] dark:text-[hsl(var(--foreground))]">
            Sistema de administración del equipo de ADS
          </p>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            ¿Problemas para iniciar sesión? Contacta al administrador.
          </p>
        </div>
      </div>
    </div>
  );
};
