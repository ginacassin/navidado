# Navidado 🎲🎁

El juego de regalos más divertido de la Navidad: se tira un dado y, según lo que salga, los regalos cambian de manos hasta que se acaba el tiempo.

- **Un solo móvil**: un teléfono hace de dado y de mesa y se pasa de mano en mano. Funciona sin conexión una vez cargada la página.
- **Sala tipo Jackbox**: el anfitrión crea una sala (TV, portátil o móvil) y el resto se une con un QR o un código de 4 letras. El anfitrión también puede jugar. Hay una vista de TV en `/tv/CÓDIGO`.

El dado es 3D real (WebGL con three.js, cargado aparte); en dispositivos sin WebGL se usa la versión vectorial.

Diseño de referencia: [`docs/design-board.png`](docs/design-board.png) y su descripción en [`docs/design-board.md`](docs/design-board.md).

## Reglas implementadas

| Modo | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| Clásico (predeterminado) | Derecha | Izquierda | Robo | Todos a la derecha | Todos a la izquierda | ¡Feliz Navidad! |
| Tranquilo | Derecha | Izquierda | Robo | Remolino | ¡Feliz Navidad! | ¡Feliz Navidad! |
| Caótico | Derecha | Izquierda | Robo | Robo a ciegas | Remolino | ¡Feliz Navidad! |
| Estratégico | Derecha | Izquierda | Robo | Me lo quedo | Remolino | ¡Feliz Navidad! |
| Mínimo | Derecha | Izquierda | Robo | ¡Feliz Navidad! | ¡Feliz Navidad! | ¡Feliz Navidad! |

- Turnos en el sentido de las agujas del reloj. La izquierda de cada jugador es el siguiente en el orden de asientos y la derecha, el anterior.
- No hay límite de tiempo para tirar ni opción de pasar. Si alguien no está, el anfitrión puede saltar su turno desde su menú.
- Para elegir a quién robar, o la dirección del remolino, hay 15 s. Si se agotan, la app elige al azar.
- **Temporizador de partida** (15 min por defecto). Muestra solo los minutos hasta los 3 últimos. A los 3 y a los 2 minutos avisa con vibración y un mensaje. El último minuto aparece en rojo y con segundos. Al llegar a 0:00 suena la campanada, se resuelve la elección en curso y se pasa al final.
- Los regalos no llevan etiquetas: la app habla de personas («Dale tu regalo a Ana; ella te da el suyo») y sigue cada paquete por quién lo trajo.
- Al final se muestra el orden de apertura y tres premios: ladrón del año, regalo más robado y regalo más viajero.

## Desarrollo

```bash
npm install
npm run dev        # cliente en :5173 (con proxy) y servidor en :3000
npm test           # tests del motor de juego
npm run check      # comprobación de tipos
npm run build && npm start   # producción en :3000
node scripts/smoke.mjs http://localhost:3000   # partida simulada contra el servidor
```

Estructura:

- `src/shared/game.ts`: motor de juego puro, compartido por el cliente y el servidor.
- `src/server/index.ts`: servidor HTTP con Socket.IO. Las salas viven en memoria y se guardan en `DATA_DIR/rooms.json` cada 5 s y al apagar el servidor.
- `src/client/`: interfaz en Svelte 5. Está en `screens/` y `components/`.

Caché: cada build lleva un identificador (`BUILD_ID`, por defecto la fecha). El service worker usa una caché nueva por versión y la página se recarga sola cuando hay una versión nueva; `index.html` y `sw.js` se sirven sin caché.

Variables de entorno:

| Variable | Por defecto | Para qué |
|---|---|---|
| `PORT` | `3000` | Puerto interno |
| `HOST` | `0.0.0.0` | Interfaz. Tiene que ser 0.0.0.0 detrás de Traefik |
| `DATA_DIR` | `./data` (`/data` en Docker) | Dónde se guardan las salas |
| `CORS_ORIGIN` | (ninguno) | Solo si sirves el frontend desde otro dominio |

## Despliegue en la Raspberry Pi con Dokploy

La imagen funciona en `linux/arm64` (Raspberry Pi 4 y 5 con sistema de 64 bits) y en `amd64`. Ocupa poco: unos 6 MB de dependencias de Node.

### Opción A: Application con Dockerfile (recomendada)

1. En Dokploy, crea un **Proyecto** → **Application**.
2. **Source**: GitHub → el repositorio → rama `main`. **Build type**: `Dockerfile` (ruta `./Dockerfile`).
3. **Domains**: añade tu dominio (por ejemplo `navidado.tudominio.com`) con:
   - **Container port** `3000`.
   - **HTTPS** activado con Let's Encrypt.
   - **Strip path** desactivado.

   Antes, crea el registro DNS A que apunte a tu IP.
4. **Advanced → Volumes**: monta un volumen en `/data`, para que las salas sobrevivan a los redeploys.
5. **Advanced → Health check** (opcional): `GET /health` en el puerto 3000. La imagen ya trae un `HEALTHCHECK`.
6. **Deploy**. Después activa **Auto Deploy** para desplegar en cada push.

Notas:

- **HTTPS es obligatorio en producción.** En iOS, «agitar para tirar» y mantener la pantalla encendida solo funcionan con HTTPS.
- **Usa 1 réplica.** El estado de las salas está en memoria. Traefik hace el upgrade a WebSocket sin configuración extra.
- **Compilar en la Pi** (`npm ci` + `vite build`) tarda un par de minutos en una Pi 4. Si prefieres no compilar allí, el workflow `.github/workflows/docker.yml` publica la imagen multi-arquitectura en GHCR. En ese caso, en Dokploy usa como source **Docker** con `ghcr.io/<tu-usuario>/navidado:latest`.

### Opción B: Compose

Usa `docker-compose.yml`: incluye el volumen con nombre `navidado-data`. Luego, en la pestaña **Domains** del Compose, elige el servicio `navidado`, el puerto `3000` y tu dominio, y **haz redeploy**. En Compose, los cambios de dominio no se aplican sin redeploy.

### Copias de seguridad

Todo el estado está en `/data/rooms.json`. Las salas caducan a las 12 h sin actividad, así que no hace falta hacer copia. Si quieres hacerla, usa **Volume Backups** de Dokploy sobre el volumen.
