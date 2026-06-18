import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourcePreview } from './resource-preview';

describe('ResourcePreview', () => {
  let component: ResourcePreview;
  let fixture: ComponentFixture<ResourcePreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourcePreview],
    }).compileComponents();

    fixture = TestBed.createComponent(ResourcePreview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
