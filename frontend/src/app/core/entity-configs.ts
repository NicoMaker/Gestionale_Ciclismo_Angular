import { ChiaveLookup } from './lookup.service';

export type TipoCampo = 'testo' | 'numero' | 'data' | 'select' | 'textarea';

export interface OpzioneStatica {
  valore: string;
  etichetta: string;
}

export interface CampoConfig {
  chiave: string;
  etichetta: string;
  tipo: TipoCampo;
  obbligatorio?: boolean;
  opzioniStatiche?: OpzioneStatica[];
  lookup?: ChiaveLookup;
  passo?: string;
  default?: string | number;
}

export interface EntitaConfig {
  /** segmento di path dell'endpoint, es. 'staff-tecnico' → /api/staff-tecnico */
  chiave: string;
  titolo: string;
  singolare: string;
  campi: CampoConfig[];
}

/**
 * Le 14 tabelle "secondarie" del gestionale condividono lo stesso schema
 * CRUD generico lato backend (backend/routes/generic/generic.js): stessa
 * forma di richiesta/risposta, stessa gestione errori. Un solo componente
 * Angular (GenericoComponent) le gestisce tutte, pilotato da questa
 * configurazione dichiarativa — evita di scrivere 14 componenti quasi
 * identici.
 */
export const CONFIGURAZIONI_GENERICHE: EntitaConfig[] = [
  {
    chiave: 'staff-tecnico',
    titolo: 'Staff tecnico',
    singolare: 'membro dello staff',
    campi: [
      { chiave: 'nome', etichetta: 'Nome', tipo: 'testo', obbligatorio: true },
      {
        chiave: 'cognome',
        etichetta: 'Cognome',
        tipo: 'testo',
        obbligatorio: true,
      },
      {
        chiave: 'ruolo',
        etichetta: 'Ruolo',
        tipo: 'select',
        default: 'direttore_sportivo',
        opzioniStatiche: [
          { valore: 'direttore_sportivo', etichetta: 'Direttore sportivo' },
          { valore: 'meccanico', etichetta: 'Meccanico' },
          { valore: 'medico', etichetta: 'Medico' },
          { valore: 'massaggiatore', etichetta: 'Massaggiatore' },
          { valore: 'preparatore_atletico', etichetta: 'Preparatore atletico' },
        ],
      },
      {
        chiave: 'squadra_id',
        etichetta: 'Squadra',
        tipo: 'select',
        lookup: 'squadre',
      },
    ],
  },
  {
    chiave: 'tappe-percorso',
    titolo: 'Percorso di tappa (sprint / GPM)',
    singolare: 'punto di percorso',
    campi: [
      {
        chiave: 'tappa_id',
        etichetta: 'Tappa',
        tipo: 'select',
        lookup: 'tappe',
        obbligatorio: true,
      },
      { chiave: 'km', etichetta: 'Km', tipo: 'numero', passo: '0.1' },
      {
        chiave: 'tipo',
        etichetta: 'Tipo',
        tipo: 'select',
        default: 'sprint',
        opzioniStatiche: [
          { valore: 'sprint', etichetta: 'Sprint' },
          { valore: 'gpm', etichetta: 'GPM' },
        ],
      },
      { chiave: 'nome_luogo', etichetta: 'Luogo', tipo: 'testo' },
      {
        chiave: 'categoria',
        etichetta: 'Categoria',
        tipo: 'testo',
        default: '',
      },
    ],
  },
  {
    chiave: 'classifiche-tipo',
    titolo: 'Tipi di classifica',
    singolare: 'tipo di classifica',
    campi: [
      { chiave: 'nome', etichetta: 'Nome', tipo: 'testo', obbligatorio: true },
      { chiave: 'descrizione', etichetta: 'Descrizione', tipo: 'textarea' },
    ],
  },
  {
    chiave: 'traguardi-volanti',
    titolo: 'Traguardi volanti',
    singolare: 'traguardo volante',
    campi: [
      {
        chiave: 'tappa_id',
        etichetta: 'Tappa',
        tipo: 'select',
        lookup: 'tappe',
        obbligatorio: true,
      },
      {
        chiave: 'corridore_id',
        etichetta: 'Corridore',
        tipo: 'select',
        lookup: 'corridori',
        obbligatorio: true,
      },
      { chiave: 'posizione', etichetta: 'Posizione', tipo: 'numero' },
      { chiave: 'punti', etichetta: 'Punti', tipo: 'numero', default: 0 },
    ],
  },
  {
    chiave: 'gpm-risultati',
    titolo: 'Risultati GPM',
    singolare: 'risultato GPM',
    campi: [
      {
        chiave: 'tappa_id',
        etichetta: 'Tappa',
        tipo: 'select',
        lookup: 'tappe',
        obbligatorio: true,
      },
      {
        chiave: 'corridore_id',
        etichetta: 'Corridore',
        tipo: 'select',
        lookup: 'corridori',
        obbligatorio: true,
      },
      { chiave: 'posizione', etichetta: 'Posizione', tipo: 'numero' },
      { chiave: 'punti', etichetta: 'Punti', tipo: 'numero', default: 0 },
    ],
  },
  {
    chiave: 'abbuoni',
    titolo: 'Abbuoni di classifica',
    singolare: 'abbuono',
    campi: [
      {
        chiave: 'posizione',
        etichetta: 'Posizione di tappa',
        tipo: 'numero',
        obbligatorio: true,
      },
      {
        chiave: 'secondi',
        etichetta: 'Secondi di abbuono',
        tipo: 'numero',
        default: 0,
      },
    ],
  },
  {
    chiave: 'penalita',
    titolo: 'Penalità',
    singolare: 'penalità',
    campi: [
      {
        chiave: 'corridore_id',
        etichetta: 'Corridore',
        tipo: 'select',
        lookup: 'corridori',
        obbligatorio: true,
      },
      {
        chiave: 'tappa_id',
        etichetta: 'Tappa',
        tipo: 'select',
        lookup: 'tappe',
      },
      {
        chiave: 'motivo',
        etichetta: 'Motivo',
        tipo: 'testo',
        obbligatorio: true,
      },
      { chiave: 'secondi', etichetta: 'Secondi', tipo: 'numero', default: 0 },
      { chiave: 'punti', etichetta: 'Punti', tipo: 'numero', default: 0 },
    ],
  },
  {
    chiave: 'biciclette',
    titolo: 'Biciclette',
    singolare: 'bicicletta',
    campi: [
      {
        chiave: 'corridore_id',
        etichetta: 'Corridore',
        tipo: 'select',
        lookup: 'corridori',
      },
      { chiave: 'marca', etichetta: 'Marca', tipo: 'testo' },
      { chiave: 'modello', etichetta: 'Modello', tipo: 'testo' },
      { chiave: 'telaio', etichetta: 'Numero telaio', tipo: 'testo' },
    ],
  },
  {
    chiave: 'squadra-sponsor',
    titolo: 'Sponsor per squadra',
    singolare: 'collegamento sponsor',
    campi: [
      {
        chiave: 'squadra_id',
        etichetta: 'Squadra',
        tipo: 'select',
        lookup: 'squadre',
        obbligatorio: true,
      },
      {
        chiave: 'sponsor_id',
        etichetta: 'Sponsor',
        tipo: 'select',
        lookup: 'sponsor',
        obbligatorio: true,
      },
      {
        chiave: 'tipo',
        etichetta: 'Tipo',
        tipo: 'select',
        default: 'co_sponsor',
        opzioniStatiche: [
          { valore: 'main_sponsor', etichetta: 'Main sponsor' },
          { valore: 'co_sponsor', etichetta: 'Co-sponsor' },
          { valore: 'fornitore_tecnico', etichetta: 'Fornitore tecnico' },
        ],
      },
    ],
  },
  {
    chiave: 'veicoli-squadra',
    titolo: 'Veicoli squadra',
    singolare: 'veicolo',
    campi: [
      {
        chiave: 'squadra_id',
        etichetta: 'Squadra',
        tipo: 'select',
        lookup: 'squadre',
        obbligatorio: true,
      },
      {
        chiave: 'tipo',
        etichetta: 'Tipo',
        tipo: 'select',
        default: 'ammiraglia',
        opzioniStatiche: [
          { valore: 'ammiraglia', etichetta: 'Ammiraglia' },
          { valore: 'furgone', etichetta: 'Furgone' },
          { valore: 'bus', etichetta: 'Bus' },
          { valore: 'camper', etichetta: 'Camper' },
        ],
      },
      { chiave: 'targa', etichetta: 'Targa', tipo: 'testo' },
      { chiave: 'modello', etichetta: 'Modello', tipo: 'testo' },
    ],
  },
  {
    chiave: 'hotel',
    titolo: 'Hotel',
    singolare: 'hotel',
    campi: [
      {
        chiave: 'tappa_id',
        etichetta: 'Tappa',
        tipo: 'select',
        lookup: 'tappe',
      },
      {
        chiave: 'squadra_id',
        etichetta: 'Squadra',
        tipo: 'select',
        lookup: 'squadre',
      },
      {
        chiave: 'nome',
        etichetta: 'Nome hotel',
        tipo: 'testo',
        obbligatorio: true,
      },
      { chiave: 'citta', etichetta: 'Città', tipo: 'testo' },
      { chiave: 'indirizzo', etichetta: 'Indirizzo', tipo: 'testo' },
    ],
  },
  {
    chiave: 'meteo-tappa',
    titolo: 'Meteo di tappa',
    singolare: 'previsione meteo',
    campi: [
      {
        chiave: 'tappa_id',
        etichetta: 'Tappa',
        tipo: 'select',
        lookup: 'tappe',
        obbligatorio: true,
      },
      {
        chiave: 'temperatura',
        etichetta: 'Temperatura (°C)',
        tipo: 'numero',
        passo: '0.1',
      },
      {
        chiave: 'condizione',
        etichetta: 'Condizione',
        tipo: 'select',
        default: 'sereno',
        opzioniStatiche: [
          { valore: 'sereno', etichetta: 'Sereno' },
          { valore: 'nuvoloso', etichetta: 'Nuvoloso' },
          { valore: 'pioggia', etichetta: 'Pioggia' },
          { valore: 'vento_forte', etichetta: 'Vento forte' },
          { valore: 'neve', etichetta: 'Neve' },
        ],
      },
      {
        chiave: 'vento_kmh',
        etichetta: 'Vento (km/h)',
        tipo: 'numero',
        passo: '0.1',
      },
    ],
  },
  {
    chiave: 'media-accreditati',
    titolo: 'Media accreditati',
    singolare: 'accredito media',
    campi: [
      { chiave: 'nome', etichetta: 'Nome', tipo: 'testo', obbligatorio: true },
      { chiave: 'testata', etichetta: 'Testata', tipo: 'testo' },
      {
        chiave: 'tipo',
        etichetta: 'Tipo',
        tipo: 'select',
        default: 'stampa',
        opzioniStatiche: [
          { valore: 'stampa', etichetta: 'Stampa' },
          { valore: 'tv', etichetta: 'TV' },
          { valore: 'radio', etichetta: 'Radio' },
          { valore: 'foto', etichetta: 'Foto' },
          { valore: 'online', etichetta: 'Online' },
        ],
      },
      {
        chiave: 'tappa_id',
        etichetta: 'Tappa',
        tipo: 'select',
        lookup: 'tappe',
      },
    ],
  },
  {
    chiave: 'comunicati-stampa',
    titolo: 'Comunicati stampa',
    singolare: 'comunicato',
    campi: [
      {
        chiave: 'titolo',
        etichetta: 'Titolo',
        tipo: 'testo',
        obbligatorio: true,
      },
      { chiave: 'contenuto', etichetta: 'Contenuto', tipo: 'textarea' },
      { chiave: 'data', etichetta: 'Data', tipo: 'data' },
      {
        chiave: 'tappa_id',
        etichetta: 'Tappa',
        tipo: 'select',
        lookup: 'tappe',
      },
    ],
  },
];

export function trovaConfigurazione(chiave: string): EntitaConfig | undefined {
  return CONFIGURAZIONI_GENERICHE.find((c) => c.chiave === chiave);
}
