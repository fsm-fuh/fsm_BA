import { Component, effect, inject, untracked  } from '@angular/core';
import { CoverabilityGraphDisplayComponent } from './coverability-graph-display/coverability-graph-display.component';
import { CoverabilityGraphDrawDisplayComponent } from './coverability-graph-draw-display/coverability-graph-draw-display.component';
import { TabStateService } from '../../../services/tab-state.service';
import { Tab } from '../../../classes/tabs';
import { SourcePetriNetService } from '../../../services/source-petri-net.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { CoverabilityGraphService } from 'src/app/services/coverability-graph.service';

@Component({
  selector: 'app-coverability-graph',
  standalone: true,
  imports: [CoverabilityGraphDisplayComponent, CoverabilityGraphDrawDisplayComponent],
  templateUrl: './coverability-graph.component.html',
  styleUrl: './coverability-graph.component.css',
})
export class CoverabilityGraphComponent {
  private _tabStateService = inject(TabStateService);
    private _coverabilityGraphService = inject(CoverabilityGraphService);
    private _sourcePetriNetService = inject(SourcePetriNetService);
    private _sourceNet = toSignal(this._sourcePetriNetService.sourceNet$);

    constructor() {
        this.initializeTabEffect();
    }

    private initializeTabEffect() {
        effect(() => {
            const currentTab = this._tabStateService.currentTab();
            this._sourceNet(); // Register dependency

            if (currentTab === Tab.COVERABILITY_GRAPH) {
                // Use untracked to prevent the effect from subscribing to signals
                // read inside the service method (like AppMode or internal state)
                untracked(() => {
                    this._coverabilityGraphService.initializeCoverabilityGraphFirstStateNode();
                });
            }
        });
    }

}
