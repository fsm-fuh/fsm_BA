import { inject, Injectable, signal } from '@angular/core';
import { FiringEntry } from '../classes/firing-entry';
import { ToasterNotificationService } from './toaster-notification.service';
import { DiagramTransition } from '../classes/diagram/diagram-transition';
import { Diagram } from '../classes/diagram/diagram';
import { SourcePetriNetService } from './source-petri-net.service';

@Injectable({ providedIn: 'root' })
export class PlayService {
    private _notificationService = inject(ToasterNotificationService);
    private _sourceNetService = inject(SourcePetriNetService);

    private _startMarking: Record<string, number> = {};
    private _currentMarking = signal<Record<string, number>>(this._startMarking);
    firingEntries = signal<FiringEntry[]>([]);

    set startMarking(marking: Record<string, number>) {
        this._startMarking = marking;
    }

    set currentMarking(marking: Record<string, number>) {
        this._currentMarking.set(marking);
    }

    resetFiringEntries(): void {
        this.firingEntries.set([]);
    }

    processTransitionClick(diagram: Diagram, node: DiagramTransition): void {
        if (node.isActivated()) {
            node.fire();
            diagram.updateMarking();
            this._sourceNetService.updateEditedNet(diagram);
            this._addTransitionToFiringSequence(node.label);
        } else
            this._notificationService.showWarning(
                'Transition not activated',
                `The transition ${node.label} is not activated and cannot be fired.`,
            );
    }

    private _addTransitionToFiringSequence(label: string): void {
        this.firingEntries.update((entries) => {
            let lastEntry = entries[entries.length - 1];
            if (lastEntry) {
                lastEntry = this._updateFiringEntry(lastEntry, label);
                return [...entries];
            }
            const newEntry: FiringEntry = {
                id: 0,
                firingSequence: label,
                transitionCount: 1,
                startMarking: this._startMarking,
                endMarking: this._currentMarking(),
            };
            return [...entries, newEntry];
        });
    }

    private _updateFiringEntry(entry: FiringEntry, label: string): FiringEntry {
        entry.firingSequence += ` ${label}`;
        entry.transitionCount += 1;
        entry.endMarking = this._currentMarking();
        return entry;
    }
}
