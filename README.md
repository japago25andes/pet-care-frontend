# PeludOS Web

Frontend de PeludOS: Angular + Angular Material, con paleta azul. Consume la API de `pet-care-backend`.

## Arranque

Solo necesitas Docker. Primero levanta el back y luego el front.

### Producción

```bash
docker compose up -d --build
```

- Compila la app y la sirve con nginx en `http://localhost` (puerto 80).
- nginx reenvía `/api/...` al back y devuelve `index.html` en las rutas de Angular, así que recargar cualquier página funciona.
- El puerto se cambia con `WEB_PORT`. Si el back no está en el 8001 de la misma máquina, usa `API_TARGET` (ej: `API_TARGET=http://10.0.0.5:8001`).

### Desarrollo

```bash
docker compose -f docker-compose.dev.yml up -d
```

- La app queda en `http://localhost:4200`, con recarga automática. La primera vez tarda unos minutos porque instala las dependencias.
- Acepta las mismas variables `WEB_PORT` y `API_TARGET`.

Para tener datos de prueba, corre `docker compose exec api python -m app.scripts.cargar_demo` en el back. Los usuarios y la contraseña están en ese script.

## Qué hay por rol

| Rol | Secciones |
|---|---|
| Sin sesión | Portada, búsqueda de veterinarias con mapa, detalle de veterinaria y tienda |
| Cliente | Panel, mascotas con ficha de salud, citas, carrito, pedidos, reseñas y mensajes |
| Veterinaria | Panel del día, sus veterinarias y profesionales, agenda, inventario, pedidos recibidos y mensajes |
| Admin | Usuarios y veterinarias, incluidas las inactivas |

## Cómo se conecta con el back

El navegador llama a `/api/...` en el mismo origen y el servidor lo reenvía al back sin el prefijo, así que no hace falta CORS. En desarrollo lo hace `proxy.conf.js` y en producción `nginx.conf.template`.

El cliente de `src/app/core/api` se genera desde el OpenAPI del back; no se edita a mano. Si cambian los endpoints:

```bash
docker compose -f docker-compose.dev.yml run --rm web npm run api
```

Los mensajes no llegan en tiempo real: la app consulta el hilo abierto cada 8 segundos y los no leídos cada 15.

## Estructura de `src/app`

| Carpeta | Contenido |
|---|---|
| `core` | Sesión, interceptor, guards, errores, carrito, mensajes y API generada |
| `layout` | Estructura con menú lateral y marco de login/registro |
| `shared` | Componentes reutilizables (mapa, avisos de carga, confirmación, etiquetas) |
| `features` | Una carpeta por sección de la app |

Los colores se definen en `src/styles.scss`, como variables `--pel-*`.

## Pruebas

```bash
docker compose -f docker-compose.dev.yml run --rm web npx ng test --watch=false
```
