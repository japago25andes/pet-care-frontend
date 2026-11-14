import { ResourceRef, linkedSignal } from '@angular/core';

/** Conserva el último valor mientras el recurso recarga con otros parámetros, para que la lista no parpadee. */
export function ultimoValor<T>(recurso: ResourceRef<T | undefined>) {
  return linkedSignal<T | undefined, T | undefined>({
    source: () => (recurso.hasValue() ? recurso.value() : undefined),
    computation: (actual, previo) => actual ?? previo?.value,
  });
}
