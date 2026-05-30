import { DisplayableEdge, DisplayableGraph, DisplayableNode } from './displayable-graph.interface';
import { SHAPE } from './diagram/diagram-node';
import { Coords } from './json-petri-net';
import { signal, Signal, WritableSignal } from '@angular/core';
import { Visited } from './visited';

/**
 * custom type for representing marking in CovGraph as a string (to ensure type safety with changed record type for MatDialog)
 */
export class CovMarkingStringSaver {
    markingKeyString: string;
    markingValueString: string;

    constructor(markingKeyString: string, markingValueString: string) {
        this.markingKeyString = markingKeyString;
        this.markingValueString = markingValueString;
    }
}
/**
 * A node representing a state in the coverability graph.
 */
export class CoverabilityStateNode implements DisplayableNode {
    id: string;
    _x: WritableSignal<number>;
    _y: WritableSignal<number>;
    label: string;
    covMarking: Record<string, number>;
    nodeVisitedStateForAlgorithm: Visited = Visited.WHITE;
    nodeVisitedStateForLimitCheck = false;
    isStartingState = false;
    predecessors: CoverabilityStateNode[] = [];
    successors: CoverabilityStateNode[] = [];
    isMorMStrich = false;
    tokenSum = 0;
    firingPath: string;
    //Array, in which positions of omega values are marked with boolean, initially empty
    omegaPositions: boolean[] = [];

    //TODO add additional marking as string, string, which is always updated when marking changes (on each new stateNode)
    // covMarkingAsStringRecord: Record<string, string> = {};
    covMarkingAsStringRecord: CovMarkingStringSaver[] = [];

    get shape(): SHAPE {
        return SHAPE.CIRCLE;
    }
    get displayLabel(): string {
        return `(${this.label.replace(/ /g, ',')})`;
    }

    get tokenCount(): Signal<number> {
        return signal(0);
    }

    constructor(id: string, x: number, y: number, label: string, marking: Record<string, number>, firingPath = '') {
        this.id = id;
        this._x = signal(x);
        this._y = signal(y);
        this.label = label;
        this.covMarking = marking;
        this.firingPath = firingPath;

        this.calculateTokenSum(marking);
        //initialize all Omega positions to false (no omega contained in covStateNode on creation)
        this.initializeOmegaPositionsArray(marking);
        
        this.convertMarkingToStringMarking(marking);
        console.log('omegaPositions' + this.omegaPositions);
        for (const stringRecord of this.covMarkingAsStringRecord) {
            console.log(
                'covMarkingAsStringRecord place AFTER INIT  ' +
                    stringRecord.markingKeyString +
                    '  covMarkingAsStringRecord value AFTER INIT ' +
                    stringRecord.markingValueString,
            );
        }
    }

    get x(): number {
        return this._x();
    }

    set x(value: number) {
        this._x.set(value);
    }

    get y(): number {
        return this._y();
    }

    set y(value: number) {
        this._y.set(value);
    }

    private calculateTokenSum(marking: Record<string, number>) {
        console.log('calculateTokenSum' + this.id);
        for (const tokens of Object.values(marking)) {
            this.tokenSum = this.tokenSum + tokens;
            console.log('calculatedSum' + this.tokenSum);
        }
    }

    /**
     * Initializes values of OmegaPositions-Array to false
     * Length is the same as marking length, positions of array equal positions of the marking (first place in record is also first in boolean array, later used in comparing function)
     * @param marking marking of the state node
     */
    private initializeOmegaPositionsArray(marking: Record<string, number>) {
        console.log('initializeOmegaPositionsArray ' + this.id);
        for (const positions of Object.entries(marking)) {
            this.omegaPositions.push(false);
        }
    }

    //TODO HIER TYP ÄNDERN, ggf. neu definieren als Objekt, das number oder string enthalten kann?
    private convertMarkingToStringMarking(marking: Record<string, number>) {
        let tempKey: string = '';
        let tempValue: string = '';
        let tempStringSaver: CovMarkingStringSaver;
        Object.entries(marking).forEach(
            ([key, value]) => (
                (tempKey = key),
                (tempValue = value.toString()),
                (tempStringSaver = new CovMarkingStringSaver(tempKey, tempValue)),
                this.covMarkingAsStringRecord.push(tempStringSaver),
                console.log(
                    'covMarkingAsStringRecord tempKey  ' +
                        tempKey +
                        '  covMarkingAsStringRecord tempValue ' +
                        tempValue,
                )
            ),
        );
        // console.log('covMarkingAsStringRecord ' + this.covMarkingAsStringRecord);
    }
}

/**
 * An edge representing a transition firing in the reachability graph.
 */
export class CoverabilityFiringEdge implements DisplayableEdge {
    id: string;
    source: string;
    target: string;
    displayLabel: string;
    bendPoints: Coords[] = [];
    rgFiringSequencePath: string;
    isPartOfUnlimitedPath = false;

    constructor(id: string, source: string, target: string, transitionLabel: string, firedSequence: string) {
        this.id = id;
        this.source = source;
        this.target = target;
        this.displayLabel = transitionLabel;
        this.rgFiringSequencePath = firedSequence;
    }
}

/**
 * The coverability graph of a Petri net.
 */
export class CoverabilityGraph implements DisplayableGraph {
    nodes: CoverabilityStateNode[] = [];
    edges: CoverabilityFiringEdge[] = [];
    isUnlimited = false;
    breakLoop = false;
    omegaValuesExistInGraph: boolean = false;

    getNodes(): DisplayableNode[] {
        return this.nodes;
    }
    getEdges(): DisplayableEdge[] {
        return this.edges;
    }
}
