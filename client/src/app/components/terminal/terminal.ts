import { Component, input } from '@angular/core';
import { Highlight } from 'ngx-highlightjs';

@Component({
  selector: 'app-terminal',
  imports: [Highlight],
  templateUrl: './terminal.html',
})
export class Terminal {
  value = input<string>('');
}
