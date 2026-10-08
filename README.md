# R_2026_chihuahua — RetroFit AI (Acceso NFC + Roles + Logs)

Sistema de monitoreo industrial con acceso por chip **NFC**, roles de usuario y
registro de **logs** (mantenimientos + diagnósticos de IA).

## Arquitectura

```
 Chip NFC (NDEF URL) ─► http://<IP>:3000/m/<nfc_id>
                              │
                    ┌─────────┴──────────┐
        frontend (Next.js 16, puerto 3000) │  retrofit-agent (Node, puerto 4000)
        ─ es la ÚNICA puerta compartida    │  ─ NO se comparte (interno)
        ├─ login + JWT cookie (sin pwd)    │  ├─ MQTT ← Mosquitto (topic retrofit/telemetria)
        ├─ proxy.ts (control de acceso)    │  ├─ Umbral vibración ≥ 800 → IA (Ollama)
        ├─ /m/<id>  (panel vs mantenimiento)│  └─ Escribe cada diagnóstico en ai_logs
        ├─ /logs    (históricos)            │
        └─ SQLite (data/demo.db, WAL) ◄─────┘  ← BD compartida
```

- **Roles**: `supervisor` (ve datos de la máquina) y `mantenimiento`
  (registra mantenimientos). Sin sesión válida → acceso denegado.
- **Entrada sin contraseña** (demo): en `/login` solo se elige el rol
  (`supervisor` o `mantenimiento`); no hay usuario ni password. La API de login
  recibe igual `{username}` con el rol elegido.
- **Máquinas** (catálogo en BD): `motor-01`, `cnc-01`, `compresor-01`.
- **Logs**: `maintenance_logs` (creados por mantenimiento) y `ai_logs`
  (escritos por retrofit-agent por cada diagnóstico de la IA).

## Cómo correr la demo

Requisitos: Node ≥ 24 (usa `node:sqlite`, sin librerías nativas).

```bash
# 1) Frontend (puerta compartida → puerto 3000)
cd frontend
npm install
npm run dev

# 2) Motor (backend interno → puerto 4000) — necesita Mosquitto + Ollama para IA real
cd retrofit-agent
npm install
node server.js
```

Compartir: abrir `http://<IP-de-tu-PC-en-la-red>:3000` desde otro equipo.
(Usa `ipconfig` para conocer la IP; el QR del login ayuda a abrirla en el celular.)

### Uso
1. Abrir `/` → dashboard de la planta (o escanear el chip NFC para ir directo a `/m/<máquina>`).
2. Sin sesión te redirige a `/login` (elige `supervisor` o `mantenimiento`).
3. `supervisor` → pantalla de panel; `mantenimiento` → pantalla de registro.
4. La pantalla de logs muestra los históricos de mantenimiento y de IA.

### Probar la API sin frontend
```bash
curl -c jar.txt -H "Content-Type: application/json" -d '{"username":"supervisor"}' http://localhost:3000/api/auth/login
curl -b jar.txt http://localhost:3000/api/logs
curl -b jar.txt http://localhost:3000/api/machines/motor-01
```

## Escribir un chip NFC (demo presencial)
Programar el chip con una URL NDEF:
```
http://<IP>:3000/m/motor-01
```
- **Android**: abre la URL automáticamente al acercar el chip.
- **iPhone**: Safari no abre URLs NFC nativamente → usar el QR del login.

## Endpoints
| Método | Ruta | Permiso |
|-------|------|---------|
| POST | `/api/auth/login` | público (`{username}`) |
| POST | `/api/auth/logout` | sesión |
| GET | `/api/auth/me` | sesión |
| GET | `/api/machines` | sesión |
| GET | `/api/machines/[id]` | sesión (estado + último diagnóstico IA) |
| GET | `/api/maintenance` | sesión |
| POST | `/api/maintenance` | solo `mantenimiento` |
| GET | `/api/logs?type=maintenance\|ai&machine&from&to` | sesión |

## Notas
- La BD se crea sola en `data/demo.db` (incluida en `.gitignore`).
- Las contraseñas no se piden aún; la columna `password_hash` ya existe en
  `users` para activarlas después sin migrar.
- El UI de las pantallas (`panel`, `mantenimiento`, `logs`) está **en preparación**
  (placeholders protegidos); las APIs ya están listas y probadas.