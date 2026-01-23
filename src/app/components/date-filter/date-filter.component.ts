import {Component, input, output, ChangeDetectionStrategy, effect} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-date-filter',
  imports: [ReactiveFormsModule, FaIconComponent],
  templateUrl: './date-filter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateFilterComponent {
  private fb = new FormBuilder();

  readonly currentYear = input.required<string>();
  readonly currentMonth = input.required<string>();

  readonly dateChange = output<{ year: string; month: string }>();
  readonly resetFilters = output<void>();

  faFilter = faFilter;
  form: FormGroup;

  constructor() {
    // Initialiser avec une valeur par défaut
    this.form = this.fb.group({
      rangeDate: ''
    });

    // Mettre à jour le formulaire quand les inputs changent
    effect(() => {
      const year = this.currentYear();
      const month = this.currentMonth();
      this.form.patchValue({
        rangeDate: `${year}-${month}`
      });
    });
  }

  onSubmit(): void {
    const [year, month] = this.form.value.rangeDate.split('-');
    this.dateChange.emit({ year, month });
  }
}
