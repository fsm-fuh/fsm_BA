import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CgMarkingDialogComponent } from './cg-marking-dialog.component';

describe('CgMarkingDialogComponent', () => {
  let component: CgMarkingDialogComponent;
  let fixture: ComponentFixture<CgMarkingDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CgMarkingDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CgMarkingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
