// =============================================================================
// Modelli TypeScript — rispecchiano 1:1 le tabelle SQLite del backend
// (backend/db/database.js). Molti campi sono opzionali perché il DB li
// consente NULL oppure vengono aggiunti dalle JOIN delle route dedicate.
// =============================================================================

export interface Nazione {
  id: number;
  nome: string;
  codice_iso2: string;
}

export interface Squadra {
  id: number;
  nome: string;
  nazione_id: number | null;
  colore: string;
  creato_il?: string;
  // arricchiti dalla JOIN del backend
  nazione_nome?: string;
  nazione_codice?: string;
  numero_corridori?: number;
  numero_corridori_in_gara?: number;
}

export type MotivoRitiro =
  | 'infortunio'
  | 'abbandono'
  | 'squalifica'
  | 'doping'
  | 'altro';

export interface Corridore {
  id: number;
  nome: string;
  cognome: string;
  numero_pettorale: number | null;
  nazione_id: number | null;
  squadra_id: number | null;
  data_nascita: string | null;
  ritirato: number; // 0 | 1
  ritirato_tappa_numero: number | null;
  motivo_ritiro: MotivoRitiro | null;
  note_ritiro: string | null;
  ritirato_il: string | null;
  creato_il?: string;
  // arricchiti dalla JOIN del backend
  squadra_nome?: string;
  squadra_colore?: string;
  squadra_nazione_codice?: string;
  squadra_nazione_nome?: string;
  nazione_nome?: string;
  nazione_codice?: string;
}

export type TipoTappa = 'pianura' | 'collina' | 'montagna' | 'cronometro';
export type StatoTappa = 'programmata' | 'in_corso' | 'conclusa';

export interface Tappa {
  id: number;
  numero_tappa: number;
  nome: string;
  partenza: string;
  arrivo: string;
  distanza_km: number | null;
  dislivello_m: number | null;
  tipo: TipoTappa;
  data: string | null;
  stato: StatoTappa;
  abbuoni_attivi: number; // 0 | 1
  creato_il?: string;
}

export interface Risultato {
  id?: number;
  tappa_id: number;
  corridore_id: number;
  posizione: number | null;
  tempo: string | null;
  distacco?: string;
  punti: number;
  creato_il?: string;
  // arricchiti dalla JOIN del backend (GET /api/risultati/tappa/:id)
  nome?: string;
  cognome?: string;
  numero_pettorale?: number;
  squadra_nome?: string;
  squadra_colore?: string;
  squadra_nazione_codice?: string;
  nazione_nome?: string;
  nazione_codice?: string;
}

export interface VoceClassificaTempo {
  id: number;
  nome: string;
  cognome: string;
  numero_pettorale: number | null;
  data_nascita: string | null;
  squadra_id: number | null;
  squadra_nome: string;
  squadra_colore: string;
  nazione_nome: string | null;
  nazione_codice: string | null;
  tappe_disputate: number;
  secondi_totali: number;
  abbuono_secondi: number;
  tempo_totale: string;
  distacco: string;
  eta?: number;
}

export interface VoceClassificaPunti {
  id: number;
  nome: string;
  cognome: string;
  numero_pettorale: number | null;
  squadra_nome: string;
  nazione_nome: string | null;
  nazione_codice: string | null;
  punti_totali: number;
  tappe_disputate: number;
}

export interface VoceClassificaMontagna {
  id: number;
  nome: string;
  cognome: string;
  numero_pettorale: number | null;
  squadra_nome: string;
  squadra_colore: string;
  nazione_nome: string | null;
  nazione_codice: string | null;
  punti_totali: number;
  gpm_disputati: number;
}

export interface VoceClassificaSquadre {
  squadra_id: number;
  squadra_nome: string;
  squadra_colore: string;
  nazione_nome: string | null;
  nazione_codice: string | null;
  corridori_contati: number;
  secondi_totali: number;
  tempo_totale: string;
  distacco: string;
}

export interface PosizioneClassifica {
  posizione: number;
  totale: number;
}

export interface DettaglioCorridore {
  risultati: Array<{
    tappa_id: number;
    posizione: number | null;
    tempo: string | null;
    distacco: string | null;
    punti: number;
    numero_tappa: number;
    tappa_nome: string;
    tappa_tipo: TipoTappa;
    tappa_data: string | null;
    partenza: string;
    arrivo: string;
  }>;
  ritirato: boolean;
  classifiche: {
    generale: PosizioneClassifica | null;
    punti: PosizioneClassifica | null;
    giovani: PosizioneClassifica | null;
    montagna: PosizioneClassifica | null;
  };
}

export interface Sponsor {
  id: number;
  nome: string;
  settore: string | null;
  sito_web: string | null;
  creato_il?: string;
}

export type EsitoAntidoping = 'negativo' | 'positivo' | 'in_attesa';

export interface ControlloAntidoping {
  id: number;
  corridore_id: number;
  tappa_id: number | null;
  data: string | null;
  esito: EsitoAntidoping;
}

export interface VoceCestino {
  id: number;
  entita: string;
  etichetta: string;
  entita_id: number;
  descrizione: string;
  dati: Record<string, unknown>;
  eliminato_il: string;
  scade_il: string;
  giorni_rimanenti: number;
}

export interface StatoLive {
  tappaInCorsoId: number | string | null;
  spettatoriConnessi: number;
}

// ---- tabelle "generiche" (CRUD identico, gestite dal componente generico) ----

export interface StaffTecnico {
  id: number;
  nome: string;
  cognome: string;
  ruolo:
    | 'direttore_sportivo'
    | 'meccanico'
    | 'medico'
    | 'massaggiatore'
    | 'preparatore_atletico';
  squadra_id: number | null;
}

export interface TappaPercorso {
  id: number;
  tappa_id: number;
  km: number | null;
  tipo: 'sprint' | 'gpm';
  nome_luogo: string | null;
  categoria: string | null;
}

export interface ClassificaTipo {
  id: number;
  nome: string;
  descrizione: string | null;
}

export interface TraguardoVolante {
  id: number;
  tappa_id: number;
  corridore_id: number;
  posizione: number | null;
  punti: number;
}

export interface GpmRisultato {
  id: number;
  tappa_id: number;
  corridore_id: number;
  posizione: number | null;
  punti: number;
}

export interface AbbuonoClassifica {
  id: number;
  posizione: number;
  secondi: number;
}

export interface Penalita {
  id: number;
  corridore_id: number;
  tappa_id: number | null;
  motivo: string;
  secondi: number;
  punti: number;
}

export interface Bicicletta {
  id: number;
  corridore_id: number | null;
  marca: string | null;
  modello: string | null;
  telaio: string | null;
}

export interface SquadraSponsor {
  id: number;
  squadra_id: number;
  sponsor_id: number;
  tipo: 'main_sponsor' | 'co_sponsor' | 'fornitore_tecnico';
}

export interface VeicoloSquadra {
  id: number;
  squadra_id: number;
  tipo: 'ammiraglia' | 'furgone' | 'bus' | 'camper';
  targa: string | null;
  modello: string | null;
}

export interface Hotel {
  id: number;
  tappa_id: number | null;
  squadra_id: number | null;
  nome: string;
  citta: string | null;
  indirizzo: string | null;
}

export interface MeteoTappa {
  id: number;
  tappa_id: number;
  temperatura: number | null;
  condizione: 'sereno' | 'nuvoloso' | 'pioggia' | 'vento_forte' | 'neve';
  vento_kmh: number | null;
}

export interface MediaAccreditato {
  id: number;
  nome: string;
  testata: string | null;
  tipo: 'stampa' | 'tv' | 'radio' | 'foto' | 'online';
  tappa_id: number | null;
}

export interface ComunicatoStampa {
  id: number;
  titolo: string;
  contenuto: string | null;
  data: string | null;
  tappa_id: number | null;
}
