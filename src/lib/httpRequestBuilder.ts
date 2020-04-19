import normalize from 'json-api-normalizer';
import axios from 'axios';
import { JsonApiRequestConfig } from './types';

/**
 * Request builder
 */
export abstract class HttpRequestBuilder {
  public static buildPageFilter(page) {
    if (page && page.number && page.size) {
      return `page[number]=${page.number}&page[size]=${page.size}`;
    }
    return '';
  }

  public static buildUrlFilter(filter: any) {
    const { field, query } = filter;
    if (field && query) {
      return `filter[${field}]=like:${query}&`;
    }
    return '';
  }

  public static buildDateFilter(dates: any) {
    const { field, min, max } = dates;
    let filters: any[] = [];
    if (min) filters.push(`filter[${field}]=ge:${min}`);
    if (max) filters.push(`filter[${field}]=le:${max}`);
    return filters;
  }

  public static buildUrlQuery(queryParams) {
    let params: string[] = [];
    if (queryParams) {
      Object.keys(queryParams).forEach((param) => {
        switch (param) {
          case "filter":
            let filter = HttpRequestBuilder.buildUrlFilter(queryParams.filter);
            if (filter) params.push(filter);
            break;
          case "page":
            let page = HttpRequestBuilder.buildPageFilter(queryParams.page);
            if (page) params.push(page);
            break;
          case "date":
            if (queryParams.date.field) {
              let date = HttpRequestBuilder.buildDateFilter(queryParams.date);
              if (date) {
                params = [...params, ...date]
              }
            }        
            break;
          default:
            if (queryParams[param])
              params.push(`${param}=${queryParams[param]}`);
        }
      });
    }
    if (params) return params.join('&');
  }

  public static buildUrl(request: JsonApiRequestConfig) {
    let url = request.endpoint;
    const paramString: any = HttpRequestBuilder.buildUrlQuery(request.queryParams);
    if (paramString) url = `${url}?${paramString}`
    return url;
  }

  public static jsonApiRequest(request: any) {
    const url = HttpRequestBuilder.buildUrl(request);
    const body = request.formData ? request.formData : {};
    return axios({
      method: request.method,
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/vnd.api+json'
      },
      ...request.options,
      url: `${url}`,
      data: body
    }).then(function (response) {
      switch (response.status) {
        case 200:
        case 201:
          return Object.assign({}, normalize(response.data, { endpoint: request.endpoint }));
        default:
          throw response.statusText;
      }
    }).catch((error) => {
      if (axios.isCancel(error)) {
        console.log('post Request canceled');
      }
    });;
  }
}