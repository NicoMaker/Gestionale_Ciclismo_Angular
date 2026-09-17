import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Nazione } from '../../core/models';
import { ToastService } from '../../core/toast.service';
import { ModalComponent } from '../../shared/modal.component';

@Component({
  selector: 'app-nazioni',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ModalComponent],
  template: `
    <div class="view-head view-head-riga">
      <div>
        <h1>Nazioni</h1>
        <p>
          Anagrafica nazioni usata per corridori e squadre (bandiera + codice
          ISO2).
        </p>
      </div>
      <button class="btn btn-primary" type="button" (click)="apriNuovo()">
        + Nuova nazione
      </button>
    </div>

    <div class="barra-ricerca">
      <input
        type="search"
        placeholder="Cerca per nome o codice…"
        [(ngModel)]="filtro"
        [ngModelOptions]="{ standalone: true }"
      />
    </div>

    @if (caricamento) {
      <div class="stato-caricamento">Caricamento…</div>
    } @else if (nazioniFiltrate.length === 0) {
      <div class="stato-vuoto">
        <div class="titolo">Nessuna nazione trovata</div>
        <p>Aggiungi la prima nazione con il pulsante in alto.</p>
      </div>
    } @else {
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Codice</th>
              <th>Nome</th>
              <th class="col-azioni">Azioni</th>
            </tr>
          </thead>
          <tbody>
            @for (n of nazioniFiltrate; track n.id) {
              <tr>
                <td>
                  <span class="badge badge-grigio">{{ n.codice_iso2 }}</span>
                </td>
                <td>{{ n.nome }}</td>
                <td class="col-azioni">
                  <button
                    class="btn btn-secondary btn-sm"
                    type="button"
                    (click)="apriModifica(n)"
                  >
                    Modifica
                  </button>
                  <button
                    class="btn btn-danger btn-sm"
                    type="button"
                    (click)="elimina(n)"
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
        [titolo]="form.value.id ? 'Modifica nazione' : 'Nuova nazione'"
        (chiudi)="chiudiModale()"
      >
        <form
          [formGroup]="form"
          class="form-grid colonna-singola"
          (ngSubmit)="salva()"
        >
          <div class="campo">
            <label for="nome">Nome</label>
            <input
              id="nome"
              type="text"
              formControlName="nome"
              placeholder="Italia"
            />
          </div>
          <div class="campo">
            <label for="codice">Codice ISO2</label>
            <input
              id="codice"
              type="text"
              maxlength="2"
              formControlName="codice_iso2"
              placeholder="IT"
              style="text-transform: uppercase"
            />
            <span class="suggerimento">Due lettere, es. IT, FR, ES, BE.</span>
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
export class NazioniComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  nazioni: Nazione[] = [];
  caricamento = true;
  modaleAperto = false;
  salvataggio = false;
  filtro = '';

  form = this.fb.nonNullable.group({
    id: this.fb.control<number | null>(null),
    nome: ['', Validators.required],
    codice_iso2: [
      '',
      [Validators.required, Validators.pattern(/^[A-Za-z]{2}$/)],
    ],
  });

  get nazioniFiltrate(): Nazione[] {
    const q = this.filtro.trim().toLowerCase();
    if (!q) return this.nazioni;
    return this.nazioni.filter(
      (n) =>
        n.nome.toLowerCase().includes(q) ||
        n.codice_iso2.toLowerCase().includes(q),
    );
  }

  ngOnInit(): void {
    this.carica();
  }

  carica(): void {
    this.caricamento = true;
    this.api.list<Nazione>('nazioni').subscribe((righe) => {
      this.nazioni = righe;
      this.caricamento = false;
    });
  }

  apriNuovo(): void {
    this.form.reset({ id: null, nome: '', codice_iso2: '' });
    this.modaleAperto = true;
  }

  apriModifica(n: Nazione): void {
    this.form.reset({ id: n.id, nome: n.nome, codice_iso2: n.codice_iso2 });
    this.modaleAperto = true;
  }

  chiudiModale(): void {
    this.modaleAperto = false;
  }

  salva(): void {
    if (this.form.invalid) return;
    this.salvataggio = true;
    const { id, ...corpo } = this.form.getRawValue();
    corpo.codice_iso2 = corpo.codice_iso2.toUpperCase();
    const richiesta = id
      ? this.api.aggiorna('nazioni', id, corpo)
      : this.api.crea('nazioni', corpo);
    richiesta.subscribe({
      next: () => {
        this.toast.successo(id ? 'Nazione aggiornata.' : 'Nazione creata.');
        this.salvataggio = false;
        this.chiudiModale();
        this.carica();
      },
      error: () => (this.salvataggio = false),
    });
  }

  elimina(n: Nazione): void {
    if (
      !confirm(
        `Eliminare la nazione "${n.nome}"? Verrà spostata nel cestino per 15 giorni.`,
      )
    )
      return;
    this.api.elimina('nazioni', n.id).subscribe(() => {
      this.toast.successo('Nazione spostata nel cestino.');
      this.carica();
    });
  }
}
