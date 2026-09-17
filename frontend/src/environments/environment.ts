// Ambiente di sviluppo: il backend Express gira di default su localhost:3000.
// In produzione, se il frontend viene servito da un dominio diverso dal
// backend, modificare apiUrl/socketUrl con l'indirizzo pubblico del server.
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  socketUrl: 'http://localhost:3000',
};
