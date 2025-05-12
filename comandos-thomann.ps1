
# --- ✅ GIT: Guardar y subir cambios al repositorio ---
git add .                             # Agrega todos los cambios al staging
git commit -m "mensaje de commit"     # Crea un commit (cambia el mensaje)
git push                              # Sube los cambios al repositorio remoto

# --- 🚀 Desarrollo local ---
npm install                           # Instala dependencias
npm run dev                           # Inicia servidor en modo desarrollo

# --- 🧼 Limpieza / reinstalación ---
rm -r node_modules package-lock.json  # Elimina dependencias y lockfile
npm install                           # Reinstala dependencias limpias
npm cache clean --force               # Limpia caché de npm

# --- 🧪 Lint y Tests (si están configurados) ---
npm run lint                          # Revisa errores de código
npm test                              # Ejecuta pruebas

# --- ⚙️ Build y test de producción local ---
npm run build                         # Compila la app
npm start                             # Prueba el servidor en producción local

# --- ☁️ Vercel ---
vercel login                          # Inicia sesión en Vercel
vercel link                           # Conecta proyecto local con Vercel
vercel                                # Deploy a entorno de preview
vercel --prod                         # 🚀 EMPUJAR a producción
vercel whoami                         # Verifica el usuario conectado
vercel env ls                         # Lista variables de entorno
vercel open                           # Abre el proyecto en el dashboard web

node scripts/scrape-descriptions.js   # Actualiza descripciones del catalogo
