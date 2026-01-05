import { Component, OnDestroy, OnInit, inject, DestroyRef } from '@angular/core';
import { ProcessNetDisplayComponent } from './process-net-display/process-net-display.component';
import { ProcessNetDrawDisplayComponent } from './process-net-draw-display/process-net-draw-display';
import { DisplayService } from '../../../services/display.service';
import { SourcePetriNetService } from '../../../services/source-petri-net.service';
import { SerializationService } from '../../../services/serialization.service';
import { ParserService } from '../../../services/parser.service';
import { Diagram } from '../../../classes/diagram/diagram';
import { Subscription } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-process-net',
    standalone: true,
    imports: [ProcessNetDisplayComponent, ProcessNetDrawDisplayComponent],
    templateUrl: './process-net.component.html',
    styleUrl: './process-net.component.css',
    providers: [DisplayService],
})
export class ProcessNetComponent implements OnInit, OnDestroy {
    private displayService = inject(DisplayService);
    private sourcePetriNetService = inject(SourcePetriNetService);
    private serializationService = inject(SerializationService);
    private parserService = inject(ParserService);
    private destroyRef = inject(DestroyRef);
    private sub?: Subscription;

    ngOnInit(): void {
        this.pushCloneToLocalDisplay(this.sourcePetriNetService.getCurrentSourceNet());
        this.sub = this.sourcePetriNetService.sourceNet$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((net) => this.pushCloneToLocalDisplay(net));
    }

    ngOnDestroy(): void {
        this.sub?.unsubscribe();
    }

    private pushCloneToLocalDisplay(net: Diagram | null): void {
        if (!net) {
            this.displayService.clear();
            return;
        }
        try {
            const json = this.serializationService.serializeJson(net);
            const clone = this.parserService.parseJson(json);
            if (clone) {
                this.displayService.display(clone);
            } else {
                this.displayService.clear();
            }
        } catch (err) {
            console.error('Failed to clone net for Process Net tab', err);
            this.displayService.clear();
        }
    }
}
