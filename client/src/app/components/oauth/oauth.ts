import { Component, inject, input, PLATFORM_ID } from '@angular/core';
import { IconDirective } from '@coreui/icons-angular';
import { cibGoogle, cibGithub } from '@coreui/icons';
import { environment } from '@/environments/environment';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-oauth',
  imports: [IconDirective],
  templateUrl: './oauth.html',
  standalone: true,
})
export class Oauth {
  styles = input<string>('');
  protected icons = { cibGoogle, cibGithub };
  protected apiUrl = environment.apiUrl;
  protected isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
}
