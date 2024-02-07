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
    // this.changeDetectorRef.detectChanges();
    // // this.dataSource.paginator = this.paginator;
    // this.obs = this.dataSource.connect();

    // this.changeDetectorRef.detectChanges();
    // this.dataSource.paginator = this.paginator;
    // this.obs = this.dataSource.connect();

    this.operationService
      .getOperations(this.allOperations, this.userId)
      .subscribe((operation) => {
        operation.reverse();
        this.firstOperationYear = operation[0].operationDate.split('-')[0];
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
        this.showOperationsFiltered(this.todayMonthString, this.todayYear);
        this.showAccounts();
        // this.dataSource.paginator = this.paginator;

        this.changeDetectorRef.detectChanges();
        this.dataSource.paginator = this.paginator;
        this.obs = this.dataSource.connect();

        this.getSoldePerAccount(operation);
        this.getDepenseByCategory(this.todayMonthString, this.todayYear);
      });

    if (this.todayMonthString.length < 2) {
      this.todayMonthString = 0 + this.todayMonthString;
    }

    this.form = this.fb.group({
      rangeDate: this.todayYear + '-' + this.todayMonthString,
    });
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

  showOperationsFiltered(month: string, year: string) {
    this.operationList = [];
    this.totalCredit = 0;
    this.totalDebit = 0;
    let service = null;

    if (this.dateFiltered) {
      service = this.operationService.getOperationsFiltered(month, year);
    } else {
      service = this.operationService.getAllOperations();
    }

    service.subscribe((data) => {
      data.forEach((operation) => {
        if (operation.userId == this.userId) {
          //Récupérer le nom du compte Bancaire lié à l'opération à partir de l'id
          this.compteService
            .getOneAccount(operation.compte)
            .subscribe((compte) => {
              operation.compte = compte.name;
            });

          // Ajout d'une class CSS par type d'opération
          let index = this.categorieClass.findIndex(
            (p) => p[0] == operation.categorie
          );
          operation.classCSS = this.categorieClass[index][1];
          this.operationList.push(operation);

          // Ajouter l'opération dans le calcul du récap seulement pour les comptes courants et sans prendre en compte le compte joint
          this.compteService.getAllAccounts().subscribe((compteList) => {
            compteList.forEach((compte) => {
              this.calculRecapCompte(compte, operation);
            });
          });

          // this.totalOperations(
          //   operation.montant,
          //   operation.type,
          //   operation.categorie
          // );
        }
      });
      this.dataSource = new MatTableDataSource(this.operationList);
      // console.log(this.monthlyHistoryPerAccount);
      // this.dataSource.paginator = this.paginator;
      this.changeDetectorRef.detectChanges();
      this.dataSource.paginator = this.paginator;
      this.obs = this.dataSource.connect();
    });
  }

  calculRecapCompte(compte: any, operation: any) {
    if (
      compte.userId == this.userId &&
      compte.typeCompte == 'Compte Courant' &&
      compte.name == operation.compte &&
      compte.name !== ('Compte joint' || 'Compte Joint')
    ) {
      this.totalOperations(
        operation.montant,
        operation.type,
        operation.categorie
      );
    }
  }

  AddOperation() {
    this.dialog
      .open(OperationFormComponent, {
        data: {
          addOrEdit: 'add',
        },
        width: '60%',
      })
      .afterClosed()
      .subscribe(() => {
        this.showOperationsFiltered(this.todayMonthString, this.todayYear);
        this.changeDetectorRef.detectChanges();
        this.dataSource.paginator = this.paginator;
        this.obs = this.dataSource.connect();
        this.operationService
          .getOperations(this.allOperations, this.userId)
          .subscribe((operations) => {
            this.getSoldePerAccount(operations);
            this.getDepenseByCategory(this.todayMonthString, this.todayYear);
          });
      });
  }

  openOperationDetail(operation: any) {
    this.dialog
      .open(OperationFormComponent, {
        data: {
          operation: operation,
          addOrEdit: 'edit',
        },
        width: '60%',
      })
      .afterClosed()
      .subscribe(() => {
        this.showOperationsFiltered(this.todayMonthString, this.todayYear);
        this.operationService
          .getOperations(this.allOperations, this.userId)
          .subscribe((operations) => {
            this.getSoldePerAccount(operations);
            this.getDepenseByCategory(this.todayMonthString, this.todayYear);
          });
        // this.showAccounts();
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

    this.operationService
      .getOneOperation(this.operationId)
      .subscribe((data) => {
        this.operation = data;
        this.compteService
          .getOneAccountByName(operation.compte, this.userId)
          .subscribe((compte) => {
            let montantRestitue = -this.operation.montant;
            if (compte) {
              this.compteId = compte._id;

              compte.soldeActuel = compte.soldeActuel + montantRestitue;

              const compteData = {
                id: this.compteId,
                compte: compte,
              };

              let updateSolde = this.compteService.updateOneAccount(compteData);
              let deleteOperation = this.operationService.deleteOperation(
                this.operationId
              );

              forkJoin([updateSolde, deleteOperation]).subscribe(() => {
                this.showOperationsFiltered(
                  this.todayMonthString,
                  this.todayYear
                );
                this.operationService
                  .getOperations(this.allOperations, this.userId)
                  .subscribe((operations) => {
                    this.getSoldePerAccount(operations);
                    this.getDepenseByCategory(
                      this.todayMonthString,
                      this.todayYear
                    );
                  });
              });
            } else {
              this.operationService
                .deleteOperation(this.operationId)
                .subscribe(() => {
                  this.showOperationsFiltered(
                    this.todayMonthString,
                    this.todayYear
                  );
                  this.operationService
                    .getOperations(this.allOperations, this.userId)
                    .subscribe((operations) => {
                      this.getSoldePerAccount(operations);
                      this.getDepenseByCategory(
                        this.todayMonthString,
                        this.todayYear
                      );
                    });
                });
            }
          });
      });
  }

  /* ************************* Accounts *********** */

  showAccounts() {
    this.compteList = [];
    this.compteCourantList = [];
    this.compteService.getAllAccounts().subscribe((data) => {
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
    });
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
        this.showAccounts();
        this.getSoldePerAccount(this.allOperations);
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
          this.showAccounts();
          this.getSoldePerAccount(this.allOperations);
        });
    });
  }

  deleteAccount(compte: any) {
    this.compteService.getAllAccounts().subscribe((data) => {
      let compteIndex = data.findIndex((p) => p.name == compte.name);
      this.compteService.deleteAccount(data[compteIndex]._id).subscribe(() => {
        this.showAccounts();
        this.getSoldePerAccount(this.allOperations);
      });
    });
  }

  getSoldePerAccount(operations: any[]) {
    this.soldePerAccount = [];
    // console.log(this.allOperations);

    this.compteService.getAllAccounts().subscribe((data: any[]) => {
      data.forEach((compte, index) => {
        if (
          compte.userId == this.userId &&
          compte.typeCompte == 'Compte Courant'
        ) {
          let initialSolde = compte.soldeInitial;
          let accountName = compte.name;
          let accountId = compte._id;

          this.soldePerAccount.push({ name: accountName, history: [] });

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
          for (
            let i = 0;
            i < this.soldePerAccount[compteIndex].history.length;
            i++
          ) {
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
      });
      // console.log(this.soldePerAccount);
      this.getMonthlySolde(this.todayMonthString, this.todayYear);
    });
  }

  getMonthlySolde(month: string, year: string) {
    this.monthlyHistoryPerAccount = [];
    let filteredmonthlyHistory = [];

    this.soldePerAccount.forEach((compte) => {
      filteredmonthlyHistory = [];
      filteredmonthlyHistory = compte.history.filter((element: any) =>
        element.dateSolde.includes(year + '-' + month)
      );

      this.monthlyHistoryPerAccount.push({
        name: compte.name,
        history: filteredmonthlyHistory,
      });
    });
    return this.monthlyHistoryPerAccount;
  }

  /************** Date picker ***********/
  onSubmitChangeDate() {
    let tempMonth = '';

    // Récupération de la date depuis le formulaire html
    this.todayMonthString = this.form.value.rangeDate.split('-')[1];
    this.todayYear = this.form.value.rangeDate.split('-')[0];

    // Si pas de filtre -> date d'aujourd'hui
    if ((new Date(Date.now()).getMonth() + 1).toString().length < 2) {
      tempMonth = '0' + (new Date(Date.now()).getMonth() + 1).toString();
    } else {
      tempMonth = (new Date(Date.now()).getMonth() + 1).toString();
    }

    // Si valeur du datepicker different de la date d'aujourd'hui alors un filtre est appliqué
    if (
      this.todayMonthString != tempMonth ||
      this.todayYear != new Date(Date.now()).getFullYear().toString()
    ) {
      this.dateFiltered = true;
    }

    // Appel au backend pour filtrer les données par date
    this.operationList = [];
    this.totalCredit = 0;
    this.totalDebit = 0;

    this.showOperationsFiltered(this.todayMonthString, this.todayYear);
    // this.getMonthlySolde(this.todayMonthString, this.todayYear);
    this.getSoldePerAccount(this.allOperations);
    this.getDepenseByCategory(this.todayMonthString, this.todayYear);
  }

  resetDateFilters() {
    this.todayMonth = new Date(Date.now()).getMonth() + 1;
    this.todayYear = new Date(Date.now()).getFullYear().toString();
    this.todayMonthString = this.todayMonth.toString();
    if (this.todayMonthString.length < 2) {
      this.todayMonthString = 0 + this.todayMonthString;
    }
    this.dateFiltered = false;

    this.showOperationsFiltered(this.todayMonthString, this.todayYear);
    this.showAccounts();
    this.getMonthlySolde('12', new Date(Date.now()).getFullYear().toString());
    this.getDepenseByCategory(
      '12',
      new Date(Date.now()).getFullYear().toString()
    );
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

    this.operationService
      .getOperationsFiltered(month, year)
      .subscribe((data) => {
        data.forEach((operation) => {
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
        });
        this.spendByCategory = tempArray;
      });
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
          Compte: data.compte,
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

  // exportChart(id: string) {
  //   // let canvas = document.getElementById(id) as HTMLCanvasElement;
  //   // const chartEl: any = document.getElementById(id);
  //   // const chartEl: any = document.querySelector('#' + id);
  //   // console.log(chartEl);
  //   // const image = chartEl.toDataURL('image/png');

  //   // const pdf = new jsPDF('p', 'mm', 'a4');
  //   // pdf.addImage(image, 'PNG', 80, 30, 150, 150);
  //   // pdf.save('chart.pdf');

  //   let chart = document.querySelector('#' + id);
  //   // chart.then;

  //   html2canvas(document.querySelector('#' + id)!).then((canvas) => {
  //     console.log(canvas);
  //     let fileWidth = 208;
  //     let fileHeight = (canvas.height * fileWidth) / canvas.width;
  //     const imgData = canvas.toDataURL('image/png');
  //     const pdfFile = new jsPDF('p', 'mm', 'a4');
  //     let position = 0;
  //     pdfFile.addImage(imgData, 'PNG', position, 0, fileWidth, fileHeight);
  //     pdfFile.save('sample2.pdf');
  //   });
  // }

  ngOnDestroy() {
    if (this.dataSource) {
      this.dataSource.disconnect();
    }
  }
}
