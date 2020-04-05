import { Resource, IRequestParams } from "./resource.core";
import { HttpRequestBuilder } from "./httpRequestBuilder";

/**
 * Resource dispatcher class
 */
export class ResourceDispatcher extends Resource {
  public static async dispatcher(store: any, request: any) {
    await HttpRequestBuilder.jsonApiRequest(request)
      .then(payload => {
        store.dispatch({ type: `${request.action}_SUCCESS`, payload });
      });
  }

  public static async fetchAll(store, requestParams?: IRequestParams) {
    const { type, includes } = this.prototype;
    const request = {
      action: "FETCH_RESOURCES",
      method: "GET",
      endpoint: type,
      queryParams: {
        include: includes
      }
    };
    await this.dispatcher(store, request);
  }
}


