import { Resource, IRequestParams } from "./resource.core";
import { createSelector } from "reselect";
import { useEffect } from "react";
import { useSelector, shallowEqual } from "react-redux";
import { convertFieldsToJsonApi, entitiesToRelationships } from "./utils";
import build from 'redux-object';
import { JsonApiRequestConfig } from "./types";

/**
 * Resource based on React Hooks principles
 */
export class ResourceHook extends Resource {
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
          let resource = build(resources, type, id, { ignoreLinks: true, includeType: true });
          if (resource && resource.id) {
            return baseClass.createResource(this, resource);
          }
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
          let builtResources: any = build(rawResources, type, null, { ignoreLinks: true, includeType: true });
          if (builtResources) {
            builtResources = this.filterByQuery(builtResources, requestParams);
            builtResources = this.filterByPage(builtResources, requestParams);
          }

          // Create class instances
          builtResources && builtResources.forEach((r: any) => {
            resources.push(baseClass.createResource(baseClass, r));
          });

          return [...resources || []];
        }
      }
    );
  }

  /**
  * React hook: Use this resource by fetching and selecting from store
  * @param id
  */
  public static useResource(store: any, id: number) {
    useEffect(() => {
      this.fetch(store, id);
    }, [id]);
    let resource = this.select(id);
    return resource;
  }

  /**
   * React hook: Use resources by fetching and selecting from store
   * @param requestParams 
   */
  public static useResources(store: any, requestParams?: IRequestParams) {
    requestParams = requestParams ? requestParams : {};
    this.fetchAll(store, requestParams);
    const resources = this.selectAll(requestParams);
    return resources;
  }

  /**
   * Select this resource from redux store
   */
  public static select(id: number) {
    const type = this.prototype.type;
    if (type) {
      const selectResource = this.createResourceSelector(id);
      let resource = useSelector(selectResource, shallowEqual);
      return resource;
    }
  }

  /**
   * Select all resources from store
   */
  public static selectAll(requestParams?: IRequestParams) {
    requestParams = requestParams ? requestParams : {};
    const selectResources = this.createResourcesSelector(requestParams);
    let resources = useSelector(selectResources, shallowEqual);
    return resources;
  }

  /**
   * Fetch resource from api by id
   */
  public static async fetch(store: any, id: number | string | undefined) {
    const request: JsonApiRequestConfig = {
      action: "FETCH_RESOURCES",
      method: "GET",
      endpoint: `${this.prototype.type}/${id}`,
      queryParams: {
        include: this.prototype.includes
      }
    }
    this.asyncAction(store, request);
  }

  /**
   * Fetch all resources from api by class type
   */
  public static fetchAll(store, requestParams?: IRequestParams) {
    requestParams = requestParams ? requestParams : {};
    const { type, includes, searchable, size, number } = this.prototype;
    let { filter, page, date } = requestParams;
    date = date ? date : {};
    const { min, max, field } = date;

    useEffect(() => {
      if (type) {
        const request = {
          action: "FETCH_RESOURCES",
          method: "GET",
          endpoint: type,
          queryParams: {
            filter: {
              query: filter,
              field: searchable.length ? searchable[0] : null
            },
            include: includes,
            page: {
              size: page && page.size ? page.size : size,
              number: page && page.number ? page.number : number
            },
            date
          }
        }
        this.asyncAction(store, request);
      }
    }, [filter, type, size, number, min, max, field])
  }

  /**
   * Create a resource and store response in store
   * @param store 
   * @param fields 
   */
  public static create(store: any, data: any, action?: string): any {
    const request = {
      action: action ? action : "POST_RESOURCE",
      endpoint: `${this.prototype.type}/`,
      method: "POST",
      queryParams: {
        include: this.patchIncludes(data)
      },
      formData: {
        data:
        {
          "type": this.prototype.type,
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
      "id": this.id,
      "type": this.type,
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
    this.hydrate(store, "HYDRATE_RESOURCE", data);
    return this.asyncAction(store, { ...request, action: "PATCH_RESOURCE", method: "PATCH" });
  }

  /**
   * Delete this resource
   */
  public delete(store: any) {
    const data = {
      "id": this.id,
      "type": this.type
    };

    const request = {
      action: "POST_RESOURCE",
      endpoint: `${this.type}/${this.id}`,
      method: "DELETE",
      formData: {
        data
      }
    };
    this.asyncAction(store, request);
    this.hydrate(store, "DELETE_RESOURCE", data);
  }

  /**
   * Add array of relationships to resource
   * @param relationshipFields 
   */
  public patchRelationships(store: any, relationships: any, rType: any) {
    const request = {
      type: "POST_RESOURCE",
      endpoint: `${this.type}/${this.id}/relationships/${rType}`,
      method: "PATCH",
      formData: {
        "data": relationships
      }
    }
    this.asyncAction(store, request);

    this.hydrate(store, "HYDRATE_RELATIONSHIPS", {
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
  public deleteRelationship(store, rId: number, rType: string) {
    if (!this[rType]) return;
    const relationships = this[rType];

    // Update table
    Object.keys(relationships).forEach(function (key) {
      if (relationships[key].id === rId) delete relationships[key];
    });
    const relationshipFields = [...entitiesToRelationships(this[rType], rType)];
    this.patchRelationships(store, relationshipFields, rType);

    // Hydrate store
    this.hydrate(store, "DELETE_RELATIONSHIP", {
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
      Object.keys(arg).forEach((key) => {
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
  public static filterByQuery(resources, requestParams: IRequestParams) {
    if (!requestParams) return resources;

    const { searchable } = this.prototype;
    const { filter } = requestParams;

    if (searchable && filter) {
      return resources.filter((r: any) => {
        return r[searchable[0]].indexOf(filter) > -1;
      });
    }
    return resources;
  }

  /**
   * Filter given resources by page and size
   * @param resources
   * @param requestParams 
   */
  public static filterByPage(resources: any[], requestParams: any) {
    if (!requestParams) return resources;

    if (requestParams.page) {
      const { number, size } = requestParams.page;
      if (number && size && resources) {
        return resources.slice((number * size - size), (number * size));
      }
    }
    return resources;
  }

  /**
   * Non generic functions, should be moved to Project scope.
   */
  public patchFormFields(store, fields) {
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
    const relationshipFields = [...entitiesToRelationships(this[type], type), relationshipField];
    this.patchRelationships(store, relationshipFields, type);
  }
}