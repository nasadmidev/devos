import { Service } from '@angular/core';
import ms, { StringValue } from 'ms';

@Service()
export class CookieService {
  setCookie({ name, value, expires }: { name: string, value: string, expires?: StringValue }) {
    const date = new Date();
    if (expires) date.setTime(date.getTime() + ms(expires));
    document.cookie = `${name}=${value} ${expires ? `; expires=${date.toUTCString()}` : ''}; path=/`;
  }

  getCookie(name: string) {
    const cookies = document.cookie.split(' ').map(cookie => ({ name: cookie.split('=')[0], value: cookie.split('=')[1] }));
    return cookies.find((cookie) => cookie.name === name);
  }

  eraseCookie(name: string) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`
  }
}
