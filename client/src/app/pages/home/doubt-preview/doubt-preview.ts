import { Component } from '@angular/core';
import { Highlight } from 'ngx-highlightjs';

@Component({
  selector: 'app-doubt-preview',
  imports: [Highlight],
  templateUrl: './doubt-preview.html',
  standalone: true,
})
export class DoubtPreview {}
