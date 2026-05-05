import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SvgCovStateNodeComponent } from './svg-cov-state-node.component';

describe('SvgCovStateNodeComponent', () => {
  let component: SvgCovStateNodeComponent;
  let fixture: ComponentFixture<SvgCovStateNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SvgCovStateNodeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SvgCovStateNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
