import { Injectable, signal } from '@angular/core';

export type TipoToast = 'successo' | 'errore' | 'info';

export interface Toast {
  id: number;
  tipo: TipoToast;
  messaggio: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private contatore = 0;

  private mostra(messaggio: string, tipo: TipoToast, durataMs = 4500): void {
    const id = ++this.contatore;
    this.toasts.update((lista) => [...lista, { id, tipo, messaggio }]);
    setTimeout(() => this.rimuovi(id), durataMs);
  }

  successo(messaggio: string): void {
    this.mostra(messaggio, 'successo');
  }

  errore(messaggio: string): void {
    this.mostra(messaggio, 'errore', 6000);
  }

  info(messaggio: string): void {
    this.mostra(messaggio, 'info');
  }

  rimuovi(id: number): void {
    this.toasts.update((lista) => lista.filter((t) => t.id !== id));
  }
}
