# Gestionale Ciclismo — backend API + frontend Angular

Questo pacchetto contiene:

- **`backend/`** — API Express + SQLite3 + Socket.IO originale del progetto,
  con una sola modifica: **non serve più il vecchio frontend HTML statico**
  (`frontend/`). Ora espone solo `/api/*` e gli eventi realtime Socket.IO.
- **`frontend/`** — il vecchio frontend HTML/CSS/JS statico, mantenuto solo
  come riferimento: **non è più collegato al backend** e non è necessario
  per far funzionare l'applicazione.
- **`frontend-angular/`** — il nuovo frontend, riscritto da zero in Angular
  18 + TypeScript, che legge e scrive tutti i dati tramite le API del
  backend. È l'unico frontend da usare per amministrare il gestionale.

## Avvio rapido

Servono due terminali, uno per il backend e uno per il frontend.

**Terminale 1 — backend (porta 3000):**
```bash
cd backend
npm install
npm run start_dati    # avvia con dati di esempio precaricati
# oppure: npm start    per partire da un database vuoto
```

**Terminale 2 — frontend Angular (porta 4200):**
```bash
cd frontend-angular
npm install
npm start
```

Poi apri `http://localhost:4200`. Il frontend Angular chiama in automatico
`http://localhost:3000/api` (configurabile in
`frontend-angular/src/environments/environment.ts`).

## Perché due processi separati

Il backend ora fa solo da API/dati (Express + SQLite + Socket.IO); il
frontend Angular è un'app a sé, buildabile e distribuibile in autonomia
(anche su un dominio diverso, via `environment.apiUrl`). Consulta
`frontend-angular/README.md` per i dettagli sulla struttura del frontend.
