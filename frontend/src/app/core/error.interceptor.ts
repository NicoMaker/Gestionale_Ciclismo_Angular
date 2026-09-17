import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from './toast.service';

/**
 * Tutte le route del backend rispondono agli errori con { errore: "..." }
 * (400/404/409/500). Questo interceptor centralizza la visualizzazione di
 * quel messaggio in un toast, così i singoli componenti non devono
 * ripetere la stessa gestione ad ogni chiamata.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const messaggio =
        (err.error && typeof err.error === 'object' && 'errore' in err.error
          ? String((err.error as { errore: unknown }).errore)
          : null) ||
        (err.status === 0
          ? 'Impossibile contattare il server: verifica che il backend sia avviato.'
          : `Errore ${err.status}: ${err.message}`);
      toast.errore(messaggio);
      return throwError(() => err);
    }),
  );
};
