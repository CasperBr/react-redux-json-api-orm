import normalize from 'json-api-normalizer';
import axios from 'axios';
import { JsonApiRequestConfig } from './types';

export interface IQueryParam {
  attribute: string
  operator: string
  value: string
  type: string
}

/**
 * Request builder
 */
export abstract class HttpRequestBuilder {
  /**
   * Returns a querystring for the give QueryParam
   * @param filter 
   */
  public static makeFilter(filter: IQueryParam) {
    const { attribute, operator, value, type } = filter;
    return `${type}[${attribute}]${operator}${value}`;
  }

  /**
   * Takes all query filter objects and returns a querystring
   * @param queryParams 
   */
  public static buildUrlQuery(queryParams: IQueryParam[]) {
    let params: string[] = [];
    queryParams.forEach((f) => {
      if (f.value) params.push(HttpRequestBuilder.makeFilter(f));
    });
    if (params.length > 0) return params.join('&');
    if (params) return params.join('&');
  }

  /**
   * Builds the url used by Json API
   * @param request 
   */
  public static buildUrl(request: any) {
    // Set endpoint
    let url = request.endpoint;
    let filters: any = [];

    // Set relationships
    let includes = request?.queryParams?.include ? `include=${request.queryParams.include}`: '';
    
    // Paginate
    if (request?.queryParams?.page && request?.queryParams?.size) {
      filters.push({
        type: "page",
        attribute: "size",
        operator: "=",
        value: request?.queryParams?.size,
      });
      filters.push( {
        type: "page",
        attribute: "number",
        operator: "=",
        value: request?.queryParams?.page,
      });
    }

    // Search
    if (request?.queryParams?.searchable && request?.queryParams?.query) {
      filters.push( {
        type: "filter",
        attribute: request?.queryParams?.searchable[0],
        operator: "=like:",
        value: request?.queryParams?.query
      });
    }

    if (request?.queryParams?.filters) filters = [...filters, ...request.queryParams.filters];

    const filterString = this.buildUrlQuery(filters);

    // Includes
    url = includes ? `${url}?${includes}&${filterString}`: `${url}?${filterString}`;
    return url;
  }

  public static jsonApiRequest(request: any) {
    const url = HttpRequestBuilder.buildUrl(request);
    const body = request.formData ? request.formData : {};
    return axios({
      method: request.method,
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json'
      },
      ...request.options,
      url: `${url}`,
      data: body
    }).then(function (response) {
      switch (response.status) {
        case 200:
        case 201:
          if (request.method === "PATCH") {
            return Object.assign({}, normalize(request.formData, { endpoint: request.endpoint }));
          }
          return Object.assign({}, normalize(response.data, { endpoint: request.endpoint }));
        case 204:
          return true;
        default:
          throw new TypeError("kapot");
        }
    }).catch((error) => {
      if (axios.isCancel(error)) {
        console.log('post Request canceled');
      }
      return {
        error: true,
        response: error
      };
    });
  }
}