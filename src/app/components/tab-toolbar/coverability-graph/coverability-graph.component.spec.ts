import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoverabilityGraphComponent } from './coverability-graph.component';

describe('CoverabilityGraphComponent', () => {
  let component: CoverabilityGraphComponent;
  let fixture: ComponentFixture<CoverabilityGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoverabilityGraphComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoverabilityGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
