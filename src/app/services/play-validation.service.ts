import { inject, Injectable } from '@angular/core';

import { ToasterNotificationService } from './toaster-notification.service';
import { PlayService } from './play.service';
import { Diagram } from '../classes/diagram/diagram';
import { FiringEntry } from '../classes/firing-entry';

@Injectable({ providedIn: 'root' })
export class PlayValidationService {
    // TODO:
    // - use notification service to provide user feedback
    // - validate transition count/ marking input
    private _notificationService = inject(ToasterNotificationService);
    private _playService = inject(PlayService);

    /**
     * Validates a firing entry input based on the diagram and the keyboard event.
     * @param diagram
     *          The diagram on which the firing entry is to be validated.
     * @param firingEntry
     *          The firing entry to be validated.
     * @param event
     *          The keyboard event that triggered the validation.
     * @returns
     */
    validateInput(diagram: Diagram | undefined, firingEntry: FiringEntry, event: KeyboardEvent): void {
        if (!diagram || event.key === ' ' || event.key === ',' || event.key === ';') return;
        if (event.key.length === 1 || event.key === 'Backspace' || event.key === 'Delete') {
            firingEntry.transitionCount = firingEntry.labels.length;
            const possibleTransitions: string[] = diagram.transitions.map((t) => t.label || t.id) || [];
            const hasOnlyValidTransitions = this._hasOnlyValidTransitions(possibleTransitions, firingEntry.labels);
            // TODO: provide user feedback if invalid transitions are present
            if (hasOnlyValidTransitions) this._isValidFiringEntry(diagram, firingEntry);
        }
    }

    /**
     * Checks if all labels correspond to (the start of) existing transitions in the diagram.
     * @param possibleTransitions
     *          The transitions present in the diagram.
     * @param labels
     *          The labels to be validated.
     * @returns true if all labels correnspond to (the start of) existing transitions, false otherwise.
     */
    private _hasOnlyValidTransitions(possibleTransitions: string[], labels: string[]): boolean {
        if (labels.length === 0) return true;
        if (possibleTransitions.length === 0 && labels.length > 0) return false;
        return labels.every(
            (label) =>
                possibleTransitions.includes(label) ||
                possibleTransitions.some((transition) => transition.startsWith(label)),
        );
    }

    /**
     * Checks whether a firing entry is valid for a given diagram.
     * @param diagram
     *          The diagram on which the firing entry is to be validated.
     * @param firingEntry
     *          The firing entry to be validated.
     * @returns true if the firing entry is valid, false otherwise.
     */
    private _isValidFiringEntry(diagram: Diagram, firingEntry: FiringEntry): boolean {
        const endMarking: string = firingEntry.formattedEndMarking;
        this._playService.playSequence(diagram, firingEntry, 0);
        return endMarking === firingEntry.formattedEndMarking;
    }
}
