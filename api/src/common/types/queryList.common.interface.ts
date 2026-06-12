export interface QueryListDTO<T> {
  lastIndex?: string;
  limit?: string;
  select?: Array<keyof T>;
}
