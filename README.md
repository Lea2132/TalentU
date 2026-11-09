# Proyecto de Emprendimiento Universitario

Este proyecto es una plataforma de e-commerce que permite a los usuarios crear una cuenta, subir sus emprendimientos y gestionar sus productos para que otros usuarios puedan realizar compras y apoyarlos.

## Tecnologías

- **Frontend**: React.js, Tailwind
- **Backend**: Node.js con Express
- **Base de datos**: PostgreSQL

## Configuración Inicial

- **Frontend**: npm install
- **Backend**: npm install

- **Frontend**: npm run dev
- **Backend**: npm run dev ( Creacion de las tablas de la base de datos automaticamente al levantar el servidor)
- **Backend**: npm run db ( Para visualizar los datos que contienen las tablas de la base de datos desde la terminal)
   

## Despliegue gratuito

La aplicación puede usar Vercel para el frontend, Render para la API y Neon para PostgreSQL.

1. Importa primero el respaldo de tu PostgreSQL local a una base de datos vacía de Neon.
2. En Render, crea un Web Service desde este repositorio con **Root Directory** `backend`, **Build Command** `npm install` y **Start Command** `npm start`.
3. En las variables de entorno de Render configura `DATABASE_URL` (URL de conexión de Neon con SSL), `JWT_SECRET` (secreto aleatorio largo), `FRONTEND_URL` (origen de Vercel), `ADMIN_EMAIL` y `ADMIN_PASSWORD`.
4. Crea una cuenta gratuita de Cloudinary y configura `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET` en Render para que las imágenes nuevas se guarden fuera del disco temporal.
5. En Vercel configura **Root Directory** `frontend`, **Build Command** `npm run build`, **Output Directory** `dist` y la variable `VITE_API_URL` con el origen de Render, sin `/api`.
6. Despliega Vercel después de configurar `VITE_API_URL`; los cambios de variables requieren un nuevo despliegue.

El backend crea las tablas que falten al iniciar. `backend/.env.example` y `frontend/.env.example` muestran los nombres de las variables sin incluir credenciales. Si Cloudinary no está configurado, el backend guarda imágenes en `backend/uploads`, pero Render puede borrarlas al reiniciar o desplegar.

Si `ADMIN_EMAIL` ya existe en la base importada, el backend sincroniza su contraseña con `ADMIN_PASSWORD` y confirma que esa cuenta sea administradora en cada inicio.
