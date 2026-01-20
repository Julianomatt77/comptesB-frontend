import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CompteV2 } from '../models/compte.model';
import { StorageService } from './storage.service';
import { firstValueFrom } from 'rxjs';
import {CurrentAccountsRecap, SavingsAccountsRecap, YearlyAccountRecap} from "../interfaces/recap";

@Injectable({
  providedIn: 'root',
})
export class CompteService {
  private http = inject(HttpClient);
  private storageService = inject(StorageService);

  // State signals
  readonly accounts = signal<CompteV2[]>([]);
  readonly accountsLoading = signal(false);
  readonly accountsError = signal<string | null>(null);

  readonly deactivatedAccounts = signal<CompteV2[]>([]);
  readonly deactivatedAccountsLoading = signal(false);
  readonly deactivatedAccountsError = signal<string | null>(null);

  // Computed signals
  readonly compteCourantList = computed(() =>
    this.accounts().filter(c => c.typeCompte === 'Compte Courant')
  );

  readonly compteEpargneList = computed(() =>
    this.accounts().filter(c => c.typeCompte !== 'Compte Courant')
  );

  readonly groupedComptes = computed(() => this.groupComptesByType(this.accounts()));

  readonly groupedCompteTypes = computed(() => Object.keys(this.groupedComptes()));

  // Load all accounts (met à jour le signal)
  async loadAccounts(userId?: number): Promise<void> {
    this.accountsLoading.set(true);
    this.accountsError.set(null);

    try {
      const data = await firstValueFrom(
        this.http.get<CompteV2[]>(`${environment.baseUrl}/comptes/getAllAccounts`)
      );

      let filtered = data || [];

      if (userId) {
        filtered = filtered.filter(compte => compte.userId === userId);
      }

      const processed = filtered.map(compte => ({
        ...compte,
        soldeActuel: Math.round(compte.soldeActuel * 100) / 100
      }));

      const sorted = this.sortCompteListByType(processed);
      this.accounts.set(sorted);
    } catch (error: any) {
      this.accountsError.set(error?.message || 'Erreur lors du chargement des comptes');
      console.error('Error loading accounts:', error);
    } finally {
      this.accountsLoading.set(false);
    }
  }

  // Load deactivated accounts (met à jour le signal)
  async loadDeactivatedAccounts(userId?: number): Promise<void> {
    this.deactivatedAccountsLoading.set(true);
    this.deactivatedAccountsError.set(null);

    try {
      const data = await firstValueFrom(
        this.http.get<CompteV2[]>(`${environment.baseUrl}/comptes/getAllDeactivatedAccounts`)
      );

      let filtered = data || [];

      if (userId) {
        filtered = filtered.filter(compte => compte.userId === userId);
      }

      this.deactivatedAccounts.set(filtered);
    } catch (error: any) {
      this.deactivatedAccountsError.set(error?.message || 'Erreur lors du chargement des comptes désactivés');
      console.error('Error loading deactivated accounts:', error);
    } finally {
      this.deactivatedAccountsLoading.set(false);
    }
  }

  // Méthodes existantes (retournent des Observables pour compatibilité)
  public createAccount(compte: CompteV2) {
    const userId = this.storageService.getUser();
    const data = { ...compte, userId: userId };

    return this.http.post<CompteV2>(
      `${environment.baseUrl}/comptes/createAccount`,
      data
    );
  }

  public getAllAccounts() {
    return this.http.get<CompteV2[]>(
      `${environment.baseUrl}/comptes/getAllAccounts`
    );
  }

  public getOneAccount(id: string) {
    return this.http.get<CompteV2>(
      `${environment.baseUrl}/comptes/getOneAccount/${id}`
    );
  }

  public getOneAccountByName(name: string, userId: string) {
    return this.http.get<CompteV2>(
      `${environment.baseUrl}/comptes/getOneAccountByName/${name}`
    );
  }

  public updateOneAccount(value: { id: string; compte: CompteV2 }) {
    return this.http.post<CompteV2>(
      `${environment.baseUrl}/comptes/updateOneAccount/${value.compte.id}`,
      value
    );
  }

  public deleteAccount(id: string) {
    return this.http.post<CompteV2>(
      `${environment.baseUrl}/comptes/deleteAccount/${id}`,
      { id: id }
    );
  }

  public updateSolde(name: string, solde: number) {
    return this.http.post<any>(
      `${environment.baseUrl}/comptes/updateSolde/${name}`,
      solde
    );
  }

  public getAllDeactivatedAccounts() {
    return this.http.get<CompteV2[]>(
      `${environment.baseUrl}/comptes/getAllDeactivatedAccounts`
    );
  }

  public reactivateAccount(id: string) {
    return this.http.post<CompteV2>(
      `${environment.baseUrl}/comptes/reactivateAccount/${id}`,
      { id: id }
    );
  }

  // Nouvelles méthodes async qui mettent à jour les signals
  async createAccountAsync(compte: Omit<CompteV2, 'id'>, userId?: number): Promise<CompteV2 | null> {
    try {
      const userIdValue = userId || this.storageService.getUser();
      const data = { ...compte, userId: userIdValue };

      const created = await firstValueFrom(
        this.http.post<CompteV2>(`${environment.baseUrl}/comptes/createAccount`, data)
      );

      if (created) {
        // Refresh accounts list
        await this.loadAccounts(userIdValue);
      }

      return created || null;
    } catch (error) {
      console.error('Error creating account:', error);
      return null;
    }
  }

  async updateAccountAsync(id: number, compte: CompteV2): Promise<CompteV2 | null> {
    try {
      const updated = await firstValueFrom(
        this.http.post<CompteV2>(
          `${environment.baseUrl}/comptes/updateOneAccount/${id}`,
          { id: id.toString(), compte }
        )
      );

      if (updated && compte.userId) {
        // Refresh accounts list
        await this.loadAccounts(compte.userId);
      }

      return updated || null;
    } catch (error) {
      console.error('Error updating account:', error);
      return null;
    }
  }

  async deleteAccountAsync(id: number, userId?: number): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.post<CompteV2>(
          `${environment.baseUrl}/comptes/deleteAccount/${id}`,
          { id: id }
        )
      );

      if (userId) {
        // Refresh accounts list
        await this.loadAccounts(userId);
      }

      return true;
    } catch (error) {
      console.error('Error deleting account:', error);
      return false;
    }
  }

  async reactivateAccountAsync(id: number, userId?: number): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.post<CompteV2>(
          `${environment.baseUrl}/comptes/reactivateAccount/${id}`,
          { id: id }
        )
      );

      if (userId) {
        // Refresh both lists
        await this.loadAccounts(userId);
        await this.loadDeactivatedAccounts(userId);
      }

      return true;
    } catch (error) {
      console.error('Error reactivating account:', error);
      return false;
    }
  }

  async getAccountAsync(id: number): Promise<CompteV2 | null> {
    try {
      const compte = await firstValueFrom(
        this.http.get<CompteV2>(`${environment.baseUrl}/comptes/getOneAccount/${id}`)
      );

      return compte || null;
    } catch (error) {
      console.error('Error getting account:', error);
      return null;
    }
  }

  async getAccountByNameAsync(name: string): Promise<CompteV2 | null> {
    try {
      const compte = await firstValueFrom(
        this.http.get<CompteV2>(`${environment.baseUrl}/comptes/getOneAccountByName/${name}`)
      );

      return compte || null;
    } catch (error) {
      console.error('Error getting account by name:', error);
      return null;
    }
  }

  async updateSoldeAsync(name: string, solde: number): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.post<any>(`${environment.baseUrl}/comptes/updateSolde/${name}`, solde)
      );

      return true;
    } catch (error) {
      console.error('Error updating solde:', error);
      return false;
    }
  }

  // Utility methods
  public sortCompteListByType(compteList: CompteV2[]): CompteV2[] {
    return [...compteList].sort((a, b) => {
      if (a.typeCompte === 'Compte Courant' && b.typeCompte !== 'Compte Courant') {
        return -1;
      } else if (a.typeCompte !== 'Compte Courant' && b.typeCompte === 'Compte Courant') {
        return 1;
      } else if (a.typeCompte < b.typeCompte) {
        return -1;
      } else if (a.typeCompte > b.typeCompte) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  public groupComptesByType(compteList: CompteV2[]): { [key: string]: CompteV2[] } {
    return compteList.reduce((groups, compte) => {
      const type = compte.typeCompte;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(compte);
      return groups;
    }, {} as { [key: string]: CompteV2[] });
  }

  // Find account by ID in current state (no API call)
  findAccountById(id: number): CompteV2 | undefined {
    return this.accounts().find(c => c.id === id);
  }

  // Find account by name in current state (no API call)
  findAccountByName(name: string): CompteV2 | undefined {
    return this.accounts().find(c => c.name === name);
  }

  async getMonthlyRecap(year: string, month: string) {
    return firstValueFrom(
      this.http.get<any[]>(
        `${environment.baseUrl}/comptes/monthly-recap`,
        { params: { year, month } }
      )
    );
  }

  async getAnnualRecapCurrentAccounts(year: string): Promise<CurrentAccountsRecap | null> {
    try {
      const result = await firstValueFrom(
        this.http.get<CurrentAccountsRecap>(
          `${environment.baseUrl}/comptes/annual-recap/current-accounts`,
          { params: { year } }
        )
      );
      return result || null;
    } catch (error) {
      console.error('Error getting annual recap for current accounts:', error);
      return null;
    }
  }

  async getAnnualRecapSavingsAccounts(year: string): Promise<SavingsAccountsRecap | null> {
    try {
      const result = await firstValueFrom(
        this.http.get<SavingsAccountsRecap>(
          `${environment.baseUrl}/comptes/annual-recap/savings-accounts`,
          { params: { year } }
        )
      );
      return result || null;
    } catch (error) {
      console.error('Error getting annual recap for savings accounts:', error);
      return null;
    }
  }

  async getAnnualRecapSavingsByAccount(year: string): Promise<YearlyAccountRecap[] | null> {
    try {
      const result = await firstValueFrom(
        this.http.get<YearlyAccountRecap[]>(
          `${environment.baseUrl}/comptes/annual-recap/savings-by-account`,
          { params: { year } }
        )
      );
      return result || null;
    } catch (error) {
      console.error('Error getting annual recap by account:', error);
      return null;
    }
  }

}
