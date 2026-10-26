# ADS - Panel de Administración

Aplicación web de administración del sistema ADS, una plataforma que conecta a
clientes con trabajadores independientes de reparaciones locativas (hogar y
comercio) en Ubaté, Cundinamarca. El panel permite al equipo administrador
verificar la documentación de los trabajadores, gestionar clientes y cuentas,
mantener el catálogo de servicios y sus tarifas de referencia, consultar las
transacciones y atender las peticiones, quejas y reclamos (PQR).

El panel consume la API REST del backend de ADS
([Panel_admln_ADS_backend](https://github.com/zXpect/Panel_admln_ADS_backend)),
autenticándose con JWT.

## Tabla de contenido

1. [Funcionalidades](#funcionalidades)
2. [Tecnologías](#tecnologías)
3. [Estructura del proyecto](#estructura-del-proyecto)
4. [Requisitos](#requisitos)
5. [Instalación](#instalación)
6. [Configuración](#configuración)
7. [Ejecución](#ejecución)
8. [Uso](#uso)
9. [Integración con la API](#integración-con-la-api)
10. [Calidad de código](#calidad-de-código)
11. [Despliegue](#despliegue)
12. [Seguridad](#seguridad)
13. [Contribución](#contribución)
14. [Licencia](#licencia)

## Funcionalidades

| Módulo | Ruta | Descripción |
|---|---|---|
| Inicio de sesión | `/login` | Acceso con las credenciales de un usuario administrador del backend |
| Tablero | `/dashboard` | Indicadores de trabajadores, clientes y documentos pendientes, con tendencias semanales y mensuales |
| Trabajadores | `/workers` | Listado con búsqueda y filtros, creación, edición, estado de verificación y suspensión de cuentas |
| Detalle del trabajador | `/workers/:id` | Perfil, oficios, calificación, documentos y estado de la cuenta |
| Carga masiva | `/workers/bulk-upload` | Registro de trabajadores desde un archivo Excel con plantilla descargable |
| Documentos pendientes | `/documents/pending` | Cola de trabajadores con documentos por revisar |
| Revisión documental | `/documents/review/:workerId` | Visualización, aprobación y rechazo con motivo de hoja de vida, antecedentes, títulos y cartas de recomendación, con decisión final de verificación |
| Clientes | `/clients` | Listado, detalle y suspensión o reactivación de cuentas |
| Transacciones | `/transactions` | Pagos digitales y en efectivo con filtros por estado, pasarela y fechas, y resumen de montos aprobados |
| PQR | `/pqr` | Bandeja de peticiones, quejas y reclamos con plazo de respuesta, cambio a trámite y cierre con respuesta |
| Catálogo | `/catalog` | Oficios y tareas con rangos de precio, parámetros de cotización e historial de auditoría de cambios |

La interfaz admite modo claro y oscuro.

## Tecnologías

| Componente | Tecnología |
|---|---|
| Lenguaje | TypeScript 5 |
| Biblioteca de interfaz | React 18 |
| Empaquetador | Vite 5 |
| Enrutamiento | React Router 6 |
| Estado del servidor | TanStack React Query 5 |
| Estado global de interfaz y sesión | Zustand |
| Cliente HTTP | Axios |
| Estilos y componentes | Tailwind CSS, shadcn/ui (Radix UI), lucide-react |
| Formularios y validación | React Hook Form, Zod |
| Gráficas | Recharts |
| Notificaciones en pantalla | react-hot-toast |

## Estructura del proyecto

El código de la aplicación vive en `worker-verification-admin/`:

```
worker-verification-admin/
├── public/                 Recursos estáticos (íconos)
├── src/
│   ├── api/
│   │   ├── axiosConfig.ts  Instancia de Axios con interceptores de autenticación,
│   │   │                   renovación de token y reintentos
│   │   ├── endpoints.ts    Rutas de la API
│   │   └── services/       Un servicio por recurso (trabajadores, documentos,
│   │                       clientes, pagos, PQR, catálogo, cuentas, tablero)
│   ├── components/
│   │   ├── ui/             Componentes base de shadcn/ui
│   │   ├── layout/         Estructura general (barra lateral, encabezado)
│   │   ├── common/         Componentes reutilizables
│   │   └── features/       Componentes propios de cada módulo
│   ├── hooks/              Hooks de React Query por recurso y utilidades
│   ├── pages/              Páginas agrupadas por módulo
│   ├── routes/             Definición de rutas y protección por sesión
│   ├── store/              Estado global con Zustand (sesión e interfaz)
│   ├── types/              Tipos de TypeScript por dominio
│   └── lib/utils/          Manejo de errores, registro y utilidades
├── .env.example            Plantilla de variables de entorno
├── package.json
├── tailwind.config.js
└── vite.config.ts
render.yaml                 Blueprint de despliegue en Render (sitio estático)
```

## Requisitos

- Node.js 20 o superior y npm.
- El backend de ADS en ejecución (por defecto en `http://127.0.0.1:8000`) con
  al menos un usuario administrador creado.

## Instalación

1. Clonar el repositorio e ingresar a la carpeta de la aplicación:

   ```bash
   git clone https://github.com/zXpect/Panel_Admin_ADS_Frontend.git
   cd Panel_Admin_ADS_Frontend/worker-verification-admin
   ```

2. Instalar las dependencias:

   ```bash
   npm install
   ```

3. Crear el archivo de entorno a partir de la plantilla:

   ```bash
   cp .env.example .env
   ```

## Configuración

Las variables se leen en tiempo de compilación (Vite solo expone las que
comienzan con `VITE_`).

| Variable | Descripción | Valor de desarrollo |
|---|---|---|
| `VITE_API_BASE_URL` | URL del backend, sin `/api` al final | `http://127.0.0.1:8000` |
| `VITE_APP_NAME` | Nombre de la aplicación | `Worker Verification Admin` |
| `VITE_APP_VERSION` | Versión mostrada | `1.0.0` |
| `VITE_APP_ENV` | Entorno de ejecución | `development` |

El backend debe incluir el origen del panel en su variable
`CORS_ALLOWED_ORIGINS` (en desarrollo, `http://localhost:3000`).

## Ejecución

Todos los comandos se ejecutan dentro de `worker-verification-admin/`.

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo en `http://localhost:3000`, con recarga en caliente |
| `npm run build` | Verificación de tipos con TypeScript y compilación de producción en `dist/` |
| `npm run preview` | Sirve localmente la compilación de producción |
| `npm run lint` | Análisis estático con ESLint; falla ante cualquier advertencia |

## Uso

1. Iniciar el backend y crear un usuario administrador con
   `python manage.py createsuperuser`.
2. Iniciar el panel con `npm run dev` y abrir `http://localhost:3000`.
3. Ingresar con el usuario y la contraseña del administrador.
4. Flujo típico de verificación de un trabajador:
   1. Abrir **Documentos pendientes** y elegir un trabajador.
   2. Revisar cada documento y aprobarlo o rechazarlo indicando el motivo.
   3. Emitir la decisión final de verificación. El resultado se refleja de
      inmediato en la aplicación móvil del trabajador.
5. Las modificaciones del catálogo, de los parámetros de cotización y del estado
   de las cuentas quedan registradas en el historial de auditoría.

## Integración con la API

- Todas las peticiones se hacen mediante la instancia de Axios de
  `src/api/axiosConfig.ts`, que agrega el encabezado
  `Authorization: Bearer <access_token>`.
- Ante una respuesta `401`, el interceptor renueva el token con
  `POST /api/auth/token/refresh/`, encola las peticiones concurrentes mientras
  se renueva y las reintenta. Si la renovación falla, cierra la sesión y
  redirige a `/login`.
- Los datos del servidor se obtienen con hooks de React Query (`src/hooks/`),
  que gestionan la caché y la invalidan después de cada modificación.
- Los errores se interpretan de forma centralizada en
  `src/lib/utils/errorHandler.ts` y se muestran al usuario como notificaciones.

Las rutas de la API utilizadas están declaradas en `src/api/endpoints.ts`. La
referencia completa de la API está en el README del repositorio del backend.

## Calidad de código

- TypeScript en modo estricto; la compilación falla ante errores de tipos.
- ESLint con reglas de `@typescript-eslint` y de hooks de React, sin
  advertencias permitidas.
- Componentes funcionales, uno por archivo, nombrados en PascalCase; las páginas
  terminan en `Page`.

## Despliegue

El archivo `render.yaml` define el panel como sitio estático en Render:

1. En Render, crear un Blueprint (**New > Blueprint**) a partir de este repositorio.
2. Render compila con `npm ci && npm run build` dentro de
   `worker-verification-admin/` y publica la carpeta `dist/`.
3. `VITE_API_BASE_URL` apunta a la URL pública del backend.
4. Todas las rutas se reescriben a `index.html` para que la navegación del
   lado del cliente funcione al recargar la página.
5. Agregar la URL pública del panel a `CORS_ALLOWED_ORIGINS` del backend.

Cada push a la rama configurada vuelve a desplegar el sitio.

## Seguridad

- Rutas protegidas: sin una sesión válida, toda ruta redirige al inicio de sesión.
- Tokens de acceso de corta duración renovados automáticamente.
- El backend limita los intentos de inicio de sesión por dirección IP.
- Encabezados de seguridad en producción: `X-Frame-Options: DENY`,
  `X-Content-Type-Options: nosniff` y `Referrer-Policy: strict-origin-when-cross-origin`.
- Comunicación con el backend exclusivamente por HTTPS en producción.
- Ningún secreto se incluye en el código; el archivo `.env` está excluido del
  control de versiones.

## Contribución

1. Crear una rama a partir de `develop`: `feature/<nombre-corto>` para
   funcionalidades o `fix/<nombre-corto>` para correcciones.
2. Hacer commits con el formato [Conventional Commits](https://www.conventionalcommits.org/es/),
   por ejemplo `feat(workers): add verification filter`.
3. Ejecutar `npm run lint` y `npm run build` antes de abrir el Pull Request hacia
   `develop`.
4. La rama `main` se reserva para versiones publicadas.

## Licencia

Proyecto privado desarrollado como trabajo de grado en la Universidad de
Cundinamarca. Todos los derechos reservados.
