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
  isLoading = true;
  operationPerYear: Recap[] = [
    { month: 'Janvier', investi: 0, economie: 0, solde: 0 },
    { month: 'Février', investi: 0, economie: 0, solde: 0 },
    { month: 'Mars', investi: 0, economie: 0, solde: 0 },
    { month: 'Avril', investi: 0, economie: 0, solde: 0 },
    { month: 'Mai', investi: 0, economie: 0, solde: 0 },
    { month: 'Juin', investi: 0, economie: 0, solde: 0 },
    { month: 'Juillet', investi: 0, economie: 0, solde: 0 },
    { month: 'Août', investi: 0, economie: 0, solde: 0 },
    { month: 'Septembre', investi: 0, economie: 0, solde: 0 },
    { month: 'Octobre', investi: 0, economie: 0, solde: 0 },
    { month: 'Novembre', investi: 0, economie: 0, solde: 0 },
    { month: 'Décembre', investi: 0, economie: 0, solde: 0 },
  ];
  epargnePerYear: Recap[] = [
    { month: 'Janvier', investi: 0, economie: 0, solde: 0 },
    { month: 'Février', investi: 0, economie: 0, solde: 0 },
    { month: 'Mars', investi: 0, economie: 0, solde: 0 },
    { month: 'Avril', investi: 0, economie: 0, solde: 0 },
    { month: 'Mai', investi: 0, economie: 0, solde: 0 },
    { month: 'Juin', investi: 0, economie: 0, solde: 0 },
    { month: 'Juillet', investi: 0, economie: 0, solde: 0 },
    { month: 'Août', investi: 0, economie: 0, solde: 0 },
    { month: 'Septembre', investi: 0, economie: 0, solde: 0 },
    { month: 'Octobre', investi: 0, economie: 0, solde: 0 },
    { month: 'Novembre', investi: 0, economie: 0, solde: 0 },
    { month: 'Décembre', investi: 0, economie: 0, solde: 0 },
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
  columnsToDisplayEpargne = ['month', 'investi', 'economie', 'solde'];
  columnsToDisplayYearly = [
    'compte',
    'soldeInitial',
    'soldeFinal',
    'evolution',
  ];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  todayMonth = new Date(Date.now()).getMonth() + 1;
  todayYear = new Date(Date.now()).getFullYear().toString();
  filteredYear = this.todayYear;
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

  private subscriptions: Subscription = new Subscription();

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
    this.subscriptions.add(
      this.operationService
        .getOperations(this.operationList, this.userId)
        .subscribe((operation) => {
          if (operation && operation.length > 0){
            operation.reverse();
            this.firstOperationYear = operation[0].operationDate.split('-')[0];
            this.displayYear = [];
            this.displayYear.push(new Date(Date.now()).getFullYear())

            for (let i = 0; i <= year - this.firstOperationYear; i++) {
              this.displayYear.push(year - i);
              this.operationsYears.push(year - i);
            }

            this.operationsYears.unshift(new Date(Date.now()).getFullYear());
            this.operationsYears.reverse();

            //Récupération des opérations et de la liste des comptes courant (return soldeAllAccounts)
            this.getBalancePerMonth(this.todayYear);
            // this.getEpargnePerMonth(this.todayYear);
          } else {
            this.operationsYears.push(new Date(Date.now()).getFullYear());
            this.isLoading = false;
          }

        })
    );

    this.todayMonthString = this.datePickerService.transformMonth(
      this.todayMonthString
    );
  }

  // Envoi du filtre de sélection d'année
  onSubmitChangeDate() {
    this.totalCredit = 0;
    this.totalDebit = 0;
    this.filteredYear = this.form.value.rangeDate;
    this.todayYear = this.filteredYear
    this.isLoading = true;

    // Si valeur du datepicker different de la date d'aujourd'hui alors un filtre est appliqué
    if (this.filteredYear != new Date(Date.now()).getFullYear().toString()) {
      this.dateFiltered = true;
    } else {
      this.dateFiltered = false;
    }

    // this.showOperationsPerMonth(this.todayYear);
    this.getBalancePerMonth(this.filteredYear);
    // this.displayDatas(this.todayYear);
    // this.displayDatasEpargne(this.filteredYear);
    // this.displayYearlyEpargne(this.filteredYear);
  }

  /*  ************************   COMPTE COURANT ****************************/

  // Récupérer les opérations mensuelles + sauvegarder en json
  getBalancePerMonth(year: string) {
    //Comptes courants
    this.soldeAllAccounts = [];
    this.operationList = [];
    this.compteList = [];
    // comptes epargne
    this.soldeAllEpargne = [];
    this.operationEpargneList = [];
    this.compteEpargneList = [];

    let compteListObservable = this.compteService.getAllAccounts();
    let operationsObservable = this.operationService.getAllOperations();

    this.subscriptions.add(
      forkJoin([compteListObservable, operationsObservable]).subscribe((data) => {
        this.soldeAllAccounts = [];
        this.isLoading = false;
        // récupération des comptes
        data[0].forEach((compte) => {
          if (
            compte.userId == this.userId &&
            compte.typeCompte == 'Compte Courant' &&
            compte.name !== ("Compte joint" || "Compte Joint")
          ) {
            this.compteList.push(compte);
          } else if (compte.userId == this.userId &&
            (compte.typeCompte == 'Epargne' || compte.typeCompte == 'Bourse')) {
            this.compteEpargneList.push(compte);
          }
        });

        //Récupération des opérations de l'utilisateur
        data[1].forEach((operation) => {
          let matchCompteId = this.compteList.findIndex(
            (el) => el.id == operation.compte
          );
          let matchCompteName = this.compteList.findIndex(
            (el) => el.name == operation.compte
          );
          if (operation.userId == this.userId &&
            ((matchCompteName != -1) || (matchCompteId != -1))) {
            this.operationList.push(operation);
          }
        });

        //Récupération des opérations d'épargne de l'utilisateur
        data[1].forEach((operation) => {
          let matchCompteId = this.compteEpargneList.findIndex(
            (el) => el.id == operation.compte
          );
          let matchCompteName = this.compteEpargneList.findIndex(
            (el) => el.name == operation.compte
          );
          if (operation.userId == this.userId &&
            ((matchCompteName != -1) || (matchCompteId != -1))) {
            this.operationEpargneList.push(operation);
          }
        });

        // Ajout des comptes épargne dans un tableau soldeAllAccounts
        this.operationService.fillSoldeAllAccounts(
          this.compteList,
          'Compte Courant',
          this.soldeAllAccounts,
          this.userId
        );

        // Ajout des opérations courantes pour chaque compte dans le tableau soldeAllAccount
        this.operationService.fillOperations(
          this.operationList,
          this.soldeAllAccounts,
          this.userId
        );

        // Ajout des comptes épargne dans un tableau soldeAllEpargne
        this.operationService.fillSoldeAllAccounts(
          this.compteEpargneList,
          'Epargne',
          this.soldeAllEpargne,
          this.userId
        );
        this.operationService.fillSoldeAllAccounts(
          this.compteEpargneList,
          'Bourse',
          this.soldeAllEpargne,
          this.userId
        );

        // Ajout des opérations d'épargne pour chaque compte dans le tableau soldeAllEpargne
        this.operationService.fillOperations(
          this.operationEpargneList,
          this.soldeAllEpargne,
          this.userId
        );

        // HISTORIQUE des comptes courant

        // Calcul du solde initial de tous les comptes
        this.initialSolde = 0;
        this.soldeAllAccounts.forEach((compte) => {
          this.initialSolde = this.initialSolde + compte.soldeInitial;
        });

        // Détail des économies et du solde pour chaque mois
        this.monthlySoldeHistory = [];
        this.monthlySoldeHistory = this.operationService.getOperationHistory(
          this.operationsYears,
          this.monthlySoldeHistory,
          this.initialSolde,
          this.soldeAllAccounts
        );

        // HISTORIQUE de l'epargne

        // Calcul du solde initial de tous les comptes
        this.initialEpargneSolde = 0;
        this.soldeAllEpargne.forEach((compte) => {
          this.initialEpargneSolde =
            this.initialEpargneSolde + compte.soldeInitial;
        });

        // Détail des économies et du solde pour chaque mois
        this.monthlyEpargneHistory = [];
        this.monthlyEpargneHistory = this.operationService.getOperationHistory(
          this.operationsYears,
          this.monthlyEpargneHistory,
          this.initialEpargneSolde,
          this.soldeAllEpargne
        );

        this.displayDatas(year);
        // Affichage du tableau de l'année en cours grâce aux données de monthlyEpargneHistory
        this.displayDatasEpargne(year);

        // Calcule de l'évolution annuel de chaque compte
        this.getEpargneHistoryPerAccount(this.soldeAllEpargne, year);
      })
    );
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
      this.totaldifference = soldeFinal - soldeInitial;
      this.evolutionCompteCourant =
        ((soldeFinal - soldeInitial) / soldeInitial) * 100;
    }

    for (let i = 0; i < 12; i++) {
      // MAJ des données du tableau
      this.operationPerYear[i].economie = monthlyHistoryFiltered[i].economie;
      this.operationPerYear[i].solde = monthlyHistoryFiltered[i].solde;

      // MAJ du graphique
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
      // this.totaldifference = Math.round(this.totalCredit + this.totalDebit);
    }
  }

  /*  ************************   EPARGNE ****************************/

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
        ((soldeFinal - soldeInitial) / soldeInitial) * 100;
    }

    for (let i = 0; i < 12; i++) {
      this.operationEpargneList.forEach((monthData) => {
        let operationYear = monthData.operationDate.split('-')[0];
        let operationMonth = monthData.operationDate.split('-')[1];

        this.compteEpargneList.forEach((compte) => {
          if (
            ((compte.name == monthData.compte)  || (compte.id == monthData.compte)) &&
            compte.typeCompte != 'Compte Courant' &&
            monthData.userId == this.userId &&
            monthData.categorie != 'Transfert'
          ) {
            if (operationMonth == (i+1) && operationYear == year){
              this.epargnePerYear[i].economie += monthData.montant;
              this.epargnePerYear[i].economie = Math.round(
                this.epargnePerYear[i].economie
              );
            }

          }
        })

        this.epargnePerYear[i].solde = monthlyHistoryFiltered[i].solde;
        this.epargnePerYear[i].investi =
          monthlyHistoryFiltered[i].montantInvesti;

        // MAJ de l'affichage du tableau
        this.dataSourceEpargne = new MatTableDataSource(this.epargnePerYear);
        this.totaldifferenceEpargne = Math.round(
          this.totalCreditEpargne + this.totalDebitEpargne
        );

      })
    }

  }

  // Récupération de l'historique annuel du solde des comptes épargne
  getEpargneHistoryPerAccount(soldeAllEpargne: any[], year: string) {
    this.soldeAllEpargnePerAccount = [];
    this.monthlyEpargneHistoryPerAccount = [];
    let filteredEpargnePerAccount = [];

    soldeAllEpargne.forEach((compte, index) => {
      let initialSolde = compte.soldeInitial;
      let accountName = compte.compteName;

      this.soldeAllEpargnePerAccount.push({ name: accountName, history: [] });

      this.operationsYears.forEach((operationyear, indexyear) => {
        let montant = 0;
        let montantInvesti = 0;
        filteredEpargnePerAccount = [];
        filteredEpargnePerAccount = compte.soldeHistory.filter((element: any) =>
          element.soldeDate.includes(operationyear)
        );
        filteredEpargnePerAccount.forEach((operation: any) => {
          montant += operation.montant - operation.montantInvesti;
          montantInvesti += operation.montantInvesti;
        });

        if (indexyear != 0) {
          initialSolde =
            this.soldeAllEpargnePerAccount[index].history[indexyear - 1]
              .soldeFinal;
        }

        let soldeFinal = initialSolde + montant + montantInvesti;
        let totalInvesti = initialSolde + montantInvesti;

        this.soldeAllEpargnePerAccount[index].history.push({
          year: operationyear,
          soldeInitial: initialSolde,
          montantInvesti: montantInvesti,
          montantOperations: montant,
          totalInvesti: totalInvesti,
          soldeFinal: soldeFinal,
          evolution: ((soldeFinal - totalInvesti) / totalInvesti) * 100,
        });
      });

      this.displayYearlyEpargne(year);
    });
  }

  // Affichage de l'évolution annuelle par compte
  displayYearlyEpargne(year: string) {
    this.yearlyArray = [];
    let totalInitial = 0;
    let totalInvesti = 0;
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
      // console.log(compte)
      totalInitial += compte.history.soldeInitial;
      totalInvesti += compte.history.totalInvesti;
      totalFinal += compte.history.soldeFinal;
    });

    if (totalFinal - totalInvesti == 0) {
      totalEvolution = 0;
    } else {
      totalEvolution = ((totalFinal - totalInvesti) / totalInvesti) * 100;
      totalEvolution = Math.round(totalEvolution * 100) / 100
    }

    this.yearlyArray.push({
      name: 'TOTAL',
      history: {
        year: year,
        totalInvesti: totalInvesti,
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
          'solde initial': data.history.soldeInitial,
          'total investi': data.history.totalInvesti,
          'solde Final': data.history.soldeFinal,
          evolution: data.history.evolution,
        });
      });

      filename = this.todayYear + '_epargne.csv';
    } else if (type == 'comptes') {
      arrayToExport = [];
      this.operationPerYear.forEach((data) => {
        arrayToExport.push({
          Mois: data.month,
          Economie: data.economie,
          Solde: data.solde,
        });
      });

      filename = this.todayYear + '_comptes.csv';
    }

    this.operationService.exportToCSV(arrayToExport, filename);
  }

  ngOnDestroy() {
    if (this.dataSource) {
      this.dataSource.disconnect();
    }

    this.subscriptions.unsubscribe();
  }
}
