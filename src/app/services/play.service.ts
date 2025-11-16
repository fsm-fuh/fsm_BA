import { inject, Injectable, signal } from '@angular/core';
import { FiringEntry } from '../classes/firing-entry';
import { ToasterNotificationService } from './toaster-notification.service';
import { DiagramTransition } from '../classes/diagram/diagram-transition';
import { Diagram } from '../classes/diagram/diagram';

@Injectable({ providedIn: 'root' })
export class PlayService {
    private _startMarking: Record<string, number> = {};
    private _currentMarking = signal<Record<string, number>>(this._startMarking);

    /**
     * To be implemented:
     * - get endMarking
     * */
    firingEntries = signal<FiringEntry[]>([]);

    private _notificationService = inject(ToasterNotificationService);

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
            this.addTransitionToFiringSequence(node.label);
        } else
            this._notificationService.showWarning(
                'Transition not activated',
                `The transition ${node.label} is not activated and cannot be fired.`,
            );
    }

    addTransitionToFiringSequence(label: string): void {
        this.firingEntries.update((entries) => {
            const lastEntry = entries[entries.length - 1];
            if (lastEntry) {
                lastEntry.firingSequence += label;
                lastEntry.transitionCount += 1;
                lastEntry.endMarking = this._currentMarking();
                return [...entries];
            } else {
                const newEntry: FiringEntry = {
                    id: 0,
                    firingSequence: label,
                    transitionCount: 1,
                    startMarking: this._startMarking,
                    endMarking: this._currentMarking(),
                };
                return [...entries, newEntry];
            }
        });
    }
}
