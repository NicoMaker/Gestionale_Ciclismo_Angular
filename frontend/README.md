# Gestionale Ciclismo — Frontend Angular

Frontend Angular 18 (standalone components, TypeScript) per il progetto
[Gestionale_Ciclismo](https://github.com/NicoMaker/Gestionale_Ciclismo).

Il backend Express **non serve più pagine HTML**: espone solo API REST
(`/api/*`) ed eventi Socket.IO. Tutta l'interfaccia — tabelle, form,
classifiche, cestino — è servita da questa app Angular, che legge/scrive
i dati esclusivamente tramite quelle API.

## Struttura del progetto

```
src/app/
  core/               servizi condivisi (API, socket, lookup FK, toast, errori)
    api.service.ts        wrapper HttpClient su /api/*
    socket.service.ts     client Socket.IO per gli aggiornamenti realtime
    lookup.service.ts     cache delle liste (corridori, squadre, tappe...) per le select
    entity-configs.ts     configurazione delle 14 tabelle CRUD generiche
    models.ts              interfacce TypeScript per tutte le entità
  shared/             componenti riusabili (modale, notifiche toast)
  pages/
    dashboard/          panoramica generale
    nazioni/ squadre/ corridori/ tappe/ sponsor/   CRUD dedicati
    corridore-dettaglio/   scheda corridore con risultati e posizioni in classifica
    risultati-tappa/       inserimento/modifica arrivi di una tappa
    classifiche/            5 classifiche ufficiali (tempo, punti, montagna, giovani, squadre)
    controlli-antidoping/   gestione controlli e squalifiche
    cestino/                ripristino / eliminazione definitiva
    generico/               un solo componente per le 14 tabelle di supporto
                             (staff tecnico, veicoli, hotel, meteo, ecc.),
                             pilotato da core/entity-configs.ts
```

## Avvio in locale

1. Avvia il backend (dalla cartella `backend/` del progetto originale):
   ```bash
   npm install
   npm start        # oppure: npm run start_dati per popolare dati di esempio
   ```
   Il backend resta in ascolto su `http://localhost:3000`.

2. In un altro terminale, avvia il frontend Angular:
   ```bash
   npm install
   npm start        # ng serve, apre su http://localhost:4200
   ```

Per impostazione predefinita il frontend punta a `http://localhost:3000/api`
(vedi `src/environments/environment.ts`). Se il backend gira su un altro
host/porta, modifica `apiUrl` e `socketUrl` in quel file (e nel corrispondente
`environment.prod.ts` per le build di produzione).

## Build di produzione

```bash
npm run build
```

I file compilati vengono generati in `dist/frontend-angular/browser`: sono
file statici che puoi servire con qualunque web server (nginx, serve, ecc.),
tenendo presente che comunicheranno comunque con il backend Express via API.

## Note tecniche

- Angular 18, componenti standalone, nuova sintassi di controllo flusso
  (`@if`/`@for`/`@switch`), routing con lazy loading per pagina.
- Tutte le chiamate HTTP passano da un interceptor unico che mostra in un
  toast il messaggio `errore` restituito dal backend in caso di 4xx/5xx.
- Socket.IO è usato per lo stato live in sidebar (spettatori connessi); i
  singoli componenti ricaricano i propri dati dopo ogni salvataggio, invece
  di fare aggiornamenti realtime granulari — scelta volutamente semplice e
  robusta per un gestionale amministrativo.
