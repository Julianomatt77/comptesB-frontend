import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
  signal,
  computed,
  DOCUMENT,
  Renderer2
} from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CompteService} from 'src/app/services/compte.service';
import { OperationService } from 'src/app/services/operation.service';
import {
  faArrowDown,
  faArrowUp,
  faDownload,
  faFilter,
} from '@fortawesome/free-solid-svg-icons';
import { DecimalPipe } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { LineChartModule } from '@swimlane/ngx-charts';
import {CurrentAccountsRecap, MonthlyRecapItem, SavingsAccountsRecap, YearlyAccountRecap} from "../../interfaces/recap";

@Component({
  selector: 'app-recap',
  templateUrl: './recap.component.html',
  styleUrls: ['./recap.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    FaIconComponent,
    LineChartModule,
    DecimalPipe
  ]
})
export class RecapComponent implements OnInit {
  private cookieService = inject(CookieService);
  private fb = inject(FormBuilder);
  private compteService = inject(CompteService);
  private operationService = inject(OperationService);
  private document = inject<Document>(DOCUMENT);
  private renderer = inject(Renderer2);

  // Signals pour l'état
  readonly userId = signal<number>(0);
  readonly isLoading = signal(true);
  readonly selectedYear = signal(new Date().getFullYear().toString());
  toggleCourant = signal(false);
  toggleEpargne = signal(false);

  // Données du recap
  readonly currentAccountsRecap = signal<CurrentAccountsRecap | null>(null);
  readonly savingsAccountsRecap = signal<SavingsAccountsRecap | null>(null);
  readonly savingsByAccount = signal<YearlyAccountRecap[]>([]);

  // Années disponibles (depuis operationService)
  readonly availableYears = computed(() => {
    const years = this.operationService.operationYears();
    const currentYear = new Date().getFullYear();

    // Ajouter l'année courante si elle n'est pas présente
    if (!years.includes(currentYear)) {
      return [...years, currentYear].sort((a, b) => b - a);
    }

    return years.sort((a, b) => b - a);
  });

  // Computed pour les données des comptes courants
  readonly operationPerYear = computed(() => {
    const recap = this.currentAccountsRecap();
    return recap?.monthlyRecap || [];
  });

  readonly totalDifference = computed(() => {
    const recap = this.currentAccountsRecap();
    return recap?.difference || 0;
  });

  readonly evolutionCompteCourant = computed(() => {
    const recap = this.currentAccountsRecap();
    return recap?.evolution || 0;
  });

  // Computed pour les données d'épargne
  readonly epargnePerYear = computed(() => {
    const recap = this.savingsAccountsRecap();
    return recap?.monthlyRecap || [];
  });

  readonly evolutionEpargne = computed(() => {
    const savingsByAcc = this.savingsByAccount();
    const total = savingsByAcc.find(acc => acc.name === 'TOTAL');
    return total?.evolution || 0;
  });

  readonly yearlyArray = computed(() => {
    return this.savingsByAccount();
  });

  // Données pour le graphique
  readonly chartData = computed(() => {
    const currentData = this.operationPerYear();

    return [{
      name: 'Comptes Courants',
      series: currentData.map((item: MonthlyRecapItem) => ({
        name: item.month,
        value: item.solde ?? 0
      }))
    }];
  });

  form!: FormGroup;
  width = 0;

  // Graphique configuration
  legend = true;
  showLabels = true;
  animations = true;
  xAxis = true;
  yAxis = true;
  showYAxisLabel = true;
  showXAxisLabel = true;
  xAxisLabel = 'Mois';
  yAxisLabel = 'Solde';
  timeline = true;

  colorScheme = {
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5'],
  };

  // Icons
  faArrowUp = faArrowUp;
  faArrowDown = faArrowDown;
  faDownload = faDownload;
  faFilter = faFilter;


  constructor() {
    this.renderer.addClass(this.document.body, 'bg-light');

    const userIdFromCookie = this.cookieService.get('compty-userId');
    this.userId.set(parseInt(userIdFromCookie, 10) || 0);

    this.width = innerWidth / 1.3;

    this.form = this.fb.group({
      rangeDate: this.selectedYear()
    });
  }

  async ngOnInit(): Promise<void> {
    // Charger les opérations pour obtenir les années disponibles
    await this.operationService.loadAllOperations(this.userId());

    // Charger les données de l'année courante
    await this.loadYearData(this.selectedYear());

    this.isLoading.set(false);
  }

  async onSubmitChangeDate(): Promise<void> {
    const year = this.form.value.rangeDate;
    this.selectedYear.set(year);
    this.isLoading.set(true);

    await this.loadYearData(year);

    this.isLoading.set(false);
  }

  private async loadYearData(year: string): Promise<void> {
    const userId = this.userId();

    // Charger toutes les données en parallèle
    const [currentAccounts, savingsAccounts, savingsByAccount] = await Promise.all([
      this.compteService.getAnnualRecapCurrentAccounts(year),
      this.compteService.getAnnualRecapSavingsAccounts(year),
      this.compteService.getAnnualRecapSavingsByAccount(year)
    ]);

    this.currentAccountsRecap.set(currentAccounts);
    this.savingsAccountsRecap.set(savingsAccounts);
    this.savingsByAccount.set(savingsByAccount || []);
  }

  onResize(event: any): void {
    this.width = event.target.innerWidth / 1.3;
  }

  export(type: string): void {
    let arrayToExport: any[] = [];
    let filename = '';

    if (type === 'epargne') {
      arrayToExport = this.yearlyArray().map(data => ({
        compte: data.name,
        'solde initial': data.soldeInitial,
        'total investi': data.totalInvesti,
        'solde Final': data.soldeFinal,
        evolution: data.evolution,
      }));

      filename = `${this.selectedYear()}_epargne.csv`;
    } else if (type === 'comptes') {
      arrayToExport = this.operationPerYear().map((data: MonthlyRecapItem) => ({
        Mois: data.month,
        'solde initial': data.soldeInitial,
        Economie: data.economie,
        Solde: data.soldeFinal ?? 0
      }));


      filename = `${this.selectedYear()}_comptes.csv`;
    }

    this.operationService.exportToCSV(arrayToExport, filename);
  }

  toggleCourantSection() {
    this.toggleCourant.set(!this.toggleCourant());
    this.toggleEpargne.set(false);
  }

  toggleEpargneSection() {
    this.toggleEpargne.set(!this.toggleEpargne());
    this.toggleCourant.set(false);
  }
}
