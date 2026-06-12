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
import { ToastList } from 'src/app/classes/toast';
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

    private dialogUserMarkingComparisonArray: string[] = [];
    hintButtonDisabled =true;

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
        this.dialogUserMarkingComparisonArray=[];

        for (let i = 0; i < this.correctDialogMarking.length; i++) {
            // console.log(
            //     'keep function currentMarkingKeyString  ' +
            //         this.currentDialogMarking[i].markingKeyString +
            //         '  keep function currentMarkingValueString  ' +
            //         this.currentDialogMarking[i].markingValueString,
            // );
            if (this.currentDialogMarking[i].markingValueString !== this.correctDialogMarking[i].markingValueString) {
                isCorrect = false;
                this.dialogUserMarkingComparisonArray.push(this.currentDialogMarking[i].markingKeyString)
                // break;
            }
        }

        if (isCorrect) {
            this._dialogRef.close(this.currentDialogMarking);
        } else {
            this.hintButtonDisabled=false;
            this._notificationService.showError(
                //TODO Toaster anpassen für Omega?
                'TOASTER.HEADER.MARKING_INPUT_WRONG',
                'TOASTER.BODY.MARKING_INPUT_WRONG',
            );
        }
    }


    hint(){        
        
        const userInputWrongPlacesList: ToastList[] = this.dialogUserMarkingComparisonArray.map((item) => {
            return {
                message: `${item}`,
            };
        });
        
        for (const element of userInputWrongPlacesList) {
            console.log('userInputWrongPlacesList element ' + element.message)
            
        }
        
        this._notificationService.showError(
            'TOASTER.HEADER.MARKING_INPUT_WRONG_HINT',
            'TOASTER.BODY.MARKING_INPUT_WRONG_HINT',
            { list: userInputWrongPlacesList },
        );
    }
    





    discard() {
        this._dialogRef.close(this.correctDialogMarking);
    }
}
