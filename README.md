# 🎉 Eventify - Backend

Este es el backend de **Eventify**, una aplicación web fullstack para descubrir, crear y asistir a eventos. Proporciona una API RESTful construida con Node.js, Express y MongoDB, con autenticación basada en JWT y soporte para funcionalidades como favoritos, asistencia y CRUD de eventos.

---

## 🚀 Tecnologías

- Node.js
- Express
- MongoDB + Mongoose
- JSON Web Tokens (JWT)
- bcrypt
- dotenv
- CORS

---

## 📁 Estructura del proyecto

```
/src
├── api
│     ├── controllers/       # Controladores
│     │    ├── /attendees.js
│     │    ├── /events.js
│     │    └── /users.js
│     ├── models/            # Modelos de Mongoose
│     │    ├── /attendees.js
│     │    ├── /events.js
│     │    └── /users.js
│     └── routes/            # Definición de endpoints
│          ├── /attendees.js
│          ├── /events.js
│          ├── /imageRoutes.js
│          └── /users.js
│
├── config
│    └── /db.js
│
├── controllers
│    └── /imageController.js
│
├── data
│    ├── /events.csv
│    └── /users.csv
│
├── middleware/              # Middlewares personalizados
│    ├── /confirmedEvent.js
│    ├── /file.js
│    └── /isAuth.js
│
├── utils/                   # Funciones auxiliares
│    ├── seeds
│    │    ├── /events.seed.js
│    │    └── /users.seed.js
│    │
│    ├── deleteFile.js
│    │
│    └──jwt.js
│
├── .env                     # Variables de entorno
│
└── index.js                 # Archivo principal
```

---

## 🔐 Autenticación

La autenticación se realiza mediante tokens JWT.

- **Registro:** `POST /auth/register`
- **Login:** `POST /auth/login`
- El token debe ser enviado en el header:  
  `Authorization: Bearer <token>`

---

## 🧠 Endpoints principales

### 🔸 Eventos

- `GET /events` - Obtener todos los eventos
- `GET /events/:id` - Obtener un evento específico
- `POST /events` - Crear un nuevo evento (protegido)
- `PATCH /events/:id` - Editar un evento existente (protegido)
- `DELETE /events/:id` - Eliminar un evento (protegido)

### 🔸 Favoritos

- `PATCH /favorites/:eventId` - Agregar o quitar un evento de favoritos (protegido)
- `GET /favorites` - Obtener todos los eventos favoritos del usuario (protegido)

### 🔸 Asistencia

- `PATCH /attendance/:eventId` - Confirmar o cancelar asistencia a un evento (protegido)
- `GET /attendance` - Obtener eventos a los que el usuario está asistiendo (protegido)

---

## ⚙️ Instalación

### 1. Clona el repositorio

```bash
git clone https://github.com/MaryCala/PROYECTO-13-BACK.git
cd PROYECTO-13-BACK
```

### 2. Instala las dependencias

```bash
npm install
```

### 3. Configura el archivo `.env`

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
DB_URL=************
SECRET_KEY=tu_secreto_super_seguro
```

### 4. Inicia el servidor

Modo desarrollo:

```bash
npm run dev
```

El backend estará disponible en: [http://localhost:3001](http://localhost:3001)

---

## ✅ Requisitos

- Node.js ≥ 18
- MongoDB (local o en la nube, por ejemplo [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

---

## 🛠 Scripts disponibles

```bash
npm run dev     # Inicia el servidor con nodemon (desarrollo)
npm start       # Inicia el servidor en modo producción
```

---

## 🛡️ Buenas prácticas incluidas

- Uso de controladores separados para organización del código
- Middleware de autenticación y autorización
- Manejo de errores centralizado
- Estructura modular y escalable
- Uso de variables de entorno con dotenv

---

## Contacto

Proyecto desarrollado por Mary Cala
Para dudas o colaboración, contactar por email: marycala87@gmail.com

---

## Licencia

MIT License © 2025 Mary Cala
