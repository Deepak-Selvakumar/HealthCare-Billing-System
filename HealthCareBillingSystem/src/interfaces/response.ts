export interface GetResponse<T> {
  value: T[];
  response: ResponseModel;
}

export interface ResponseModel {
  returnNumber: number;
  errorMessage: string;
}