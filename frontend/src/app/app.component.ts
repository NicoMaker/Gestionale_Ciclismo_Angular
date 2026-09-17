import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from './core/api.service';
import { CONFIGURAZIONI_GENERICHE } from './core/entity-configs';
import { SocketService } from './core/socket.service';
import { StatoLive } from './core/models';
import { ToastContainerComponent } from './shared/toast-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ToastContainerComponent,
  ],
  template: `
    <div class="layout">
      <aside class="sidebar">
        <div class="sidebar-brand">
          <span class="sidebar-brand-badge">GC</span>
          <div>
            <strong>Gestionale Ciclismo</strong>
            <div class="sidebar-brand-sub">Frontend Angular</div>
          </div>
        </div>

        <div class="sidebar-live">
          @if (statoLive) {
            <span class="pill-live">
              <span class="pallino-live"></span>
              {{ statoLive.spettatoriConnessi }} connessi in diretta
            </span>
          }
        </div>

        <nav class="sidebar-nav">
          <div class="nav-sezione">La corsa</div>
          <a
            routerLink="/"
            routerLinkActive="attivo"
            [routerLinkActiveOptions]="{ exact: true }"
            class="nav-item"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="3" width="7" height="9" rx="1.5" />
              <rect x="14" y="3" width="7" height="5" rx="1.5" />
              <rect x="14" y="12" width="7" height="9" rx="1.5" />
              <rect x="3" y="16" width="7" height="5" rx="1.5" />
            </svg>
            <span>Dashboard</span>
          </a>
          <a routerLink="/tappe" routerLinkActive="attivo" class="nav-item">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M9 20L4 18V6l5 2m0 12l6-2m-6 2V8m6 10l5 2V8l-5-2m0 14V6m0 0L9 8"
              />
            </svg>
            <span>Tappe</span>
          </a>
          <a routerLink="/corridori" routerLinkActive="attivo" class="nav-item">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="7.5" r="3.5" />
              <path d="M4.5 20.5c0-4.14 3.36-7 7.5-7s7.5 2.86 7.5 7" />
            </svg>
            <span>Corridori</span>
          </a>
          <a routerLink="/squadre" routerLinkActive="attivo" class="nav-item">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="8.5" cy="8" r="3" />
              <circle cx="16" cy="8.5" r="2.5" />
              <path
                d="M3 20c0-3.31 2.46-6 5.5-6S14 16.69 14 20M14.5 14.5c2.8.2 4.5 2.4 4.5 5.5"
              />
            </svg>
            <span>Squadre</span>
          </a>
          <a
            routerLink="/classifiche"
            routerLinkActive="attivo"
            class="nav-item"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4z" />
              <path
                d="M7 6H4.5A1.5 1.5 0 0 0 3 7.5c0 2 1.5 3.5 4 3.8M17 6h2.5A1.5 1.5 0 0 1 21 7.5c0 2-1.5 3.5-4 3.8"
              />
            </svg>
            <span>Classifiche</span>
          </a>
          <a routerLink="/nazioni" routerLinkActive="attivo" class="nav-item">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M5 21V4m0 1h13l-2.5 3.5L18 12H5" />
            </svg>
            <span>Nazioni</span>
          </a>
          <a routerLink="/sponsor" routerLinkActive="attivo" class="nav-item">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="8" width="18" height="12" rx="2" />
              <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" />
            </svg>
            <span>Sponsor</span>
          </a>
          <a
            routerLink="/controlli-antidoping"
            routerLinkActive="attivo"
            class="nav-item"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M12 3l7 3.5v5c0 4.6-3 7.9-7 9.5-4-1.6-7-4.9-7-9.5v-5L12 3z"
              />
              <path d="M9.5 12l1.8 1.8L15 10" />
            </svg>
            <span>Controlli antidoping</span>
          </a>

          <div class="nav-sezione">Dati di supporto</div>
          @for (config of configurazioni; track config.chiave) {
            <a
              [routerLink]="['/dati', config.chiave]"
              routerLinkActive="attivo"
              class="nav-item nav-item-sm"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="3" y="4" width="18" height="4" rx="1" />
                <rect x="3" y="10" width="18" height="4" rx="1" />
                <rect x="3" y="16" width="18" height="4" rx="1" />
              </svg>
              <span>{{ config.titolo }}</span>
            </a>
          }

          <div class="nav-sezione">Altro</div>
          <a routerLink="/cestino" routerLinkActive="attivo" class="nav-item">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0l1 13a2 2 0 0 0 2 1.8h4a2 2 0 0 0 2-1.8l1-13"
              />
            </svg>
            <span>Cestino</span>
          </a>
        </nav>
      </aside>

      <main class="contenuto">
        <router-outlet></router-outlet>
      </main>
    </div>

    <app-toast-container></app-toast-container>
  `,
  styles: [
    `
      .sidebar {
        background: linear-gradient(
          180deg,
          var(--notte) 0%,
          var(--notte-2) 100%
        );
        color: #fff;
        display: flex;
        flex-direction: column;
        padding: 24px 0 18px;
        position: sticky;
        top: 0;
        height: 100vh;
        overflow-y: auto;
        border-right: 1px solid rgba(255, 255, 255, 0.06);
      }
      .sidebar-brand {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 0 22px 20px;
      }
      .sidebar-brand-badge {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        background: var(--gradiente-primario);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 14px;
        font-family: 'Manrope', sans-serif;
        flex-shrink: 0;
        box-shadow: 0 6px 18px -4px rgba(109, 91, 246, 0.6);
      }
      .sidebar-brand strong {
        font-size: 14.5px;
        line-height: 1.25;
        display: block;
        font-family: 'Manrope', sans-serif;
        letter-spacing: -0.01em;
      }
      .sidebar-brand-sub {
        font-size: 11.5px;
        color: rgba(255, 255, 255, 0.42);
        margin-top: 1px;
      }
      .sidebar-live {
        padding: 0 22px 16px;
      }
      .sidebar-nav {
        display: flex;
        flex-direction: column;
        padding: 4px 14px;
        gap: 2px;
        overflow-y: auto;
      }
      .nav-sezione {
        font-size: 10.5px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: rgba(255, 255, 255, 0.32);
        padding: 18px 10px 7px;
        font-weight: 700;
      }
      .nav-item {
        display: flex;
        align-items: center;
        gap: 11px;
        padding: 9.5px 14px;
        border-radius: 10px;
        color: rgba(255, 255, 255, 0.72);
        text-decoration: none;
        font-size: 14px;
        font-weight: 600;
        letter-spacing: -0.005em;
      }
      .nav-item svg {
        width: 17px;
        height: 17px;
        flex-shrink: 0;
        opacity: 0.75;
      }
      .nav-item-sm svg {
        width: 15px;
        height: 15px;
        opacity: 0.55;
      }
      .nav-item-sm {
        font-size: 13px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.52);
        padding: 7px 14px;
      }
      .nav-item:hover {
        background: rgba(255, 255, 255, 0.07);
        color: #fff;
      }
      .nav-item:hover svg {
        opacity: 1;
      }
      .nav-item.attivo {
        background: var(--gradiente-primario);
        color: #fff;
        box-shadow: 0 4px 14px -2px rgba(109, 91, 246, 0.5);
      }
      .nav-item.attivo svg {
        opacity: 1;
      }
    `,
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private socket = inject(SocketService);
  private sub?: Subscription;

  configurazioni = CONFIGURAZIONI_GENERICHE;
  statoLive: StatoLive | null = null;

  ngOnInit(): void {
    this.api
      .ottieniPercorso<StatoLive>('stato-live')
      .subscribe((s) => (this.statoLive = s));
    this.sub = this.socket
      .on<StatoLive>('stato-live:aggiornato')
      .subscribe((s) => (this.statoLive = s));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
