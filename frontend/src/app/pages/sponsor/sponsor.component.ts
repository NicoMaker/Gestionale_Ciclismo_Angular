import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Sponsor } from '../../core/models';
import { ToastService } from '../../core/toast.service';
import { ModalComponent } from '../../shared/modal.component';

@Component({
  selector: 'app-sponsor',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ModalComponent],
  template: `
    <div class="view-head view-head-riga">
      <div>
        <h1>Sponsor</h1>
        <p>Anagrafica degli sponsor della corsa, collegabili alle squadre in "Sponsor per squadra".</p>
      </div>
      <button class="btn btn-primary" type="button" (click)="apriNuovo()">+ Nuovo sponsor</button>
    </div>

    <div class="barra-ricerca">
      <input type="search" placeholder="Cerca sponsor…" [(ngModel)]="filtro" [ngModelOptions]="{ standalone: true }" />
    </div>

    @if (caricamento) {
      <div class="stato-caricamento">Caricamento…</div>
    } @else if (sponsorFiltrati.length === 0) {
      <div class="stato-vuoto">
        <div class="titolo">Nessuno sponsor trovato</div>
        <p>Aggiungi il primo sponsor con il pulsante in alto.</p>
      </div>
    } @else {
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Nome</th><th>Settore</th><th>Sito web</th><th class="col-azioni">Azioni</th></tr>
          </thead>
          <tbody>
            @for (s of sponsorFiltrati; track s.id) {
              <tr>
                <td>{{ s.nome }}</td>
                <td>{{ s.settore || '—' }}</td>
                <td>
                  @if (s.sito_web) {
                    <a [href]="s.sito_web" target="_blank" rel="noopener">{{ s.sito_web }}</a>
                  } @else { — }
                </td>
                <td class="col-azioni">
                  <button class="btn btn-secondary btn-sm" type="button" (click)="apriModifica(s)">Modifica</button>
                  <button class="btn btn-danger btn-sm" type="button" (click)="elimina(s)">Elimina</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    @if (modaleAperto) {
      <app-modal [titolo]="form.value.id ? 'Modifica sponsor' : 'Nuovo sponsor'" (chiudi)="chiudiModale()">
        <form [formGroup]="form" class="form-grid colonna-singola" (ngSubmit)="salva()">
          <div class="campo">
            <label for="nome">Nome</label>
            <input id="nome" type="text" formControlName="nome" />
          </div>
          <div class="campo">
            <label for="settore">Settore</label>
            <input id="settore" type="text" formControlName="settore" placeholder="es. Abbigliamento sportivo" />
          </div>
          <div class="campo">
            <label for="sito">Sito web</label>
            <input id="sito" type="text" formControlName="sito_web" placeholder="https://…" />
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
export class SponsorComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  sponsor: Sponsor[] = [];
  caricamento = true;
  modaleAperto = false;
  salvataggio = false;
  filtro = '';

  form = this.fb.nonNullable.group({
    id: this.fb.control<number | null>(null),
    nome: ['', Validators.required],
    settore: [''],
    sito_web: [''],
  });

  get sponsorFiltrati(): Sponsor[] {
    const q = this.filtro.trim().toLowerCase();
    if (!q) return this.sponsor;
    return this.sponsor.filter((s) => s.nome.toLowerCase().includes(q));
  }

  ngOnInit(): void {
    this.carica();
  }

  carica(): void {
    this.caricamento = true;
    this.api.list<Sponsor>('sponsor').subscribe((righe) => {
      this.sponsor = righe;
      this.caricamento = false;
    });
  }

  apriNuovo(): void {
    this.form.reset({ id: null, nome: '', settore: '', sito_web: '' });
    this.modaleAperto = true;
  }

  apriModifica(s: Sponsor): void {
    this.form.reset({ id: s.id, nome: s.nome, settore: s.settore || '', sito_web: s.sito_web || '' });
    this.modaleAperto = true;
  }

  chiudiModale(): void {
    this.modaleAperto = false;
  }

  salva(): void {
    if (this.form.invalid) return;
    this.salvataggio = true;
    const { id, ...corpo } = this.form.getRawValue();
    const richiesta = id ? this.api.aggiorna('sponsor', id, corpo) : this.api.crea('sponsor', corpo);
    richiesta.subscribe({
      next: () => {
        this.toast.successo(id ? 'Sponsor aggiornato.' : 'Sponsor creato.');
        this.salvataggio = false;
        this.chiudiModale();
        this.carica();
      },
      error: () => (this.salvataggio = false),
    });
  }

  elimina(s: Sponsor): void {
    if (!confirm(`Eliminare lo sponsor "${s.nome}"? Verrà spostato nel cestino per 15 giorni.`)) return;
    this.api.elimina('sponsor', s.id).subscribe(() => {
      this.toast.successo('Sponsor spostato nel cestino.');
      this.carica();
    });
  }
}
