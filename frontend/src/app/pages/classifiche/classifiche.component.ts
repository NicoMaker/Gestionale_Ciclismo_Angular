import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ApiService } from '../../core/api.service';
import {
  VoceClassificaMontagna,
  VoceClassificaPunti,
  VoceClassificaSquadre,
  VoceClassificaTempo,
} from '../../core/models';

type SchedaClassifica = 'tempo' | 'punti' | 'montagna' | 'giovani' | 'squadre';

@Component({
  selector: 'app-classifiche',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="view-head">
      <h1>Classifiche</h1>
      <p>Le cinque classifiche ufficiali della corsa, calcolate in tempo reale dal backend.</p>
    </div>

    <div class="tabs">
      @for (s of schede; track s.chiave) {
        <button class="tab" [class.attivo]="schedaAttiva === s.chiave" type="button" (click)="cambiaScheda(s.chiave)">
          {{ s.etichetta }}
        </button>
      }
    </div>

    @if (caricamento) {
      <div class="stato-caricamento">Caricamento…</div>
    } @else {
      @switch (schedaAttiva) {
        @case ('tempo') {
          @if (tempo.length === 0) {
            <p class="testo-soft">Nessun risultato ancora disponibile.</p>
          } @else {
            <div class="table-wrap">
              <table>
                <thead>
                  <tr><th>#</th><th>Corridore</th><th>Squadra</th><th>Tappe</th><th>Tempo totale</th><th>Distacco</th></tr>
                </thead>
                <tbody>
                  @for (v of tempo; track v.id; let i = $index) {
                    <tr>
                      <td>{{ i + 1 }}</td>
                      <td>{{ v.cognome }} {{ v.nome }} <span class="testo-soft">#{{ v.numero_pettorale }}</span></td>
                      <td>{{ v.squadra_nome }}</td>
                      <td>{{ v.tappe_disputate }}</td>
                      <td>{{ v.tempo_totale }}</td>
                      <td>{{ v.distacco }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        }
        @case ('punti') {
          @if (punti.length === 0) {
            <p class="testo-soft">Nessun risultato ancora disponibile.</p>
          } @else {
            <div class="table-wrap">
              <table>
                <thead>
                  <tr><th>#</th><th>Corridore</th><th>Squadra</th><th>Tappe</th><th>Punti</th></tr>
                </thead>
                <tbody>
                  @for (v of punti; track v.id; let i = $index) {
                    <tr>
                      <td>{{ i + 1 }}</td>
                      <td>{{ v.cognome }} {{ v.nome }} <span class="testo-soft">#{{ v.numero_pettorale }}</span></td>
                      <td>{{ v.squadra_nome }}</td>
                      <td>{{ v.tappe_disputate }}</td>
                      <td>{{ v.punti_totali }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        }
        @case ('montagna') {
          @if (montagna.length === 0) {
            <p class="testo-soft">Nessun risultato ancora disponibile.</p>
          } @else {
            <div class="table-wrap">
              <table>
                <thead>
                  <tr><th>#</th><th>Corridore</th><th>Squadra</th><th>GPM disputati</th><th>Punti</th></tr>
                </thead>
                <tbody>
                  @for (v of montagna; track v.id; let i = $index) {
                    <tr>
                      <td>{{ i + 1 }}</td>
                      <td>{{ v.cognome }} {{ v.nome }} <span class="testo-soft">#{{ v.numero_pettorale }}</span></td>
                      <td>{{ v.squadra_nome }}</td>
                      <td>{{ v.gpm_disputati }}</td>
                      <td>{{ v.punti_totali }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        }
        @case ('giovani') {
          @if (giovani.length === 0) {
            <p class="testo-soft">Nessun corridore under-25 con risultati ancora.</p>
          } @else {
            <div class="table-wrap">
              <table>
                <thead>
                  <tr><th>#</th><th>Corridore</th><th>Età</th><th>Squadra</th><th>Tempo totale</th><th>Distacco</th></tr>
                </thead>
                <tbody>
                  @for (v of giovani; track v.id; let i = $index) {
                    <tr>
                      <td>{{ i + 1 }}</td>
                      <td>{{ v.cognome }} {{ v.nome }} <span class="testo-soft">#{{ v.numero_pettorale }}</span></td>
                      <td>{{ v.eta ?? '—' }}</td>
                      <td>{{ v.squadra_nome }}</td>
                      <td>{{ v.tempo_totale }}</td>
                      <td>{{ v.distacco }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        }
        @case ('squadre') {
          @if (squadre.length === 0) {
            <p class="testo-soft">Nessun risultato ancora disponibile.</p>
          } @else {
            <div class="table-wrap">
              <table>
                <thead>
                  <tr><th>#</th><th>Squadra</th><th>Corridori contati</th><th>Tempo totale</th><th>Distacco</th></tr>
                </thead>
                <tbody>
                  @for (v of squadre; track v.squadra_id; let i = $index) {
                    <tr>
                      <td>{{ i + 1 }}</td>
                      <td><span class="puntino" [style.background]="v.squadra_colore"></span> {{ v.squadra_nome }}</td>
                      <td>{{ v.corridori_contati }}</td>
                      <td>{{ v.tempo_totale }}</td>
                      <td>{{ v.distacco }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        }
      }
    }
  `,
})
export class ClassificheComponent implements OnInit {
  private api = inject(ApiService);

  schede: { chiave: SchedaClassifica; etichetta: string }[] = [
    { chiave: 'tempo', etichetta: 'Maglia rosa (tempo)' },
    { chiave: 'punti', etichetta: 'Maglia ciclamino (punti)' },
    { chiave: 'montagna', etichetta: 'Maglia verde (GPM)' },
    { chiave: 'giovani', etichetta: 'Maglia bianca (giovani)' },
    { chiave: 'squadre', etichetta: 'Classifica a squadre' },
  ];

  schedaAttiva: SchedaClassifica = 'tempo';
  caricamento = true;

  tempo: VoceClassificaTempo[] = [];
  punti: VoceClassificaPunti[] = [];
  montagna: VoceClassificaMontagna[] = [];
  giovani: VoceClassificaTempo[] = [];
  squadre: VoceClassificaSquadre[] = [];

  private caricate = new Set<SchedaClassifica>();

  ngOnInit(): void {
    this.caricaScheda('tempo');
  }

  cambiaScheda(s: SchedaClassifica): void {
    this.schedaAttiva = s;
    this.caricaScheda(s);
  }

  private caricaScheda(s: SchedaClassifica): void {
    if (this.caricate.has(s)) return;
    this.caricamento = true;
    const percorsi: Record<SchedaClassifica, string> = {
      tempo: 'risultati/classifica-tempo',
      punti: 'risultati/classifica-generale',
      montagna: 'risultati/classifica-montagna',
      giovani: 'risultati/classifica-giovani',
      squadre: 'risultati/classifica-squadre',
    };
    this.api.ottieniPercorso<unknown[]>(percorsi[s]).subscribe((righe) => {
      switch (s) {
        case 'tempo':
          this.tempo = righe as VoceClassificaTempo[];
          break;
        case 'punti':
          this.punti = righe as VoceClassificaPunti[];
          break;
        case 'montagna':
          this.montagna = righe as VoceClassificaMontagna[];
          break;
        case 'giovani':
          this.giovani = righe as VoceClassificaTempo[];
          break;
        case 'squadre':
          this.squadre = righe as VoceClassificaSquadre[];
          break;
      }
      this.caricate.add(s);
      this.caricamento = false;
    });
  }
}
