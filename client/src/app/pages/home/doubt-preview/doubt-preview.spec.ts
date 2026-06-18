import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoubtPreview } from './doubt-preview';

describe('DoubtPreview', () => {
  let component: DoubtPreview;
  let fixture: ComponentFixture<DoubtPreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoubtPreview],
    }).compileComponents();

    fixture = TestBed.createComponent(DoubtPreview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
