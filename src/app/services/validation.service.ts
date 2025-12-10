// Service / utility for validating a drawn process net against the original Petri net
// Based on user-provided specification, with minor fixes (e.g., producer count increment).

export interface PetriNet {
    places: string[];
    transitions: string[];
    arcs: Record<string, number>; // key: "source,target" -> weight
    labels: Record<string, string>; // original transition id -> label (e.g. t1 -> A)
    marking?: Record<string, number>;
    startPlaces?: string[];
}

export interface ProcessElement {
    id: string;
    type: 'Place' | 'Transition';
    label: string; // places: original place id (e.g. p4), transitions: action label (e.g. A/B/C/...)
    isStartPlace?: boolean;
}

export interface ProcessConnection {
    from: string; // element id
    to: string; // element id
    weight: number; // arc weight in the process net (>= 1)
}

export interface ValidationResult {
    valid: boolean;
    errors: string[];
    infos: string[];
}

interface OriginalNetShape {
    pre: Record<string, string[]>;
    post: Record<string, string[]>;
    preWeights: Record<string, Record<string, number>>;
    postWeights: Record<string, Record<string, number>>;
}

function buildOriginalNetShape(net: PetriNet): OriginalNetShape {
    const shape: OriginalNetShape = {
        pre: {},
        post: {},
        preWeights: {},
        postWeights: {},
    };

    net.transitions.forEach((t) => {
        shape.pre[t] = [];
        shape.post[t] = [];
        shape.preWeights[t] = {};
        shape.postWeights[t] = {};
    });

    Object.entries(net.arcs).forEach(([arc, rawWeight]) => {
        const [from, to] = arc.split(',');
        const weight = rawWeight ?? 1;
        if (net.places.includes(from) && net.transitions.includes(to)) {
            shape.pre[to].push(from);
            shape.preWeights[to][from] = weight;
        } else if (net.transitions.includes(from) && net.places.includes(to)) {
            shape.post[from].push(to);
            shape.postWeights[from][to] = weight;
        }
    });

    return shape;
}

export function validateProcessNet(
    net: PetriNet,
    elements: ProcessElement[],
    connections: ProcessConnection[],
): ValidationResult {
    const errors: string[] = [];
    const infos: string[] = [];

    const elementMap = new Map<string, ProcessElement>(elements.map((e) => [e.id, e]));
    const placeLabelById = new Map<string, string>();
    const transitionLabelById = new Map<string, string>();
    elements.forEach((el) => {
        if (el.type === 'Place') {
            placeLabelById.set(el.id, el.label);
        } else {
            transitionLabelById.set(el.id, el.label);
        }
    });

    const connectionsByTarget: Record<string, ProcessConnection[]> = {};
    const connectionsBySource: Record<string, ProcessConnection[]> = {};
    connections.forEach((conn) => {
        (connectionsBySource[conn.from] ||= []).push(conn);
        (connectionsByTarget[conn.to] ||= []).push(conn);
    });

    const originalNetShape = buildOriginalNetShape(net);

    const errorsFromStructure = validateTransitionsForStructure(
        net,
        elements,
        connections,
        elementMap,
        originalNetShape,
    );
    errors.push(...errorsFromStructure);

    const errorsFromPlaces = validatePlaceInputs(net, elements, connectionsByTarget);
    errors.push(...errorsFromPlaces);

    const errorsFromProducerLimit = validateProducerUniqueness(elements, connections, elementMap);
    errors.push(...errorsFromProducerLimit);

    const errorsFromStartPlaces = validateStartPlacesPresence(net, elements);
    errors.push(...errorsFromStartPlaces);

    const errorsFromCycles = validateAcyclicity(elements, connections);
    errors.push(...errorsFromCycles);

    const errorsFromMaximality = validateMaximality(net, elements, connectionsBySource, originalNetShape);
    infos.push(...errorsFromMaximality);

    return {
        valid: errors.length === 0,
        errors,
        infos,
    };
}

function validateTransitionsForStructure(
    net: PetriNet,
    elements: ProcessElement[],
    connections: ProcessConnection[],
    elementMap: Map<string, ProcessElement>,
    originalShape: OriginalNetShape,
): string[] {
    const errors: string[] = [];

    const mapLabelToTransition = (label: string): string | undefined =>
        Object.keys(net.labels).find((t) => net.labels[t] === label);

    const { pre: origPre, post: origPost, preWeights: origPreW, postWeights: origPostW } = originalShape;

    // --------- 3) Process net pre/post sets (by label) and weights ---------
    const procPre: Record<string, string[]> = {};
    const procPost: Record<string, string[]> = {};
    const procPreW: Record<string, Record<string, number>> = {}; // tOcc -> placeLabel -> sum weight
    const procPostW: Record<string, Record<string, number>> = {}; // tOcc -> placeLabel -> sum weight

    elements
        .filter((e) => e.type === 'Transition')
        .forEach((t) => {
            procPre[t.id] = [];
            procPost[t.id] = [];
            procPreW[t.id] = {};
            procPostW[t.id] = {};
        });

    connections.forEach((c) => {
        const src = elementMap.get(c.from);
        const tgt = elementMap.get(c.to);
        if (!src || !tgt) return;

        if (src.type === 'Place' && tgt.type === 'Transition') {
            // store original place label (already the original id)
            procPre[tgt.id].push(src.label);
            procPreW[tgt.id][src.label] = (procPreW[tgt.id][src.label] || 0) + (c.weight || 1);
        }
        if (src.type === 'Transition' && tgt.type === 'Place') {
            procPost[src.id].push(tgt.label);
            procPostW[src.id][tgt.label] = (procPostW[src.id][tgt.label] || 0) + (c.weight || 1);
        }
    });

    elements
        .filter((e) => e.type === 'Transition')
        .forEach((tOcc) => {
            const originalT = mapLabelToTransition(tOcc.label);
            if (!originalT) {
                errors.push(`❌ Transition ${tOcc.label} hat keine passende Beschriftung im Petrinetz.`);
                return;
            }

            const normalize = (values: string[]) => Array.from(new Set(values)).sort();

            const expectedPre = origPre[originalT];
            const actualPre = procPre[tOcc.id];
            const expectedPreSet = normalize(expectedPre);
            const actualPreSet = normalize(actualPre);
            if (JSON.stringify(expectedPreSet) !== JSON.stringify(actualPreSet)) {
                errors.push(
                    `❌ Vorbereich falsch bei ${tOcc.label}. Erwartet: ${expectedPreSet.join(',')} / Gefunden: ${actualPreSet.join(',')}`,
                );
            } else {
                // If structure matches, verify weights for each required place label
                expectedPreSet.forEach((pl) => {
                    const expW = origPreW[originalT][pl] ?? 1;
                    const actW = procPreW[tOcc.id][pl] ?? 0;
                    if (expW !== actW) {
                        errors.push(
                            `❌ Vorbereichsgewicht falsch bei ${tOcc.label} für Stelle ${pl}. Erwartet: ${expW} / Gefunden: ${actW}`,
                        );
                    }
                });
            }

            const expectedPost = origPost[originalT];
            const actualPost = procPost[tOcc.id];
            const expectedPostSet = normalize(expectedPost);
            const actualPostSet = normalize(actualPost);
            if (JSON.stringify(expectedPostSet) !== JSON.stringify(actualPostSet)) {
                errors.push(
                    `❌ Nachbereich falsch bei ${tOcc.label}. Erwartet: ${expectedPostSet.join(',')} / Gefunden: ${actualPostSet.join(',')}`,
                );
            } else {
                expectedPostSet.forEach((pl) => {
                    const expW = origPostW[originalT][pl] ?? 1;
                    const actW = procPostW[tOcc.id][pl] ?? 0;
                    if (expW !== actW) {
                        errors.push(
                            `❌ Nachbereichsgewicht falsch bei ${tOcc.label} für Stelle ${pl}. Erwartet: ${expW} / Gefunden: ${actW}`,
                        );
                    }
                });
            }
        });

    return errors;
}

function validatePlaceInputs(
    net: PetriNet,
    elements: ProcessElement[],
    connectionsByTarget: Record<string, ProcessConnection[]>,
): string[] {
    const errors: string[] = [];

    elements
        .filter((el) => el.type === 'Place')
        .forEach((place) => {
            const isStartNode = place.isStartPlace ?? false;
            const incoming = connectionsByTarget[place.id] || [];
            if (!isStartNode && incoming.length === 0) {
                errors.push(
                    `❌ Stelle ${place.label} besitzt keinen eingehenden Bogen, obwohl sie kein Startplatz in diesem Prozessnetz ist.`,
                );
            }
        });

    return errors;
}

function validateProducerUniqueness(
    elements: ProcessElement[],
    connections: ProcessConnection[],
    elementMap: Map<string, ProcessElement>,
): string[] {
    const errors: string[] = [];
    const producerCount: Record<string, number> = {};
    connections.forEach((conn) => {
        const src = elementMap.get(conn.from);
        const tgt = elementMap.get(conn.to);
        if (src?.type === 'Transition' && tgt?.type === 'Place') {
            producerCount[tgt.id] = (producerCount[tgt.id] || 0) + 1;
        }
    });

    Object.entries(producerCount).forEach(([placeId, count]) => {
        if (count > 1) {
            errors.push(`❌ Stelle ${placeId} hat mehr als einen Produzenten – verletzt Kausalität.`);
        }
    });
    return errors;
}

function validateAcyclicity(elements: ProcessElement[], connections: ProcessConnection[]): string[] {
    const errors: string[] = [];
    const graph: Record<string, string[]> = {};
    elements.forEach((el) => (graph[el.id] = []));
    connections.forEach((c) => graph[c.from].push(c.to));

    const visited = new Set<string>();
    const stack = new Set<string>();

    const visit = (node: string): boolean => {
        if (stack.has(node)) return true;
        if (visited.has(node)) return false;
        visited.add(node);
        stack.add(node);
        for (const nxt of graph[node]) {
            if (visit(nxt)) return true;
        }
        stack.delete(node);
        return false;
    };

    if (Object.keys(graph).some((node) => visit(node))) {
        errors.push('❌ Prozessnetz enthält einen Zyklus – Prozessnetze müssen azyklisch sein.');
    }

    return errors;
}

function validateStartPlacesPresence(net: PetriNet, elements: ProcessElement[]): string[] {
    const errors: string[] = [];
    const requiredStartPlaces = new Set(
        Object.entries(net.marking ?? {})
            .filter(([, tokens]) => (tokens ?? 0) > 0)
            .map(([placeId]) => placeId),
    );
    if (requiredStartPlaces.size === 0) {
        return errors;
    }

    const providedStartPlaces = new Set(net.startPlaces ?? []);
    const missingProvided = [...requiredStartPlaces].filter((placeId) => !providedStartPlaces.has(placeId));
    if (missingProvided.length > 0) {
        errors.push(
            `❌ Startplätze fehlen im Prozessnetz: ${missingProvided.join(', ')}. Bitte alle markierten Plätze platzieren.`,
        );
    }

    const drawnPlaceLabels = new Set(elements.filter((el) => el.type === 'Place').map((el) => el.label));
    const missingDrawn = [...requiredStartPlaces].filter((placeId) => !drawnPlaceLabels.has(placeId));
    if (missingDrawn.length > 0) {
        errors.push(`❌ Die markierten Startplätze (${missingDrawn.join(', ')}) befinden sich nicht im Prozessnetz.`);
    }

    return errors;
}

function validateMaximality(
    net: PetriNet,
    elements: ProcessElement[],
    connectionsBySource: Record<string, ProcessConnection[]>,
    originalShape: OriginalNetShape,
): string[] {
    const infos: string[] = [];

    const terminalPlaces = elements.filter(
        (el) => el.type === 'Place' && (connectionsBySource[el.id] ?? []).length === 0,
    );
    if (terminalPlaces.length === 0) {
        return infos;
    }

    const terminalLabelCounts: Record<string, number> = {};
    terminalPlaces.forEach((place) => {
        terminalLabelCounts[place.label] = (terminalLabelCounts[place.label] || 0) + 1;
    });

    net.transitions.forEach((transitionId) => {
        const requiredPlaces = originalShape.pre[transitionId] || [];
        if (requiredPlaces.length === 0) {
            return;
        }

        const allPlacesSatisfied = requiredPlaces.every((placeId) => {
            const needed = originalShape.preWeights[transitionId][placeId] ?? 1;
            return (terminalLabelCounts[placeId] ?? 0) >= needed;
        });

        if (allPlacesSatisfied) {
            const transitionLabel = net.labels[transitionId] ?? transitionId;
            infos.push(
                `Info: Prozessnetz ist nicht maximal. Transition ${transitionLabel} kann mit den Stellen (${requiredPlaces.join(
                    ', ',
                )}) noch ausgeführt werden.`,
            );
        }
    });

    return infos;
}
