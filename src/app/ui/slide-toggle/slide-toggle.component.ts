import { Component, input, ChangeDetectionStrategy, signal } from '@angular/core';
import { ReactiveFormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-slide-toggle',
  imports: [ReactiveFormsModule],
  templateUrl: './slide-toggle.component.html',
  styleUrl: './slide-toggle.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SlideToggleComponent,
      multi: true
    }
  ]
})
export class SlideToggleComponent implements ControlValueAccessor {
  readonly labelLeft = input<string>('');
  readonly labelRight = input<string>('');
  readonly disabled = input<boolean>(false);

  value = signal(false);
  onChange: (value: boolean) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: boolean): void {
    this.value.set(value ?? false);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Handle disabled state if needed
  }

  toggle(): void {
    if (!this.disabled()) {
      this.value.update(v => !v);
      this.onChange(this.value());
      this.onTouched();
    }
  }
}
