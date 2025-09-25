# Echo Editor

A real-time collaborative code editor with multi-user presence, per-room language selection, and persistent session storage. Built with a modern React + Vite frontend and a Node.js (Express + Socket.IO) backend backed by MongoDB (with graceful in‑memory fallback). Designed for fast iteration locally and production deployment behind Nginx with SSL.

> Use this README as both public documentation and as material you can reference on your resume / portfolio.

---
## 🚀 Key Features
- Real-time collaborative editing (Socket.IO)
- Multi-room architecture (unique sharable room IDs / session IDs)
- Live user presence list (join / leave events & periodic cleanup)
- Language switching (synchronized across participants)
- Automatic session persistence in MongoDB (code, language, metadata)
- Graceful offline fallback to in-memory store if MongoDB is unavailable
- User identity persistence via localStorage (stable per-browser userId)
- Clean, focused UI with Monaco Editor (VS Code experience in browser)
- Deployment-ready (PM2, Nginx reverse proxy, multi-subdomain + SSL scripts)
- Environment-based API & Socket URLs for local vs production builds

---
## 🧱 Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, Monaco Editor, react-router-dom |
| Realtime | Socket.IO (Client + Server) |
| Backend | Node.js, Express 5, Socket.IO Server |
| Database | MongoDB Atlas (Mongoose) with in-memory fallback |
| Process Management | PM2 (ecosystem config) |
| Web Server (Prod) | Nginx (reverse proxy + SSL) |
| Deployment Scripts | Bash automation + Certbot (Let's Encrypt) |
| Other | UUID, dotenv, CORS |

---
## 🗂️ Repository Structure
```
Echo-Editor/
  README.md                # (You are here) – master documentation
  code-editor-backend/
    server.js              # Express + Socket.IO + persistence logic
    models/Session.js      # Session (room) schema
    models/User.js         # User schema
    package.json
    ... (env, deployment, scripts, etc.)
  code-editor-frontend/
    src/
      App.jsx
      components/
        HomePage.jsx       # Create / join sessions
        RoomPage.jsx       # Core collaborative editor view
        UserList.jsx       # Presence display overlay
        EditorCompnent.jsx # Legacy single-room prototype (keep / remove)
    index.html
    package.json
```

---
## ⚙️ Environment Variables
Create `.env` files in backend (never commit secrets):
```
# code-editor-backend/.env
PORT=3001
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster-host>/<db-name>?retryWrites=true&w=majority
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```
Frontend variables (optional – Vite):
```
# code-editor-frontend/.env
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
```
For production set these to your domain (e.g. `https://echo.example.com`).

---
## 🏃 Local Development
1. Install dependencies (both folders):
   ```bash
   cd code-editor-backend && npm install
   cd ../code-editor-frontend && npm install
   ```
2. Start backend:
   ```bash
   npm run dev
   ```
3. Start frontend (in another terminal):
   ```bash
   npm run dev
   ```
4. Open: http://localhost:5173
5. Create a session, copy/share the URL, open in another browser / tab to test real-time sync.

---
## 🔌 REST API (Backend)
Base URL: `http://localhost:3001`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sessions` | Create a new session (returns `roomId`) |
| GET | `/api/sessions/:roomId` | Fetch existing session metadata |

### Sample Create Session Response
```json
{
  "roomId": "b3e6a9f2-...",
  "session": {
    "roomId": "b3e6a9f2-...",
    "title": "New Collaborative Session",
    "language": "javascript",
    "code": "// Welcome to Echo Editor!...",
    "activeUsers": [],
    "createdAt": "2025-09-25T10:00:00.000Z",
    "lastModified": "2025-09-25T10:00:00.000Z"
  }
}
```

---
## 🔁 Socket.IO Events
| Direction | Event | Payload | Purpose |
|-----------|-------|---------|---------|
| Client → Server | `join-room` | `{ roomId, user: { userId, username, color? } }` | Join/create room and register presence |
| Server → Client | `session-data` | `{ code, language, title, users[] }` | Initial state after join |
| Client → Server | `code-change` | `{ code, roomId }` | Broadcast code edits |
| Server → Clients (room) | `code-receive` | `{ code, userId, username }` | Apply remote edits |
| Client → Server | `language-change` | `{ language, roomId }` | Change active language |
| Server → Clients | `language-changed` | `{ language, userId, username }` | Sync language |
| Server → Clients | `user-joined` | `{ userId, username, users[] }` | Presence join notification |
| Server → Clients | `user-left` | `{ userId, username, users[] }` | Presence leave notification |
| Server → Clients (periodic) | `user-list-updated` | `{ users[] }` | Periodic cleanup broadcast |
| Client → Server | `cursor-move` | `{ position, selection }` | (Event emitted; UI cursor layer is extendable) |
| Server → Clients | `user-cursor` | `{ userId, username, color, position, selection }` | Data for future live cursors |

---
## 🧠 Design & Architecture Notes
- **Atomic active user management:** User addition/removal uses `$pull` + `$push` to avoid Mongoose version conflicts.
- **Resilience:** If MongoDB is unavailable at startup or temporarily disconnected, an in-memory Map store allows collaboration to continue (non-persistent mode). Reconnection restores persistence.
- **Session lifecycle:** Room created implicitly (if it doesn’t exist) upon first `join-room` or explicitly via REST `POST /api/sessions` then joined via URL.
- **User identity:** Browser-local `userId` persisted in `localStorage` ensures stable presence across reloads.
- **Scalability considerations:** Stateless horizontal scaling would require a Socket.IO adapter (e.g. Redis) not yet configured.

---
## 🛡️ Production Deployment Overview
1. Provision Linux VM (e.g., DigitalOcean droplet)
2. Install Node.js, MongoDB Atlas connection string, Nginx, Certbot
3. Point DNS:
   - A record: `@` → droplet IP
   - CNAME: `www`, `echo`, `editor` → root domain
4. Run production deploy script (example file `production-deploy.sh` if present)
5. PM2 manages node process (restart on crash)
6. Nginx terminates SSL and proxies:
   - `echo.domain.com` / `editor.domain.com` → backend/frontend origins (config dependent)
7. Cert renewal automated by Certbot (cron/systemd timer)

---
## 📌 Roadmap / Possible Enhancements
- Visual live cursors & selections (Monaco decorations)
- Chat / inline comments panel
- Role-based permissions (view vs edit)
- Code execution sandbox per language
- Session history / time-travel snapshots
- Shareable invite links (short tokens instead of UUIDs in URL)
- Redis adapter for multi-instance scaling
- Authentication (OAuth / JWT)
- Tests (unit + integration), load testing scripts

---
## ✅ Resume / Portfolio Bullet Points
You can adapt these:
- Built a full-stack real-time collaborative code editor (React + Node.js + Socket.IO + MongoDB) supporting multi-user presence and synchronized language switching.
- Implemented resilience with an automatic in-memory fallback store to maintain collaboration during database outages.
- Designed atomic MongoDB update patterns to eliminate race conditions in active user tracking.
- Deployed behind Nginx with SSL (Let’s Encrypt), environment-based configuration, and PM2 process supervision.
- Optimized developer experience using Vite, modular React components, and environment-driven API/socket endpoints.
- Implemented a periodic cleanup scheduler to remove stale sockets and keep presence accurate.

---
## 🧪 Testing Ideas (Not Yet Implemented)
- Socket integration tests using `socket.io-client` in Node
- Load simulation (e.g., artillery) to benchmark message latency
- Snapshot persistence test: create session → modify code → reconnect → verify code/state

---
## 🗑️ Cleanup Suggestions (Optional Next Steps)
- Remove legacy `EditorCompnent.jsx` or mark deprecated
- Add `color` to `activeUsers` schema if persisting colors (currently omitted in Mongoose schema)
- Introduce logging levels (debug/info/warn/error) + centralized logger
- Add `/health` endpoint returning DB + uptime info

---
## 🤝 Contributions / Forking
Feel free to fork and extend. Recommended guidelines:
- Use feature branches
- Run lint (add ESLint config) before PR
- Keep Socket event naming consistent (`kebab-case`)

---
## 📄 License
Add a license (e.g., MIT) if you intend to open-source formally. (Currently unspecified.)

---
## 🔍 Quick FAQ
**Why not keep only code in DB?** Storing language & metadata allows consistent rehydration after downtime.
**What happens if MongoDB is down?** Editor still works (memory mode) but data is lost on restart.
**How to scale horizontally?** Add a Redis adapter (`socket.io-redis`) plus share session state or move session persistence fully to DB/Redis.

---
## 🧭 Next Steps After Cloning
```bash
git clone <repo-url>
cd Echo-Editor
# Backend
cd code-editor-backend && npm install && npm run dev
# Frontend (new terminal)
cd ../code-editor-frontend && npm install && npm run dev
```
Open multiple browser tabs to verify real-time sync.

---
## 🙌 Acknowledgements
- Monaco Editor (Microsoft/VS Code engine)
- Socket.IO ecosystem
- Vite for fast local dev

---
Happy collaborating! 🎉
