import { Component, inject } from '@angular/core';
import { ToastService } from '../core/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="toast-container">
      @for (t of toastService.toasts(); track t.id) {
        <div class="toast" [class]="'toast-' + t.tipo">
          <span>{{ t.messaggio }}</span>
          <button type="button" (click)="toastService.rimuovi(t.id)" aria-label="Chiudi notifica">&times;</button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
}
