import {
  Component,
  OnInit,
  ViewChild,
  Output,
  EventEmitter,
  DOCUMENT,
  inject,
  ChangeDetectionStrategy,
  signal,
  computed,
  effect,
  OnDestroy,
  Renderer2,
  ChangeDetectorRef
} from '@angular/core';
import { OperationV2 } from 'src/app/models/operation.model';
import { CompteV2 } from 'src/app/models/compte.model';
import { OperationService } from 'src/app/services/operation.service';
import { OperationFormComponent } from '../operation-form/operation-form.component';
import { CompteFormComponent } from '../compte-form/compte-form.component';
import { CompteService } from 'src/app/services/compte.service';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { CookieService } from 'ngx-cookie-service';
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  faArrowDown,
  faArrowUp,
  faDownload,
  faFilter,
  faPen,
  faPlusCircle,
  faTrashCan,
  faClose
} from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { NgClass, DecimalPipe, DatePipe } from '@angular/common';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatSelect } from '@angular/material/select';
import { MatOption, MatOptgroup } from '@angular/material/autocomplete';
import { PieChartModule } from '@swimlane/ngx-charts';
import { firstValueFrom } from 'rxjs';

interface OperationDisplay extends OperationV2 {
  classCSS?: string;
  compteName?: string;
}

interface MonthlyHistory {
  name: string;
  solde: number;
  history: any[];
}

@Component({
  selector: 'app-comptes',
  templateUrl: './comptes.component.html',
  styleUrls: ['./comptes.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    FaIconComponent,
    MatLabel,
    MatSelect,
    MatOption,
    MatOptgroup,
    MatPaginator,
    PieChartModule,
    DecimalPipe,
    DatePipe
  ]
})
export class ComptesComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  readonly operationService = inject(OperationService);
  readonly compteService = inject(CompteService);
  private dialog = inject(MatDialog);
  private cookieService = inject(CookieService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private document = inject<Document>(DOCUMENT);
  private renderer = inject(Renderer2);

  @Output() formSubmitted = new EventEmitter<string>();
  @ViewChild(MatSort) sort?: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Local state signals
  readonly userId = signal<number>(0);
  readonly todayMonth = signal(new Date().getMonth() + 1);
  readonly todayYear = signal(new Date().getFullYear().toString());
  readonly selectedAccount = signal('');
  readonly selectedCategory = signal('');
  readonly selectedType = signal<boolean | null>(null);
  readonly dateFiltered = signal(true);
  readonly width = signal(0);

  // Computed from services
  readonly isLoading = computed(() =>
    this.operationService.operationsLoading() || this.compteService.accountsLoading()
  );

  readonly allOperations = computed(() => this.operationService.operations());
  readonly accounts = computed(() => this.compteService.accounts());
  readonly groupedComptes = computed(() => this.compteService.groupedComptes());
  readonly groupedCompteTypes = computed(() => this.compteService.groupedCompteTypes());
  readonly operationsYears = computed(() => this.operationService.operationYears());
  readonly monthlyHistoryPerAccount = signal<any[]>([]);

  // Filtered operations based on current filters
  readonly filteredOperations = computed(() => {
    const month = this.todayMonthString();
    const year = this.todayYear();
    const allOps = this.allOperations();
    const selectedAccount = this.selectedAccount();
    const selectedCategory = this.selectedCategory();
    const selectedType = this.selectedType();
    const dateFiltered = this.dateFiltered();

    let filtered = allOps;

    // Filtre par date
    if (dateFiltered) {
      const targetDate = `${year}-${month}`;
      filtered = filtered.filter(op => {
        const opDate = new Date(op.operationDate).toISOString().substring(0, 7);
        return opDate === targetDate;
      });
    }

    // Filtre par compte
    if (selectedAccount) {
      const accountId = parseInt(selectedAccount, 10);
      filtered = filtered.filter(op => op.compteId === accountId);
    }

    // Filtre par catégorie
    if (selectedCategory) {
      filtered = filtered.filter(op => op.categorie === selectedCategory);
    }

    // Filtre par type
    if (selectedType !== null) {
      filtered = filtered.filter(op => op.type === selectedType);
    }

    // Ajouter les informations d'affichage
    const displayOps: OperationDisplay[] = filtered.map(op => {
      const compte = this.accounts().find(c => c.id === op.compteId);
      const categorieIndex = this.categorieClass.findIndex(c => c[0] === op.categorie);

      return {
        ...op,
        compteName: compte?.name || 'Compte inconnu',
        classCSS: categorieIndex !== -1 ? this.categorieClass[categorieIndex][1] : ''
      };
    });

    return displayOps;
  });

  readonly totalCredit = computed(() => {
    return this.filteredOperations().reduce((sum, op) => {
      if (op.categorie !== 'Transfert' && op.type) {
        return sum + op.montant;
      }
      return sum;
    }, 0);
  });

  readonly totalDebit = computed(() => {
    return this.filteredOperations().reduce((sum, op) => {
      if (op.categorie !== 'Transfert' && !op.type) {
        return sum + Math.abs(op.montant);
      }
      return sum;
    }, 0);
  });

  readonly todayMonthString = computed(() => {
    const month = this.todayMonth();
    return month < 10 ? `0${month}` : `${month}`;
  });

  private monthlyRecapEffect = effect(async () => {
    this.filteredOperations()
    const data = await this.compteService.getMonthlyRecap(
      this.todayYear(),
      this.todayMonthString()
    );

    this.monthlyHistoryPerAccount.set(data);
  });

  readonly spendByCategory = computed(() => {
    const result: any[] = [];

    this.categorieList.forEach(categorie => {
      if (categorie !== 'Transfert' && categorie !== 'Salaire' && categorie !== 'Remboursement') {
        result.push({ name: categorie, value: 0 });
      }
    });

    this.filteredOperations().forEach(operation => {
      if (operation.categorie !== 'Transfert' &&
        operation.categorie !== 'Salaire' &&
        operation.categorie !== 'Remboursement') {
        const index = result.findIndex(x => x.name === operation.categorie);

        if (index !== -1 && operation.montant < 0) {
          result[index].value += Math.abs(operation.montant);
        }
      }
    });

    return result;
  });

  // DataSource avec signal
  dataSource = new MatTableDataSource<OperationDisplay>([]);

  // Effect pour mettre à jour le dataSource
  private updateDataSourceEffect = effect(() => {
    this.dataSource.data = this.filteredOperations();
    this.updatePaginator();
  });

  categorieList: string[] = [
    'Courses',
    'Divers',
    'Essence',
    'Epargne',
    'Prélèvement',
    'Pub',
    'Remboursement',
    'Restaurant',
    'Salaire',
    'santé',
    'Transfert',
    'Voyage',
  ];

  categorieClass: [string, string][] = [
    ['Courses', 'courses'],
    ['Divers', 'divers'],
    ['Essence', 'essence'],
    ['Epargne', 'epargne'],
    ['Prélèvement', 'prelevement'],
    ['Pub', 'pub'],
    ['Remboursement', 'remboursement'],
    ['Restaurant', 'restaurant'],
    ['Salaire', 'salaire'],
    ['santé', 'santé'],
    ['Transfert', 'transfert'],
    ['Voyage', 'voyage'],
  ];

  columnsToDisplay = [
    'operationDate',
    'compte',
    'montant',
    'categorie',
    'description1',
    'description2',
    'edition',
    'suppression',
  ];

  form!: FormGroup;
  formAccountFiltered!: FormGroup;
  formCategoryFiltered!: FormGroup;

  // Icons
  faPen = faPen;
  faTrashCan = faTrashCan;
  faArrowUp = faArrowUp;
  faArrowDown = faArrowDown;
  faDownload = faDownload;
  faPlus = faPlusCircle;
  faFilter = faFilter;
  faClose = faClose;

  constructor() {
    this.renderer.addClass(this.document.body, 'bg-light');
    const userIdFromCookie = this.cookieService.get('compty-userId');
    this.userId.set(parseInt(userIdFromCookie, 10) || 0);

    this.width.set(innerWidth >= 991 ? innerWidth / 3.3 : innerWidth / 1.3);
  }

  async ngOnInit(): Promise<void> {
    this.initializeForms();
    await this.loadInitialData();
  }

  private initializeForms(): void {
    this.form = this.fb.group({
      rangeDate: `${this.todayYear()}-${this.todayMonthString()}`,
    });

    this.formAccountFiltered = this.fb.group({
      account: this.selectedAccount()
    });

    this.formCategoryFiltered = this.fb.group({
      category: this.selectedCategory()
    });
  }

  private async loadInitialData(): Promise<void> {
    const userId = this.userId();

    // Load accounts and operations in parallel
    await Promise.all([
      this.compteService.loadAccounts(userId),
      this.operationService.loadAllOperations(userId)
    ]);
  }

  async onSubmitChangeDate(): Promise<void> {
    const [year, month] = this.form.value.rangeDate.split('-');
    this.todayYear.set(year);
    this.todayMonth.set(parseInt(month, 10));
    this.dateFiltered.set(true);
  }

  resetDateFilters(): void {
    const now = new Date();
    this.todayMonth.set(now.getMonth() + 1);
    this.todayYear.set(now.getFullYear().toString());
    this.dateFiltered.set(false);
  }

  onSubmitAccountFilter(): void {
    this.selectedAccount.set(this.formAccountFiltered.value.account);
  }

  onSubmitCategoryFilter(): void {
    this.selectedCategory.set(this.formCategoryFiltered.value.category);
  }

  typeFilter(type: boolean): void {
    const currentType = this.selectedType();
    this.selectedType.set(currentType === type ? null : type);
  }

  resetAllFilters(): void {
    this.selectedType.set(null);
    this.selectedCategory.set('');
    this.selectedAccount.set('');
    this.formCategoryFiltered.get('category')?.setValue('');
    this.formAccountFiltered.get('account')?.setValue('');
  }

  async AddOperation(): Promise<void> {
    const dialogRef = this.dialog.open(OperationFormComponent, {
      data: {
        addOrEdit: 'add',
        compteList: this.accounts()
      },
      width: '60%',
    });

    await firstValueFrom(dialogRef.afterClosed());
    await this.loadInitialData();
  }

  async openOperationDetail(operation: OperationDisplay): Promise<void> {
    const dialogRef = this.dialog.open(OperationFormComponent, {
      data: {
        operation,
        addOrEdit: 'edit',
        compteList: this.accounts(),
      },
      width: '60%',
    });

    await firstValueFrom(dialogRef.afterClosed());
    await this.loadInitialData();
  }

  async openConfirmation(operation: OperationDisplay): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false,
    });

    dialogRef.componentInstance.confirmMessage =
      'Etes vous sûr de vouloir supprimer cette opération ?';

    const result = await firstValueFrom(dialogRef.afterClosed());

    if (result) {
      await this.deleteOperation(operation);
    }
  }

  private async deleteOperation(operation: OperationDisplay): Promise<void> {
    const compte = this.compteService.findAccountById(operation.compteId);

    if (compte) {
      const montantRestitue = -operation.montant;
      const updatedCompte: CompteV2 = {
        ...compte,
        soldeActuel: compte.soldeActuel + montantRestitue
      };

      await this.compteService.updateAccountAsync(compte.id, updatedCompte);
      await this.operationService.deleteOperation(operation.id, this.userId());
    }
  }

  async AddAccount(): Promise<void> {
    const dialogRef = this.dialog.open(CompteFormComponent, {
      data: {
        addOrEdit: 'add',
      },
      width: '60%',
    });

    await firstValueFrom(dialogRef.afterClosed());
    await this.compteService.loadAccounts(this.userId());
  }

  async openAccountDetail(compte: CompteV2): Promise<void> {
    const dialogRef = this.dialog.open(CompteFormComponent, {
      data: {
        compte,
        addOrEdit: 'edit',
      },
      width: '60%',
    });

    await firstValueFrom(dialogRef.afterClosed());
    await this.compteService.loadAccounts(this.userId());
  }

  async deleteAccount(compte: CompteV2): Promise<void> {
    await this.compteService.deleteAccountAsync(compte.id, this.userId());
  }

  onResize(event: any): void {
    this.width.set(event.target.innerWidth >= 991
      ? event.target.innerWidth / 3.3
      : event.target.innerWidth / 1.3);
  }

  htmltoPDF(): void {
    const element = this.document.querySelector('#dataToPrint');
    if (!element) return;

    html2canvas(element as HTMLElement).then(canvas => {
      const fileWidth = 208;
      const fileHeight = (canvas.height * fileWidth) / canvas.width;
      const imgData = canvas.toDataURL('image/png');
      const pdfFile = new jsPDF('p', 'mm', 'a4');

      pdfFile.addImage(imgData, 'PNG', 0, 0, fileWidth, fileHeight);
      pdfFile.save(`${this.todayYear()}-${this.todayMonthString()} operations.pdf`);
    });
  }

  export(type: string): void {
    let arrayToExport: any[] = [];
    let filename = '';

    if (type === 'operations') {
      arrayToExport = this.filteredOperations().map(data => ({
        Date: new Date(data.operationDate).toISOString().split('T')[0],
        Crédit: data.type ? data.montant : '',
        Débit: !data.type ? Math.abs(data.montant) : '',
        Catégorie: data.categorie,
        Compte: data.compteName,
        'Description 1': data.description1,
        'Description 2': data.description2 || '',
      }));

      filename = `${this.todayYear()}-${this.todayMonthString()}_operations.csv`;
    } else if (type === 'comptes') {
      arrayToExport = this.monthlyHistoryPerAccount().map(data => ({
        Compte: data.name,
        'Solde Actuel': data.solde,
      }));

      filename = `${this.todayYear()}-${this.todayMonthString()}_comptes.csv`;
    }

    this.operationService.exportToCSV(arrayToExport, filename);
  }

  ngOnDestroy(): void {
    if (this.dataSource) {
      this.dataSource.disconnect();
    }
  }

  private updatePaginator(): void {
    this.changeDetectorRef.detectChanges();
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }
}
