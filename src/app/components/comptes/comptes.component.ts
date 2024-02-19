import {
  Component,
  OnInit,
  ViewChild,
  Output,
  EventEmitter,
  Host,
} from '@angular/core';
import { Operation } from 'src/app/models/Operation';
import { OperationService } from 'src/app/services/operation.service';
import { OperationFormComponent } from '../operation-form/operation-form.component';

// import { ConfirmationDialogComponent } from '../operation-form/operation-form.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CompteFormComponent } from '../compte-form/compte-form.component';
import { CompteService } from 'src/app/services/compte.service';
import { forkJoin, Observable } from 'rxjs';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { CookieService } from 'ngx-cookie-service';
import { FormGroup, FormBuilder } from '@angular/forms';
import {
  faArrowDown,
  faArrowUp,
  faDownload,
  faFilter,
  faPen,
  faPlusCircle,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons';
// import * as jsPDF from 'jspdf';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  HostBinding,
  Inject,
  Renderer2,
  ChangeDetectorRef,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { OnDestroy } from '@angular/core';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import {map} from "rxjs/operators";

@Component({
  selector: 'app-comptes',
  templateUrl: './comptes.component.html',
  styleUrls: ['./comptes.component.css'],
})
export class ComptesComponent implements OnInit, OnDestroy {
  // @HostBinding('class.bg-light') someClass: Host = true;
  @Output() formSubmitted: EventEmitter<string>;

  operationList: any[] = [];
  allOperations: any[] = [];
  operationId!: string;
  operation!: Operation;
  totalCredit = 0;
  totalDebit = 0;
  userId!: string;

  compteList: any[] = [];
  compteId = '';
  compteCourantList: any[] = [];
  compteEpargneList: any[] = [];

  soldeAllAccounts: any[] = [];
  soldePerAccount: any[] = [];
  monthlysoldeHistory: any[] = [];
  monthlyHistoryPerAccount: any[] = [];

  spendByCategory: any[] = [];
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
    'Transfert',
    'Voyage',
    'santé',
  ];
  categorieClass: any[] = [
    ['Courses', 'courses'],
    ['Divers', 'divers'],
    ['Essence', 'essence'],
    ['Epargne', 'epargne'],
    ['Prélèvement', 'prelevement'],
    ['Pub', 'pub'],
    ['Remboursement', 'remboursement'],
    ['Restaurant', 'restaurant'],
    ['Salaire', 'salaire'],
    ['Transfert', 'transfert'],
    ['Voyage', 'voyage'],
    ['santé', 'sante'],
  ];

  // datasource = [];
  // dataSource!: MatTableDataSource<any>;
  obs!: Observable<any>;
  // dataSource: MatTableDataSource<Operation> = new MatTableDataSource<Operation>(
  //   this.operationList
  // );

  dataSource = new MatTableDataSource(this.operationList);
  @ViewChild(MatSort) sort!: MatSort | undefined;
  @ViewChild('table') table!: MatTable<any> | undefined;
  childRevelancy = { displayColumns: [], hideColumns: [], data: [] };
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
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  form!: FormGroup;
  todayMonth = new Date(Date.now()).getMonth() + 1;
  todayYear = new Date(Date.now()).getFullYear().toString();
  todayMonthString = this.todayMonth.toString();
  dateFiltered = true;

  firstOperationYear = 0;
  operationsYears: number[] = [];

  faPen = faPen;
  faTrashCan = faTrashCan;
  faArrowUp = faArrowUp;
  faArrowDown = faArrowDown;
  faDownload = faDownload;
  faPlus = faPlusCircle;
  faFilter = faFilter;

  width = 0;

  dialogRef!: MatDialogRef<ConfirmationDialogComponent>;

  constructor(
    private fb: FormBuilder,
    private operationService: OperationService,
    private compteService: CompteService,
    public dialog: MatDialog,
    private cookieService: CookieService,
    private changeDetectorRef: ChangeDetectorRef,

    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2
  ) {
    this.renderer.addClass(this.document.body, 'bg-light');
    this.formSubmitted = new EventEmitter<string>();
    this.userId = this.cookieService.get('userId');
    if (innerWidth >= 991) {
      this.width = innerWidth / 3.3;
    } else {
      this.width = innerWidth / 1.3;
    }
  }

  ngOnInit(): void {
    let year = new Date(Date.now()).getFullYear() - 1;

    this.operationService
      .getOperations(this.allOperations, this.userId)
      .subscribe((operations) => {
        // Menu déroulant pour années avec data
        operations.reverse();
        this.firstOperationYear = operations[0].operationDate.split('-')[0];
        for (let i = 0; i <= year - this.firstOperationYear; i++) {
          this.operationsYears.push(year - i);
        }
        this.operationsYears.unshift(new Date(Date.now()).getFullYear());
        this.operationsYears.reverse();

        this.dataSource = new MatTableDataSource(this.operationList);
        if ((new Date(Date.now()).getMonth() + 1).toString().length < 2) {
          this.todayMonthString =
            '0' + (new Date(Date.now()).getMonth() + 1).toString();
        }

        forkJoin([
          // this.operationList + dataSource, obs, paginator
          this.showOperationsFilteredObservable(),
          // this.compteList, this.compteCourantList, this.compteEpargneList
          this.showAccountsObservable()
        ]).subscribe(() => {
          // this.soldePerAccount puis this.monthlyHistoryPerAccount (affichage du solde de chaque compte à droite) -> a besoin du service allAccounts (donc de comptesList)
          // + de operationYears + d'une boucle des opérations
          // this.getSoldePerAccount(this.operationList);

          // this.getSoldePerAccount(operations);
          this.getMonthlySolde(this.todayMonthString, this.todayYear);
          // this.spendByCategory (camembert) -> a besoin du service operationsFiltered (donc operationList)
          this.getDepenseByCategory(this.todayMonthString, this.todayYear);
          // console.log(this.soldePerAccount)
        })

        this.changeDetectorRef.detectChanges();
        this.dataSource.paginator = this.paginator;
        this.obs = this.dataSource.connect();
      });

    if (this.todayMonthString.length < 2) {
      this.todayMonthString = 0 + this.todayMonthString;
    }

    this.form = this.fb.group({
      rangeDate: this.todayYear + '-' + this.todayMonthString,
    });
  }

  // Create Observables for showOperationsFiltered and showAccounts
  private showOperationsFilteredObservable(): Observable<any> {
    return this.showOperationsFiltered(this.todayMonthString, this.todayYear).pipe(
      map(() => {
        return;
      })
    );
  }

  private showAccountsObservable(): Observable<any> {
    return this.showAccounts().pipe(
      map(() => {
        return;
      })
    );
  }

  totalOperations(montant: number, type: boolean, categorie: string) {
    if (categorie != 'Transfert') {
      if (type == false) {
        this.totalDebit += montant;
      } else {
        this.totalCredit += montant;
      }

      let temp1 = Math.round(this.totalDebit * 100) / 100;
      this.totalDebit = temp1;

      let temp2 = Math.round(this.totalCredit * 100) / 100;
      this.totalCredit = temp2;
    }
  }

  /* ************************* Opêrations *********** */

  showOperationsFiltered(month: string, year: string): Observable<any> {
    this.operationList = [];
    this.totalCredit = 0;
    this.totalDebit = 0;
    let service: any = null;

    if (this.dateFiltered) {
      service = this.operationService.getOperationsFiltered(month, year);
    } else {
      service = this.operationService.getAllOperations();
    }

    return new Observable(observer => {
      service.subscribe((data: any) => {
        data.forEach((operation: any) => {
          if (operation.userId == this.userId) {
            // Ajout d'une class CSS par type d'opération
            let index = this.categorieClass.findIndex(
              (p) => p[0] == operation.categorie
            );
            operation.classCSS = this.categorieClass[index][1];
            this.operationList.push(operation);

            this.totalOperations(
              operation.montant,
              operation.type,
              operation.categorie
            );
          }
        });

        this.dataSource = new MatTableDataSource(this.operationList);
        this.changeDetectorRef.detectChanges();
        this.dataSource.paginator = this.paginator;
        this.obs = this.dataSource.connect();

        observer.next();
        observer.complete();
      });
    });
  }

  AddOperation() {
    this.dialog
      .open(OperationFormComponent, {
        data: {
          addOrEdit: 'add',
          compteList: this.compteList
        },
        width: '60%',
      })
      .afterClosed()
      .subscribe(() => {
        forkJoin([
          this.showOperationsFilteredObservable(),
          this.showAccountsObservable()
        ]).subscribe(() => {
          this.getMonthlySolde(this.todayMonthString, this.todayYear);
          this.getDepenseByCategory(this.todayMonthString, this.todayYear);
        })

        this.changeDetectorRef.detectChanges();
        this.dataSource.paginator = this.paginator;
        this.obs = this.dataSource.connect();
      });
  }

  openOperationDetail(operation: any) {
    this.dialog
      .open(OperationFormComponent, {
        data: {
          operation: operation,
          addOrEdit: 'edit',
          compteList: this.compteList,
        },
        width: '60%',
      })
      .afterClosed()
      .subscribe(() => {
        forkJoin([
          this.showOperationsFilteredObservable(),
          this.showAccountsObservable()
        ]).subscribe(() => {
          this.getMonthlySolde(this.todayMonthString, this.todayYear);
          this.getDepenseByCategory(this.todayMonthString, this.todayYear);
        })
      });
  }

  openConfirmation(operation: any) {
    this.dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      // width: '250px',
      disableClose: false,
    });
    this.dialogRef.componentInstance.confirmMessage =
      'Etes vous sûr de vouloir supprimer cette opération ?';

    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // do confirmation actions
        this.deleteOperation(operation);
      }
      // this.dialogRef = null;
    });
  }

  deleteOperation(operation: any) {
    this.operationId = operation._id;
    let montantRestitue = -operation.montant;

    // On met à jour le solde du compte
    this.compteService.getOneAccount(operation.compte).subscribe((compte) => {
      compte.soldeActuel = compte.soldeActuel + montantRestitue;
      const compteData = {
        id: operation.compte,
        compte: compte,
      };

      let updateSolde = this.compteService.updateOneAccount(compteData);
      let deleteOperation = this.operationService.deleteOperation(
        this.operationId
      );
      // On met à jour l'affichage
      forkJoin([updateSolde, deleteOperation]).subscribe(() => {
        forkJoin([
          this.showOperationsFilteredObservable(),
          this.showAccountsObservable()
        ]).subscribe(() => {
          this.getMonthlySolde(this.todayMonthString, this.todayYear);
          this.getDepenseByCategory(this.todayMonthString, this.todayYear);
        })
      })
    });
  }

  /* ************************* Accounts *********** */

  showAccounts(): Observable<any> {
    this.compteList = [];
    this.compteCourantList = [];

    return this.compteService.getAllAccounts().pipe(
      map((data) => {
        data.forEach((compte) => {
          if (compte.userId == this.userId) {
            let temp = Math.round(compte.soldeActuel * 100) / 100;
            compte.soldeActuel = temp;
            this.compteList.push(compte);

            if (compte.typeCompte == 'Compte Courant') {
              this.compteCourantList.push(compte);
            } else {
              this.compteEpargneList.push(compte);
            }
          }
        });
// console.log(this.compteList)
        return this.compteList;
      })
    );
  }

  AddAccount() {
    this.dialog
      .open(CompteFormComponent, {
        data: {
          addOrEdit: 'add',
        },
        width: '60%',
      })
      .afterClosed()
      .subscribe(() => {
        this.showAccountsObservable().subscribe(() => {
          this.getMonthlySolde(this.todayMonthString, this.todayYear);
        })
      });
  }

  openAccountDetail(compte: any) {
    this.compteService.getAllAccounts().subscribe((data) => {
      let compteIndex = data.findIndex((p) => p.name == compte.name);
      this.dialog
        .open(CompteFormComponent, {
          data: {
            compte: data[compteIndex],
            addOrEdit: 'edit',
          },
          width: '60%',
        })
        .afterClosed()
        .subscribe(() => {
          this.showAccountsObservable().subscribe(() => {
            this.getMonthlySolde(this.todayMonthString, this.todayYear);
          })
        });
    });
  }

  deleteAccount(compte: any) {
    this.compteService.getAllAccounts().subscribe((data) => {
      let compteIndex = data.findIndex((p) => p.name == compte.name);
      this.compteService.deleteAccount(data[compteIndex]._id).subscribe(() => {
        this.showAccountsObservable().subscribe(() => {
          this.getMonthlySolde(this.todayMonthString, this.todayYear);
        })
      });
    });
  }

  //TODO: a supprimer ?
  /*
  getSoldePerAccount(operations: any[]) {
    this.soldePerAccount = [];

    this.compteList.forEach((compte, index) => {
      if ( compte.userId == this.userId && compte.typeCompte == 'Compte Courant'
      ){
        let initialSolde = compte.soldeInitial;
        let accountName = compte.name;
        let accountId = compte._id;

        this.soldePerAccount.push({ name: accountName, id: accountId, history: [] });
        // Find the index of the account in the new array
        let compteIndex = this.soldePerAccount.findIndex(
          (p) => p.name == accountName
        );

        // Récupération du montant des opérations pour chaque mois et création du tableau avec bilan mensuel
        this.operationsYears.forEach((operationyear) => {
          for (let i = 0; i < 12; i++) {
            let montant = 0;
            let month: string;
            let totalDebit = 0;
            let totalCredit = 0;

            if (i < 9) {
              month = 0 + (i + 1).toString();
            } else {
              month = (i + 1).toString();
            }

            operations.forEach((operation) => {
              if (
                (operation.compte == accountName ||
                  operation.compteName == accountName ||
                  operation.compte == accountId) &&
                operation.operationDate.includes(
                  operationyear + '-' + month
                ) &&
                operation.userId === this.userId
              ) {
                if (operation.type){
                  totalCredit += operation.montant
                  let temp = Math.round(totalCredit * 100) / 100;
                  totalCredit = temp;
                } else {
                  totalDebit += (-operation.montant)
                  let temp = Math.round(totalDebit * 100) / 100;
                  totalDebit = temp;
                }
                montant += operation.montant;
              }
            });

            let compteIndex = this.soldePerAccount.findIndex(
              (p) => p.name == accountName
            );

            this.soldePerAccount[compteIndex].history.push({
              dateSolde: operationyear + '-' + month,
              soldeInitial: initialSolde,
              montant: montant,
              soldeFinal: initialSolde,
              totalCredit: totalCredit,
              totalDebit: totalDebit
            });
          }
        });

        // MAJ du solde initial et final mensuel
        for (let i = 0; i < this.soldePerAccount[compteIndex].history.length; i++) {
          let montant = this.soldePerAccount[compteIndex].history[i].montant;

          if (i > 0) {
            this.soldePerAccount[compteIndex].history[i].soldeInitial =
              this.soldePerAccount[compteIndex].history[i - 1].soldeFinal;
          }
          this.soldePerAccount[compteIndex].history[i].soldeFinal =
            this.soldePerAccount[compteIndex].history[i].soldeInitial +
            montant;
        }

      }
    })
      // console.log(this.soldePerAccount);
      this.getMonthlySolde(this.todayMonthString, this.todayYear);
  }

   */

  getMonthlySolde(month: string, year: string) {
    this.monthlyHistoryPerAccount = [];
    let filteredmonthlyHistory = [];

    // this.soldePerAccount.forEach((compte) => {
    this.compteList.forEach((compte) => {
      if (compte.userId == this.userId && compte.typeCompte == 'Compte Courant'
      ) {

        filteredmonthlyHistory = [];
        filteredmonthlyHistory = compte.history.filter((element: any) =>
          element.dateSolde.includes(year + '-' + month)
        );

        this.monthlyHistoryPerAccount.push({
          name: compte.name,
          history: filteredmonthlyHistory,
        });
      }
    });
    return this.monthlyHistoryPerAccount;
  }

  /************** Date picker ***********/
  onSubmitChangeDate() {
    // Récupération de la date depuis le formulaire html
    this.todayMonthString = this.form.value.rangeDate.split('-')[1];
    this.todayYear = this.form.value.rangeDate.split('-')[0];

    this.dateFiltered = true;

    forkJoin([
      this.showOperationsFilteredObservable(),
      this.showAccountsObservable()
    ]).subscribe(() => {
      this.getMonthlySolde(this.todayMonthString, this.todayYear);
      this.getDepenseByCategory(this.todayMonthString, this.todayYear);
    })
  }

  resetDateFilters() {
    this.todayMonth = new Date(Date.now()).getMonth() + 1;
    this.todayYear = new Date(Date.now()).getFullYear().toString();
    this.todayMonthString = this.todayMonth.toString();
    if (this.todayMonthString.length < 2) {
      this.todayMonthString = 0 + this.todayMonthString;
    }
    this.dateFiltered = false;

    forkJoin([
      this.showOperationsFilteredObservable(),
      this.showAccountsObservable()
    ]).subscribe(() => {
      this.getMonthlySolde('12', new Date(Date.now()).getFullYear().toString());
      this.getDepenseByCategory(
        '12',
        new Date(Date.now()).getFullYear().toString()
      );
    })

  }

  /*********** GRAPHIQUE ************* */
  getDepenseByCategory(month: string, year: string) {
    this.spendByCategory = [];
    let tempArray: any[] = [];
    this.categorieList.forEach((categorie) => {
      if (
        categorie != 'Transfert' &&
        categorie != 'Salaire' &&
        categorie != 'Remboursement'
      ) {
        tempArray.push({ name: categorie, value: 0 });
      }
    });

    this.operationList.forEach((operation) => {
      let montant = 0;
      if (
        operation.userId == this.userId &&
        operation.categorie != 'Transfert' &&
        operation.categorie != 'Salaire' &&
        operation.categorie != 'Remboursement'
      ) {
        let index = tempArray.findIndex(
          (x) => x.name == operation.categorie
        );

        if (operation.montant < 0) {
          montant = -operation.montant;
        } else {
          montant = 0;
        }
        tempArray[index].value += montant;
      }
    })

    this.spendByCategory = tempArray;
  }

  /* ---- Auto resize chart ---- */
  onResize(event: any): void {
    if (event.target.innerWidth >= 991) {
      this.width = event.target.innerWidth / 3.3;
    } else {
      this.width = event.target.innerWidth / 1.3;
    }
  }

  /*********** EXPORT TO PDF *************** */
  htmltoPDF() {
    // printChartis the html element which has to be converted to PDF
    html2canvas(document.querySelector('#dataToPrint')!).then((canvas) => {
      let fileWidth = 208;
      let fileHeight = (canvas.height * fileWidth) / canvas.width;
      let position = 0;

      const imgData = canvas.toDataURL('image/png');
      const pdfFile = new jsPDF('p', 'mm', 'a4');

      pdfFile.addImage(imgData, 'PNG', position, 0, fileWidth, fileHeight);
      pdfFile.save(
        this.todayYear + '-' + this.todayMonthString + ' operations.pdf'
      );
    });
  }

  export(type: string) {
    let arrayToExport: any[] = [];
    let filename = '';

    if (type == 'operations') {
      arrayToExport = [];
      this.operationList.forEach((data) => {
        arrayToExport.push({
          Date: this.todayYear + '-' + this.todayMonthString,
          Crédit: data.type ? data.montant : '',
          Débit: !data.type ? -data.montant : '',
          Catégorie: data.categorie,
          Compte: data.compteName,
          'Description 1': data.description1,
          'Description 2': data.description2,
        });
      });

      filename =
        this.todayYear + '-' + this.todayMonthString + '_operations.csv';
    } else if (type == 'comptes') {
      arrayToExport = [];
      this.monthlyHistoryPerAccount.forEach((data) => {
        arrayToExport.push({
          Date: data.history[0].dateSolde,
          Compte: data.name,
          'Solde Initial': data.history[0].soldeInitia,
          Différence: data.history[0].montant,
          'Solde Final': data.history[0].soldeFinal,
        });
      });

      filename = this.todayYear + '-' + this.todayMonthString + '_comptes.csv';
    }

    this.operationService.exportToCSV(arrayToExport, filename);
  }

  ngOnDestroy() {
    if (this.dataSource) {
      this.dataSource.disconnect();
    }
  }
}
