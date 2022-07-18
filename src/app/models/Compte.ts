export class Compte {
  _id: string;
  private _name: string;
  private _typeCompte: string;
  private _soldeInitial: number;
  private _soldeActuel: number;

  constructor(
    id: string,
    name: string,
    typeCompte: string,
    soldeInitial: number,
    soldeActuel: number
  ) {
    this._id = id;
    this._name = name;
    this._typeCompte = typeCompte;
    this._soldeInitial = soldeInitial;
    this._soldeActuel = soldeActuel;
  }

  /**
   * Getter id
   * @return {string}
   */
  public get id(): string {
    return this._id;
  }

  /**
   * Getter name
   * @return {string}
   */
  public get name(): string {
    return this._name;
  }

  /**
   * Getter typeCompte
   * @return {string}
   */
  public get typeCompte(): string {
    return this._typeCompte;
  }

  /**
   * Getter soldeInitial
   * @return {number}
   */
  public get soldeInitial(): number {
    return this._soldeInitial;
  }

  /**
   * Getter soldeActuel
   * @return {number}
   */
  public get soldeActuel(): number {
    return this._soldeActuel;
  }

  /**
   * Setter id
   * @param {string} value
   */
  public set id(value: string) {
    this._id = value;
  }

  /**
   * Setter name
   * @param {string} value
   */
  public set name(value: string) {
    this._name = value;
  }

  /**
   * Setter typeCompte
   * @param {string} value
   */
  public set typeCompte(value: string) {
    this._typeCompte = value;
  }

  /**
   * Setter soldeInitial
   * @param {number} value
   */
  public set soldeInitial(value: number) {
    this._soldeInitial = value;
  }

  /**
   * Setter soldeActuel
   * @param {number} value
   */
  public set soldeActuel(value: number) {
    this._soldeActuel = value;
  }
}
