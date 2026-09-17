import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    title: 'Dashboard · Gestionale Ciclismo',
  },
  {
    path: 'nazioni',
    loadComponent: () => import('./pages/nazioni/nazioni.component').then((m) => m.NazioniComponent),
    title: 'Nazioni · Gestionale Ciclismo',
  },
  {
    path: 'squadre',
    loadComponent: () => import('./pages/squadre/squadre.component').then((m) => m.SquadreComponent),
    title: 'Squadre · Gestionale Ciclismo',
  },
  {
    path: 'corridori',
    loadComponent: () => import('./pages/corridori/corridori.component').then((m) => m.CorridoriComponent),
    title: 'Corridori · Gestionale Ciclismo',
  },
  {
    path: 'corridori/:id',
    loadComponent: () =>
      import('./pages/corridore-dettaglio/corridore-dettaglio.component').then(
        (m) => m.CorridoreDettaglioComponent,
      ),
    title: 'Dettaglio corridore · Gestionale Ciclismo',
  },
  {
    path: 'tappe',
    loadComponent: () => import('./pages/tappe/tappe.component').then((m) => m.TappeComponent),
    title: 'Tappe · Gestionale Ciclismo',
  },
  {
    path: 'tappe/:id/risultati',
    loadComponent: () =>
      import('./pages/risultati-tappa/risultati-tappa.component').then((m) => m.RisultatiTappaComponent),
    title: 'Risultati tappa · Gestionale Ciclismo',
  },
  {
    path: 'classifiche',
    loadComponent: () => import('./pages/classifiche/classifiche.component').then((m) => m.ClassificheComponent),
    title: 'Classifiche · Gestionale Ciclismo',
  },
  {
    path: 'sponsor',
    loadComponent: () => import('./pages/sponsor/sponsor.component').then((m) => m.SponsorComponent),
    title: 'Sponsor · Gestionale Ciclismo',
  },
  {
    path: 'controlli-antidoping',
    loadComponent: () =>
      import('./pages/controlli-antidoping/controlli-antidoping.component').then(
        (m) => m.ControlliAntidopingComponent,
      ),
    title: 'Controlli antidoping · Gestionale Ciclismo',
  },
  {
    path: 'cestino',
    loadComponent: () => import('./pages/cestino/cestino.component').then((m) => m.CestinoComponent),
    title: 'Cestino · Gestionale Ciclismo',
  },
  {
    path: 'dati/:entita',
    loadComponent: () => import('./pages/generico/generico.component').then((m) => m.GenericoComponent),
    title: 'Dati · Gestionale Ciclismo',
  },
  { path: '**', redirectTo: '' },
];
