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
import {forkJoin, Observable, Subscription} from 'rxjs';
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
  faClose
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
  isLoading = true;

  compteList: any[] = [];
  compteId = '';
  compteCourantList: any[] = [];
  compteEpargneList: any[] = [];
  groupedComptes: { [key: string]: any[] } = {};
  groupedCompteTypes: string[] = [];

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
    'santé',
    'Transfert',
    'Voyage',
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
    ['santé', 'santé'],
    ['Transfert', 'transfert'],
    ['Voyage', 'voyage'],
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
  formAccountFiltered!: FormGroup;
  formCategoryFiltered!: FormGroup;
  todayMonth = new Date(Date.now()).getMonth() + 1;
  todayYear = new Date(Date.now()).getFullYear().toString();
  todayMonthString = this.todayMonth.toString();
  dateFiltered = true;
  selectedAccount = "";
  selectedCategory = "";
  selectedType = null;

  firstOperationYear = 0;
  operationsYears: number[] = [];

  faPen = faPen;
  faTrashCan = faTrashCan;
  faArrowUp = faArrowUp;
  faArrowDown = faArrowDown;
  faDownload = faDownload;
  faPlus = faPlusCircle;
  faFilter = faFilter;
  faClose = faClose;

  width = 0;

  dialogRef!: MatDialogRef<ConfirmationDialogComponent>;

  private subscriptions: Subscription = new Subscription();

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
    this.subscriptions.add(
      this.operationService
        .getOperations(this.allOperations, this.userId)
        .subscribe((operations) => {
          if (operations && operations.length > 0){
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

            this.subscriptions.add(
              forkJoin([
                // this.operationList + dataSource, obs, paginator
                this.showOperationsFilteredObservable(),
                // this.compteList, this.compteCourantList, this.compteEpargneList
                this.showAccountsObservable()
              ]).subscribe(() => {
                // this.soldePerAccount puis this.monthlyHistoryPerAccount (affichage du solde de chaque compte à droite) -> a besoin du service allAccounts (donc de comptesList)
                // + de operationYears + d'une boucle des opérations
                // this.getSoldePerAccount(this.operationList);
                this.isLoading = false;
                // this.getSoldePerAccount(operations);
                this.getMonthlySolde(this.todayMonthString, this.todayYear);
                // this.spendByCategory (camembert) -> a besoin du service operationsFiltered (donc operationList)
                this.getDepenseByCategory(this.todayMonthString, this.todayYear);
                // console.log(this.soldePerAccount)
                this.updatePaginator();
              })
            )
          } else {
            this.operationsYears.push(new Date(Date.now()).getFullYear());
            this.isLoading = false;
          }

        })
    );

    if (this.todayMonthString.length < 2) {
      this.todayMonthString = 0 + this.todayMonthString;
    }

    this.form = this.fb.group({
      rangeDate: this.todayYear + '-' + this.todayMonthString,
    });

    this.formAccountFiltered = this.fb.group({
      account: this.selectedAccount
    });

    this.formCategoryFiltered = this.fb.group({
      category: this.selectedCategory
    });
  }

  // Create Observables for showOperationsFiltered and showAccounts
  private showOperationsFilteredObservable(): Observable<any> {
    this.isLoading = true;
    return this.showOperationsFiltered(this.todayMonthString, this.todayYear).pipe(
      map(() => {
        return;
      })
    );
  }

  private showAccountsObservable(): Observable<any> {
    this.isLoading = true;
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
      this.subscriptions.add(
        service.subscribe((data: any) => {
        data.forEach((operation: any) => {
          if (operation.userId == this.userId) {
            // Ajout d'une class CSS par type d'opération
            let index = this.categorieClass.findIndex(
              (p) => p[0] == operation.categorie
            );


            if (index != -1){
              operation.classCSS = this.categorieClass[index][1];
            } else {
              console.log(operation)
              console.log(index)
              // console.log(this.categorieClass)
            }


            if ((this.selectedAccount == "" || this.selectedAccount == operation.compte) &&
              (this.selectedCategory == "" || this.selectedCategory == operation.categorie) &&
              (this.selectedType === null || this.selectedType == operation.type)){ //Prise en compte des filtres
              this.operationList.push(operation);

              this.totalOperations(
                operation.montant,
                operation.type,
                operation.categorie
              );
            }
          }
        });

        this.dataSource = new MatTableDataSource(this.operationList);
        this.updatePaginator();

        observer.next();
        observer.complete();
      })
      );
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
        this.subscriptions.add(
          forkJoin([
            this.showOperationsFilteredObservable(),
            this.showAccountsObservable()
          ]).subscribe(() => {
            this.isLoading = false;
            this.getMonthlySolde(this.todayMonthString, this.todayYear);
            this.getDepenseByCategory(this.todayMonthString, this.todayYear);

            this.updatePaginator();
          })
        )

      });
  }

  // Edit operation
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
        this.subscriptions.add(
          forkJoin([
            this.showOperationsFilteredObservable(),
            this.showAccountsObservable()
          ]).subscribe(() => {
            this.isLoading = false;
            this.getMonthlySolde(this.todayMonthString, this.todayYear);
            this.getDepenseByCategory(this.todayMonthString, this.todayYear);

            // Maj du paginator
            this.updatePaginator();
          })
        )
      });
  }

  // Delete operation
  openConfirmation(operation: any) {
    this.dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      // width: '250px',
      disableClose: false,
    });
    this.dialogRef.componentInstance.confirmMessage =
      'Etes vous sûr de vouloir supprimer cette opération ?';

    this.subscriptions.add(
      this.dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          // do confirmation actions
          this.deleteOperation(operation);
        }
        // this.dialogRef = null;
      })
    );
  }

  deleteOperation(operation: any) {
    this.operationId = operation._id;
    let montantRestitue = -operation.montant;

    // On met à jour le solde du compte
    this.subscriptions.add(
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
            this.isLoading = false;
            this.getMonthlySolde(this.todayMonthString, this.todayYear);
            this.getDepenseByCategory(this.todayMonthString, this.todayYear);

            // Maj du paginator
            this.updatePaginator();
          })
        })
      })
    );
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

        // On réorganise l'ordre d'affichage des comptes
        this.compteList = this.compteService.sortCompteListByType(this.compteList);
        this.groupedComptes = this.compteService.groupComptesByType(this.compteList);
        this.groupedCompteTypes = Object.keys(this.groupedComptes);

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
        this.subscriptions.add(
          this.showAccountsObservable().subscribe(() => {
            this.isLoading = false;
            this.getMonthlySolde(this.todayMonthString, this.todayYear);
          })
        )
      });
  }

  openAccountDetail(compte: any) {
    this.subscriptions.add(
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
            this.subscriptions.add(
              this.showAccountsObservable().subscribe(() => {
                this.isLoading = false;
                this.getMonthlySolde(this.todayMonthString, this.todayYear);
              })
            )
          });
      })
    );
  }

  deleteAccount(compte: any) {
    this.subscriptions.add(
      this.compteService.getAllAccounts().subscribe((data) => {
        let compteIndex = data.findIndex((p) => p.name == compte.name);
        this.subscriptions.add(
          this.compteService.deleteAccount(data[compteIndex]._id).subscribe(() => {
            this.showAccountsObservable().subscribe(() => {
              this.isLoading = false;
              this.getMonthlySolde(this.todayMonthString, this.todayYear);
            })
          })
        )
      })
    );
  }

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
          solde: compte.soldeActuel,
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
    this.isLoading = true;

    this.subscriptions.add(
      forkJoin([
        this.showOperationsFilteredObservable(),
        this.showAccountsObservable()
      ]).subscribe(() => {
        this.isLoading = false;
        this.getMonthlySolde(this.todayMonthString, this.todayYear);
        this.getDepenseByCategory(this.todayMonthString, this.todayYear);

        this.updatePaginator();
      })
    )
  }

  resetDateFilters() {
    this.todayMonth = new Date(Date.now()).getMonth() + 1;
    this.todayYear = new Date(Date.now()).getFullYear().toString();
    this.todayMonthString = this.todayMonth.toString();
    if (this.todayMonthString.length < 2) {
      this.todayMonthString = 0 + this.todayMonthString;
    }
    this.dateFiltered = false;

    this.subscriptions.add(
      forkJoin([
        this.showOperationsFilteredObservable(),
        this.showAccountsObservable()
      ]).subscribe(() => {
        this.isLoading = false;
        this.getMonthlySolde('12', new Date(Date.now()).getFullYear().toString());
        this.getDepenseByCategory(
          '12',
          new Date(Date.now()).getFullYear().toString()
        );
        this.updatePaginator();
      })
    )

  }

  /************** Account filter ***********/
  onSubmitAccountFilter(){
    // compte id
    this.selectedAccount = this.formAccountFiltered.value.account;

    this.subscriptions.add(
      this.showOperationsFilteredObservable().subscribe(() => {
        this.isLoading = false;
        this.updatePaginator();
      })
    )
  }

  /************** Category filter ***********/
  onSubmitCategoryFilter(){
    this.selectedCategory = this.formCategoryFiltered.value.category;
    this.subscriptions.add(
      this.showOperationsFilteredObservable().subscribe(() => {
        this.isLoading = false;
        this.updatePaginator();
      })
    )
  }

  /************** Crédit / débit filter ***********/
  typeFilter(type: any){
    if (this.selectedType == null || this.selectedType !== type){
        this.selectedType = type
    } else {
      this.selectedType = null
    }

    this.subscriptions.add(
      this.showOperationsFilteredObservable().subscribe(() => {
        this.isLoading = false;
        this.updatePaginator();
      })
    )
  }

  resetAllFilters(){
    this.selectedType = null;

    this.selectedCategory = "";
    this.formCategoryFiltered.get('category')?.setValue('');

    this.selectedAccount = "";
    this.formAccountFiltered.get('account')?.setValue('');

    this.subscriptions.add(
      this.showOperationsFilteredObservable().subscribe(() => {
        this.isLoading = false;
        this.updatePaginator();
      })
    )
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
        arrayToExport.unshift({
          Date: data.operationDate.split('T')[0],
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
          'Solde Initial': data.history[0].soldeInitial,
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

    this.subscriptions.unsubscribe();
  }

  /*********** GLOBAL *************** */

  updatePaginator() {
    this.changeDetectorRef.detectChanges();
    this.dataSource.paginator = this.paginator;
    this.obs = this.dataSource.connect();
  }
}
