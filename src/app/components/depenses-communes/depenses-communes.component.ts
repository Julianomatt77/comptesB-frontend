import {
  Component,
  OnInit,
  ViewChild,
  EventEmitter,
  Output,
} from '@angular/core';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { FormGroup, FormBuilder } from '@angular/forms';
import { faPen, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { MatDialog } from '@angular/material/dialog';
import { CookieService } from 'ngx-cookie-service';
import { OpCommunesService } from 'src/app/services/op-communes.service';
import { OpCommune } from 'src/app/models/OpCommune';
import { OpcommuneFormComponent } from '../opcommune-form/opcommune-form.component';
import { OpcommuneuserFormComponent } from '../opcommuneuser-form/opcommuneuser-form.component';
import { OpCommuneUser } from 'src/app/models/OpCommuneUser';

@Component({
  selector: 'app-depenses-communes',
  templateUrl: './depenses-communes.component.html',
  styleUrls: ['./depenses-communes.component.css'],
})
export class DepensesCommunesComponent implements OnInit {
  @Output() formSubmitted: EventEmitter<string>;

  userList: any[] = [];
  operationCommuneList: OpCommune[] = [];
  soldePerUser: any[] = [];

  totalCredit = 0;
  totalDebit = 0;

  userId!: string;

  dataSource = new MatTableDataSource(this.operationCommuneList);
  @ViewChild(MatSort) sort!: MatSort | undefined;
  @ViewChild('table') table!: MatTable<any> | undefined;
  childRevelancy = { displayColumns: [], hideColumns: [], data: [] };
  columnsToDisplay = [
    'operationDate',
    'name',
    'montant',
    'description',
    'edition',
    'suppression',
  ];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  form!: FormGroup;
  todayMonth = new Date(Date.now()).getMonth() + 1;
  todayYear = new Date(Date.now()).getFullYear().toString();
  todayMonthString = this.todayMonth.toString();
  dateFiltered = false;

  firstOperationYear = 0;
  operationsYears: number[] = [];

  faPen = faPen;
  faTrashCan = faTrashCan;

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private cookieService: CookieService,
    private opCommuneService: OpCommunesService
  ) {
    this.formSubmitted = new EventEmitter<string>();
    this.userId = this.cookieService.get('userId');
  }

  ngOnInit(): void {
    let year = new Date(Date.now()).getFullYear() - 1;

    if (this.todayMonthString.length < 2) {
      this.todayMonthString = 0 + this.todayMonthString;
    }

    this.form = this.fb.group({
      rangeDate: this.todayYear + '-' + this.todayMonthString,
    });
    this.getSoldePerUser();
    this.showUsers();
    this.showOperationsFiltered(this.todayMonthString, this.todayYear);
    // this.getSoldePerUser();
    // this.showOperations();
    // this.dataSource = new MatTableDataSource(this.operationCommuneList);
    // this.dataSource.paginator = this.paginator;

    console.log(this.operationCommuneList);
    // TODO get operationsYears
    // this.opCommuneService
    //   .getOperations(this.operationCommuneList, this.userId)
    //   .subscribe((operation) => {
    //     operation.reverse();
    //     this.firstOperationYear = operation[0].operationDate.split('-')[0];
    //     for (let i = 0; i <= year - this.firstOperationYear; i++) {
    //       this.operationsYears.push(year - i);
    //     }
    //     this.operationsYears.unshift(new Date(Date.now()).getFullYear());
    //     this.operationsYears.reverse();

    //     this.dataSource = new MatTableDataSource(this.operationCommuneList);
    //     if ((new Date(Date.now()).getMonth() + 1).toString().length < 2) {
    //       this.todayMonthString =
    //         '0' + (new Date(Date.now()).getMonth() + 1).toString();
    //     }

    //     //TODO: show operations and users
    //     console.log(this.operationCommuneList);

    //     this.dataSource.paginator = this.paginator;
    //   });
  }

  /* ******************* OPERATIONS ******************/

  showOperations() {
    this.operationCommuneList = [];
    this.opCommuneService.getAllOperations().subscribe((data) => {
      data.forEach((operation) => {
        if (operation.userId == this.userId) {
          this.operationCommuneList.push(operation);
        }
      });
      console.log(this.operationCommuneList);
      this.dataSource = new MatTableDataSource(this.operationCommuneList);
      this.dataSource.paginator = this.paginator;
    });
  }

  showOperationsFiltered(month: string, year: string) {
    this.operationCommuneList = [];
    this.opCommuneService
      .getOperationsFiltered(month, year)
      .subscribe((data) => {
        data.forEach((operation) => {
          if (operation.userId == this.userId) {
            this.operationCommuneList.push(operation);
            // this.totalOperations(
            //   operation.montant,
            //   operation.type,
            //   operation.categorie
            // );
          }
        });
        // console.log(this.operationCommuneList);
        this.dataSource = new MatTableDataSource(this.operationCommuneList);
        this.dataSource.paginator = this.paginator;
      });
  }

  AddOperation() {
    this.dialog
      .open(OpcommuneFormComponent, {
        data: {
          // operation: operation,
          addOrEdit: 'add',
          // id: operation._id,
        },
        width: '60%',
      })
      .afterClosed()
      .subscribe(() => {
        // this.opCommuneService.getOneUserByName()
        this.getSoldePerUser();
        this.showUsers();
        // this.showOperations();
        this.showOperationsFiltered(this.todayMonthString, this.todayYear);
        // this.getSoldePerUser();
        // this.showOperationsFiltered(this.todayMonthString, this.todayYear);
        // this.showAccounts();
        // this.getSoldePerAccount(this.operationList);
        // TODO show operations
      });
  }

  openOperationDetail(operation: any) {
    this.dialog
      .open(OpcommuneFormComponent, {
        data: {
          operation: operation,
          addOrEdit: 'edit',
          // id: operation._id,
        },
        width: '60%',
      })
      .afterClosed()
      .subscribe(() => {
        this.getSoldePerUser();
        this.showUsers();
        // this.showOperations();
        this.showOperationsFiltered(this.todayMonthString, this.todayYear);
        // this.getSoldePerUser();
        // this.showOperationsFiltered(this.todayMonthString, this.todayYear);
        // this.showAccounts();
        // this.getSoldePerAccount(this.operationList);
        // TODO
      });
  }

  deleteOperation(operation: any) {
    this.opCommuneService.deleteOperation(operation._id).subscribe(() => {
      this.getSoldePerUser();
      this.showUsers();
      // this.showOperations();
      this.showOperationsFiltered(this.todayMonthString, this.todayYear);
    });
  }

  /********************* DATEPICKER ****************** */

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

    this.operationCommuneList = [];
    this.totalCredit = 0;
    this.totalDebit = 0;

    // TODO Show operations + show users
    this.showUsers();
    this.showOperationsFiltered(this.todayMonthString, this.todayYear);
  }

  resetDateFilters() {
    this.todayMonth = new Date(Date.now()).getMonth() + 1;
    this.todayYear = new Date(Date.now()).getFullYear().toString();
    this.todayMonthString = this.todayMonth.toString();
    if (this.todayMonthString.length < 2) {
      this.todayMonthString = 0 + this.todayMonthString;
    }
    this.dateFiltered = false;

    // TODO Show operations + show users
    this.showUsers();
  }

  /**************** ACCOUNTS ************************* */

  showUsers() {
    this.userList = [];
    this.opCommuneService.getAllUsers().subscribe((data) => {
      data.forEach((user) => {
        if (user.userId == this.userId) {
          this.userList.push(user);
        }
      });
      console.log(this.userList);
    });
  }

  AddUser() {
    this.dialog
      .open(OpcommuneuserFormComponent, {
        data: {
          addOrEdit: 'add',
        },
        width: '60%',
      })
      .afterClosed()
      .subscribe(() => {
        this.showUsers();
      });
  }

  openUserDetail(user: any) {
    this.dialog
      .open(OpcommuneuserFormComponent, {
        data: {
          user: user,
          addOrEdit: 'edit',
        },
        width: '60%',
      })
      .afterClosed()
      .subscribe(() => {
        this.showUsers();
      });
  }

  deleteUser(user: any) {
    this.opCommuneService.deleteUser(user._id).subscribe(() => {
      this.showUsers();
    });
  }

  getSoldePerUser() {
    this.soldePerUser = [];

    this.opCommuneService.getAllUsers().subscribe((data) => {
      data.forEach((user, userIndex) => {
        if (user.userId == this.userId) {
          let userBDD = new OpCommuneUser('', '', []);
          this.opCommuneService.getOneUser(user._id).subscribe((data) => {
            userBDD = data;
          });

          let operationsHistory: any[] = [];
          this.opCommuneService.getAllOperations().subscribe((data) => {
            data.forEach((operation) => {
              if (
                operation.userId == this.userId &&
                operation.name == user.name
              ) {
                // this.operationCommuneList.push(operation);
                // console.log(operation);
                operationsHistory.push(operation);
              }
            });

            userBDD.history = operationsHistory;

            const userdata = {
              id: user._id,
              user: userBDD,
            };

            this.opCommuneService.updateOneUser(userdata).subscribe();
            // console.log(this.userList);
          });
        }
      });
      // console.log(this.userList);
      // console.log(this.soldePerUser);
    });
  }
}
