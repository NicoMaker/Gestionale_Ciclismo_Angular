import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { LookupService } from '../../core/lookup.service';
import { Nazione, Squadra } from '../../core/models';
import { ToastService } from '../../core/toast.service';
import { ModalComponent } from '../../shared/modal.component';

@Component({
  selector: 'app-squadre',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ModalComponent],
  template: `
    <div class="view-head view-head-riga">
      <div>
        <h1>Squadre</h1>
        <p>Anagrafica squadre, nazionalità e colore sociale.</p>
      </div>
      <button class="btn btn-primary" type="button" (click)="apriNuovo()">+ Nuova squadra</button>
    </div>

    <div class="barra-ricerca">
      <input type="search" placeholder="Cerca squadra…" [(ngModel)]="filtro" [ngModelOptions]="{ standalone: true }" />
    </div>

    @if (caricamento) {
      <div class="stato-caricamento">Caricamento…</div>
    } @else if (squadreFiltrate.length === 0) {
      <div class="stato-vuoto">
        <div class="titolo">Nessuna squadra trovata</div>
        <p>Aggiungi la prima squadra con il pulsante in alto.</p>
      </div>
    } @else {
      <div class="griglia-card">
        @for (s of squadreFiltrate; track s.id) {
          <div class="card scheda-squadra">
            <div class="scheda-squadra-riga">
              <span class="puntino" [style.background]="s.colore"></span>
              <h3>{{ s.nome }}</h3>
            </div>
            <p class="testo-soft">{{ s.nazione_nome || 'Nazione non impostata' }}</p>
            <p class="testo-soft">
              {{ s.numero_corridori_in_gara ?? 0 }} in gara / {{ s.numero_corridori ?? 0 }} in rosa
            </p>
            <div class="scheda-squadra-azioni">
              <button class="btn btn-secondary btn-sm" type="button" (click)="apriModifica(s)">Modifica</button>
              <button class="btn btn-danger btn-sm" type="button" (click)="elimina(s)">Elimina</button>
            </div>
          </div>
        }
      </div>
    }

    @if (modaleAperto) {
      <app-modal [titolo]="form.value.id ? 'Modifica squadra' : 'Nuova squadra'" (chiudi)="chiudiModale()">
        <form [formGroup]="form" class="form-grid" (ngSubmit)="salva()">
          <div class="campo largo">
            <label for="nome">Nome squadra</label>
            <input id="nome" type="text" formControlName="nome" placeholder="es. Team Asfalto Rosa" />
          </div>
          <div class="campo">
            <label for="nazione">Nazione</label>
            <select id="nazione" formControlName="nazione_id">
              <option [ngValue]="null">—</option>
              @for (n of nazioni; track n.id) {
                <option [ngValue]="n.id">{{ n.nome }} ({{ n.codice_iso2 }})</option>
              }
            </select>
          </div>
          <div class="campo">
            <label for="colore">Colore sociale</label>
            <input id="colore" type="color" formControlName="colore" />
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
  styles: [
    `
      .scheda-squadra-riga {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
      }
      .scheda-squadra-riga h3 {
        font-size: 16px;
      }
      .scheda-squadra .puntino {
        width: 12px;
        height: 12px;
      }
      .scheda-squadra-azioni {
        display: flex;
        gap: 8px;
        margin-top: 14px;
      }
    `,
  ],
})
export class SquadreComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  lookup = inject(LookupService);

  squadre: Squadra[] = [];
  nazioni: Nazione[] = [];
  caricamento = true;
  modaleAperto = false;
  salvataggio = false;
  filtro = '';

  form = this.fb.nonNullable.group({
    id: this.fb.control<number | null>(null),
    nome: ['', Validators.required],
    nazione_id: this.fb.control<number | null>(null),
    colore: ['#e6197f'],
  });

  get squadreFiltrate(): Squadra[] {
    const q = this.filtro.trim().toLowerCase();
    if (!q) return this.squadre;
    return this.squadre.filter((s) => s.nome.toLowerCase().includes(q));
  }

  ngOnInit(): void {
    this.api.list<Nazione>('nazioni').subscribe((n) => (this.nazioni = n));
    this.carica();
  }

  carica(): void {
    this.caricamento = true;
    this.api.list<Squadra>('squadre').subscribe((righe) => {
      this.squadre = righe;
      this.caricamento = false;
      this.lookup.invalida('squadre');
    });
  }

  apriNuovo(): void {
    this.form.reset({ id: null, nome: '', nazione_id: null, colore: '#e6197f' });
    this.modaleAperto = true;
  }

  apriModifica(s: Squadra): void {
    this.form.reset({ id: s.id, nome: s.nome, nazione_id: s.nazione_id, colore: s.colore || '#e6197f' });
    this.modaleAperto = true;
  }

  chiudiModale(): void {
    this.modaleAperto = false;
  }

  salva(): void {
    if (this.form.invalid) return;
    this.salvataggio = true;
    const { id, ...corpo } = this.form.getRawValue();
    const richiesta = id ? this.api.aggiorna('squadre', id, corpo) : this.api.crea('squadre', corpo);
    richiesta.subscribe({
      next: () => {
        this.toast.successo(id ? 'Squadra aggiornata.' : 'Squadra creata.');
        this.salvataggio = false;
        this.chiudiModale();
        this.carica();
      },
      error: () => (this.salvataggio = false),
    });
  }

  elimina(s: Squadra): void {
    if (!confirm(`Eliminare la squadra "${s.nome}"? Verrà spostata nel cestino per 15 giorni.`)) return;
    this.api.elimina('squadre', s.id).subscribe(() => {
      this.toast.successo('Squadra spostata nel cestino.');
      this.carica();
    });
  }
}
