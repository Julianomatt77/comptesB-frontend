import { Component, input, output, ChangeDetectionStrategy, signal, effect } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-operations-filter',
  imports: [ReactiveFormsModule],
  templateUrl: './operations-filter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OperationsFilterComponent {
  private fb = new FormBuilder();

  readonly groupedComptes = input.required<{ [key: string]: any[] }>();
  readonly groupedCompteTypes = input.required<string[]>();
  readonly categorieList = input.required<string[]>();

  readonly accountChange = output<string>();
  readonly categoryChange = output<string>();
  readonly typeChange = output<boolean | null>();
  readonly resetFilters = output<void>();

  readonly selectedType = signal<boolean | null>(null);

  formAccount: FormGroup;
  formCategory: FormGroup;

  constructor() {
    this.formAccount = this.fb.group({
      account: ''
    });

    this.formCategory = this.fb.group({
      category: ''
    });
  }

  onAccountChange(): void {
    this.accountChange.emit(this.formAccount.value.account);
  }

  onCategoryChange(): void {
    this.categoryChange.emit(this.formCategory.value.category);
  }

  onTypeChange(type: boolean): void {
    const currentType = this.selectedType();
    const newType = currentType === type ? null : type;
    this.selectedType.set(newType);
    this.typeChange.emit(newType);
  }

  onResetFilters(): void {
    this.selectedType.set(null);
    this.formAccount.reset({ account: '' });
    this.formCategory.reset({ category: '' });
    this.resetFilters.emit();
  }
}
