import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndexLayout } from './index-layout';

describe('IndexLayout', () => {
  let component: IndexLayout;
  let fixture: ComponentFixture<IndexLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndexLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(IndexLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
