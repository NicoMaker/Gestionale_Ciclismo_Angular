import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Tappa } from '../../core/models';
import { ToastService } from '../../core/toast.service';
import { ModalComponent } from '../../shared/modal.component';

@Component({
  selector: 'app-tappe',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ModalComponent,
    RouterLink,
  ],
  template: `
    <div class="view-head view-head-riga">
      <div>
        <h1>Tappe</h1>
        <p>
          Percorso della corsa: partenza, arrivo, profilo altimetrico e stato di
          ciascuna tappa.
        </p>
      </div>
      <button class="btn btn-primary" type="button" (click)="apriNuovo()">
        + Nuova tappa
      </button>
    </div>

    @if (caricamento) {
      <div class="stato-caricamento">Caricamento…</div>
    } @else if (tappe.length === 0) {
      <div class="stato-vuoto">
        <div class="titolo">Nessuna tappa creata</div>
        <p>Aggiungi la prima tappa con il pulsante in alto.</p>
      </div>
    } @else {
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Nome</th>
              <th>Percorso</th>
              <th>Km</th>
              <th>Tipo</th>
              <th>Stato</th>
              <th class="col-azioni">Azioni</th>
            </tr>
          </thead>
          <tbody>
            @for (t of tappeOrdinate; track t.id) {
              <tr>
                <td>{{ t.numero_tappa }}</td>
                <td>{{ t.nome }}</td>
                <td>{{ t.partenza }} → {{ t.arrivo }}</td>
                <td>{{ t.distanza_km ?? '—' }}</td>
                <td>
                  <span class="badge badge-viola">{{ t.tipo }}</span>
                </td>
                <td>
                  <span class="badge" [class]="classeStato(t.stato)">{{
                    etichettaStato(t.stato)
                  }}</span>
                </td>
                <td class="col-azioni">
                  <a
                    class="btn btn-secondary btn-sm"
                    [routerLink]="['/tappe', t.id, 'risultati']"
                    >Risultati</a
                  >
                  <button
                    class="btn btn-secondary btn-sm"
                    type="button"
                    (click)="apriModifica(t)"
                  >
                    Modifica
                  </button>
                  <button
                    class="btn btn-danger btn-sm"
                    type="button"
                    (click)="elimina(t)"
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

    @if (modaleAperto) {
      <app-modal
        [titolo]="form.value.id ? 'Modifica tappa' : 'Nuova tappa'"
        (chiudi)="chiudiModale()"
      >
        <form [formGroup]="form" class="form-grid" (ngSubmit)="salva()">
          <div class="campo">
            <label for="numero">Numero tappa</label>
            <input id="numero" type="number" formControlName="numero_tappa" />
          </div>
          <div class="campo">
            <label for="data">Data</label>
            <input id="data" type="date" formControlName="data" />
          </div>
          <div class="campo largo">
            <label for="nome">Nome tappa</label>
            <input
              id="nome"
              type="text"
              formControlName="nome"
              placeholder="es. Cuneo - Sestriere"
            />
          </div>
          <div class="campo">
            <label for="partenza">Partenza</label>
            <input id="partenza" type="text" formControlName="partenza" />
          </div>
          <div class="campo">
            <label for="arrivo">Arrivo</label>
            <input id="arrivo" type="text" formControlName="arrivo" />
          </div>
          <div class="campo">
            <label for="distanza">Distanza (km)</label>
            <input
              id="distanza"
              type="number"
              step="0.1"
              formControlName="distanza_km"
            />
          </div>
          <div class="campo">
            <label for="dislivello">Dislivello (m)</label>
            <input
              id="dislivello"
              type="number"
              formControlName="dislivello_m"
            />
          </div>
          <div class="campo">
            <label for="tipo">Tipo di tappa</label>
            <select id="tipo" formControlName="tipo">
              <option value="pianura">Pianura</option>
              <option value="collina">Collina</option>
              <option value="montagna">Montagna</option>
              <option value="cronometro">Cronometro</option>
            </select>
          </div>
          <div class="campo">
            <label for="stato">Stato</label>
            <select id="stato" formControlName="stato">
              <option value="programmata">Programmata</option>
              <option value="in_corso">In corso</option>
              <option value="conclusa">Conclusa</option>
            </select>
          </div>
          <div class="campo campo-checkbox largo">
            <input
              id="abbuoni"
              type="checkbox"
              formControlName="abbuoni_attivi"
            />
            <label for="abbuoni"
              >Abbuoni di classifica attivi su questa tappa</label
            >
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
})
export class TappeComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  tappe: Tappa[] = [];
  caricamento = true;
  modaleAperto = false;
  salvataggio = false;

  form = this.fb.nonNullable.group({
    id: this.fb.control<number | null>(null),
    numero_tappa: [1, Validators.required],
    nome: ['', Validators.required],
    partenza: ['', Validators.required],
    arrivo: ['', Validators.required],
    distanza_km: this.fb.control<number | null>(null),
    dislivello_m: this.fb.control<number | null>(null),
    tipo: this.fb.control<Tappa['tipo']>('pianura'),
    data: this.fb.control<string | null>(null),
    stato: this.fb.control<Tappa['stato']>('programmata'),
    abbuoni_attivi: [true],
  });

  get tappeOrdinate(): Tappa[] {
    return [...this.tappe].sort((a, b) => a.numero_tappa - b.numero_tappa);
  }

  ngOnInit(): void {
    this.carica();
  }

  carica(): void {
    this.caricamento = true;
    this.api.list<Tappa>('tappe').subscribe((righe) => {
      this.tappe = righe;
      this.caricamento = false;
    });
  }

  etichettaStato(s: Tappa['stato']): string {
    return {
      programmata: 'Programmata',
      in_corso: 'In corso',
      conclusa: 'Conclusa',
    }[s];
  }

  classeStato(s: Tappa['stato']): string {
    return {
      programmata: 'badge-grigio',
      in_corso: 'badge-verde',
      conclusa: 'badge-rosa',
    }[s];
  }

  apriNuovo(): void {
    const prossimoNumero = this.tappe.length
      ? Math.max(...this.tappe.map((t) => t.numero_tappa)) + 1
      : 1;
    this.form.reset({
      id: null,
      numero_tappa: prossimoNumero,
      nome: '',
      partenza: '',
      arrivo: '',
      distanza_km: null,
      dislivello_m: null,
      tipo: 'pianura',
      data: null,
      stato: 'programmata',
      abbuoni_attivi: true,
    });
    this.modaleAperto = true;
  }

  apriModifica(t: Tappa): void {
    this.form.reset({
      id: t.id,
      numero_tappa: t.numero_tappa,
      nome: t.nome,
      partenza: t.partenza,
      arrivo: t.arrivo,
      distanza_km: t.distanza_km,
      dislivello_m: t.dislivello_m,
      tipo: t.tipo,
      data: t.data,
      stato: t.stato,
      abbuoni_attivi: !!t.abbuoni_attivi,
    });
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
      ? this.api.aggiorna('tappe', id, corpo)
      : this.api.crea('tappe', corpo);
    richiesta.subscribe({
      next: () => {
        this.toast.successo(id ? 'Tappa aggiornata.' : 'Tappa creata.');
        this.salvataggio = false;
        this.chiudiModale();
        this.carica();
      },
      error: () => (this.salvataggio = false),
    });
  }

  elimina(t: Tappa): void {
    if (
      !confirm(
        `Eliminare la tappa "${t.nome}"? Verrà spostata nel cestino per 15 giorni.`,
      )
    )
      return;
    this.api.elimina('tappe', t.id).subscribe(() => {
      this.toast.successo('Tappa spostata nel cestino.');
      this.carica();
    });
  }
}
