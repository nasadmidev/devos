import { Component } from '@angular/core';
import { PostPreview } from './post-preview/post-preview';
import { DoubtPreview } from './doubt-preview/doubt-preview';
import { ResourcePreview } from './resource-preview/resource-preview';

@Component({
  selector: 'app-home',
  imports: [PostPreview, DoubtPreview, ResourcePreview],
  templateUrl: './home.html',
})
export class Home {}
