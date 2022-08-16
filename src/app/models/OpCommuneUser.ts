export class OpCommuneUser {
  _id: string;
  private _name: string;
  private _history: any[];

  constructor(id: string, name: string, history: any[]) {
    this._id = id;
    this._name = name;
    this._history = history;
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
   * Getter history
   * @return {any[]}
   */
  public get history(): any[] {
    return this._history;
  }

  /**
   * Setter history
   * @param {any[]} value
   */
  public set history(value: any[]) {
    this._history = value;
  }
}
