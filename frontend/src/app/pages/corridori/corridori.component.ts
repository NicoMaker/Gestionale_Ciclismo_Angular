import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Corridore, MotivoRitiro, Nazione, Squadra } from '../../core/models';
import { ToastService } from '../../core/toast.service';
import { ModalComponent } from '../../shared/modal.component';

@Component({
  selector: 'app-corridori',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ModalComponent, RouterLink],
  template: `
    <div class="view-head view-head-riga">
      <div>
        <h1>Corridori</h1>
        <p>Anagrafica corridori, ritiro/riammissione e collegamento a squadra e nazione.</p>
      </div>
      <button class="btn btn-primary" type="button" (click)="apriNuovo()">+ Nuovo corridore</button>
    </div>

    <div class="barra-ricerca">
      <input type="search" placeholder="Cerca per nome, cognome o pettorale…" [(ngModel)]="filtro" [ngModelOptions]="{ standalone: true }" />
      <select [(ngModel)]="filtroSquadra" [ngModelOptions]="{ standalone: true }">
        <option [ngValue]="null">Tutte le squadre</option>
        @for (s of squadre; track s.id) {
          <option [ngValue]="s.id">{{ s.nome }}</option>
        }
      </select>
      <select [(ngModel)]="filtroStato" [ngModelOptions]="{ standalone: true }">
        <option value="tutti">Tutti gli stati</option>
        <option value="in_gara">Solo in gara</option>
        <option value="ritirati">Solo ritirati</option>
      </select>
    </div>

    @if (caricamento) {
      <div class="stato-caricamento">Caricamento…</div>
    } @else if (corridoriFiltrati.length === 0) {
      <div class="stato-vuoto">
        <div class="titolo">Nessun corridore trovato</div>
        <p>Prova a cambiare i filtri o aggiungine uno nuovo.</p>
      </div>
    } @else {
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Corridore</th>
              <th>Squadra</th>
              <th>Nazione</th>
              <th>Stato</th>
              <th class="col-azioni">Azioni</th>
            </tr>
          </thead>
          <tbody>
            @for (c of corridoriFiltrati; track c.id) {
              <tr>
                <td>{{ c.numero_pettorale ?? '—' }}</td>
                <td>
                  <a [routerLink]="['/corridori', c.id]">{{ c.cognome }} {{ c.nome }}</a>
                </td>
                <td>{{ c.squadra_nome || '—' }}</td>
                <td>{{ c.nazione_nome || '—' }}</td>
                <td>
                  @if (c.ritirato) {
                    <span class="badge badge-rosso">{{ etichettaMotivo(c.motivo_ritiro) }}</span>
                  } @else {
                    <span class="badge badge-verde">In gara</span>
                  }
                </td>
                <td class="col-azioni">
                  @if (c.ritirato) {
                    <button class="btn btn-secondary btn-sm" type="button" (click)="riammetti(c)">Riammetti</button>
                  } @else {
                    <button class="btn btn-secondary btn-sm" type="button" (click)="apriRitiro(c)">Ritira</button>
                  }
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
      <app-modal [titolo]="form.value.id ? 'Modifica corridore' : 'Nuovo corridore'" (chiudi)="chiudiModale()">
        <form [formGroup]="form" class="form-grid" (ngSubmit)="salva()">
          <div class="campo">
            <label for="nome">Nome</label>
            <input id="nome" type="text" formControlName="nome" />
          </div>
          <div class="campo">
            <label for="cognome">Cognome</label>
            <input id="cognome" type="text" formControlName="cognome" />
          </div>
          <div class="campo">
            <label for="pettorale">Numero pettorale</label>
            <input id="pettorale" type="number" formControlName="numero_pettorale" />
          </div>
          <div class="campo">
            <label for="nascita">Data di nascita</label>
            <input id="nascita" type="date" formControlName="data_nascita" />
          </div>
          <div class="campo">
            <label for="squadra">Squadra</label>
            <select id="squadra" formControlName="squadra_id">
              <option [ngValue]="null">—</option>
              @for (s of squadre; track s.id) {
                <option [ngValue]="s.id">{{ s.nome }}</option>
              }
            </select>
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
        </form>
        <div modal-footer>
          <button class="btn btn-ghost" type="button" (click)="chiudiModale()">Annulla</button>
          <button class="btn btn-primary" type="button" [disabled]="form.invalid || salvataggio" (click)="salva()">
            {{ salvataggio ? 'Salvataggio…' : 'Salva' }}
          </button>
        </div>
      </app-modal>
    }

    @if (modaleRitiroAperto && corridoreDaRitirare) {
      <app-modal [titolo]="'Ritira ' + corridoreDaRitirare.cognome + ' ' + corridoreDaRitirare.nome" (chiudi)="chiudiRitiro()">
        <form [formGroup]="formRitiro" class="form-grid colonna-singola">
          <div class="campo">
            <label for="motivo">Motivo del ritiro</label>
            <select id="motivo" formControlName="motivo_ritiro">
              <option value="infortunio">Infortunio</option>
              <option value="abbandono">Abbandono</option>
              <option value="squalifica">Squalifica</option>
              <option value="doping">Doping</option>
              <option value="altro">Altro</option>
            </select>
          </div>
          <div class="campo">
            <label for="tappaRitiro">Numero tappa del ritiro (opzionale)</label>
            <input id="tappaRitiro" type="number" formControlName="ritirato_tappa_numero" />
            <span class="suggerimento">
              Se indicato, il corridore resta ammesso nei risultati fino a quella tappa inclusa.
            </span>
          </div>
          <div class="campo">
            <label for="noteRitiro">Note</label>
            <textarea id="noteRitiro" formControlName="note_ritiro"></textarea>
          </div>
        </form>
        <div modal-footer>
          <button class="btn btn-ghost" type="button" (click)="chiudiRitiro()">Annulla</button>
          <button class="btn btn-danger" type="button" (click)="confermaRitiro()">Conferma ritiro</button>
        </div>
      </app-modal>
    }
  `,
})
export class CorridoriComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  corridori: Corridore[] = [];
  squadre: Squadra[] = [];
  nazioni: Nazione[] = [];
  caricamento = true;
  modaleAperto = false;
  salvataggio = false;
  filtro = '';
  filtroSquadra: number | null = null;
  filtroStato: 'tutti' | 'in_gara' | 'ritirati' = 'tutti';

  modaleRitiroAperto = false;
  corridoreDaRitirare: Corridore | null = null;

  form = this.fb.nonNullable.group({
    id: this.fb.control<number | null>(null),
    nome: ['', Validators.required],
    cognome: ['', Validators.required],
    numero_pettorale: this.fb.control<number | null>(null),
    data_nascita: this.fb.control<string | null>(null),
    squadra_id: this.fb.control<number | null>(null),
    nazione_id: this.fb.control<number | null>(null),
  });

  formRitiro = this.fb.nonNullable.group({
    motivo_ritiro: this.fb.control<MotivoRitiro>('infortunio'),
    ritirato_tappa_numero: this.fb.control<number | null>(null),
    note_ritiro: [''],
  });

  get corridoriFiltrati(): Corridore[] {
    const q = this.filtro.trim().toLowerCase();
    return this.corridori.filter((c) => {
      if (this.filtroSquadra && c.squadra_id !== this.filtroSquadra) return false;
      if (this.filtroStato === 'in_gara' && c.ritirato) return false;
      if (this.filtroStato === 'ritirati' && !c.ritirato) return false;
      if (!q) return true;
      const pettorale = c.numero_pettorale ? String(c.numero_pettorale) : '';
      return (
        c.nome.toLowerCase().includes(q) ||
        c.cognome.toLowerCase().includes(q) ||
        pettorale.includes(q)
      );
    });
  }

  ngOnInit(): void {
    this.api.list<Squadra>('squadre').subscribe((s) => (this.squadre = s));
    this.api.list<Nazione>('nazioni').subscribe((n) => (this.nazioni = n));
    this.carica();
  }

  carica(): void {
    this.caricamento = true;
    this.api.list<Corridore>('corridori').subscribe((righe) => {
      this.corridori = righe;
      this.caricamento = false;
    });
  }

  etichettaMotivo(motivo: MotivoRitiro | null): string {
    const mappa: Record<string, string> = {
      infortunio: 'Infortunato',
      abbandono: 'Abbandono',
      squalifica: 'Squalificato',
      doping: 'Squalifica doping',
      altro: 'Ritirato',
    };
    return motivo ? mappa[motivo] ?? 'Ritirato' : 'Ritirato';
  }

  apriNuovo(): void {
    this.form.reset({
      id: null,
      nome: '',
      cognome: '',
      numero_pettorale: null,
      data_nascita: null,
      squadra_id: null,
      nazione_id: null,
    });
    this.modaleAperto = true;
  }

  apriModifica(c: Corridore): void {
    this.form.reset({
      id: c.id,
      nome: c.nome,
      cognome: c.cognome,
      numero_pettorale: c.numero_pettorale,
      data_nascita: c.data_nascita,
      squadra_id: c.squadra_id,
      nazione_id: c.nazione_id,
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
    const richiesta = id ? this.api.aggiorna('corridori', id, corpo) : this.api.crea('corridori', corpo);
    richiesta.subscribe({
      next: () => {
        this.toast.successo(id ? 'Corridore aggiornato.' : 'Corridore creato.');
        this.salvataggio = false;
        this.chiudiModale();
        this.carica();
      },
      error: () => (this.salvataggio = false),
    });
  }

  elimina(c: Corridore): void {
    if (!confirm(`Eliminare ${c.cognome} ${c.nome}? Verrà spostato nel cestino per 15 giorni.`)) return;
    this.api.elimina('corridori', c.id).subscribe(() => {
      this.toast.successo('Corridore spostato nel cestino.');
      this.carica();
    });
  }

  apriRitiro(c: Corridore): void {
    this.corridoreDaRitirare = c;
    this.formRitiro.reset({ motivo_ritiro: 'infortunio', ritirato_tappa_numero: null, note_ritiro: '' });
    this.modaleRitiroAperto = true;
  }

  chiudiRitiro(): void {
    this.modaleRitiroAperto = false;
    this.corridoreDaRitirare = null;
  }

  confermaRitiro(): void {
    if (!this.corridoreDaRitirare) return;
    this.api.azione(`corridori/${this.corridoreDaRitirare.id}/ritira`, this.formRitiro.getRawValue()).subscribe(() => {
      this.toast.successo('Corridore ritirato.');
      this.chiudiRitiro();
      this.carica();
    });
  }

  riammetti(c: Corridore): void {
    if (!confirm(`Riammettere ${c.cognome} ${c.nome} in gara?`)) return;
    this.api.azione(`corridori/${c.id}/riammetti`, {}).subscribe(() => {
      this.toast.successo('Corridore riammesso.');
      this.carica();
    });
  }
}
