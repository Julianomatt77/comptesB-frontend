import {Component, OnInit, inject, ChangeDetectionStrategy} from '@angular/core';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';

@Component({
    selector: 'app-confirmation-dialog',
    templateUrl: './confirmation-dialog.component.html',
    styleUrls: ['./confirmation-dialog.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatDialogActions, MatDialogClose]
})
export class ConfirmationDialogComponent implements OnInit {
  dialogRef = inject<MatDialogRef<ConfirmationDialogComponent>>(MatDialogRef);

  public confirmMessage!: string;

  ngOnInit(): void {}
}
