import 'reflect-metadata';
import { injectable } from 'inversify';
import { HttpRequestBuilder } from './httpRequestBuilder';

export interface IRequestParams {
  actionType?: string;
  filter?: string;
  page?: {
    number?: number;
    size?: number;
  };
  date?: {
    field?: string;
    min?: string;
    max?: string;
  };
  includes?: string;
  filters?: any;
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
    if (this.toMany.length === 0 && this.toOne.length === 0) return undefined;
    return [...this.toOne, ...this.nested, ...this.toMany].join(',');
  }

  public static patchIncludes(resource) {
    let rRel = resource.relationships ? Object.keys(resource.relationships) : [];
    let includes = this.prototype.includes ? this.prototype.includes.split(',') : [];
    includes = includes.filter(r => {
      let e = r.split('.')[0];
      return rRel.indexOf(e) > -1;
    });
    if (includes.length > 0) return includes;
    return;
  }

  public patchIncludes(resource) {
    let rRel = resource.relationships ? Object.keys(resource.relationships) : [];
    let includes = this.includes ? this.includes.split(',') : [];
    includes = includes.filter(r => {
      let e = r.split('.')[0];
      return rRel.indexOf(e) > -1;
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
    store.dispatch({
      type: 'FETCHING_STARTED',
      payload: request.endpoint
    });
    return HttpRequestBuilder.jsonApiRequest(request)
      .then(response => {
        store.dispatch({
          type: 'FETCHING_SUCCESS',
          payload: request.endpoint
        });
        if (response.error) {
          return response;
        }
        store.dispatch({
          type: `${request.action}_SUCCESS`,
          payload: response,
          resourceType: request.endpoint
        });
        return response;
      })
      .catch(error => {
        store.dispatch({
          type: 'FETCHING_FAILED',
          payload: request.endpoint
        });
        return error;
      });
  }
}
