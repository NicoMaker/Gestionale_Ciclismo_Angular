import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { ApiService } from '../../core/api.service';
import {
  CampoConfig,
  EntitaConfig,
  trovaConfigurazione,
} from '../../core/entity-configs';
import {
  ChiaveLookup,
  LookupService,
  OpzioneLookup,
} from '../../core/lookup.service';
import { ToastService } from '../../core/toast.service';
import { ModalComponent } from '../../shared/modal.component';

/**
 * Un solo componente gestisce le 14 tabelle "di supporto" del gestionale
 * (staff tecnico, veicoli, hotel, meteo di tappa, ecc.): la struttura di
 * colonne/form viene letta da entity-configs.ts in base al segmento di
 * rotta /dati/:entita, evitando di duplicare 14 volte lo stesso CRUD.
 */
@Component({
  selector: 'app-generico',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  template: `
    @if (!config) {
      <div class="stato-vuoto">
        <div class="titolo">Sezione non trovata</div>
      </div>
    } @else {
      <div class="view-head view-head-riga">
        <div>
          <h1>{{ config.titolo }}</h1>
          <p>
            Dati di supporto della corsa — gestione libera tramite API
            generiche.
          </p>
        </div>
        <button class="btn btn-primary" type="button" (click)="apriNuovo()">
          + Nuovo {{ config.singolare }}
        </button>
      </div>

      @if (caricamento) {
        <div class="stato-caricamento">Caricamento…</div>
      } @else if (righe.length === 0) {
        <div class="stato-vuoto">
          <div class="titolo">Nessun elemento presente</div>
          <p>
            Aggiungi il primo {{ config.singolare }} con il pulsante in alto.
          </p>
        </div>
      } @else {
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                @for (campo of config.campi; track campo.chiave) {
                  <th>{{ campo.etichetta }}</th>
                }
                <th class="col-azioni">Azioni</th>
              </tr>
            </thead>
            <tbody>
              @for (riga of righe; track riga['id']) {
                <tr>
                  @for (campo of config.campi; track campo.chiave) {
                    <td>{{ valoreVisualizzato(riga, campo) }}</td>
                  }
                  <td class="col-azioni">
                    <button
                      class="btn btn-secondary btn-sm"
                      type="button"
                      (click)="apriModifica(riga)"
                    >
                      Modifica
                    </button>
                    <button
                      class="btn btn-danger btn-sm"
                      type="button"
                      (click)="elimina(riga)"
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

      @if (modaleAperto && form) {
        <app-modal
          [titolo]="
            (form.get('id')?.value ? 'Modifica ' : 'Nuovo ') + config.singolare
          "
          (chiudi)="chiudiModale()"
        >
          <form [formGroup]="form" class="form-grid">
            @for (campo of config.campi; track campo.chiave) {
              <div class="campo" [class.largo]="campo.tipo === 'textarea'">
                <label [for]="campo.chiave">{{ campo.etichetta }}</label>

                @switch (campo.tipo) {
                  @case ('select') {
                    <select
                      [id]="campo.chiave"
                      [formControlName]="campo.chiave"
                    >
                      @if (!campo.obbligatorio) {
                        <option [ngValue]="null">—</option>
                      }
                      @if (campo.lookup) {
                        @for (
                          o of opzioniLookup[campo.lookup] || [];
                          track o.valore
                        ) {
                          <option [ngValue]="o.valore">
                            {{ o.etichetta }}
                          </option>
                        }
                      } @else {
                        @for (
                          o of campo.opzioniStatiche || [];
                          track o.valore
                        ) {
                          <option [ngValue]="o.valore">
                            {{ o.etichetta }}
                          </option>
                        }
                      }
                    </select>
                  }
                  @case ('textarea') {
                    <textarea
                      [id]="campo.chiave"
                      [formControlName]="campo.chiave"
                    ></textarea>
                  }
                  @case ('numero') {
                    <input
                      [id]="campo.chiave"
                      type="number"
                      [step]="campo.passo || '1'"
                      [formControlName]="campo.chiave"
                    />
                  }
                  @case ('data') {
                    <input
                      [id]="campo.chiave"
                      type="date"
                      [formControlName]="campo.chiave"
                    />
                  }
                  @default {
                    <input
                      [id]="campo.chiave"
                      type="text"
                      [formControlName]="campo.chiave"
                    />
                  }
                }
              </div>
            }
          </form>
          <div modal-footer>
            <button
              class="btn btn-ghost"
              type="button"
              (click)="chiudiModale()"
            >
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
    }
  `,
})
export class GenericoComponent implements OnChanges {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private lookup = inject(LookupService);

  @Input() entita!: string;

  config: EntitaConfig | undefined;
  righe: Record<string, unknown>[] = [];
  opzioniLookup: Partial<Record<ChiaveLookup, OpzioneLookup[]>> = {};
  caricamento = true;
  modaleAperto = false;
  salvataggio = false;
  form: FormGroup | null = null;

  ngOnChanges(): void {
    this.config = trovaConfigurazione(this.entita);
    this.modaleAperto = false;
    if (!this.config) return;

    const chiaviLookup = Array.from(
      new Set(
        this.config.campi
          .map((c) => c.lookup)
          .filter((l): l is ChiaveLookup => !!l),
      ),
    );
    const richiesteLookup = chiaviLookup.length
      ? forkJoin(
          Object.fromEntries(
            chiaviLookup.map((l) => [l, this.lookup.opzioni(l)]),
          ),
        )
      : of({});

    richiesteLookup.subscribe((mappa) => {
      this.opzioniLookup = mappa as Partial<
        Record<ChiaveLookup, OpzioneLookup[]>
      >;
      this.carica();
    });
  }

  carica(): void {
    if (!this.config) return;
    this.caricamento = true;
    this.api
      .list<Record<string, unknown>>(this.config.chiave)
      .subscribe((righe) => {
        this.righe = righe;
        this.caricamento = false;
      });
  }

  valoreVisualizzato(
    riga: Record<string, unknown>,
    campo: CampoConfig,
  ): string {
    const valore = riga[campo.chiave];
    if (valore === null || valore === undefined || valore === '') return '—';
    if (campo.lookup)
      return this.lookup.etichetta(campo.lookup, valore as number);
    if (campo.opzioniStatiche) {
      const trovata = campo.opzioniStatiche.find((o) => o.valore === valore);
      if (trovata) return trovata.etichetta;
    }
    return String(valore);
  }

  private costruisciForm(valori: Record<string, unknown> = {}): FormGroup {
    if (!this.config) return new FormGroup({});
    const controlli: Record<string, FormControl> = {
      id: new FormControl<unknown>(valori['id'] ?? null),
    };
    for (const campo of this.config.campi) {
      let valore = valori[campo.chiave];
      if (valore === undefined) {
        valore = campo.default ?? (campo.tipo === 'numero' ? null : '');
      }
      controlli[campo.chiave] = new FormControl<unknown>(
        valore,
        campo.obbligatorio ? [Validators.required] : [],
      );
    }
    return new FormGroup(controlli);
  }

  apriNuovo(): void {
    this.form = this.costruisciForm();
    this.modaleAperto = true;
  }

  apriModifica(riga: Record<string, unknown>): void {
    this.form = this.costruisciForm(riga);
    this.modaleAperto = true;
  }

  chiudiModale(): void {
    this.modaleAperto = false;
  }

  salva(): void {
    if (!this.form || this.form.invalid || !this.config) return;
    this.salvataggio = true;
    const { id, ...corpo } = this.form.getRawValue();
    const richiesta = id
      ? this.api.aggiorna(this.config.chiave, id as number, corpo)
      : this.api.crea(this.config.chiave, corpo);
    richiesta.subscribe({
      next: () => {
        this.toast.successo('Salvato con successo.');
        this.salvataggio = false;
        this.chiudiModale();
        this.carica();
      },
      error: () => (this.salvataggio = false),
    });
  }

  elimina(riga: Record<string, unknown>): void {
    if (!this.config) return;
    if (!confirm(`Eliminare questo ${this.config.singolare}?`)) return;
    this.api.elimina(this.config.chiave, riga['id'] as number).subscribe(() => {
      this.toast.successo('Elemento eliminato.');
      this.carica();
    });
  }
}
