import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mensajeDeError } from './errores';

/** Mensajes breves al pie de la pantalla. */
@Injectable({ providedIn: 'root' })
export class Avisos {
  private readonly snackBar = inject(MatSnackBar);

  exito(mensaje: string): void {
    this.snackBar.open(mensaje, undefined, { duration: 3000 });
  }

  error(error: unknown): void {
    this.snackBar.open(mensajeDeError(error), 'Cerrar', { duration: 6000 });
  }
}
