import { Component, computed, input, output } from '@angular/core';
import { StateNode } from '../../../classes/reachability-graph.model';
import { GeometryUtil } from '../../../utils/geometry.util';
import { VIEW_MODES, ViewMode } from '../display.constants';
import { CoverabilityStateNode } from 'src/app/classes/coverability-graph';


@Component({
  selector: 'g[appSvgCovStateNode]',
  imports: [],
  templateUrl: './svg-cov-state-node.component.html',
  styleUrl: './svg-cov-state-node.component.css',
})
export class SvgCovStateNodeComponent {

    protected readonly VIEW_MODES = VIEW_MODES;
    readonly RADIUS = 7;

    readonly covStateNode = input.required<CoverabilityStateNode>();
    readonly viewMode = input<ViewMode>(VIEW_MODES.SIMPLE);

    covStateNodeClick = output<CoverabilityStateNode>();

    readonly x = computed(() => this.covStateNode().x);
    readonly y = computed(() => this.covStateNode().y);
    readonly label = computed(() => this.covStateNode().displayLabel);

    readonly isStartingState = computed(() => this.covStateNode().isStartingState);
    readonly isUnlimited = computed(() => this.covStateNode().isMorMStrich);

    readonly fillColor = computed(() => {
        if (this.isUnlimited()) {
            return 'red';
        }
        return 'black';
    });

    readonly arrowTip = computed(() => {
        const x = this.x();
        const y = this.y();

        if (this.viewMode() === VIEW_MODES.DESCRIPTIVE) {
            // Calculate intersection for a line coming from top-left (-1, -1 direction)
            return GeometryUtil.getLabelBoundingBoxIntersection({ x, y }, { x: x - 1, y: y - 1 }, this.label());
        }

        const offset = 5;
        return { x: x - offset, y: y - offset };
    });

    readonly arrowLineEnd = computed(() => {
        const tip = this.arrowTip();
        const backOff = 3;
        return { x: tip.x - backOff, y: tip.y - backOff };
    });

    readonly arrowLineStart = computed(() => {
        const tip = this.arrowTip();
        const length = 25;
        return { x: tip.x - length, y: tip.y - length };
    });

    onCovClick() {
        this.covStateNodeClick.emit(this.covStateNode());
    }
}

