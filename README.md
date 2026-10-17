# Super Sam La Victoria

Una Progressive Web App para gestionar un san de motos en Venezuela.

## Stack

- Vite + React + TypeScript
- Tailwind CSS
- shadcn/ui
- vite-plugin-pwa
- Supabase (Auth + Database + Storage)

## Instalación

1. Clona el repositorio
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Copia el archivo `.env.example` a `.env` y completa las variables de entorno de Supabase
4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Características Principales

- Registro e inicio de sesión de usuarios
- Perfil personal
- Subida de comprobantes de pago
- Panel de administrador con búsqueda por cédula
- Diseño responsive para móvil y escritorio
- Funciona como PWA (Progressive Web App)

## Estructura del Proyecto

```
src/
├── components/
│   ├── ui/
│   ├── layout/
│   └── shared/
├── pages/
│   ├── auth/
│   ├── dashboard/
│   └── admin/
├── lib/
│   ├── supabase.ts
│   └── utils.ts
├── hooks/
├── types/
├── contexts/
└── styles/
```

## Comandos Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Vista previa de la construcción de producción
- `npm test` - Ejecuta los tests (por implementar)

## Notas

- Este proyecto utiliza TypeScript estricto
- El diseño utiliza Tailwind CSS con configuración personalizada
- Los componentes UI utilizan shadcn/ui con los colores de la marca
- La aplicación está configurada para ser una PWA básica

## Deploy en Cloudflare Pages

1. Conecta el repositorio a Cloudflare Pages
2. Configura los siguientes valores:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Environment variables:**
     - `VITE_SUPABASE_URL` — URL de tu proyecto Supabase
     - `VITE_SUPABASE_ANON_KEY` — clave anónima de Supabase
3. Despliega

> Nota: `public/_redirects` incluye la regla SPA (`/* /index.html 200`) para que las rutas como `/app` y `/admin` funcionen al recargar la página.
