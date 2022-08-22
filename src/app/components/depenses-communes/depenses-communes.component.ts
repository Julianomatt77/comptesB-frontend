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
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-depenses-communes',
  templateUrl: './depenses-communes.component.html',
  styleUrls: ['./depenses-communes.component.css'],
})
export class DepensesCommunesComponent implements OnInit {
  @Output() formSubmitted: EventEmitter<string>;

  userList: any[] = [];
  operationCommuneList: OpCommune[] = [];
  soldePerUser: any[] = [{ name: '', montant: 0 }];

  totalDifference = 0;
  totalMoyenne = 0;

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
    // this.getSoldePerUser();
    this.showUsers(this.todayMonthString, this.todayYear);
    this.showOperationsFiltered(this.todayMonthString, this.todayYear);
    // this.getSoldePerUser(this.todayMonthString, this.todayYear);
    // this.showOperations();
  }

  /* ******************* OPERATIONS ******************/

  showOperations() {
    let getOperationsObservable = this.opCommuneService.getAllOperations();

    return getOperationsObservable;

    // this.operationCommuneList = [];
    // this.opCommuneService.getAllOperations().subscribe((data) => {
    //   data.forEach((operation) => {
    //     if (operation.userId == this.userId) {
    //       this.operationCommuneList.push(operation);
    //     }
    //   });
    //   // console.log(this.operationCommuneList);
    //   this.dataSource = new MatTableDataSource(this.operationCommuneList);
    //   this.dataSource.paginator = this.paginator;
    // });
  }

  showOperationsFiltered(month: string, year: string) {
    this.operationCommuneList = [];
    this.opCommuneService
      .getOperationsFiltered(month, year)
      .subscribe((data) => {
        // this.soldePerUser = []
        data.forEach((operation) => {
          if (operation.userId == this.userId) {
            this.operationCommuneList.push(operation);
          }
        });
        // console.log(this.operationCommuneList);
        // console.log(this.userList);

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
        // this.getSoldePerUser();
        this.showUsers(this.todayMonthString, this.todayYear);
        // this.showOperations();
        this.showOperationsFiltered(this.todayMonthString, this.todayYear);
        // this.getSoldePerUser();

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
        // this.getSoldePerUser();
        this.showUsers(this.todayMonthString, this.todayYear);
        // this.showOperations();
        this.showOperationsFiltered(this.todayMonthString, this.todayYear);
        // this.getSoldePerUser();
      });
  }

  deleteOperation(operation: any) {
    this.opCommuneService.deleteOperation(operation._id).subscribe(() => {
      // this.getSoldePerUser();
      this.showUsers(this.todayMonthString, this.todayYear);
      // this.showOperations();
      this.showOperationsFiltered(this.todayMonthString, this.todayYear);
      // this.getSoldePerUser(this.todayMonthString, this.todayYear);
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
    // this.totalCredit = 0;
    // this.totalDebit = 0;

    // TODO Show operations + show users
    this.showUsers(this.todayMonthString, this.todayYear);
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
    this.showUsers(this.todayMonthString, this.todayYear);
  }

  /**************** ACCOUNTS ************************* */

  // showUsers() {
  //   this.userList = [];
  //   this.opCommuneService.getAllUsers().subscribe((data) => {
  //     data.forEach((user) => {
  //       if (user.userId == this.userId) {
  //         this.userList.push(user);
  //       }
  //     });
  //     console.log(this.userList);
  //   });
  // }

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
        this.showUsers(this.todayMonthString, this.todayYear);
      });
  }

  openUserDetail(user: any) {
    // console.log(user);
    this.opCommuneService.getOneUserByName(user.name).subscribe((data) => {
      this.dialog
        .open(OpcommuneuserFormComponent, {
          data: {
            user: data,
            addOrEdit: 'edit',
          },
          width: '60%',
        })
        .afterClosed()
        .subscribe(() => {
          this.showUsers(this.todayMonthString, this.todayYear);
          // this.getSoldePerUser(this.todayMonthString, this.todayYear);
        });
    });
  }

  deleteUser(user: any) {
    this.opCommuneService.getOneUserByName(user.name).subscribe((data) => {
      this.opCommuneService.deleteUser(data._id).subscribe(() => {
        this.showUsers(this.todayMonthString, this.todayYear);
      });
    });
  }

  getSoldePerUser(month: string, year: string) {
    this.soldePerUser = [];
    this.totalDifference = 0;

    this.opCommuneService.getAllUsers().subscribe((users) => {
      this.userList = [];
      users.forEach((user) => {
        if (user.userId == this.userId) {
          this.userList.push(user);
        }
      });
    });
    // console.log(this.userList);

    this.userList.forEach((user) => {
      let montant = 0;

      for (let i = 0; i < user.history.length; i++) {
        if (user.history[i].operationDate.includes(year + '-' + month)) {
          montant += user.history[i].montant;
        }
      }

      this.soldePerUser.push({ name: user.name, montant: montant });
    });

    // console.log(this.soldePerUser);

    if (this.soldePerUser.length > 0) {
      if (this.soldePerUser[0].montant && this.soldePerUser[1].montant) {
        this.totalDifference =
          (this.soldePerUser[0].montant - this.soldePerUser[1].montant) / 2;

        this.totalMoyenne =
          (this.soldePerUser[0].montant + this.soldePerUser[1].montant) / 2;
      } else {
        this.totalDifference = 0;
        this.totalMoyenne = 0;
      }
    }
  }

  showUsers(month: string, year: string) {
    this.userList = [];
    let userObservable = this.opCommuneService.getAllUsers();
    let operationsObservable = this.opCommuneService.getAllOperations();

    forkJoin([userObservable, operationsObservable]).subscribe((data) => {
      // Récupération des utilisateurs
      data[0].forEach((user, userIndex) => {
        if (user.userId == this.userId) {
          this.userList.push(user);

          let userBDD = new OpCommuneUser('', '', []);
          this.opCommuneService.getOneUser(user._id).subscribe((data) => {
            userBDD = data;
          });

          let operationsHistory: any[] = [];

          // Récupération des opérations
          data[1].forEach((operation) => {
            if (
              operation.userId == this.userId &&
              operation.name == user.name
            ) {
              operationsHistory.push(operation);
            }
          });

          userBDD.history = operationsHistory;

          const userdata = {
            id: user._id,
            user: userBDD,
          };
          // console.log(userdata);

          this.opCommuneService.updateOneUser(userdata).subscribe();
        }
      });
      // console.log(this.userList);
      this.getSoldePerUser(month, year);
    });
  }
}
