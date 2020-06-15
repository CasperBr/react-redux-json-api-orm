import { IQueryParam } from "./httpRequestBuilder";

export interface JsonApiRequestConfig {
  action: string
  endpoint: string
  queryParams?: {
    page?: number
    size?: number
    include?: string
    filters?: IQueryParam[]
  }
  jwtAccessToken?: string
  options?: any
  formData?: any
  method?: string

  successMessage?: string
  failureMessage?: string
  successCallback?: () => void
  failureCallback?: () => void
  requestCallback?: () => void
}
