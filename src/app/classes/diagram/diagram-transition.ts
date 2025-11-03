import { DiagramNode, SHAPE } from './diagram-node';

export class DiagramTransition extends DiagramNode {
    private readonly _label: string;

    constructor(id: string, label: string) {
        super(id);
        this._label = label || id;
    }

    get label(): string {
        return this._label;
    }

    override get shape(): SHAPE {
        return SHAPE.RECT;
    }

    override get displayLabel(): string {
        return this._label;
    }
}
