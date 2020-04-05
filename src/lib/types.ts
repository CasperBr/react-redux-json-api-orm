export interface JsonApiRequestConfig {
  action: string
  endpoint: string
  queryParams?: {
    page?: {
      number?: number
      size?: number
    }
    filter?: {
      field?: string
      query?: string
    }
    include?: string
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
