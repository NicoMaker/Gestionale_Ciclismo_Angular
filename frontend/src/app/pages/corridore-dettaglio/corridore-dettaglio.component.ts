import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Corridore, DettaglioCorridore } from '../../core/models';

@Component({
  selector: 'app-corridore-dettaglio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <a routerLink="/corridori" class="link-indietro">← Torna ai corridori</a>

    @if (caricamento) {
      <div class="stato-caricamento">Caricamento…</div>
    } @else if (!corridore) {
      <div class="stato-vuoto">
        <div class="titolo">Corridore non trovato</div>
      </div>
    } @else {
      <div class="view-head">
        <h1>{{ corridore.cognome }} {{ corridore.nome }}</h1>
        <p>
          #{{ corridore.numero_pettorale ?? '—' }} ·
          {{ corridore.squadra_nome || 'Nessuna squadra' }} ·
          {{ corridore.nazione_nome || 'Nazione non impostata' }}
        </p>
      </div>

      @if (corridore.ritirato) {
        <div class="card avviso-ritiro mb-16">
          <strong>Corridore ritirato</strong> — motivo:
          {{ corridore.motivo_ritiro }}
          @if (corridore.note_ritiro) {
            <p class="testo-soft mt-16">{{ corridore.note_ritiro }}</p>
          }
        </div>
      }

      @if (dettaglio) {
        <div class="griglia-statistiche">
          <div class="statistica">
            <div class="numero">
              {{ posizioneTesto(dettaglio.classifiche.generale) }}
            </div>
            <div class="etichetta">Maglia rosa (generale)</div>
          </div>
          <div class="statistica">
            <div class="numero">
              {{ posizioneTesto(dettaglio.classifiche.punti) }}
            </div>
            <div class="etichetta">Maglia ciclamino (punti)</div>
          </div>
          <div class="statistica">
            <div class="numero">
              {{ posizioneTesto(dettaglio.classifiche.montagna) }}
            </div>
            <div class="etichetta">Maglia verde (GPM)</div>
          </div>
          <div class="statistica">
            <div class="numero">
              {{ posizioneTesto(dettaglio.classifiche.giovani) }}
            </div>
            <div class="etichetta">Maglia bianca (giovani)</div>
          </div>
        </div>

        <h3 class="mb-16">Risultati tappa per tappa</h3>
        @if (dettaglio.risultati.length === 0) {
          <p class="testo-soft">
            Nessun risultato registrato per questo corridore.
          </p>
        } @else {
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tappa</th>
                  <th>Percorso</th>
                  <th>Posizione</th>
                  <th>Tempo</th>
                  <th>Distacco</th>
                  <th>Punti</th>
                </tr>
              </thead>
              <tbody>
                @for (r of dettaglio.risultati; track r.tappa_id) {
                  <tr>
                    <td>{{ r.numero_tappa }} — {{ r.tappa_nome }}</td>
                    <td>{{ r.partenza }} → {{ r.arrivo }}</td>
                    <td>{{ r.posizione ?? '—' }}</td>
                    <td>{{ r.tempo || '—' }}</td>
                    <td>{{ r.distacco || '—' }}</td>
                    <td>{{ r.punti }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      }
    }
  `,
  styles: [
    `
      .link-indietro {
        display: inline-block;
        margin-bottom: 14px;
        font-weight: 700;
        font-size: 13.5px;
        text-decoration: none;
      }
      .avviso-ritiro {
        border-left: 4px solid var(--rosso);
      }
    `,
  ],
})
export class CorridoreDettaglioComponent implements OnChanges {
  private api = inject(ApiService);

  @Input() id!: string;

  caricamento = true;
  corridore: Corridore | null = null;
  dettaglio: DettaglioCorridore | null = null;

  ngOnChanges(): void {
    if (!this.id) return;
    this.caricamento = true;
    this.api
      .ottieni<Corridore>('corridori', this.id)
      .subscribe((c) => (this.corridore = c));
    this.api
      .ottieniPercorso<DettaglioCorridore>(`risultati/corridore/${this.id}`)
      .subscribe((d) => {
        this.dettaglio = d;
        this.caricamento = false;
      });
  }

  posizioneTesto(p: { posizione: number; totale: number } | null): string {
    return p ? `${p.posizione}°` : '—';
  }
}
