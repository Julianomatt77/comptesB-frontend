export class OpCommune {
  private _id: string;
  private _montant: number;
  // private _type: boolean;
  private _name: string;
  private _description: string;
  private _operationDate: Date;

  constructor(
    id: string,
    montant: number,
    // type: boolean,
    name: string,
    description: string,
    operationDate: Date
  ) {
    this._id = id;
    this._montant = montant;
    // this._type = type;
    this._name = name;
    this._description = description;
    this._operationDate = operationDate;
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

  // /**
  //  * Getter type
  //  * @return {boolean}
  //  */
  // public get type(): boolean {
  //   return this._type;
  // }

  /**
   * Getter name
   * @return {string}
   */
  public get name(): string {
    return this._name;
  }

  /**
   * Getter description
   * @return {string}
   */
  public get description(): string {
    return this._description;
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

  // /**
  //  * Setter type
  //  * @param {boolean} value
  //  */
  // public set type(value: boolean) {
  //   this._type = value;
  // }

  /**
   * Setter name
   * @param {string} value
   */
  public set name(value: string) {
    this._name = value;
  }

  /**
   * Setter description
   * @param {string} value
   */
  public set description(value: string) {
    this._description = value;
  }

  /**
   * Setter operationDate
   * @param {Date} value
   */
  public set operationDate(value: Date) {
    this._operationDate = value;
  }
}
