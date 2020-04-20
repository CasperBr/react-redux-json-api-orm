import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { HttpRequestBuilder } from './httpRequestBuilder';

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

  public static patchIncludes(resource) {
    let rRel = resource.relationships ? Object.keys(resource.relationships): [];
    let includes = this.prototype.includes ? this.prototype.includes.split(','): [];
    includes = includes.filter((r) => {
      let e = r.split('.')[0];
      return rRel.indexOf(e) >  -1;
    });
    if (includes.length > 0) return includes;
    return;
  }

  public patchIncludes(resource) {
    let rRel = resource.relationships ? Object.keys(resource.relationships): [];
    let includes = this.includes ? this.includes.split(','): [];
    includes = includes.filter((r) => {
      let e = r.split('.')[0];
      return rRel.indexOf(e) >  -1;
    });
    if (includes.length > 0) return includes;
    return;
  }
  
  public hydrate(store: any, type: string, payload: any) {
    store.dispatch({ type, payload });
  }
  
  public static hydrate(store: any, type: string, payload: any) {
    store.dispatch({ type, payload });
  }

  public asyncAction(store: any, request: any) {
    return Resource.asyncAction(store, request);
  }

  public static asyncAction(store: any, request: any) {
    return HttpRequestBuilder.jsonApiRequest(request)
      .then(payload => {
        store.dispatch({ type: `${request.action}_SUCCESS`, payload });
        if (request.cb) request.cb(payload);
      });
  }
}
