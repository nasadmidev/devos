export default interface ApiResponse<T = unknown> {
  path: string;
  statusCode: number;
  date: string;
  data: T;
}
