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

@Component({
  selector: 'app-recap',
  templateUrl: './recap.component.html',
  styleUrls: ['./recap.component.css'],
})
export class RecapComponent implements OnInit {
  operationList: any[] = [];
  operationId!: string;
  operation!: Operation;
  totalCredit = 0;
  totalDebit = 0;
  totaldifference = 0;
  userId!: string;
  compteList: any[] = [];
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
  displayYear: Array<number> = [];

  dataSource = new MatTableDataSource(this.operationPerYear);
  @ViewChild(MatSort) sort!: MatSort | undefined;
  @ViewChild('table') table!: MatTable<any> | undefined;
  childRevelancy = { displayColumns: [], hideColumns: [], data: [] };
  columnsToDisplay = ['month', 'economie', 'solde'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  todayMonth = new Date(Date.now()).getMonth() + 1;
  todayYear = new Date(Date.now()).getFullYear().toString();
  todayMonthString = this.todayMonth.toString();
  firstOperationYear = 0;
  operationsYears: number[] = [];
  dateFiltered = false;
  soldeAllAccounts: any[] = [];

  monthlySoldeHistory: SoldeHistory[] = [];
  soldeHistory: SoldeHistory[] = [];
  initialSolde = 0;

  constructor(
    private cookieService: CookieService,
    private fb: FormBuilder,
    private operationService: OperationService,
    private datePickerService: DatepickerService,
    private compteService: CompteService
  ) {
    this.form = this.fb.group({
      rangeDate: this.todayYear + '-' + this.todayMonthString,
    });

    this.userId = this.cookieService.get('userId');
  }

  ngOnInit(): void {
    let year = new Date(Date.now()).getFullYear() - 1;
    this.displayYear = [];
    this.soldeAllAccounts = [];

    // Définition de la 1ere année affichée
    this.getOperations().subscribe((operation) => {
      operation.reverse();
      this.firstOperationYear = operation[0].operationDate.split('-')[0];
      this.displayYear = [];

      for (let i = 0; i <= year - this.firstOperationYear; i++) {
        this.displayYear.push(year - i);
        this.operationsYears.push(year - i);
      }

      this.operationsYears.unshift(new Date(Date.now()).getFullYear());

      //Récupération des opérations et de la liste des comptes courant (return soldeAllAccounts)
      this.getBalancePerMonth();

      this.initialyse(this.todayYear);
      // this.displayDatas(this.todayYear);

      this.dataSource.paginator = this.paginator;
    });

    this.todayMonthString = this.datePickerService.transformMonth(
      this.todayMonthString
    );
  }

  initialyse(year: string) {
    this.soldeAllAccounts = [];
    this.monthlySoldeHistory = [];
    let filteredArray = [];
    let montantPerMonth = 0;

    this.operationService.getAccountHistory().subscribe((history) => {
      this.soldeAllAccounts = <any>history;
      this.soldeAllAccounts.forEach((compte) => {
        this.initialSolde = this.initialSolde + compte.soldeInitial;
      });

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
          // console.log(this.soldeAllAccounts);
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

          // console.log(filteredArray);

          this.monthlySoldeHistory[monthIndex].economie = montantPerMonth;
          if (monthIndex > 0) {
            this.monthlySoldeHistory[monthIndex].solde =
              this.monthlySoldeHistory[monthIndex - 1].solde + montantPerMonth;
          }
        }
      });

      console.log(this.soldeAllAccounts);
      console.log(this.monthlySoldeHistory);

      this.displayDatas(year);
    });
  }

  // Affichage du tableau filtré par année
  async showOperationsPerMonth(year: string) {
    // Remise à 0 du tableau
    this.operationPerYear.forEach((data) => {
      data.economie = 0;
      data.solde = 0;
    });

    this.totalCredit = 0;
    this.totalDebit = 0;
    this.totaldifference = 0;

    /* *****************************        Ajout du solde mensuel **********************/
    await this.getBalancePerMonth(); // Enregistrement de l'historique des comptes dans un json

    this.monthlySoldeHistory = [];

    await this.operationService.getAccountHistory().subscribe((history) => {
      this.soldeAllAccounts = <any>history;
      this.soldeAllAccounts.forEach((compte) => {
        this.initialSolde = this.initialSolde + compte.soldeInitial;
      });
      console.log(this.soldeAllAccounts);

      // Initialisation du tableau de tous les soldes mensuels
      this.operationsYears.reverse().forEach((operationyear) => {
        // console.log(operationyear);
        // console.log(this.soldeAllAccounts);
        for (let i = 0; i < 12; i++) {
          let month: string;
          if (i < 9) {
            month = 0 + (i + 1).toString();
          } else {
            month = (i + 1).toString();
          }

          // console.log(operationyear + '-' + month);
          this.monthlySoldeHistory.push({
            dateSolde: operationyear + '-' + month,
            economie: 0,
            solde: this.initialSolde,
          });

          // console.log(this.monthlySoldeHistory);

          let monthIndex = this.monthlySoldeHistory.findIndex(
            (obj) => obj.dateSolde == operationyear + '-' + month
          );
          if (monthIndex > 0) {
            this.monthlySoldeHistory[monthIndex].solde =
              this.monthlySoldeHistory[monthIndex - 1].solde;
          }
          // console.log(operationyear + '-' + month);
          // console.log(monthIndex);

          let montantTransaction = 0;
          this.operationService
            .getOperationsFiltered(month, operationyear.toString())
            .subscribe((data) => {
              data.forEach((operation) => {
                let monthIndex = this.monthlySoldeHistory.findIndex(
                  (obj) => obj.dateSolde == operationyear + '-' + month
                );

                // console.log(monthIndex);
                // console.log(monthIndex - 1);
                if (monthIndex > 0) {
                  this.monthlySoldeHistory[monthIndex].solde =
                    this.monthlySoldeHistory[monthIndex - 1].solde;
                  // console.log(this.monthlySoldeHistory[monthIndex]);
                }

                if (operation.userId == this.userId) {
                  // this.operationList.push(operation);

                  // On prend en compter les opérations seulement si c'est un compte courant
                  let compteIndex = this.soldeAllAccounts.findIndex(
                    (obj) => obj.compteName == operation.compte
                  );
                  if (compteIndex != -1) {
                    let operationDate =
                      operation.operationDate.split('-')[0] +
                      '-' +
                      operation.operationDate.split('-')[1];
                    montantTransaction += operation.montant;

                    let objIndex = this.monthlySoldeHistory.findIndex(
                      (obj) => obj.dateSolde == operationDate
                    );
                    // console.log(this.monthlySoldeHistory[objIndex]);

                    // MAJ de la colonne economie
                    if (objIndex != -1) {
                      this.monthlySoldeHistory[objIndex].economie =
                        Math.round(montantTransaction * 100) / 100;
                      this.monthlySoldeHistory[objIndex].solde =
                        this.monthlySoldeHistory[objIndex - 1].solde +
                        montantTransaction;
                    } else {
                    }
                  }
                }
              });
              // console.log(this.monthlySoldeHistory);
              return this.monthlySoldeHistory;
            });

          // console.log(this.monthlySoldeHistory);
        }
      });
      // console.log(this.monthlySoldeHistory);

      // this.monthlySoldeHistory.forEach((dataMonth) => {
      //   console.log(dataMonth.economie);
      // });
    });

    // this.soldeHistory = this.monthlySoldeHistory;
    // console.log(this.monthlySoldeHistory);

    // return this.monthlySoldeHistory;
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

    // Récupération du solde par mois
    let monthlyHistoryFiltered = this.monthlySoldeHistory.filter((element) => {
      return element.dateSolde.includes(year) == true;
    });

    for (let i = 0; i < 12; i++) {
      this.operationService
        .getOperationsFiltered((i + 1).toString(), year)
        .subscribe((data) => {
          this.compteList.forEach((compte) => {
            data.forEach((monthData) => {
              if (
                compte.name == monthData.compte &&
                compte.typeCompte == 'Compte Courant' &&
                monthData.userId == this.userId
              ) {
                // MAJ des données du tableau
                this.operationPerYear[i].economie += monthData.montant;
                this.operationPerYear[i].economie = Math.round(
                  this.operationPerYear[i].economie
                );

                // this.operationPerYear[i].solde = this.operationPerYear[
                //   i - 1
                // ].solde += monthData.montant;

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

          // console.log(this.operationPerYear);
          // console.log(monthlyHistoryFiltered);

          // this.operationPerYear[i].solde = 0;
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

    // Si valeur du datepicker different de la date d'aujourd'hui almors un filtre est appliqué
    if (this.todayYear != new Date(Date.now()).getFullYear().toString()) {
      this.dateFiltered = true;
    }

    // this.showOperationsPerMonth(this.todayYear);
    this.displayDatas(this.todayYear);
  }

  // Récupération de la liste de tous les comptes
  getCompteList() {
    let compteListObservable = this.compteService.getAllAccounts().pipe(
      tap((data) => {
        this.compteList = [];
        data.forEach((compte) => {
          if (compte.userId == this.userId) {
            compte.soldeActuel = Math.round(compte.soldeActuel * 100) / 100;
            this.compteList.push(compte);
          }
        });
      })
    );

    return compteListObservable;
  }

  // Récupération de la liste de toutes les opérations
  getOperations() {
    let operationsObservable = this.operationService.getAllOperations().pipe(
      tap((data) => {
        data.forEach((operation) => {
          if (operation.userId == this.userId) {
            this.operationList.unshift(operation);
          }
        });
      })
    );
    // console.log(operationsObservable);
    return operationsObservable;
  }

  // Récupérer historique mensuel + sauvegarder en json
  getBalancePerMonth() {
    this.soldeAllAccounts = [];
    this.operationList = [];
    this.compteList = [];

    let compteListObservable = this.getCompteList();
    let operationsObservable = this.getOperations();

    forkJoin([compteListObservable, operationsObservable]).subscribe((data) => {
      this.soldeAllAccounts = [];
      let operations = data[1].reverse();
      data[0].forEach((compte) => {
        // console.log(compte.typeCompte);

        if (compte.typeCompte == 'Compte Courant') {
          this.soldeAllAccounts.push({
            compteName: compte.name,
            soldeInitial: compte.soldeInitial,
            soldeHistory: [],
            lastSolde: compte.soldeInitial,
          });
        }
      });

      operations.forEach((operation) => {
        // let operationDate = operation.operationDate.split('T')[0];
        let operationDate =
          operation.operationDate.split('-')[0] +
          '-' +
          operation.operationDate.split('-')[1];
        this.soldeAllAccounts.forEach((compte) => {
          if (operation.compte == compte.compteName) {
            compte.lastSolde = compte.lastSolde + operation.montant;
            compte.soldeHistory.push({
              soldeDate: operationDate,
              montant: Math.round(operation.montant * 100) / 100,
              solde: Math.round(compte.lastSolde * 100) / 100,
            });
          }
        });
      });
      this.operationService
        .uploadAccountHistory(this.soldeAllAccounts)
        .subscribe();
      // console.log(this.soldeAllAccounts);
      return this.soldeAllAccounts;
    });
  }
}
