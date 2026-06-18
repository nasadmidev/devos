import { Component } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref } from '@angular/router';

@Component({
  selector: 'app-index-layout',
  imports: [RouterOutlet, RouterLinkWithHref],
  templateUrl: './index-layout.html',
})
export class IndexLayout {}
