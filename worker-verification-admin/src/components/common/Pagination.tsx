import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
}: PaginationProps) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between px-3 sm:px-4 py-3 bg-[hsl(var(--card))] border-t border-[hsl(var(--border))] sm:px-6">
      <div className="flex flex-1 items-center justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-[hsl(var(--foreground))] bg-[hsl(var(--card))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <ChevronLeft className="w-4 h-4 mr-1 transition-transform duration-200 group-hover:-translate-x-1" />
          Ant.
        </button>
        <span className="text-sm text-[hsl(var(--muted-foreground))]">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-[hsl(var(--foreground))] bg-[hsl(var(--card))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
        >
          Sig.
          <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" />
        </button>
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Mostrando <span className="font-medium text-[hsl(var(--foreground))]">{startItem}</span> a{' '}
            <span className="font-medium text-[hsl(var(--foreground))]">{endItem}</span> de{' '}
            <span className="font-medium text-[hsl(var(--foreground))]">{totalItems}</span> resultados
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="group relative inline-flex items-center rounded-l-md px-2 py-2 text-[hsl(var(--muted-foreground))] ring-1 ring-inset ring-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 active:scale-95"
            >
              <span className="sr-only">Anterior</span>
              <ChevronLeft className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-1" />
            </button>

            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && onPageChange(page)}
                disabled={page === '...'}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold transition-all duration-200 hover:scale-110 active:scale-95 ${
                  page === currentPage
                    ? 'z-10 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--ring))] shadow-md'
                    : 'text-[hsl(var(--foreground))] ring-1 ring-inset ring-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] focus:z-20 focus:outline-offset-0'
                } ${page === '...' ? 'cursor-default hover:scale-100' : ''}`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="group relative inline-flex items-center rounded-r-md px-2 py-2 text-[hsl(var(--muted-foreground))] ring-1 ring-inset ring-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 active:scale-95"
            >
              <span className="sr-only">Siguiente</span>
              <ChevronRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};