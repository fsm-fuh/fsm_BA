import { Component, computed, ElementRef, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { SvgNodeComponent } from '../../../display/svg-node/svg-node.component';
import { DiagramNode } from '../../../../classes/diagram/diagram-node';
import { DiagramPlace } from '../../../../classes/diagram/diagram-place';
import { DiagramTransition } from '../../../../classes/diagram/diagram-transition';
import { DisplayService } from '../../../../services/display.service';
import { ReachabilityGraph } from 'src/app/classes/reachability-graph.model';
import { PanningService } from 'src/app/services/panning.service';

@Component({
    selector: 'app-reachability-graph-draw-display',
    standalone: true,
    imports: [],
    providers: [PanningService],
    templateUrl: './reachability-graph-draw-display.component.html',
    styleUrl: './reachability-graph-draw-display.component.css',
})
export class ReachabilityGraphDrawDisplayComponent {
    //signal für states, Liste von stateNodes
    //signal für edges, Liste von edges aus reachGraph
    //checken, in welchem Modus
    //dann unterschiedliche Methode aus dem RG Service abrufen?
    //oder Unterscheidung im Service machen
}
