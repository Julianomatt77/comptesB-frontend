export class Operation {
  private _id: string;
  private _montant: number;
  private _type: boolean;
  private _categorie: string;
  private _compte: string;
  private _description1: string;
  private _description2: string;
  private _operationDate: Date;
  private _solde: number;

  constructor(
    id: string,
    montant: number,
    type: boolean,
    categorie: string,
    compte: string,
    description1: string,
    description2: string,
    operationDate: Date,
    solde: number
  ) {
    this._id = id;
    this._montant = montant;
    this._type = type;
    this._categorie = categorie;
    this._compte = compte;
    this._description1 = description1;
    this._description2 = description2;
    this._operationDate = operationDate;
    this._solde = solde;
  }

  /**
   * Getter solde
   * @return {number}
   */
  public get solde(): number {
    return this._solde;
  }

  /**
   * Setter solde
   * @param {number} value
   */
  public set solde(value: number) {
    this._solde = value;
  }

  /**
   * Getter id
   * @return {string}
   */
  public get id(): string {
    return this._id;
  }

  /**
   * Getter montant
   * @return {number}
   */
  public get montant(): number {
    return this._montant;
  }

  /**
   * Getter type
   * @return {boolean}
   */
  public get type(): boolean {
    return this._type;
  }

  /**
   * Getter categorie
   * @return {string}
   */
  public get categorie(): string {
    return this._categorie;
  }

  /**
   * Getter compte
   * @return {string}
   */
  public get compte(): string {
    return this._compte;
  }

  /**
   * Getter description1
   * @return {string}
   */
  public get description1(): string {
    return this._description1;
  }

  /**
   * Getter description2
   * @return {string}
   */
  public get description2(): string {
    return this._description2;
  }

  /**
   * Getter operationDate
   * @return {Date}
   */
  public get operationDate(): Date {
    return this._operationDate;
  }

  /**
   * Setter id
   * @param {string} value
   */
  public set id(value: string) {
    this._id = value;
  }

  /**
   * Setter montant
   * @param {number} value
   */
  public set montant(value: number) {
    this._montant = value;
  }

  /**
   * Setter type
   * @param {boolean} value
   */
  public set type(value: boolean) {
    this._type = value;
  }

  /**
   * Setter categorie
   * @param {string} value
   */
  public set categorie(value: string) {
    this._categorie = value;
  }

  /**
   * Setter compte
   * @param {string} value
   */
  public set compte(value: string) {
    this._compte = value;
  }

  /**
   * Setter description1
   * @param {string} value
   */
  public set description1(value: string) {
    this._description1 = value;
  }

  /**
   * Setter description2
   * @param {string} value
   */
  public set description2(value: string) {
    this._description2 = value;
  }

  /**
   * Setter operationDate
   * @param {Date} value
   */
  public set operationDate(value: Date) {
    this._operationDate = value;
  }
}
