import { Component, Injectable, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';

interface DatosConfirmacion {
  titulo: string;
  mensaje: string;
  accion: string;
}

@Component({
  selector: 'app-dialogo-confirmacion',
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>{{ datos.titulo }}</h2>
    <mat-dialog-content>{{ datos.mensaje }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton type="button" [mat-dialog-close]="false">Cancelar</button>
      <button matButton="filled" type="button" class="peligro" [mat-dialog-close]="true">{{ datos.accion }}</button>
    </mat-dialog-actions>
  `,
  styles: `
    .peligro {
      --mat-button-filled-container-color: var(--pel-error);
    }
  `,
})
class DialogoConfirmacion {
  protected readonly datos = inject<DatosConfirmacion>(MAT_DIALOG_DATA);
}

/** Pide confirmación antes de una acción destructiva. */
@Injectable({ providedIn: 'root' })
export class Confirmacion {
  private readonly dialog = inject(MatDialog);

  async pedir(datos: DatosConfirmacion): Promise<boolean> {
    const referencia = this.dialog.open(DialogoConfirmacion, { data: datos, width: '420px', maxWidth: '95vw' });
    return (await firstValueFrom(referencia.afterClosed())) === true;
  }
}
