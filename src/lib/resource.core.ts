import 'reflect-metadata';
import { inject, injectable } from 'inversify';

export interface IRequestParams {
  action?: string
  filter?: string
  page?: {
    number?: number
    size?: number
  }
}

/**
 * Base resource class providing some Reflection data
 */
@injectable()
export class Resource {
  id?: string;
  type?: string;

  // @inject("Store")
  // public _store: any
  
  // constructor(@inject("Store") store: any) {
  //   this._store = store;
  // }

  get fields() {
    return Reflect.getMetadata('field', this) || [];
  }

  get toOne() {
    return Reflect.getMetadata('toOne', this) || [];
  }

  get toMany() {
    return Reflect.getMetadata('toMany', this) || [];
  }

  get searchable() {
    return Reflect.getMetadata('searchable', this) || [];
  }

  get includes() {
    let includesString = [...this.toOne, this.toMany].join(',');
    if (includesString.length === 1) return;
    return includesString;
  }
}
