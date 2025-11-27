import { inject, Injectable, signal } from '@angular/core';
import { FiringEntry } from '../classes/firing-entry';
import { ToasterNotificationService } from './toaster-notification.service';
import { DiagramTransition } from '../classes/diagram/diagram-transition';
import { Diagram } from '../classes/diagram/diagram';
import { SourcePetriNetService } from './source-petri-net.service';
import { TabStateService } from './tab-state.service';
import { Tab } from '../classes/tabs';

@Injectable({ providedIn: 'root' })
export class PlayService {
    private _notificationService = inject(ToasterNotificationService);
    private _sourceNetService = inject(SourcePetriNetService);
    private _tabStateService = inject(TabStateService);

    private _startMarking: Record<string, number> = {};
    private _currentMarking = signal<Record<string, number>>(this._startMarking);
    private _idCounter = 0;

    firingEntries = signal<FiringEntry[]>([this._getEmptyFiringEntry()]);

    set startMarking(marking: Record<string, number>) {
        this._startMarking = marking;
    }

    set currentMarking(marking: Record<string, number>) {
        this._currentMarking.set(marking);
    }

    /**
     * Clears all firing entries in the firing sequence table.
     */
    resetFiringEntries(): void {
        this.firingEntries.set([this._getEmptyFiringEntry()]);
    }

    /**
     * Fires a transition if it is activated, updates the diagram
     * and records the firing in the firing sequence.
     * @param diagram The diagram containing the transition.
     * @param node The transition node to be fired.
     */
    processTransitionClick(diagram: Diagram, node: DiagramTransition): void {
        if (node.isActivated()) {
            node.fire();
            diagram.updateMarking();
            this._sourceNetService.updateEditedNet(diagram);
            this._addTransitionToFiringSequence(diagram, node.label);
        } else
            this._notificationService.showWarning(
                'Transition not activated',
                `The transition ${node.label} is not activated and cannot be fired.`,
            );
    }

    isTransitionAndActivated(node: DiagramTransition): boolean {
        return this._tabStateService.currentTab() === Tab.PLAY && node.isActivated();
    }

    /**
     * Starts a new, empty firing sequence.
     */
    startNewFiringSequence() {
        this._closeLastFiringEntry();
        this.firingEntries.update((entries) => {
            entries.push(this._getEmptyFiringEntry());
            return entries;
        });
    }

    /**
     * Deletes a firing entry from the firing sequence table.
     * @param id The ID of the firing entry that is to be deleted
     */
    deleteFiringEntry(id: number): void {
        this.firingEntries.update((entries) => entries.filter((entry) => entry.id !== id));
    }

    /**
     * Updates the current firing entry when a transition is fired.
     * If no entry exists, creates a new one.
     * @param label The label of the fired transition.
     */
    private _addTransitionToFiringSequence(diagram: Diagram, label: string): void {
        this.firingEntries.update((entries) => {
            let lastEntry = entries[entries.length - 1];
            if (lastEntry) lastEntry = this._updateFiringEntry(diagram, lastEntry, label);
            return entries;
        });
    }

    /**
     * Appends the label of a fired transition to a firing sequence
     * and updates transition count and end marking accordingly.
     * @param entry The entry to be updated.
     * @param label The label of the fired transition.
     * @returns The updated firing entry.
     */
    private _updateFiringEntry(diagram: Diagram, entry: FiringEntry, label: string): FiringEntry {
        entry.firingSequence += ` ${label}`;
        entry.transitionCount += 1;
        entry.endMarking = this._currentMarking();
        return entry;
    }

    /**
     * Closes the last firing entry in the sequence, preventing further updates to it.
     */
    private _closeLastFiringEntry(): void {
        this.firingEntries.update((entries) => {
            let lastEntry = entries[entries.length - 1];
            if (lastEntry && !lastEntry.isClosed) lastEntry.isClosed = true;
            return entries;
        });
    }

    /**
     * Creates a new empty firing entry with start values.
     * @returns A firing entry with an empty sequence
     */
    private _getEmptyFiringEntry(): FiringEntry {
        return {
            id: this._getNewId(),
            firingSequence: '',
            transitionCount: 0,
            startMarking: this._startMarking,
            endMarking: this._startMarking,
            isClosed: false,
        };
    }

    /**
     * Generates a new unique ID for a firing entry.
     * @returns The new ID
     */
    private _getNewId(): number {
        return this._idCounter++;
    }
}
