import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { VoceCestino } from '../../core/models';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-cestino',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="view-head view-head-riga">
      <div>
        <h1>Cestino</h1>
        <p>Gli elementi eliminati restano qui 15 giorni prima di essere rimossi definitivamente.</p>
      </div>
      @if (voci.length > 0) {
        <button class="btn btn-danger" type="button" (click)="svuota()">Svuota cestino</button>
      }
    </div>

    @if (caricamento) {
      <div class="stato-caricamento">Caricamento…</div>
    } @else if (voci.length === 0) {
      <div class="stato-vuoto">
        <div class="titolo">Il cestino è vuoto</div>
      </div>
    } @else {
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Tipo</th><th>Descrizione</th><th>Eliminato il</th><th>Scade</th><th class="col-azioni">Azioni</th></tr>
          </thead>
          <tbody>
            @for (v of voci; track v.id) {
              <tr>
                <td><span class="badge badge-viola">{{ v.etichetta }}</span></td>
                <td>{{ v.descrizione }}</td>
                <td>{{ v.eliminato_il | date: 'dd/MM/yyyy HH:mm' }}</td>
                <td>
                  @if (v.giorni_rimanenti <= 3) {
                    <span class="badge badge-rosso">{{ v.giorni_rimanenti }} giorni</span>
                  } @else {
                    <span class="badge badge-grigio">{{ v.giorni_rimanenti }} giorni</span>
                  }
                </td>
                <td class="col-azioni">
                  <button class="btn btn-secondary btn-sm" type="button" (click)="ripristina(v)">Ripristina</button>
                  <button class="btn btn-danger btn-sm" type="button" (click)="eliminaDefinitivo(v)">Elimina def.</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
})
export class CestinoComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  voci: VoceCestino[] = [];
  caricamento = true;

  ngOnInit(): void {
    this.carica();
  }

  carica(): void {
    this.caricamento = true;
    this.api.list<VoceCestino>('cestino').subscribe((righe) => {
      this.voci = righe;
      this.caricamento = false;
    });
  }

  ripristina(v: VoceCestino): void {
    this.api.azione(`cestino/${v.id}/ripristina`, {}).subscribe(() => {
      this.toast.successo('Elemento ripristinato.');
      this.carica();
    });
  }

  eliminaDefinitivo(v: VoceCestino): void {
    if (!confirm('Eliminare definitivamente questo elemento? Non sarà più recuperabile.')) return;
    this.api.elimina('cestino', v.id).subscribe(() => {
      this.toast.successo('Elemento eliminato definitivamente.');
      this.carica();
    });
  }

  svuota(): void {
    if (!confirm('Svuotare completamente il cestino? L\'azione è irreversibile.')) return;
    this.api.eliminaPercorso('cestino').subscribe(() => {
      this.toast.successo('Cestino svuotato.');
      this.carica();
    });
  }
}
