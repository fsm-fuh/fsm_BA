import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoverabilityGraphDrawDisplayComponent } from './coverability-graph-draw-display.component';

describe('CoverabilityGraphDrawDisplayComponent', () => {
  let component: CoverabilityGraphDrawDisplayComponent;
  let fixture: ComponentFixture<CoverabilityGraphDrawDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoverabilityGraphDrawDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoverabilityGraphDrawDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
