import { Resource, IRequestParams } from "./resource.core";
import { createSelector } from "reselect";
import React, { useEffect } from "react";
import { useSelector, shallowEqual } from "react-redux";
import { convertFieldsToJsonApi } from "./utils";
import build from 'redux-object';
import { HttpRequestBuilder } from "./httpRequestBuilder";
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
      (state: any) => state.api.resources,
      (resources: any) => {
        if (type && resources[type]) {
          let resource = build(resources, type, id, { ignoreLinks: true, includeType: true });
          if (resource && resource.id) {
            return baseClass.create(this, resource);
          }
        }
      }
    );
  }

  /**
   * React hook: Select all resources from store
   * @param type 
   */
  public static createResourcesSelector(requestParams?: IRequestParams) {
    const baseClass = this;
    const type = this.prototype.type;
    return createSelector(
      (state: any) => state.api.resources,
      (resources: any) => {
        if (type && resources) {
          let resourceObjects: any = [];

          // Build resources
          let selectedResources: any = build(resources, type, null, { ignoreLinks: true, includeType: true });

          // Filter resources
          if (selectedResources) {
            selectedResources = this.filterByQuery(selectedResources, requestParams);
            selectedResources = this.filterByPage(selectedResources, requestParams);  
          }
         
          // Create class instances
          selectedResources && selectedResources.forEach((r: any) => {
            resourceObjects.push(baseClass.create(baseClass, r));
          });

          return [...resourceObjects || []];
        }
      }
    );
  }

  /**
  * React hook: Use this resource by fetching and selecting from store
  * @param id
  */
  // public static useResource(id: number) {
  //   React.useEffect(() => {
  //     if (id) this.fetch(id);
  //   }, [id]);
  //   let resource = this.select(id);
  //   return resource;
  // }

  /**
   * React hook: Use resources by fetching and selecting from store
   * @param requestParams 
   */
  public static useResources(store: any, requestParams?: IRequestParams) {
    requestParams = requestParams ? requestParams: {};
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
   * 
   */
  public static selectAll(requestParams?: IRequestParams) {
    requestParams = requestParams ? requestParams: {};
    const selectResources = this.createResourcesSelector(requestParams);
    let resources = useSelector(selectResources, shallowEqual);
    return resources;
  }

  /**
   * Fetch this resource
   */
  public static fetch(store: any, id: number) {
    const request: JsonApiRequestConfig = {
      action: "FETCH_RESOURCES",
      method: "GET",
      endpoint: `${this.prototype.type}/${id}`,
      queryParams: {
        include: this.prototype.includes
      }
    }
    this.action(store, request);
  }

  public static createResource(fields, cb?, actionType = "POST_API") {
    const type = this.prototype.type;
    const data = convertFieldsToJsonApi(fields);
    // action(actionType, {
    //   endpoint: `${type}/`,
    //   method: "POST",
    //   formData: {
    //     data:
    //     {
    //       "type": type,
    //       ...data
    //     }
    //   }
    // });
  }

  public static action(store: any, request: any) {
    HttpRequestBuilder.jsonApiRequest(request)
      .then(payload => {
        store.dispatch({ type: `${request.action}_SUCCESS`, payload });
      });
  }

  /**
   * Fetch this resource
   */
  public static async fetchAll(store, requestParams?: IRequestParams) {
    requestParams = requestParams ? requestParams: {};
    const { type, includes, searchable, size, number } = this.prototype;
    const { filter, page } = requestParams;

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
            }
          }
        }
        this.action(store, request);
      }
    }, [filter, type, size, number])
  }

  /**
   * Patch this resource
   */
  // patch(resource) {
  //   action("POST_API", {
  //     endpoint: `${this.type}/${this.id}`,
  //     method: "PATCH",
  //     formData: {
  //       data:
  //       {
  //         "id": this.id,
  //         "type": this.type,
  //         ...resource
  //       }
  //     }
  //   });
  //   hydrate("PATCH_RESOURCE", {
  //     id: this.id,
  //     type: this.type,
  //     ...resource
  //   });
  // }

  // /**
  //  * Delete this resource
  //  */
  // delete() {
  //   action("POST_API", {
  //     endpoint: `${this.type}/${this.id}`,
  //     method: "DELETE",
  //     formData: {
  //       data:
  //       {
  //         "id": this.id,
  //         "type": this.type
  //       }
  //     }
  //   });
  // }

  // /**
  //  * Add array of relationships to resource
  //  * @param relationshipFields 
  //  */
  // patchRelationships(relationships: any, rType: any) {
  //   action("POST_API", {
  //     endpoint: `${this.type}/${this.id}/relationships/${rType}`,
  //     method: "PATCH",
  //     formData: {
  //       "data": relationships
  //     }
  //   });
  //   hydrate("HYDRATE_RELATIONSHIPS", {
  //     id: this.id,
  //     type: this.type,
  //     relationships,
  //     rType
  //   });
  // }

  // /**
  //  * Delete relationship from table and store
  //  * @param rId
  //  * @param rType 
  //  */
  // deleteRelationship(rId, rType) {
  //   const relationships = this[rType];
  //   if (relationships) {

  //     // Update table
  //     Object.keys(relationships).forEach(function (key) {
  //       if (relationships[key].id === rId) delete relationships[key];
  //     });
  //     const relationshipFields = [...entitiesToRelationships(this[rType], rType)];
  //     this.patchRelationships(relationshipFields, rType);

  //     // Hydrate store
  //     hydrate("DELETE_RELATIONSHIP", {
  //       id: this.id,
  //       type: this.type,
  //       rType,
  //       rId
  //     });
  //   }
  // }

  /**
  * Create new instance of this resource
  * @param type 
  * @param arg 
  */
  public static create(type: any, arg: any) {
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
  // patchFormFields(fields) {
  //   const data = convertFieldsToJsonApi(fields);
  //   this.patch(data);
  // }

  /**
   * Add a single relationship to this resource
   * @param relationshipField 
   */
  // addRelationship(relationshipField) {
  //   if (relationshipField) {
  //     const type = relationshipField.type;
  //     const relationshipFields = [...entitiesToRelationships(this[type], type), relationshipField];
  //     this.patchRelationships(relationshipFields, type);
  //   }
  // }
}