import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { Corridore, Squadra, Tappa, VoceClassificaTempo, VoceCestino } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="view-head">
      <h1>Dashboard</h1>
      <p>Panoramica generale del gestionale — dati letti in tempo reale dalle API del backend.</p>
    </div>

    @if (caricamento) {
      <div class="stato-caricamento">Caricamento dati in corso…</div>
    } @else {
      <div class="griglia-statistiche">
        <div class="statistica">
          <div class="numero">{{ tappe.length }}</div>
          <div class="etichetta">Tappe totali</div>
        </div>
        <div class="statistica">
          <div class="numero">{{ corridori.length }}</div>
          <div class="etichetta">Corridori iscritti</div>
        </div>
        <div class="statistica">
          <div class="numero">{{ corridoriInGara }}</div>
          <div class="etichetta">Ancora in gara</div>
        </div>
        <div class="statistica">
          <div class="numero">{{ squadre.length }}</div>
          <div class="etichetta">Squadre</div>
        </div>
        <div class="statistica">
          <div class="numero">{{ cestino.length }}</div>
          <div class="etichetta">Elementi nel cestino</div>
        </div>
      </div>

      <div class="griglia-dashboard">
        <div class="card">
          <div class="card-titolo-riga">
            <h3>Maglia rosa — classifica generale a tempo</h3>
            <a routerLink="/classifiche">Vedi tutte le classifiche →</a>
          </div>
          @if (classificaTempo.length === 0) {
            <p class="testo-soft mt-16">Nessun risultato registrato ancora.</p>
          } @else {
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Corridore</th>
                  <th>Squadra</th>
                  <th>Distacco</th>
                </tr>
              </thead>
              <tbody>
                @for (v of classificaTempo.slice(0, 5); track v.id; let i = $index) {
                  <tr>
                    <td>{{ i + 1 }}</td>
                    <td>{{ v.cognome }} {{ v.nome }}</td>
                    <td>{{ v.squadra_nome }}</td>
                    <td>{{ v.distacco }}</td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>

        <div class="card">
          <div class="card-titolo-riga">
            <h3>Prossima tappa</h3>
            <a routerLink="/tappe">Vedi tutte le tappe →</a>
          </div>
          @if (prossimaTappa) {
            <div class="prossima-tappa">
              <div class="prossima-tappa-numero">Tappa {{ prossimaTappa.numero_tappa }}</div>
              <h4>{{ prossimaTappa.nome }}</h4>
              <p class="testo-soft">{{ prossimaTappa.partenza }} → {{ prossimaTappa.arrivo }}</p>
              <p class="testo-soft" *ngIf="prossimaTappa.data">{{ prossimaTappa.data }}</p>
              <span class="badge badge-viola">{{ prossimaTappa.tipo }}</span>
            </div>
          } @else {
            <p class="testo-soft mt-16">Nessuna tappa ancora programmata.</p>
          }
        </div>
      </div>
    }
  `,
  styles: [
    `
      .griglia-dashboard {
        display: grid;
        grid-template-columns: 1.4fr 1fr;
        gap: 18px;
      }
      @media (max-width: 900px) {
        .griglia-dashboard {
          grid-template-columns: 1fr;
        }
      }
      .card-titolo-riga {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        gap: 10px;
        flex-wrap: wrap;
      }
      .card-titolo-riga h3 {
        font-size: 16px;
      }
      .card-titolo-riga a {
        font-size: 13px;
        font-weight: 700;
        text-decoration: none;
      }
      .prossima-tappa-numero {
        color: var(--testo-soft);
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .prossima-tappa h4 {
        font-size: 19px;
        margin: 4px 0 6px;
      }
      .prossima-tappa {
        margin-top: 6px;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);

  caricamento = true;
  tappe: Tappa[] = [];
  corridori: Corridore[] = [];
  squadre: Squadra[] = [];
  cestino: VoceCestino[] = [];
  classificaTempo: VoceClassificaTempo[] = [];
  prossimaTappa: Tappa | null = null;

  get corridoriInGara(): number {
    return this.corridori.filter((c) => !c.ritirato).length;
  }

  ngOnInit(): void {
    forkJoin({
      tappe: this.api.list<Tappa>('tappe'),
      corridori: this.api.list<Corridore>('corridori'),
      squadre: this.api.list<Squadra>('squadre'),
      cestino: this.api.list<VoceCestino>('cestino'),
      classificaTempo: this.api.ottieniPercorso<VoceClassificaTempo[]>('risultati/classifica-tempo'),
    }).subscribe((risultati) => {
      this.tappe = risultati.tappe;
      this.corridori = risultati.corridori;
      this.squadre = risultati.squadre;
      this.cestino = risultati.cestino;
      this.classificaTempo = risultati.classificaTempo;
      this.prossimaTappa =
        this.tappe
          .filter((t) => t.stato === 'programmata')
          .sort((a, b) => a.numero_tappa - b.numero_tappa)[0] ?? null;
      this.caricamento = false;
    });
  }
}
