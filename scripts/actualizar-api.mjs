// Descarga el OpenAPI del back y regenera el cliente en src/app/core/api.
// Uso: docker compose -f docker-compose.dev.yml run --rm web npm run api
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const target = process.env.API_TARGET || 'http://localhost:8001';
const respuesta = await fetch(`${target}/openapi.json`);
if (!respuesta.ok) {
  throw new Error(`El back respondió ${respuesta.status} en ${target}/openapi.json`);
}
writeFileSync('openapi.json', JSON.stringify(await respuesta.json(), null, 2));
execSync('npx ng-openapi-gen', { stdio: 'inherit' });
