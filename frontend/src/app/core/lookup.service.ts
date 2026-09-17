import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay, tap } from 'rxjs';
import { ApiService } from './api.service';

export type ChiaveLookup =
  | 'nazioni'
  | 'squadre'
  | 'corridori'
  | 'tappe'
  | 'sponsor'
  | 'classifiche-tipo';

export interface OpzioneLookup {
  valore: number;
  etichetta: string;
}

/**
 * Molte tabelle secondarie referenziano corridori/tappe/squadre/... tramite
 * chiave esterna (es. traguardi_volanti.corridore_id). Questo servizio
 * carica una volta sola ciascuna lista "anagrafica" e la mantiene in cache
 * sia come Observable (per popolare le <select> dei form) sia come mappa
 * id → etichetta (per mostrare un nome leggibile nelle tabelle invece del
 * solo id numerico).
 */
@Injectable({ providedIn: 'root' })
export class LookupService {
  private api = inject(ApiService);
  private cacheOsservabili = new Map<
    ChiaveLookup,
    Observable<OpzioneLookup[]>
  >();
  private cacheMappe = new Map<ChiaveLookup, Map<number, string>>();

  opzioni(chiave: ChiaveLookup): Observable<OpzioneLookup[]> {
    let osservabile = this.cacheOsservabili.get(chiave);
    if (!osservabile) {
      osservabile = this.api.list<Record<string, unknown>>(chiave).pipe(
        map((righe) => righe.map((r) => this.aOpzione(chiave, r))),
        tap((opzioni) => {
          const mappa = new Map<number, string>();
          opzioni.forEach((o) => mappa.set(o.valore, o.etichetta));
          this.cacheMappe.set(chiave, mappa);
        }),
        shareReplay(1),
      );
      this.cacheOsservabili.set(chiave, osservabile);
    }
    return osservabile;
  }

  /** Etichetta leggibile per un id già in cache (chiamare opzioni() prima). */
  etichetta(
    chiave: ChiaveLookup,
    id: number | string | null | undefined,
  ): string {
    if (id === null || id === undefined || id === '') return '—';
    const idNumerico = Number(id);
    const mappa = this.cacheMappe.get(chiave);
    return mappa?.get(idNumerico) ?? `#${idNumerico}`;
  }

  /** Invalida la cache di una lista (da richiamare dopo create/update/delete). */
  invalida(chiave: ChiaveLookup): void {
    this.cacheOsservabili.delete(chiave);
    this.cacheMappe.delete(chiave);
  }

  private aOpzione(
    chiave: ChiaveLookup,
    r: Record<string, unknown>,
  ): OpzioneLookup {
    const id = Number(r['id']);
    switch (chiave) {
      case 'corridori': {
        const pettorale = r['numero_pettorale'];
        return {
          valore: id,
          etichetta: `${r['cognome']} ${r['nome']}${pettorale ? ' (#' + pettorale + ')' : ''}`,
        };
      }
      case 'tappe':
        return {
          valore: id,
          etichetta: `Tappa ${r['numero_tappa']} — ${r['nome']}`,
        };
      case 'nazioni':
        return { valore: id, etichetta: `${r['nome']} (${r['codice_iso2']})` };
      case 'squadre':
      case 'sponsor':
      case 'classifiche-tipo':
      default:
        return { valore: id, etichetta: String(r['nome'] ?? `#${id}`) };
    }
  }
}
