export interface Recap {
  month: string;
  investi: number;
  economie: number;
  solde: number;
}

export interface MonthlyRecapItem {
  month: string;
  monthNumber: number;
  economie: number;
  solde: number;
}

export interface MonthlyRecapSavingsItem {
  month: string;
  monthNumber: number;
  investi: number;
  economie: number;
  solde: number;
}

export interface CurrentAccountsRecap {
  monthlyRecap: MonthlyRecapItem[];
  soldeInitial: number;
  soldeFinal: number;
  evolution: number;
  difference: number;
}

export interface SavingsAccountsRecap {
  monthlyRecap: MonthlyRecapSavingsItem[];
  soldeInitial: number;
  soldeFinal: number;
  totalInvesti: number;
  evolution: number;
}

export interface YearlyAccountRecap {
  name: string;
  soldeInitial: number;
  totalInvesti: number;
  soldeFinal: number;
  evolution: number;
}
