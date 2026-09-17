import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Unico punto di contatto con le API REST del backend Express
 * (vedi backend/server.js). Il frontend non serve più pagine HTML dal
 * backend: legge/scrive tutto tramite queste chiamate JSON su /api/*.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  list<T>(percorso: string): Observable<T[]> {
    return this.http.get<T[]>(`${this.base}/${percorso}`);
  }

  ottieni<T>(percorso: string, id: number | string): Observable<T> {
    return this.http.get<T>(`${this.base}/${percorso}/${id}`);
  }

  /** GET puro su un percorso completo (es. 'risultati/tappa/3', 'risultati/classifica-generale') */
  ottieniPercorso<T>(percorso: string): Observable<T> {
    return this.http.get<T>(`${this.base}/${percorso}`);
  }

  crea<T>(percorso: string, corpo: unknown): Observable<T> {
    return this.http.post<T>(`${this.base}/${percorso}`, corpo);
  }

  aggiorna<T>(percorso: string, id: number | string, corpo: unknown): Observable<T> {
    return this.http.put<T>(`${this.base}/${percorso}/${id}`, corpo);
  }

  elimina<T = { ok: boolean }>(percorso: string, id: number | string): Observable<T> {
    return this.http.delete<T>(`${this.base}/${percorso}/${id}`);
  }

  /** DELETE su un percorso completo senza id in coda (es. svuota cestino) */
  eliminaPercorso<T = { ok: boolean }>(percorso: string): Observable<T> {
    return this.http.delete<T>(`${this.base}/${percorso}`);
  }

  /** POST verso un'azione dedicata (es. 'corridori/5/ritira') */
  azione<T>(percorso: string, corpo: unknown = {}): Observable<T> {
    return this.http.post<T>(`${this.base}/${percorso}`, corpo);
  }
}
