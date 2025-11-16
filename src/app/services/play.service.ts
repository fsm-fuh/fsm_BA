import { inject, Injectable, signal } from '@angular/core';
import { FiringEntry } from '../classes/firing-entry';
import { ToasterNotificationService } from './toaster-notification.service';
import { DiagramTransition } from '../classes/diagram/diagram-transition';

@Injectable({ providedIn: 'root' })
export class PlayService {
    /**
     * To be implemented:
     * - get endMarking
     * */
    firingEntries = signal<FiringEntry[]>([]);

    private _notificationService = inject(ToasterNotificationService);

    resetFiringEntries(): void {
        this.firingEntries.set([]);
    }

    processTransitionClick(node: DiagramTransition): void {
        if (node.isActivated()) {
            node.fire();
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
                return [...entries];
            } else {
                const newEntry: FiringEntry = {
                    id: 0,
                    firingSequence: label,
                    transitionCount: 1,
                    endMarking: '', // To be implemented
                };
                return [...entries, newEntry];
            }
        });
    }
}
