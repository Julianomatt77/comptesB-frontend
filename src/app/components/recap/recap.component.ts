import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
} from '@angular/core';
import { Operation } from 'src/app/models/Operation';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { CookieService } from 'ngx-cookie-service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OperationService } from 'src/app/services/operation.service';
import { DatepickerService } from 'src/app/services/datepicker.service';
import { Recap } from '../../interfaces/recap';
import { SoldeHistory } from '../../interfaces/soldeHistory';
import { CompteService } from 'src/app/services/compte.service';
import { forkJoin, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HistoryPerAccount } from 'src/app/interfaces/historyPerAccount';
import {
  faArrowDown,
  faArrowUp,
  faDownload,
  faFilter,
} from '@fortawesome/free-solid-svg-icons';
import { Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-recap',
  templateUrl: './recap.component.html',
  styleUrls: ['./recap.component.css'],
})
export class RecapComponent implements OnInit {
  operationList: any[] = [];
  operationEpargneList: any[] = [];
  operationId!: string;
  operation!: Operation;
  totalCredit = 0;
  totalDebit = 0;
  totaldifference = 0;
  totalCreditEpargne = 0;
  totalDebitEpargne = 0;
  totaldifferenceEpargne = 0;
  userId!: string;
  compteList: any[] = [];
  compteEpargneList: any[] = [];
  compteId = '';
  form!: FormGroup;
  operationPerYear: Recap[] = [
    { month: 'Janvier', economie: 0, solde: 0 },
    { month: 'Février', economie: 0, solde: 0 },
    { month: 'Mars', economie: 0, solde: 0 },
    { month: 'Avril', economie: 0, solde: 0 },
    { month: 'Mai', economie: 0, solde: 0 },
    { month: 'Juin', economie: 0, solde: 0 },
    { month: 'Juillet', economie: 0, solde: 0 },
    { month: 'Août', economie: 0, solde: 0 },
    { month: 'Septembre', economie: 0, solde: 0 },
    { month: 'Octobre', economie: 0, solde: 0 },
    { month: 'Novembre', economie: 0, solde: 0 },
    { month: 'Décembre', economie: 0, solde: 0 },
  ];
  epargnePerYear: Recap[] = [
    { month: 'Janvier', economie: 0, solde: 0 },
    { month: 'Février', economie: 0, solde: 0 },
    { month: 'Mars', economie: 0, solde: 0 },
    { month: 'Avril', economie: 0, solde: 0 },
    { month: 'Mai', economie: 0, solde: 0 },
    { month: 'Juin', economie: 0, solde: 0 },
    { month: 'Juillet', economie: 0, solde: 0 },
    { month: 'Août', economie: 0, solde: 0 },
    { month: 'Septembre', economie: 0, solde: 0 },
    { month: 'Octobre', economie: 0, solde: 0 },
    { month: 'Novembre', economie: 0, solde: 0 },
    { month: 'Décembre', economie: 0, solde: 0 },
  ];
  yearlyArray: any[] = [];
  displayYear: Array<number> = [];

  dataSource = new MatTableDataSource(this.operationPerYear);
  dataSourceEpargne = new MatTableDataSource(this.epargnePerYear);
  dataSourceEpargneYearly = new MatTableDataSource(this.yearlyArray);
  @ViewChild(MatSort) sort!: MatSort | undefined;
  @ViewChild('table') table!: MatTable<any> | undefined;
  childRevelancy = { displayColumns: [], hideColumns: [], data: [] };
  columnsToDisplay = ['month', 'economie', 'solde'];
  columnsToDisplayYearly = [
    'compte',
    'soldeInitial',
    'soldeFinal',
    'evolution',
  ];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  todayMonth = new Date(Date.now()).getMonth() + 1;
  todayYear = new Date(Date.now()).getFullYear().toString();
  todayMonthString = this.todayMonth.toString();
  firstOperationYear = 0;
  operationsYears: number[] = [];
  dateFiltered = false;
  soldeAllAccounts: any[] = [];
  soldeAllEpargne: any[] = [];
  soldeAllEpargnePerAccount: any[] = [];

  monthlySoldeHistory: SoldeHistory[] = [];
  monthlyEpargneHistory: SoldeHistory[] = [];
  monthlyEpargneHistoryPerAccount: HistoryPerAccount[] = [];
  soldeHistory: SoldeHistory[] = [];

  initialSolde = 0;
  initialEpargneSolde = 0;
  evolutionCompteCourant = 0;
  evolutionEpargne = 0;

  multi: any[] = [
    { name: 'Compte Courant', series: [] },
    { name: 'Epargne', series: [] },
  ];
  width = 0;

  // view = [700, 300];

  // options
  legend: boolean = true;
  showLabels: boolean = true;
  animations: boolean = true;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showYAxisLabel: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = 'Year';
  yAxisLabel: string = 'Population';
  timeline: boolean = true;

  colorScheme = {
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5'],
  };

  faArrowUp = faArrowUp;
  faArrowDown = faArrowDown;
  faDownload = faDownload;
  faFilter = faFilter;

  constructor(
    private cookieService: CookieService,
    private fb: FormBuilder,
    private operationService: OperationService,
    private datePickerService: DatepickerService,
    private compteService: CompteService,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2
  ) {
    this.renderer.addClass(this.document.body, 'bg-light');

    this.form = this.fb.group({
      rangeDate: this.todayYear,
    });

    this.userId = this.cookieService.get('userId');
    this.width = innerWidth / 1.3;
    Object.assign(this.multi);
  }

  ngOnInit(): void {
    let year = new Date(Date.now()).getFullYear() - 1;
    this.displayYear = [];
    this.soldeAllAccounts = [];

    // Définition de la 1ere année affichée
    this.operationService
      .getOperations(this.operationList, this.userId)
      .subscribe((operation) => {
        operation.reverse();
        this.firstOperationYear = operation[0].operationDate.split('-')[0];
        this.displayYear = [];

        for (let i = 0; i <= year - this.firstOperationYear; i++) {
          this.displayYear.push(year - i);
          this.operationsYears.push(year - i);
        }

        this.operationsYears.unshift(new Date(Date.now()).getFullYear());
        this.operationsYears.reverse();

        //Récupération des opérations et de la liste des comptes courant (return soldeAllAccounts)
        this.getBalancePerMonth();
        this.getEpargnePerMonth();

        this.getOperationHistory(this.todayYear);
        this.getEpargneHistory(this.todayYear);
        this.getEpargneHistoryPerAccount(this.todayYear);
      });

    this.todayMonthString = this.datePickerService.transformMonth(
      this.todayMonthString
    );
  }

  // Envoi du filtre de sélection d'année
  onSubmitChangeDate() {
    this.totalCredit = 0;
    this.totalDebit = 0;
    this.todayYear = this.form.value.rangeDate;

    // Si valeur du datepicker different de la date d'aujourd'hui alors un filtre est appliqué
    if (this.todayYear != new Date(Date.now()).getFullYear().toString()) {
      this.dateFiltered = true;
    } else {
      this.dateFiltered = false;
    }

    // this.showOperationsPerMonth(this.todayYear);
    this.displayDatas(this.todayYear);
    this.displayDatasEpargne(this.todayYear);
    this.displayYearlyEpargne(this.todayYear);
  }

  /*  ************************   COMPTE COURANT ****************************/

  // Récupérer les opérations mensuelles + sauvegarder en json
  getBalancePerMonth() {
    this.soldeAllAccounts = [];
    this.operationList = [];
    this.compteList = [];

    let compteListObservable = this.compteService.getCompteList(
      this.compteList,
      this.userId
    );
    let operationsObservable = this.operationService.getOperations(
      this.operationList,
      this.userId
    );

    forkJoin([compteListObservable, operationsObservable]).subscribe((data) => {
      this.soldeAllAccounts = [];

      this.operationService.fillSoldeAllAccounts(
        data[0],
        'Compte Courant',
        this.soldeAllAccounts,
        this.userId
      );

      this.operationService.fillOperations(
        data[1],
        this.soldeAllAccounts,
        this.userId
      );

      this.operationService
        .uploadAccountHistory(this.soldeAllAccounts, 'Compte Courant')
        .subscribe();
      return this.soldeAllAccounts;
    });
  }

  // Récupération de l'historique mensuel
  getOperationHistory(year: string) {
    this.soldeAllAccounts = [];
    this.monthlySoldeHistory = [];

    // let filteredArray = [];

    this.operationService.getAccountHistory().subscribe((history) => {
      this.soldeAllAccounts = <any>history;
      this.soldeAllAccounts.forEach((compte) => {
        this.initialSolde = this.initialSolde + compte.soldeInitial;
      });

      this.operationService.getOperationHistory(
        this.operationsYears,
        this.monthlySoldeHistory,
        this.initialSolde,
        this.soldeAllAccounts
      );
      console.log(this.soldeAllAccounts);
      this.displayDatas(year);
    });
  }

  // Affichage de l'évolution mensuelle
  displayDatas(year: string) {
    // Remise à 0 du tableau
    this.operationPerYear.forEach((data) => {
      data.economie = 0;
      data.solde = 0;
    });

    this.totalCredit = 0;
    this.totalDebit = 0;
    this.totaldifference = 0;
    this.evolutionCompteCourant = 0;

    // Récupération du solde par mois
    let monthlyHistoryFiltered = this.monthlySoldeHistory.filter((element) => {
      return element.dateSolde.includes(year) == true;
    });

    // Calcul de l'évolution en pourcentage
    let soldeInitial =
      monthlyHistoryFiltered[0].solde - monthlyHistoryFiltered[0].economie;
    let soldeFinal = monthlyHistoryFiltered[11].solde;

    if (soldeFinal - soldeInitial == 0) {
      this.evolutionCompteCourant = 0;
    } else {
      this.evolutionCompteCourant =
        Math.round(((soldeFinal - soldeInitial) / soldeInitial) * 100 * 10) /
        10;
    }

    for (let i = 0; i < 12; i++) {
      this.operationService
        .getOperationsFiltered((i + 1).toString(), year)
        .subscribe((data) => {
          this.compteList.forEach((compte) => {
            data.forEach((monthData) => {
              if (
                compte.name == monthData.compte &&
                compte.typeCompte == 'Compte Courant' &&
                monthData.userId == this.userId &&
                monthData.categorie != 'Transfert'
              ) {
                // MAJ des données du tableau
                this.operationPerYear[i].economie += monthData.montant;
                this.operationPerYear[i].economie = Math.round(
                  this.operationPerYear[i].economie
                );

                // MAJ du récap en haut de page
                if (monthData.montant < 0) {
                  this.totalDebit += monthData.montant;
                  this.totalDebit = Math.round(this.totalDebit);
                } else {
                  this.totalCredit += monthData.montant;
                  this.totalCredit = Math.round(this.totalCredit);
                }
              }
            });
          });

          this.operationPerYear[i].solde = Math.round(
            monthlyHistoryFiltered[i].solde
          );

          // MAJ du graphique
          // let tempArray: any[] = [{ name: 'Comptes Courants', series: [] }];
          let tempArray: any[] = [{ name: 'Comptes Courants', series: [] }];
          this.operationPerYear.forEach((data) => {
            tempArray[0].series.push({
              name: data.month,
              value: data.solde,
            });
          });
          this.multi = tempArray;

          // MAJ de l'affichage du tableau
          this.dataSource = new MatTableDataSource(this.operationPerYear);
          this.dataSource.paginator = this.paginator;
          this.totaldifference = Math.round(this.totalCredit + this.totalDebit);
        });
    }
  }

  /*  ************************   EPARGNE ****************************/

  // Récupérer des opérations mensuelles de l'épargne + sauvegarder en json
  getEpargnePerMonth() {
    this.soldeAllEpargne = [];
    this.operationEpargneList = [];
    this.compteEpargneList = [];

    let compteListObservable = this.compteService.getCompteList(
      this.compteEpargneList,
      this.userId
    );
    let operationsObservable = this.operationService.getOperations(
      this.operationEpargneList,
      this.userId
    );

    forkJoin([compteListObservable, operationsObservable]).subscribe((data) => {
      this.soldeAllEpargne = [];

      this.operationService.fillSoldeAllAccounts(
        data[0],
        'Epargne',
        this.soldeAllEpargne,
        this.userId
      );
      this.operationService.fillSoldeAllAccounts(
        data[0],
        'Bourse',
        this.soldeAllEpargne,
        this.userId
      );

      this.operationService.fillOperations(
        data[1],
        this.soldeAllEpargne,
        this.userId
      );

      this.operationService
        .uploadAccountHistory(this.soldeAllEpargne, 'Epargne')
        .subscribe();
      // console.log(this.soldeAllEpargne);
      return this.soldeAllEpargne;
    });
  }

  // Récupération de l'historique mensuel
  getEpargneHistory(year: string) {
    this.soldeAllEpargne = [];
    this.monthlyEpargneHistory = [];

    this.operationService.getEpargneHistory().subscribe((history) => {
      this.soldeAllEpargne = <any>history;
      this.soldeAllEpargne.forEach((compte) => {
        this.initialEpargneSolde =
          this.initialEpargneSolde + compte.soldeInitial;
      });

      this.soldeAllEpargne = this.operationService.getOperationHistory(
        this.operationsYears,
        this.monthlyEpargneHistory,
        this.initialEpargneSolde,
        this.soldeAllEpargne
      );

      // console.log(this.soldeAllEpargne);
      this.displayDatasEpargne(year);
    });
  }

  // Affichage de l'évolution mensuelle
  displayDatasEpargne(year: string) {
    // Remise à 0 du tableau
    this.epargnePerYear.forEach((data) => {
      data.economie = 0;
      data.solde = 0;
    });

    this.totalCreditEpargne = 0;
    this.totalDebitEpargne = 0;
    this.totaldifferenceEpargne = 0;
    this.evolutionEpargne = 0;

    // Récupération du solde par mois
    let monthlyHistoryFiltered = this.monthlyEpargneHistory.filter(
      (element) => {
        return element.dateSolde.includes(year) == true;
      }
    );

    // Calcul de l'évolution en pourcentage
    let soldeInitial =
      monthlyHistoryFiltered[0].solde - monthlyHistoryFiltered[0].economie;
    let soldeFinal = monthlyHistoryFiltered[11].solde;
    if (soldeFinal - soldeInitial == 0) {
      this.evolutionEpargne = 0;
    } else {
      this.evolutionEpargne =
        Math.round(((soldeFinal - soldeInitial) / soldeInitial) * 100 * 10) /
        10;
    }

    for (let i = 0; i < 12; i++) {
      this.operationService
        .getOperationsFiltered((i + 1).toString(), year)
        .subscribe((data) => {
          this.compteEpargneList.forEach((compte) => {
            data.forEach((monthData) => {
              if (
                compte.name == monthData.compte &&
                compte.typeCompte != 'Compte Courant' &&
                monthData.userId == this.userId &&
                monthData.categorie != 'Transfert'
              ) {
                // MAJ des données du tableau
                this.epargnePerYear[i].economie += monthData.montant;
                this.epargnePerYear[i].economie = Math.round(
                  this.epargnePerYear[i].economie
                );

                // MAJ du récap en haut de page
                if (monthData.montant < 0) {
                  this.totalDebitEpargne += monthData.montant;
                  this.totalDebitEpargne = Math.round(this.totalDebitEpargne);
                } else {
                  this.totalCreditEpargne += monthData.montant;
                  this.totalCreditEpargne = Math.round(this.totalCreditEpargne);
                }
              }
            });
          });

          this.epargnePerYear[i].solde = Math.round(
            monthlyHistoryFiltered[i].solde
          );

          // MAJ de l'affichage du tableau
          this.dataSourceEpargne = new MatTableDataSource(this.epargnePerYear);
          this.totaldifferenceEpargne = Math.round(
            this.totalCreditEpargne + this.totalDebitEpargne
          );
        });
    }
  }

  // Récupération de l'historique annuel du solde des comptes épargne
  getEpargneHistoryPerAccount(year: string) {
    this.soldeAllEpargnePerAccount = [];
    this.monthlyEpargneHistoryPerAccount = [];
    let filteredEpargnePerAccount = [];

    this.operationService.getEpargneHistory().subscribe((history) => {
      this.soldeAllEpargne = <any>history;
      this.soldeAllEpargne.forEach((compte, index) => {
        let initialSolde = compte.soldeInitial;
        let accountName = compte.compteName;

        this.soldeAllEpargnePerAccount.push({ name: accountName, history: [] });

        this.operationsYears.forEach((operationyear, indexyear) => {
          let montant = 0;
          filteredEpargnePerAccount = [];
          filteredEpargnePerAccount = compte.soldeHistory.filter(
            (element: any) => element.soldeDate.includes(operationyear)
          );
          filteredEpargnePerAccount.forEach((operation: any) => {
            montant += operation.montant;
          });

          if (indexyear == 0) {
            this.soldeAllEpargnePerAccount[index].history.push({
              year: operationyear,
              soldeInitial: initialSolde,
              soldeFinal: initialSolde + montant,
              evolution:
                Math.round(
                  ((initialSolde + montant - initialSolde) / initialSolde) *
                    100 *
                    10
                ) / 10,
            });
          } else {
            initialSolde =
              this.soldeAllEpargnePerAccount[index].history[indexyear - 1]
                .soldeFinal;
            this.soldeAllEpargnePerAccount[index].history.push({
              year: operationyear,
              soldeInitial: initialSolde,
              soldeFinal: initialSolde + montant,
              evolution:
                Math.round(
                  ((initialSolde + montant - initialSolde) / initialSolde) *
                    100 *
                    10
                ) / 10,
            });
          }
        });
      });

      this.displayYearlyEpargne(year);
    });
  }

  // Affichage de l'évolution annuelle par compte
  displayYearlyEpargne(year: string) {
    this.yearlyArray = [];
    let totalInitial = 0;
    let totalFinal = 0;
    let totalEvolution = 0;
    this.evolutionEpargne = 0;

    this.soldeAllEpargnePerAccount.forEach((compte) => {
      compte.history.forEach((history: any) => {
        if (history.year == year) {
          this.yearlyArray.push({ name: compte.name, history: history });
        }
      });
    });

    this.yearlyArray.forEach((compte) => {
      totalInitial += compte.history.soldeInitial;
      totalFinal += compte.history.soldeFinal;
    });

    if (totalFinal - totalInitial == 0) {
      totalEvolution = 0;
    } else {
      totalEvolution =
        Math.round(((totalFinal - totalInitial) / totalInitial) * 100 * 10) /
        10;
    }

    this.yearlyArray.push({
      name: 'TOTAL',
      history: {
        year: year,
        soldeInitial: totalInitial,
        soldeFinal: totalFinal,
        evolution: totalEvolution,
      },
    });
    this.evolutionEpargne = totalEvolution;
    this.dataSourceEpargneYearly = new MatTableDataSource(this.yearlyArray);
  }

  /************************* GRAPHIQUE *************** */
  onResize(event: any): void {
    this.width = event.target.innerWidth / 1.3;
  }

  /************** EXPORT **************** */
  export(type: string) {
    let arrayToExport: any[] = [];
    let filename = '';
    if (type == 'epargne') {
      arrayToExport = [];
      this.yearlyArray.forEach((data) => {
        arrayToExport.push({
          compte: data.name,
          'solde initial': data.history.soldeInitial + ' €',
          'solde Final': data.history.soldeFinal + ' €',
          evolution: data.history.evolution + ' %',
        });
      });

      filename = this.todayYear + '_epargne.csv';
    } else if (type == 'comptes') {
      arrayToExport = [];
      this.operationPerYear.forEach((data) => {
        arrayToExport.push({
          Mois: data.month,
          Economie: data.economie + ' €',
          Solde: data.solde + ' €',
        });
      });

      filename = this.todayYear + '_comptes.csv';
    }

    this.operationService.exportToCSV(arrayToExport, filename);
  }
}
