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

  constructor(
    private cookieService: CookieService,
    private fb: FormBuilder,
    private operationService: OperationService,
    private datePickerService: DatepickerService,
    private compteService: CompteService
  ) {
    this.form = this.fb.group({
      rangeDate: this.todayYear,
    });

    this.userId = this.cookieService.get('userId');
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

        this.getHistory(this.todayYear);
        this.getEpargneHistory(this.todayYear);
        this.getEpargneHistoryPerAccount(this.todayYear);
        // this.displayYearlyEpargne(this.todayYear);

        // this.dataSource.paginator = this.paginator;
      });

    this.todayMonthString = this.datePickerService.transformMonth(
      this.todayMonthString
    );
  }

  getHistory(year: string) {
    this.soldeAllAccounts = [];
    this.monthlySoldeHistory = [];

    // let filteredArray = [];

    this.operationService.getAccountHistory().subscribe((history) => {
      this.soldeAllAccounts = <any>history;
      this.soldeAllAccounts.forEach((compte) => {
        this.initialSolde = this.initialSolde + compte.soldeInitial;
      });

      // this.operationsYears.reverse();

      /*
      this.operationsYears.reverse().forEach((operationyear) => {
        for (let i = 0; i < 12; i++) {
          let month: string;
          let montantPerMonth = 0;
          if (i < 9) {
            month = 0 + (i + 1).toString();
          } else {
            month = (i + 1).toString();
          }
          this.monthlySoldeHistory.push({
            dateSolde: operationyear + '-' + month,
            economie: 0,
            solde: this.initialSolde,
          });

          let operationMonth = operationyear + '-' + month;

          let monthIndex = this.monthlySoldeHistory.findIndex(
            (obj) => obj.dateSolde == operationMonth
          );

          filteredArray = [];
          filteredArray = this.soldeAllAccounts
            .filter((element) =>
              element.soldeHistory.some(
                (subElement: any) => subElement.soldeDate === operationMonth
              )
            )
            .map((element) => {
              let newElt = Object.assign({}, element); // copies element
              return newElt.soldeHistory.filter(
                (subElement: any) => subElement.soldeDate === operationMonth
              );
            });

          filteredArray.forEach((monthOperation) => {
            montantPerMonth = 0;
            monthOperation.forEach((operation: any) => {
              montantPerMonth += operation.montant;
            });
          });

          this.monthlySoldeHistory[monthIndex].economie = montantPerMonth;
          if (monthIndex > 0) {
            this.monthlySoldeHistory[monthIndex].solde =
              this.monthlySoldeHistory[monthIndex - 1].solde + montantPerMonth;
          }
        }
      });
      */

      this.operationService.getHistory(
        this.operationsYears,
        this.monthlySoldeHistory,
        this.initialSolde,
        this.soldeAllAccounts
      );

      this.displayDatas(year);
    });
  }

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
    this.evolutionCompteCourant =
      Math.round(((soldeFinal - soldeInitial) / soldeInitial) * 100 * 10) / 10;

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

          // MAJ de l'affichage du tableau
          this.dataSource = new MatTableDataSource(this.operationPerYear);
          this.dataSource.paginator = this.paginator;
          this.totaldifference = Math.round(this.totalCredit + this.totalDebit);
        });
    }
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

  fillSoldeAllAccounts(data: any[], compteType: string, soldeAllArray: any[]) {
    data.forEach((compte) => {
      if (compte.typeCompte == compteType) {
        soldeAllArray.push({
          compteName: compte.name,
          soldeInitial: compte.soldeInitial,
          soldeHistory: [],
          lastSolde: compte.soldeInitial,
        });
      }
    });
    return soldeAllArray;
  }

  fillOperations(data: any[], soldeAllArray: any[]) {
    let operations = data.reverse();
    operations.forEach((operation) => {
      let operationDate =
        operation.operationDate.split('-')[0] +
        '-' +
        operation.operationDate.split('-')[1];

      soldeAllArray.forEach((compte) => {
        if (
          operation.compte == compte.compteName &&
          operation.categorie != 'Transfert'
        ) {
          compte.lastSolde = compte.lastSolde + operation.montant;
          compte.soldeHistory.push({
            soldeDate: operationDate,
            montant: Math.round(operation.montant * 100) / 100,
            solde: Math.round(compte.lastSolde * 100) / 100,
          });
        }
      });
    });
  }

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

      this.fillSoldeAllAccounts(
        data[0],
        'Compte Courant',
        this.soldeAllAccounts
      );

      this.fillOperations(data[1], this.soldeAllAccounts);

      this.operationService
        .uploadAccountHistory(this.soldeAllAccounts, 'Compte Courant')
        .subscribe();
      return this.soldeAllAccounts;
    });
  }

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

      this.fillSoldeAllAccounts(data[0], 'Epargne', this.soldeAllEpargne);
      this.fillSoldeAllAccounts(data[0], 'Bourse', this.soldeAllEpargne);

      this.fillOperations(data[1], this.soldeAllEpargne);

      this.operationService
        .uploadAccountHistory(this.soldeAllEpargne, 'Epargne')
        .subscribe();
      // console.log(this.soldeAllEpargne);
      return this.soldeAllEpargne;
    });
  }

  getEpargneHistory(year: string) {
    this.soldeAllEpargne = [];
    this.monthlyEpargneHistory = [];

    this.operationService.getEpargneHistory().subscribe((history) => {
      this.soldeAllEpargne = <any>history;
      this.soldeAllEpargne.forEach((compte) => {
        this.initialEpargneSolde =
          this.initialEpargneSolde + compte.soldeInitial;
      });

      this.soldeAllEpargne = this.operationService.getHistory(
        this.operationsYears,
        this.monthlyEpargneHistory,
        this.initialEpargneSolde,
        this.soldeAllEpargne
      );

      // console.log(this.soldeAllEpargne);
      this.displayDatasEpargne(year);
    });
  }

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
    this.evolutionEpargne =
      Math.round(((soldeFinal - soldeInitial) / soldeInitial) * 100 * 10) / 10;

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

  // Historique annuel du solde des comptes épargne
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
            // console.log(this.soldeAllEpargnePerAccount);
          }
        });
      });
      // console.log(this.soldeAllEpargnePerAccount);

      this.displayYearlyEpargne(year.toString());
      // return this.soldeAllEpargnePerAccount;
    });
  }

  displayYearlyEpargne(year: string) {
    this.yearlyArray = [];

    this.soldeAllEpargnePerAccount.forEach((compte) => {
      compte.history.forEach((history: any) => {
        if (history.year == year) {
          this.yearlyArray.push({ name: compte.name, history: history });
        }
      });
    });
    console.log(this.yearlyArray);
    this.dataSourceEpargneYearly = new MatTableDataSource(this.yearlyArray);
    // console.log(yearlyArray);
  }
}
