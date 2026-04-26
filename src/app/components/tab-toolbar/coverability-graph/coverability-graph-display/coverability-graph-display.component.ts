import { Component, inject } from '@angular/core';
import { DisplayComponent } from 'src/app/components/display/display.component';
import { SvgArcComponent } from 'src/app/components/display/svg-arc/svg-arc.component';
import { SvgNodeComponent } from 'src/app/components/display/svg-node/svg-node.component';
import { ToasterNotificationService } from 'src/app/services/toaster-notification.service';

@Component({
  selector: 'app-coverability-graph-display',
  standalone: true,
  imports: [SvgNodeComponent, SvgArcComponent],
  templateUrl: './coverability-graph-display.component.html',
  styleUrl: './coverability-graph-display.component.css',
})
export class CoverabilityGraphDisplayComponent extends DisplayComponent{
      private _toaster = inject(ToasterNotificationService);

    readonly isDisabled = this._coverabilityGraphService.showingCompleteGraph;

    handleDisabledClick(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this._toaster.showInfo('TOASTER.HEADER.RG_INFO', 'TOASTER.BODY.SWITCH_BACK_TO_USER_GRAPH');
    }

}
