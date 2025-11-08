import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiringTableComponent } from './firing-table.component';

describe('FiringTableComponent', () => {
  let component: FiringTableComponent;
  let fixture: ComponentFixture<FiringTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiringTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiringTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
