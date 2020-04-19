import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { HttpRequestBuilder } from './httpRequestBuilder';
import { array } from 'prop-types';
import { ResourceHook } from './resource.hooks';

export interface IRequestParams {
  filter?: string
  page?: {
    number?: number
    size?: number
  },
  date?: {
    field?: string
    min?: string,
    max?: string
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

  get nested() {
    return Reflect.getMetadata('nested', this) || [];
  }

  get toMany() {
    return Reflect.getMetadata('toMany', this) || [];
  }

  get searchable() {
    return Reflect.getMetadata('searchable', this) || [];
  }

  get includes() {
    if (this.toMany.length === 0 && this.toOne.length === 0) return;
    return [...this.toOne, ...this.nested, ...this.toMany].join(',');
  }

  patchIncludes(resource) {
    let rRel = Object.keys(resource.relationships);
    let includes = this.includes ? this.includes.split(','): [];

    return includes.filter((r) => {
      let e = r.split('.')[0];
      return rRel.indexOf(e) >  -1;
    });
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
        if (request.cb) request.cb(payload);
      });
  }
}
