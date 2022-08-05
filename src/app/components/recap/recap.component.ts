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
    });

    this.showOperationsPerMonth(this.todayYear);
    this.dataSource.paginator = this.paginator;

    this.todayMonthString = this.datePickerService.transformMonth(
      this.todayMonthString
    );

    // this.getBalancePerMonth();
  }

  // Affichage du tableau filtré par année
  showOperationsPerMonth(year: string) {
    // Remise à 0 du tableau
    this.operationPerYear.forEach((data) => {
      data.economie = 0;
      data.solde = 0;
    });

    this.totalCredit = 0;
    this.totalDebit = 0;
    this.totaldifference = 0;

    this.getBalancePerMonth();

    /* *****************************        Ajout du solde mensuel **********************/
    let monthlySolde = 0;
    this.soldeAllAccounts.forEach((compte) => {
      monthlySolde = compte.soldeInitial;
      this.operationsYears.reverse().forEach((year) => {
        for (let i = 0; i < 12; i++) {
          // TODO: si pas de transaction -> reprendre le précédent
          // TODO: enregistrer les valeurs pour chaque mois
          // TODO: Additionner les valeurs de tous les comptes
          // TODO: Créer une BDD pour chaque année avec une ligne pour chaque mois?
        }
      });
    });

    // this.operationsYears.reverse().forEach((year) => {
    //   for (let i = 0; i < 12; i++) {
    //     // this.soldeAllAccounts.forEach((compte)=>{
    //     //   if (!compte.soldeHistory.soldeDate){

    //     //   }
    //     // })
    //     console.log(year);
    //     console.log(this.soldeAllAccounts);
    //   }
    // });
    // console.log(soldeAllAccounts);

    // console.log(this.soldeAllAccounts);

    /***********************************   Ajout des économies mensuelles ******************* */
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
                this.operationPerYear[i].economie =
                  Math.round(this.operationPerYear[i].economie * 100) / 100;

                // this.operationPerYear[i].solde = this.operationPerYear[
                //   i - 1
                // ].solde += monthData.montant;

                // MAJ du récap en haut de page
                if (monthData.montant < 0) {
                  this.totalDebit += monthData.montant;
                  this.totalDebit = Math.round(this.totalDebit * 100) / 100;
                } else {
                  this.totalCredit += monthData.montant;
                  this.totalCredit = Math.round(this.totalCredit * 100) / 100;
                }
              }
            });
          });

          // MAJ de l'affichage du tableau
          this.dataSource = new MatTableDataSource(this.operationPerYear);
          this.dataSource.paginator = this.paginator;
          this.totaldifference =
            Math.round((this.totalCredit + this.totalDebit) * 100) / 100;
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

    this.showOperationsPerMonth(this.todayYear);
  }

  // Récupération de la liste de tous les comptes
  getCompteList() {
    let compteListObservable = this.compteService.getAllAccounts().pipe(
      tap((data) => {
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

  getBalancePerMonth() {
    this.soldeAllAccounts = [];
    this.operationList = [];
    this.compteList = [];
    let economie = 0;
    let solde = 0;

    let compteListObservable = this.getCompteList();
    let operationsObservable = this.getOperations();

    forkJoin([compteListObservable, operationsObservable]).subscribe((data) => {
      let operations = data[1].reverse();
      data[0].forEach((compte) => {
        this.soldeAllAccounts.push({
          compteName: compte.name,
          soldeInitial: compte.soldeInitial,
          soldeHistory: [],
          lastSolde: compte.soldeInitial,
        });

        // solde = compte.soldeInitial;
      });

      operations.forEach((operation) => {
        // console.log(operation.operationDate);
        let operationDate = operation.operationDate.split('T')[0];
        // console.log(operation.operationDate.split('-'));
        this.soldeAllAccounts.forEach((compte) => {
          if (operation.compte == compte.compteName) {
            compte.lastSolde = compte.lastSolde + operation.montant;
            compte.soldeHistory.push({
              soldeDate: operationDate,
              montant: Math.round(operation.montant * 100) / 100,
              solde: Math.round(compte.lastSolde * 100) / 100,
            });

            // compte.compteOperations.unshift({
            //   operationdate: operation.operationDate,
            //   montant: operation.montant,
            //   solde: Math.round(operation.solde * 100) / 100,
            // });
          }
        });
      });
    });

    return this.soldeAllAccounts;
  }
}
