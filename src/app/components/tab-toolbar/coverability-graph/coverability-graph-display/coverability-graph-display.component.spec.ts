import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoverabilityGraphDisplayComponent } from './coverability-graph-display.component';

describe('CoverabilityGraphDisplayComponent', () => {
  let component: CoverabilityGraphDisplayComponent;
  let fixture: ComponentFixture<CoverabilityGraphDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoverabilityGraphDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoverabilityGraphDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
