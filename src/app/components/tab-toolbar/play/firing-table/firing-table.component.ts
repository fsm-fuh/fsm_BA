import { Component, inject, Input, model } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { PlayService } from '../../../../services/play.service';
import { FiringEntry } from '../../../../classes/firing-entry';
import { DisplayService } from '../../../../services/display.service';
import { filter, take } from 'rxjs';
import { Diagram } from 'src/app/classes/diagram/diagram';

@Component({
    selector: 'app-firing-table',
    standalone: true,
    imports: [MatIconButton, MatIcon],
    templateUrl: './firing-table.component.html',
    styleUrl: './firing-table.component.css',
})
export class FiringTableComponent {
    private _playService = inject(PlayService);
    private _displayService = inject(DisplayService);

    @Input() firingEntries: FiringEntry[] = [];

    formatMarking(marking: Record<string, number>): string {
        return Object.entries(marking)
            .map(([key, value]) => `${key}:${value}`)
            .join(', ');
    }

    onDeleteEntry(id: number): void {
        this._playService.deleteFiringEntry(id);
    }

    onDeleteAllEntries(): void {
        this._playService.resetFiringEntries();
        this._displayService.diagram$
            .pipe(
                take(1), // Nimm nur den aktuellen Wert
                filter((diagram) => !!diagram && diagram instanceof Diagram),
            )
            .subscribe((diagram) => {
                diagram.resetMarking();
            });
    }
}
