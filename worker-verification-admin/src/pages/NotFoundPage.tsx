import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, FileQuestion } from 'lucide-react';
import { useState } from 'react';

export const NotFoundPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/workers?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const quickLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: Home },
    { to: '/workers', label: 'Trabajadores', icon: FileQuestion },
    { to: '/documents/pending', label: 'Documentos', icon: FileQuestion },
    { to: '/clients', label: 'Clientes', icon: FileQuestion },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center 
                 bg-[hsl(var(--background))] text-[hsl(var(--foreground))]
                 px-4 py-12 transition-colors duration-300"
    >
      <div className="max-w-2xl w-full text-center">
        {/* === Número 404 === */}
        <div className="relative mb-8">
          <h1 className="text-[180px] md:text-[220px] font-black 
                         text-[hsl(var(--muted-foreground))] opacity-30 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <FileQuestion className="w-24 h-24 md:w-32 md:h-32 text-[hsl(var(--primary))] animate-bounce" />
          </div>
        </div>

        {/* === Título y descripción === */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[hsl(var(--foreground))]">
            Página no encontrada
          </h2>
          <p className="text-lg text-[hsl(var(--muted-foreground))] mb-2">
            La página que buscas no existe o ha sido movida.
          </p>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Verifica la URL o utiliza la búsqueda para encontrar lo que necesitas.
          </p>
        </div>

        {/* === Barra de búsqueda === */}
        <form onSubmit={handleSearch} className="mb-8 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--muted-foreground))]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar trabajadores..."
              className="w-full pl-12 pr-4 py-3 rounded-xl
                         bg-[hsl(var(--input))] border border-[hsl(var(--border))]
                         text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))]
                         focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent
                         transition-all shadow-sm"
            />
          </div>
        </form>

        {/* === Botones de acción === */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-6 py-3 
                       bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] 
                       rounded-xl hover:brightness-110 transition-all shadow-lg hover:shadow-xl 
                       font-medium w-full sm:w-auto"
          >
            <Home className="w-5 h-5" />
            <span>Ir al Dashboard</span>
          </Link>

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 
                       bg-[hsl(var(--card))] text-[hsl(var(--foreground))] 
                       border border-[hsl(var(--border))]
                       rounded-xl hover:bg-[hsl(var(--muted))] 
                       transition-all shadow-sm hover:shadow-md 
                       font-medium w-full sm:w-auto"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver Atrás</span>
          </button>
        </div>

        {/* === Enlaces rápidos === */}
        <div className="bg-[hsl(var(--card))] rounded-2xl shadow-lg border border-[hsl(var(--border))] p-6">
          <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">
            Enlaces Rápidos
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-2 p-3 rounded-lg 
                           bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]
                           hover:bg-[hsl(var(--muted))] transition-colors 
                           border border-[hsl(var(--border))] text-sm font-medium"
              >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* === Ayuda === */}
        <div className="mt-8 text-sm text-[hsl(var(--muted-foreground))]">
          <p>¿Necesitas ayuda? Contacta al administrador del sistema</p>
        </div>
      </div>
    </div>
  );
};