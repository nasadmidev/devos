export default interface HealthResponse {
  status: 'error' | 'ok' | 'shutting_down';
  info: object;
  error: object;
  details: object;
}
