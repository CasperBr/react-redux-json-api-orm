import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { HttpRequestBuilder } from './httpRequestBuilder';

export interface IRequestParams {
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
  size: number = 10;
  number: number = 1;


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

  public hydrate(store: any, type: string, payload: any) {
    store.dispatch({ type, payload });
  }
  
  public static hydrate(store: any, type: string, payload: any) {
    store.dispatch({ type, payload });
  }

  public asyncAction(store: any, request: any) {
    Resource.asyncAction(store, request);
  }

  public static asyncAction(store: any, request: any) {
    HttpRequestBuilder.jsonApiRequest(request)
      .then(payload => {
        store.dispatch({ type: `${request.action}_SUCCESS`, payload });
        if (request.cb) request.cb();
      });
  }
}
