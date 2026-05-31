import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormsModule } from '@angular/forms';
import { KeyValuePipe } from '@angular/common';
import { ToasterNotificationService } from '../../../../services/toaster-notification.service';
import { CovMarkingStringSaver } from 'src/app/classes/coverability-graph';
import { log } from 'node:console';

export interface ConfirmCoverabilityUserMarkingDialogData {
    title: string;
    userInputMarking: CovMarkingStringSaver[];
    expectedCorrectMarking: CovMarkingStringSaver[];
    // tab: Tab;
    message: string;
}
@Component({
    selector: 'app-cg-marking-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        TranslateModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        // MatIconButton,
        // MatIcon,
        MatSliderModule,
        MatExpansionModule,
        // KeyValuePipe,
    ],
    templateUrl: './cg-marking-dialog.component.html',
    styleUrl: './cg-marking-dialog.component.css',
})
export class CgMarkingDialogComponent {

    private _notificationService = inject(ToasterNotificationService);
    data = inject<ConfirmCoverabilityUserMarkingDialogData>(MAT_DIALOG_DATA);
    private _dialogRef = inject(MatDialogRef<CgMarkingDialogComponent>);

    protected currentDialogMarking: CovMarkingStringSaver[] = this.data.userInputMarking;
    private correctDialogMarking: CovMarkingStringSaver[] = this.data.expectedCorrectMarking;
    inputtedMarkingValueString:string='';

    // incrementMarking(placeId: string): void {
    //     // this.currentDialogMarking[placeId] = (this.currentDialogMarking[placeId] || '0') + 1;
    // }

    // decrementMarking(placeId: string): void {
    //     // if ((this.currentDialogMarking[placeId] || "0")  > "0") {
    //     //     this.currentDialogMarking[placeId] = (this.currentDialogMarking[placeId] || "0") - 1;
    //     // }
    // }

    keep() {
        let isCorrect = true;

        for (let i = 0; i < this.correctDialogMarking.length; i++) {
            console.log('currentMarkingValueString' + this.inputtedMarkingValueString)
            if (this.currentDialogMarking[i].markingValueString !== this.correctDialogMarking[i].markingValueString) {
                isCorrect=false;
                break;                
            }            
        }

        if (isCorrect) {
            this._dialogRef.close(this.currentDialogMarking);
        } else {
            this._notificationService.showError(
                //TODO Toaster anpassen für Omega?
                'TOASTER.HEADER.MARKING_INPUT_WRONG',
                'TOASTER.BODY.MARKING_INPUT_WRONG',
            );
        }
    }

    discard() {
        this._dialogRef.close(this.correctDialogMarking);
    }
}
