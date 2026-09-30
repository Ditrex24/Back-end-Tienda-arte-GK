# 🎨 Gismar Karonen — E-Commerce & Art Gallery Platform

> Plataforma de comercio electrónico y galería de arte digital desarrollada para la artista **Gismar Karonen**. Diseñada bajo arquitectura **Zero-Trust** con soporte **Multi-idioma nativo (ES/EN)**, diseño **Soft UI**, gestión de productos para administradores y pasarela de venta de obras originales e impresiones.

---

## 🌟 Características Principales

- 🖼️ **Galería de Arte Dinámica:** Catálogo de obras originales y reproducciones de edición limitada sincronizado en tiempo real con Supabase.
- 🏷️ **Sistema de Ofertas y Descuentos:** Precios originales tachados (`~$200~` → `$150`), cálculo dinámico de porcentaje de ahorro e insignias de *"Oferta / Sale"*.
- 🌐 **Internacionalización Nativa (ES / EN):** Cambio de idioma instantáneo en tiempo real (Español e Inglés) sin recargar la página, con preferencia guardada en `localStorage`. Cero dependencias pesadas externas.
- 🔔 **Notificaciones Emergentes Flotantes (`ToastAlert`):** Sistema de notificaciones emergentes con nivel `z-[100]` posicionado en la esquina inferior derecha, garantizando legibilidad total sin solapamientos.
- 🛠️ **Panel de Administración Completo:** Gestión de inventario, cambio de precios, edición de obras y subida directa de fotografías al almacenamiento en la nube (*Supabase Storage*).
- 🔒 **Arquitectura Zero-Trust:** Backend sin SDKs externos ni dependencias pesadas; usa `fetch` nativo, cookies seguras HTTP-Only, middleware CORS estricto y Rate Limiting por ruta.
- 📧 **Autenticación de Usuarios:** Registro e inicio de sesión integrados con confirmación de correo electrónico y protección de rutas para clientes y administradores.

---

## 🛠️ Tecnologías Utilizadas

| Capa | Tecnología | Descripción |
|---|---|---|
| **Gestor de Paquetes** | `pnpm` | Gestión de dependencias en arquitectura Monorepo |
| **Frontend** | Next.js 16 (App Router) | React, Tailwind CSS (Soft UI System), TypeScript |
| **Backend API** | Next.js 15 (Route Handlers) | Servidor API REST ligero y desacoplado |
| **Base de Datos** | Supabase (PostgREST) | Base de datos PostgreSQL con cliente REST nativo |
| **Almacenamiento** | Supabase Storage | Bucket `product-images` para fotografías de obras |
| **Autenticación** | Supabase Auth REST | JWT Bearer Tokens & Email Verification |
| **Correos** | Resend REST API | Envío de correos de verificación y notificaciones |

---

## 📂 Estructura del Proyecto (Monorepo)

```
Back-end-Tienda-arte-GK/
├── backend/                       # Servidor API REST (:4000)
│   ├── src/app/api/               # Route Handlers (products, auth, upload, shipping, admin)
│   ├── src/middleware.ts          # Middleware CORS + Rate Limiting por ruta
│   ├── src/lib/supabase-rest.ts   # Cliente REST nativo para Supabase
│   └── .env.example               # Plantilla de variables de entorno del backend
├── frontend/                      # Aplicación Cliente Next.js (:3000)
│   ├── src/app/                   # Páginas públicas, detalle /obra/[id], auth y /admin
│   ├── src/components/            # Componentes Soft UI (Header, Footer, ToastAlert, ArtworkCard)
│   ├── src/context/               # Contextos globales (CartContext, LanguageContext)
│   ├── src/locales/               # Diccionarios i18n (es.json, en.json)
│   └── .env.example               # Plantilla de variables de entorno del frontend
├── .gitignore                     # Protección global de credenciales y artefactos
├── package.json                   # Raíz del monorepo
└── README.md                      # Documentación oficial
```

---

## 🚀 Guía de Instalación y Ejecución Local

### Prerrequisitos
- **Node.js**: `v18.0.0` o superior
- **pnpm**: `v8.0.0` o superior *(Uso exclusivo de `pnpm`, prohibido `npm`)*

### 1. Clonar el repositorio
```bash
git clone https://github.com/Ditrex24/Back-end-Tienda-arte-GK.git
cd Back-end-Tienda-arte-GK
```

### 2. Configurar variables de entorno
Copia los archivos de ejemplo a sus respectivas ubicaciones locales:

```bash
# Backend
cp backend/.env.example backend/.env.local

# Frontend
cp frontend/.env.example frontend/.env.local
```

Rellena las credenciales de Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) en `backend/.env.local`.

### 3. Ejecutar los Servidores

Abre dos ventanas de terminal en PowerShell o tu terminal preferida:

#### Terminal 1 — Backend API (Puerto 4000)
```powershell
cd backend
$env:PATH = "..\node_modules\.bin;" + $env:PATH
next dev -p 4000
```
> El servidor backend iniciará en: `http://localhost:4000`

#### Terminal 2 — Frontend App (Puerto 3000)
```powershell
cd frontend
pnpm exec next dev
```
> La aplicación web iniciará en: `http://localhost:3000`

---

## 🔐 Seguridad y Privacidad

- **Variables de Entorno Excluidas:** Los archivos `.env`, `.env.local` y credenciales privadas están completamente ignorados en el control de versiones vía `.gitignore`.
- **Zero Heavy SDKs:** No se utilizan paquetes Axios o Stripe/Supabase SDKs con vulnerabilidades en dependencias anidadas; todo el intercambio de datos se realiza mediante `fetch` nativo de Node.js / Browser.

---

## 📜 Licencia

Desarrollado para la marca y galería de arte **Gismar Karonen** © {new Date().getFullYear()}. Todos los derechos reservados.
