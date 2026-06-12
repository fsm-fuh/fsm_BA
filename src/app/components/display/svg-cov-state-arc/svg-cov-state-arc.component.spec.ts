import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SvgCovStateArcComponent } from './svg-cov-state-arc.component';

describe('SvgCovStateArcComponent', () => {
    let component: SvgCovStateArcComponent;
    let fixture: ComponentFixture<SvgCovStateArcComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SvgCovStateArcComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(SvgCovStateArcComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
