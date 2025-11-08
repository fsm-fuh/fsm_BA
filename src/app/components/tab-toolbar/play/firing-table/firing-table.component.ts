import { Component, input } from '@angular/core';
import { FiringEntry } from '../../../../services/play.service';

@Component({
  selector: 'app-firing-table',
  standalone: true,
  imports: [],
  templateUrl: './firing-table.component.html',
  styleUrl: './firing-table.component.css'
})
export class FiringTableComponent {
  firingEntries = input.required<FiringEntry[]>();
}
