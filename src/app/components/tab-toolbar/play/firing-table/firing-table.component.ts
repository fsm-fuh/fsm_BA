import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { filter, Subscription, take } from 'rxjs';

import { DisplayService } from '../../../../services/display.service';
import { PlayService } from '../../../../services/play.service';
import { PlayValidationService } from '../../../../services/play-validation.service';
import { Diagram } from '../../../../classes/diagram/diagram';
import { FiringEntry } from '../../../../classes/firing-entry';

@Component({
    selector: 'app-firing-table',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconButton,
        MatIcon,
        TranslateModule,
    ],
    templateUrl: './firing-table.component.html',
    styleUrl: './firing-table.component.css',
})
export class FiringTableComponent implements OnInit, OnDestroy {
    private _sub?: Subscription;

    private _displayService = inject(DisplayService);
    private _playService = inject(PlayService);
    private _playValidationService = inject(PlayValidationService);

    private readonly _TRANSITION_TIME: number = 1000;

    private _lastFiringSequence: string = '';
    private _diagram: Diagram | undefined;
    @Input() firingEntries: FiringEntry[] = [];

    isFindSequencesModalVisible: boolean = false;
    demandedStartMarking: Record<string, number> = {};
    demandedEndMarking: Record<string, number> = {};
    demandedTransitionCount: number | undefined;
    buttonColor: string = 'basic';

    ngOnInit(): void {
        this._sub = this._displayService.diagram$.subscribe((diagram) => {
            this._diagram = diagram instanceof Diagram ? diagram : undefined;

            this.demandedStartMarking = diagram instanceof Diagram ? { ...diagram.startMarking } : {};

            this.demandedEndMarking =
                diagram instanceof Diagram
                    ? Object.keys(diagram.startMarking).reduce(
                          (acc, key) => {
                              acc[key] = 0;
                              return acc;
                          },
                          {} as { [key: string]: number },
                      )
                    : {};
        });
    }

    ngOnDestroy(): void {
        this._sub?.unsubscribe();
    }

    onKeyUp(entry: FiringEntry, event: KeyboardEvent): void {
        if (entry.firingSequence.trim() === this._lastFiringSequence.trim()) return;
        this._lastFiringSequence = entry.firingSequence;
        if (event.key === 'Enter') this.onNewEntry();
        // TODO: Make validation dependent on current mode (e.g., exam mode)
        else this._playValidationService.validateInput(this._diagram, entry, event);
    }

    onDeleteEntry(id: number): void {
        this._playService.deleteFiringEntry(id);
    }

    onDeleteAllEntries(): void {
        this._playService.resetFiringEntries();
        this._displayService.diagram$
            .pipe(
                take(1),
                filter((diagram) => !!diagram && diagram instanceof Diagram),
            )
            .subscribe((diagram) => {
                diagram.resetMarking();
            });
    }

    onNewEntry(): void {
        if (this._diagram) this._playService.startNewFiringSequence(this._diagram);
    }

    onPlaySequence(entry: FiringEntry): void {
        if (this._diagram) this._playService.playSequence(this._diagram, entry, this._TRANSITION_TIME);
    }

    onFindSequences(): void {
        this.isFindSequencesModalVisible = false;
        if (this._diagram)
            this._playValidationService.findFiringSequences(
                this._diagram,
                this.demandedStartMarking,
                this.demandedEndMarking,
                this.demandedTransitionCount,
            );
    }

    toggleFindSequencesModal(): void {
        this.isFindSequencesModalVisible = !this.isFindSequencesModalVisible;
        this.buttonColor = this.isFindSequencesModalVisible ? 'primary' : 'basic';
    }
}
