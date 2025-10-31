import { SHAPE } from './diagram/diagram-node';
import { Coords } from './json-petri-net'; // Dein SHAPE-Enum

/**
 * Contract for every node that can be displayed.
 */
export interface DisplayableNode {
    id: string;
    x: number;
    y: number;

    readonly shape: SHAPE;
    readonly displayLabel: string;
    readonly tokenCount: number;
    //readonly isEnabled: boolean;
}

/**
 * Contract for every edge that can be displayed.
 */
export interface DisplayableEdge {
    id: string;
    source: string;
    target: string;

    readonly displayLabel: string;
    readonly bendPoints: Coords[];
}

/**
 * Contract for a graph that can be displayed.
 */
export interface DisplayableGraph {
    getNodes(): DisplayableNode[];
    getEdges(): DisplayableEdge[];
}
