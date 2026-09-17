import { Injectable, NgZone, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Socket, io } from 'socket.io-client';
import { environment } from '../../environments/environment';

/**
 * Il backend emette eventi Socket.IO (es. "corridori:aggiornati",
 * "risultati:aggiornati", "stato-live:aggiornato", ...) ogni volta che
 * qualcosa cambia lato server (vedi backend/server.js e le singole route).
 * Questo servizio apre un'unica connessione condivisa e permette ai
 * componenti di iscriversi ai singoli eventi come Observable.
 */
@Injectable({ providedIn: 'root' })
export class SocketService {
  private zone = inject(NgZone);
  private readonly socket: Socket = io(environment.socketUrl, {
    autoConnect: true,
    transports: ['websocket', 'polling'],
  });

  connesso(): boolean {
    return this.socket.connected;
  }

  on<T>(evento: string): Observable<T> {
    return new Observable<T>((subscriber) => {
      const gestore = (dato: T) => this.zone.run(() => subscriber.next(dato));
      this.socket.on(evento, gestore);
      return () => this.socket.off(evento, gestore);
    });
  }

  emetti(evento: string, payload?: unknown): void {
    this.socket.emit(evento, payload);
  }
}
