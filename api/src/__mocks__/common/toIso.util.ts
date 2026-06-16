export default function toIso<T>(obj: T, keys: Array<keyof T>) {
  for (const k of keys) {
    if (obj[k] instanceof Date) {
      obj[k as string] = obj[k].toISOString();
    }
  }
  return obj;
}
