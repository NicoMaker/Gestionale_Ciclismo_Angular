import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { LookupService } from '../../core/lookup.service';
import { ControlloAntidoping } from '../../core/models';
import { ToastService } from '../../core/toast.service';
import { ModalComponent } from '../../shared/modal.component';

@Component({
  selector: 'app-controlli-antidoping',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  template: `
    <div class="view-head view-head-riga">
      <div>
        <h1>Controlli antidoping</h1>
        <p>
          Un esito "positivo" squalifica automaticamente il corridore (motivo doping) da quella tappa in poi.
        </p>
      </div>
      <button class="btn btn-primary" type="button" (click)="apriNuovo()">+ Nuovo controllo</button>
    </div>

    @if (caricamento) {
      <div class="stato-caricamento">Caricamento…</div>
    } @else if (controlli.length === 0) {
      <div class="stato-vuoto">
        <div class="titolo">Nessun controllo registrato</div>
      </div>
    } @else {
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Corridore</th><th>Tappa</th><th>Data</th><th>Esito</th><th class="col-azioni">Azioni</th></tr>
          </thead>
          <tbody>
            @for (c of controlli; track c.id) {
              <tr>
                <td>{{ lookup.etichetta('corridori', c.corridore_id) }}</td>
                <td>{{ c.tappa_id ? lookup.etichetta('tappe', c.tappa_id) : '—' }}</td>
                <td>{{ c.data || '—' }}</td>
                <td><span class="badge" [class]="classeEsito(c.esito)">{{ etichettaEsito(c.esito) }}</span></td>
                <td class="col-azioni">
                  <button class="btn btn-secondary btn-sm" type="button" (click)="apriModifica(c)">Modifica</button>
                  <button class="btn btn-danger btn-sm" type="button" (click)="elimina(c)">Elimina</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    @if (modaleAperto) {
      <app-modal [titolo]="form.value.id ? 'Modifica controllo' : 'Nuovo controllo'" (chiudi)="chiudiModale()">
        <form [formGroup]="form" class="form-grid colonna-singola" (ngSubmit)="salva()">
          <div class="campo">
            <label for="corridore">Corridore</label>
            <select id="corridore" formControlName="corridore_id">
              @for (c of opzioniCorridori; track c.valore) {
                <option [ngValue]="c.valore">{{ c.etichetta }}</option>
              }
            </select>
          </div>
          <div class="campo">
            <label for="tappa">Tappa (opzionale)</label>
            <select id="tappa" formControlName="tappa_id">
              <option [ngValue]="null">—</option>
              @for (t of opzioniTappe; track t.valore) {
                <option [ngValue]="t.valore">{{ t.etichetta }}</option>
              }
            </select>
          </div>
          <div class="campo">
            <label for="data">Data</label>
            <input id="data" type="date" formControlName="data" />
          </div>
          <div class="campo">
            <label for="esito">Esito</label>
            <select id="esito" formControlName="esito">
              <option value="in_attesa">In attesa</option>
              <option value="negativo">Negativo</option>
              <option value="positivo">Positivo</option>
            </select>
          </div>
        </form>
        <div modal-footer>
          <button class="btn btn-ghost" type="button" (click)="chiudiModale()">Annulla</button>
          <button class="btn btn-primary" type="button" [disabled]="form.invalid || salvataggio" (click)="salva()">
            {{ salvataggio ? 'Salvataggio…' : 'Salva' }}
          </button>
        </div>
      </app-modal>
    }
  `,
})
export class ControlliAntidopingComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  lookup = inject(LookupService);

  controlli: ControlloAntidoping[] = [];
  opzioniCorridori: { valore: number; etichetta: string }[] = [];
  opzioniTappe: { valore: number; etichetta: string }[] = [];
  caricamento = true;
  modaleAperto = false;
  salvataggio = false;

  form = this.fb.nonNullable.group({
    id: this.fb.control<number | null>(null),
    corridore_id: this.fb.control<number | null>(null, Validators.required),
    tappa_id: this.fb.control<number | null>(null),
    data: this.fb.control<string | null>(null),
    esito: this.fb.control<ControlloAntidoping['esito']>('in_attesa'),
  });

  ngOnInit(): void {
    forkJoin({
      corridori: this.lookup.opzioni('corridori'),
      tappe: this.lookup.opzioni('tappe'),
    }).subscribe(({ corridori, tappe }) => {
      this.opzioniCorridori = corridori;
      this.opzioniTappe = tappe;
      this.carica();
    });
  }

  carica(): void {
    this.caricamento = true;
    this.api.list<ControlloAntidoping>('controlli-antidoping').subscribe((righe) => {
      this.controlli = righe;
      this.caricamento = false;
    });
  }

  etichettaEsito(e: ControlloAntidoping['esito']): string {
    return { negativo: 'Negativo', positivo: 'Positivo', in_attesa: 'In attesa' }[e];
  }

  classeEsito(e: ControlloAntidoping['esito']): string {
    return { negativo: 'badge-verde', positivo: 'badge-rosso', in_attesa: 'badge-grigio' }[e];
  }

  apriNuovo(): void {
    this.form.reset({ id: null, corridore_id: this.opzioniCorridori[0]?.valore ?? null, tappa_id: null, data: null, esito: 'in_attesa' });
    this.modaleAperto = true;
  }

  apriModifica(c: ControlloAntidoping): void {
    this.form.reset({ id: c.id, corridore_id: c.corridore_id, tappa_id: c.tappa_id, data: c.data, esito: c.esito });
    this.modaleAperto = true;
  }

  chiudiModale(): void {
    this.modaleAperto = false;
  }

  salva(): void {
    if (this.form.invalid) return;
    this.salvataggio = true;
    const { id, ...corpo } = this.form.getRawValue();
    const richiesta = id
      ? this.api.aggiorna('controlli-antidoping', id, corpo)
      : this.api.crea('controlli-antidoping', corpo);
    richiesta.subscribe({
      next: () => {
        this.toast.successo('Controllo salvato.');
        this.salvataggio = false;
        this.chiudiModale();
        this.carica();
      },
      error: () => (this.salvataggio = false),
    });
  }

  elimina(c: ControlloAntidoping): void {
    if (!confirm('Eliminare questo controllo antidoping?')) return;
    this.api.elimina('controlli-antidoping', c.id).subscribe(() => {
      this.toast.successo('Controllo eliminato.');
      this.carica();
    });
  }
}
