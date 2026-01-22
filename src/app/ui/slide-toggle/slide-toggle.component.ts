import {Component, input, Input} from '@angular/core';
import {FormControl, ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-slide-toggle',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './slide-toggle.component.html',
  styleUrl: './slide-toggle.component.css',
})
export class SlideToggleComponent {
  @Input() control!: FormControl;
  readonly formControlName = input<string>("");
  // readonly ngModelInput = input<string>("");
// <app-slide-toggle [formControlName]="'type'" [ngModelInput]="'operation.type'"></app-slide-toggle>
}
