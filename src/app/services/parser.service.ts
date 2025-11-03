import { Injectable } from '@angular/core';
import { Diagram } from '../classes/diagram/diagram';
import { DiagramNode } from '../classes/diagram/diagram-node';
import { DiagramArc } from '../classes/diagram/diagram-arc';
import { Coords, JsonPetriNet } from '../classes/json-petri-net';
import { DiagramPlace } from '../classes/diagram/diagram-place';
import { DiagramTransition } from '../classes/diagram/diagram-transition';

@Injectable({
    providedIn: 'root',
})
export class ParserService {
    parse(text: string): Diagram | undefined {
        try {
            const rawData = JSON.parse(text) as JsonPetriNet;

            // Get marking and labels data
            const marking = rawData['marking'] || {};
            const labels = rawData['labels'] || {};

            // Parse places and transitions as nodes
            const places = this.parsePlaces(rawData['places'], marking);
            const transitions = this.parseTransitions(rawData['transitions'], labels);

            const allNodes = [...places, ...transitions];
            this.setPosition(allNodes, rawData['layout']);

            // Parse arcs
            const arcs = this.parseArcs(rawData['arcs'], rawData['layout']);

            return new Diagram(places, transitions, arcs);
        } catch (e) {
            console.error('Error while parsing JSON', e, text);
            return undefined;
        }
    }

    private parsePlaces(placeIds: string[] | undefined, marking: Record<string, number>): DiagramPlace[] {
        if (!placeIds || !Array.isArray(placeIds)) {
            return [];
        }
        return placeIds.map((id) => {
            const initialTokens = marking[id] || 0;
            return new DiagramPlace(id, initialTokens);
        });
    }

    private parseTransitions(transitionIds: string[] | undefined, labels: Record<string, string>): DiagramTransition[] {
        if (!transitionIds || !Array.isArray(transitionIds)) {
            return [];
        }
        return transitionIds.map((id) => {
            const label = labels[id] || id;
            return new DiagramTransition(id, label);
        });
    }

    private parseArcs(arcs: Record<string, number> | undefined, layout: JsonPetriNet['layout']): DiagramArc[] {
        if (!arcs) {
            return [];
        }
        const result: DiagramArc[] = [];
        for (const [arcId, weight] of Object.entries(arcs)) {
            const [source, target] = arcId.split(',');
            if (source && target) {
                const bendPoints = this.getBendPoints(arcId, layout);

                result.push(new DiagramArc(arcId, source, target, weight, bendPoints));
            }
        }
        return result;
    }

    private getBendPoints(arcId: string, layout: JsonPetriNet['layout']): Coords[] {
        if (!layout || !layout[arcId]) {
            return [];
        }

        const layoutData = layout[arcId];
        if (Array.isArray(layoutData)) {
            return layoutData;
        }

        return [];
    }

    private setPosition(elements: DiagramNode[], layout: JsonPetriNet['layout']) {
        if (layout === undefined) {
            return;
        }

        for (const el of elements) {
            const pos = layout[el.id] as Coords | undefined;
            if (pos !== undefined) {
                el.x = pos.x;
                el.y = pos.y;
            }
        }
    }
}
