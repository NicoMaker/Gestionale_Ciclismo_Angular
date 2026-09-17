import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Corridore, Risultato, Tappa } from '../../core/models';
import { ToastService } from '../../core/toast.service';
import { ModalComponent } from '../../shared/modal.component';

@Component({
  selector: 'app-risultati-tappa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent, RouterLink],
  template: `
    <a routerLink="/tappe" class="link-indietro">← Torna alle tappe</a>

    @if (caricamento) {
      <div class="stato-caricamento">Caricamento…</div>
    } @else if (!tappa) {
      <div class="stato-vuoto">
        <div class="titolo">Tappa non trovata</div>
      </div>
    } @else {
      <div class="view-head view-head-riga">
        <div>
          <h1>Tappa {{ tappa.numero_tappa }} — {{ tappa.nome }}</h1>
          <p>
            {{ tappa.partenza }} → {{ tappa.arrivo }} ·
            {{ tappa.distanza_km ?? '—' }} km
          </p>
        </div>
        <button class="btn btn-primary" type="button" (click)="apriNuovo()">
          + Aggiungi risultato
        </button>
      </div>

      @if (risultati.length === 0) {
        <div class="stato-vuoto">
          <div class="titolo">Nessun risultato registrato</div>
          <p>Aggiungi l'arrivo dei corridori con il pulsante in alto.</p>
        </div>
      } @else {
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Pos.</th>
                <th>Corridore</th>
                <th>Squadra</th>
                <th>Tempo</th>
                <th>Punti</th>
                <th class="col-azioni">Azioni</th>
              </tr>
            </thead>
            <tbody>
              @for (r of risultati; track r.id) {
                <tr>
                  <td>{{ r.posizione ?? '—' }}</td>
                  <td>
                    {{ r.cognome }} {{ r.nome }}
                    <span class="testo-soft">#{{ r.numero_pettorale }}</span>
                  </td>
                  <td>{{ r.squadra_nome || '—' }}</td>
                  <td>{{ r.tempo || '—' }}</td>
                  <td>{{ r.punti }}</td>
                  <td class="col-azioni">
                    <button
                      class="btn btn-secondary btn-sm"
                      type="button"
                      (click)="apriModifica(r)"
                    >
                      Modifica
                    </button>
                    <button
                      class="btn btn-danger btn-sm"
                      type="button"
                      (click)="elimina(r)"
                    >
                      Elimina
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    }

    @if (modaleAperto) {
      <app-modal
        [titolo]="form.value.id ? 'Modifica risultato' : 'Nuovo risultato'"
        (chiudi)="chiudiModale()"
      >
        <form [formGroup]="form" class="form-grid">
          <div class="campo largo">
            <label for="corridore">Corridore</label>
            <select id="corridore" formControlName="corridore_id">
              @for (c of corridoriSelezionabili; track c.id) {
                <option [ngValue]="c.id">
                  {{ c.cognome }} {{ c.nome }} (#{{
                    c.numero_pettorale ?? '—'
                  }})
                </option>
              }
            </select>
          </div>
          <div class="campo">
            <label for="posizione">Posizione</label>
            <input id="posizione" type="number" formControlName="posizione" />
          </div>
          <div class="campo">
            <label for="tempo">Tempo (HH:MM:SS)</label>
            <input
              id="tempo"
              type="text"
              placeholder="04:32:10"
              formControlName="tempo"
            />
          </div>
          <div class="campo">
            <label for="punti">Punti</label>
            <input id="punti" type="number" formControlName="punti" />
          </div>
        </form>
        <div modal-footer>
          <button class="btn btn-ghost" type="button" (click)="chiudiModale()">
            Annulla
          </button>
          <button
            class="btn btn-primary"
            type="button"
            [disabled]="form.invalid || salvataggio"
            (click)="salva()"
          >
            {{ salvataggio ? 'Salvataggio…' : 'Salva' }}
          </button>
        </div>
      </app-modal>
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
    `,
  ],
})
export class RisultatiTappaComponent implements OnChanges {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  @Input() id!: string;

  caricamento = true;
  tappa: Tappa | null = null;
  risultati: Risultato[] = [];
  tuttiCorridori: Corridore[] = [];
  modaleAperto = false;
  salvataggio = false;

  form = this.fb.nonNullable.group({
    id: this.fb.control<number | null>(null),
    corridore_id: this.fb.control<number | null>(null, Validators.required),
    posizione: this.fb.control<number | null>(null),
    tempo: [''],
    punti: [0],
  });

  get corridoriSelezionabili(): Corridore[] {
    if (this.form.value.id) return this.tuttiCorridori; // in modifica si può riassegnare a chiunque
    const idGiaPresenti = new Set(this.risultati.map((r) => r.corridore_id));
    return this.tuttiCorridori.filter((c) => !idGiaPresenti.has(c.id));
  }

  ngOnChanges(): void {
    if (!this.id) return;
    this.caricamento = true;
    this.api
      .ottieni<Tappa>('tappe', this.id)
      .subscribe((t) => (this.tappa = t));
    this.api
      .list<Corridore>('corridori')
      .subscribe((c) => (this.tuttiCorridori = c));
    this.caricaRisultati();
  }

  caricaRisultati(): void {
    this.api
      .ottieniPercorso<Risultato[]>(`risultati/tappa/${this.id}`)
      .subscribe((r) => {
        this.risultati = r;
        this.caricamento = false;
      });
  }

  apriNuovo(): void {
    this.form.reset({
      id: null,
      corridore_id: null,
      posizione: null,
      tempo: '',
      punti: 0,
    });
    this.modaleAperto = true;
  }

  apriModifica(r: Risultato): void {
    this.form.reset({
      id: r.id ?? null,
      corridore_id: r.corridore_id,
      posizione: r.posizione,
      tempo: r.tempo || '',
      punti: r.punti,
    });
    this.modaleAperto = true;
  }

  chiudiModale(): void {
    this.modaleAperto = false;
  }

  salva(): void {
    if (this.form.invalid || !this.tappa) return;
    this.salvataggio = true;
    const { id, ...valori } = this.form.getRawValue();
    const corpo = { ...valori, tappa_id: this.tappa.id, distacco: '00:00:00' };
    const richiesta = id
      ? this.api.aggiorna('risultati', id, corpo)
      : this.api.crea('risultati', corpo);
    richiesta.subscribe({
      next: () => {
        this.toast.successo('Risultato salvato.');
        this.salvataggio = false;
        this.chiudiModale();
        this.caricaRisultati();
      },
      error: () => (this.salvataggio = false),
    });
  }

  elimina(r: Risultato): void {
    if (!r.id) return;
    if (!confirm('Eliminare questo risultato?')) return;
    this.api.elimina('risultati', r.id).subscribe(() => {
      this.toast.successo('Risultato eliminato.');
      this.caricaRisultati();
    });
  }
}
