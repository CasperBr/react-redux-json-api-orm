import { Resource, IRequestParams } from './resource.core';
import { createSelector } from 'reselect';
import { useEffect } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { convertFieldsToJsonApi, entitiesToRelationships } from './utils';
import build from 'redux-object';
import { JsonApiRequestConfig } from './types';
import { HttpRequestBuilder } from './httpRequestBuilder';

/**
 * Resource based on React Hooks principles
 */
export class ResourceHook extends Resource {
  page: number = 1;
  query: string = '';
  size: number = 10;
  filters: any[] = [];
  customIncludes: any;

  /**
   * React hook: Select single resource from store
   * @param type
   * @param id
   */
  public static createResourceSelector(id: number) {
    const baseClass = this;
    const type = this.prototype.type;
    return createSelector(
      (state: any) => state.api,
      (resources: any) => {
        if (resources && type && resources[type]) {
          let resource = build(resources, type, id, {
            ignoreLinks: true,
            includeType: true
          });
          if (resource && resource.id) return baseClass.createResource(this, resource);
        }
      }
    );
  }

  /**
   * React hook: Select all resources from store
   * @param type
   */
  public static createResourcesSelector(requestParams?: any) {
    const baseClass = this;
    const type = this.prototype.type;
    return createSelector(
      (state: any) => state.api,
      (rawResources: any) => {
        if (type && rawResources) {
          let resources: any = [];
          let builtResources: any = build(rawResources, type, null, {
            ignoreLinks: true,
            includeType: true
          });

          if (builtResources) {
            builtResources = this.filterByQuery(builtResources);
            builtResources = this.filterByPage(builtResources);
          }

          // Create class instances
          builtResources &&
            builtResources.forEach((r: any) => {
              resources.push(baseClass.createResource(baseClass, r));
            });

          return [...(resources || [])];
        }
      }
    );
  }

  /**
   * React hook: Use this resource by fetching and selecting from store
   * @param id
   */
  public static useSingle(store: any, id: number) {
    useEffect(() => {
      this.fetch(store, id);
    }, [id]);
    return this.useSelect(id);
  }

  /**
   * React hook: Use resources by fetching and selecting from store
   * @param requestParams
   */
  public static use(store: any) {
    this.fetchAll(store);
    return this.selectAll();
  }

  /**
   * Select this resource from redux store
   */
  public static useSelect(id: number) {
      const selectResource = this.createResourceSelector(id);
      return useSelector(selectResource, shallowEqual);
   
  }

  /**
   * Select all resources from store
   */
  public static selectAll() {
    const selectResources = this.createResourcesSelector();
    return useSelector(selectResources, shallowEqual);
  }

  /**
   * Fetch resource from api by id
   */
  public static async fetch(store: any, id: number | string | undefined ) {
    const { includes } = this.prototype;

    const request: JsonApiRequestConfig = {
      action: 'FETCH_RESOURCES',
      method: 'GET',
      endpoint: `${this.prototype.type}/${id}`,
      queryParams: {
        include: this.prototype.customIncludes ? this.prototype.customIncludes: includes,
      }
    };
    this.asyncAction(store, request);
  }

  /**
   * Fetch all resources from api by class type
   */
  public static fetchAll(store) {
    const { type, includes, searchable } = this.prototype;

    useEffect(() => {
      if (type) {
        const request = {
          action: 'FETCH_RESOURCES',
          method: 'GET',
          endpoint: type,
          queryParams: {
            include: this.prototype.customIncludes ? this.prototype.customIncludes: includes,
            page: this.prototype.page,
            size: this.prototype.size,
            searchable,
            query: this.prototype.query,
            filters: this.prototype.filters
          }
        };
        this.asyncAction(store, request);
      }
      // eslint-disable-next-line
    }, [this.getRefreshString()]);
  }

  /**
   * Create a resource and store response in store
   * @param store
   * @param fields
   */
  public static create(store: any, data: any, action?: string): any {
    const request = {
      action: action ? action : 'POST_RESOURCE',
      endpoint: `${this.prototype.type}/`,
      method: 'POST',
      queryParams: {
        include: this.patchIncludes(data)
      },
      formData: {
        data: {
          type: this.prototype.type,
          ...data
        }
      }
    };
    return this.asyncAction(store, request);
  }

  /**
   * Patch this resource in api. Hydrates store.
   */
  public patch(store: any, resource) {
    const data = {
      id: this.id,
      type: this.type,
      ...resource
    };

    const request = {
      endpoint: `${this.type}/${this.id}`,
      formData: {
        data
      },
      queryParams: {
        include: this.patchIncludes(resource)
      }
    };
    // this.hydrate(store, "PATCH_RESOURCE", data);
    return this.asyncAction(store, {
      ...request,
      action: 'PATCH_RESOURCE',
      method: 'PATCH'
    });
  }

  /**
   * Delete this resource
   */
  public async delete(store: any) {
    const data = {
      id: this.id,
      type: this.type
    };

    const request = {
      action: 'POST_RESOURCE',
      endpoint: `${this.type}/${this.id}`,
      method: 'DELETE',
      formData: {
        data
      }
    };
    // this.hydrate(store, "DELETE_RESOURCE", data);

    return this.asyncAction(store, request);
  }

  /**
   * Add array of relationships to resource
   * @param relationshipFields
   */
  public patchRelationships(store: any, relationships: any, rType: any) {
    const request = {
      type: 'POST_RESOURCE',
      endpoint: `${this.type}/${this.id}/relationships/${rType}`,
      method: 'PATCH',
      formData: {
        data: relationships
      }
    };
    this.asyncAction(store, request);

    this.hydrate(store, 'HYDRATE_RELATIONSHIPS', {
      id: this.id,
      type: this.type,
      relationships,
      rType
    });
  }

  /**
   * Delete relationship from table and store
   * @param rId
   * @param rType
   */
  public deleteRelationship(store, rId: number | string, rType: string) {
    if (!this[rType]) return;
    const relationships = this[rType];

    // Update table
    Object.keys(relationships).forEach(function(key) {
      if (relationships[key].id === rId) delete relationships[key];
    });
    const relationshipFields = [...entitiesToRelationships(this[rType], rType)];
    this.patchRelationships(store, relationshipFields, rType);

    // Hydrate store
    this.hydrate(store, 'DELETE_RELATIONSHIP', {
      id: this.id,
      type: this.type,
      rType,
      rId
    });
  }

  /**
   * Create new instance of this resource
   * @param type
   * @param arg
   */
  public static createResource(type: any, arg: any) {
    let resource = new type(arg);
    if (arg && Object.keys(arg).length > 0) {
      Object.keys(arg).forEach(key => {
        resource[key] = arg[key];
      });
    }
    return resource;
  }

  /**
   * Filter given resources by query
   * @param resources
   * @param requestParams
   */
  public static filterByQuery(resources) {
    const { searchable } = this.prototype;

    if (searchable && this.prototype.query) {
      return resources.filter((r: any) => {
        return r[searchable[0]].indexOf(this.prototype.query) > -1;
      });
    }
    return resources;
  }

  /**
   * Filter given resources by page and size
   * @param resources
   * @param requestParams
   */
  public static filterByPage(resources: any[]) {
    const { size, page } = this.prototype;
  
    if (page && size && resources) {
      return resources.slice(page * size - size, page * size);
    }
    
    return resources;
  }

  /**
   * Non generic functions, should be moved to Project scope.
   */
  public async patchFormFields(store, fields) {
    const data = convertFieldsToJsonApi(fields);
    return this.patch(store, data);
  }

  /**
   * Add a single relationship to this resource
   * @param relationshipField
   */
  public addRelationship(store, relationshipField) {
    if (!relationshipField) return;
    const type = relationshipField.type;
    const relationshipFields = [
      ...entitiesToRelationships(this[type], type),
      relationshipField
    ];
    this.patchRelationships(store, relationshipFields, type);
  }

  public static getRefreshString(): string {
    return this.prototype.page?.toString() + this.prototype.size?.toString() + this.prototype.query?.toString() + this.prototype.filters?.join();
  }

  /**
   * Chaining functions
   */
  public static paginate(page: number): ResourceHook {
    this.prototype.page = page;
    // @ts-ignore
    return this;
  }

  public static setIncludes(includes: string): ResourceHook {
    this.prototype.customIncludes = includes;
    // @ts-ignore
    return this;
  }

  public static pageSize(size: number): ResourceHook {
    this.prototype.size = size;
    // @ts-ignore
    return this;
  }

  public static searchQuery(searchQuery: string): ResourceHook {
    this.prototype.query = searchQuery;
    // @ts-ignore
    return this;
  }

  public static setFilters(filters: any): ResourceHook {
    this.prototype.filters = filters;
    // @ts-ignore
    return this;
  }

  /**
   * Simply get resources, without saving it to the store
   */
  public static async get(id?) {
    const { type, includes, customIncludes } = this.prototype;

    const request: any = {
      method: 'GET',
      endpoint: id ? `${type}/${id}/` : type,
      queryParams: {
        include: this.prototype.customIncludes ? this.prototype.customIncludes: includes,
        page: this.prototype.page,
        size: this.prototype.size,
        query: this.prototype.query,
        filters: this.prototype.filters
      }
    };

    return HttpRequestBuilder.jsonApiRequest(request)
      .then(response => {
        if (response.error) {
          return response;
        }
        if (response && type) {
          return build(response, type, null, {
            ignoreLinks: true,
            includeType: true
          });
        }
        return response;
      })
      .catch(error => {
        return error;
      });
  }
}
