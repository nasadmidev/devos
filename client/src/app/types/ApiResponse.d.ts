export default interface ApiResponse<T = any> {
  path: string;
  statusCode: number;
  date: string;
  data: T;
}
