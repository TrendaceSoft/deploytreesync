// crud-http.service.ts
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  /**
   * prod live run
   */

  basePath: string = 'https://griddbdeploy.herokuapp.com/user/';
  headerBasePath: string = "https://griddbdeploy.herokuapp.com/gridheader/";
  gridPropertyBasePath: string = "https://griddbdeploy.herokuapp.com/treegridproperty/";

  /**
   * prod test run
   */

  //basePath: string = 'http://103.104.48.64:84/user/';
  //headerBasePath: string = "http://103.104.48.64:84/gridheader/";
  //gridPropertyBasePath: string = "http://103.104.48.64:84/treegridproperty/";


  /**
   * local run
   */

  // basePath: string = 'http://localhost:3000/user/';
  // headerBasePath: string = "http://localhost:3000/gridheader/";
  // gridPropertyBasePath: string = "http://localhost:3000/treegridproperty/";


  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE,PUT',
      'Cache-Control': 'No-Cache'
    })
  }

  constructor(private http: HttpClient) { }
  // Read header
  listHeader() {
    return this.http.get(this.headerBasePath + 'list', this.httpOptions).pipe(
      catchError(this.handleError)
    )
  }

  // add header
  addHeader(item: any) {
    return this.http.post(this.headerBasePath + 'add', item, this.httpOptions).pipe(
      catchError(this.handleError)
    )
  }

  // add header
  // addHeaderDataType(item: any, dataType: any, columnName: any, defaultValue:any) {
    addHeaderDataType(item: any, dataType: any, columnName: any) {
  // console.log(this.headerBasePath + 'dataType/' + dataType + '/' + columnName);
    return this.http.post(this.headerBasePath + 'dataType/' + dataType + '/' + columnName, item, this.httpOptions).pipe(
      catchError(this.handleError)
    )
  }


  /**
   * create new row
   */
  create(index: any, data: any): Observable<any> {
    return this.http.post(this.basePath + 'add/' + index, data, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  // Read
  list() {
    return this.http.get(this.basePath + 'list', this.httpOptions).pipe(
      catchError(this.handleError)
    )
  }

  // Update
  update(id: any, data: any): Observable<any> {
    return this.http.patch(this.basePath + 'update/' + id, data, this.httpOptions).pipe(
      catchError(this.handleError)
    )
  }

  // Delete
  delete(id: any): Observable<any> {
    return this.http.delete(this.basePath + 'delete/' + id, this.httpOptions).pipe(
      catchError(this.handleError)
    )
  }

  /**
   * add column
   * @param colName 
   * @param headerText 
   * @returns 
   */
  // addColumn(colName: any, headerText: any): Observable<any> {
    addColumn(colName: any, body:any): Observable<any> {
    return this.http.post(this.basePath + 'addNewColumn/' + colName, body, this.httpOptions).pipe(
      catchError(this.handleError)
    )
  }

  /**
   * delete column
   * @param colName
   * @returns 
   */
  deleteColumn(colName: any): Observable<any> {
    return this.http.get(this.basePath + 'deleteColumn/' + colName, this.httpOptions).pipe(
      catchError(this.handleError)
    )
  }

  /**
   * get grid property
   * @returns
   */
  getGridProperty() {
    return this.http.get(this.gridPropertyBasePath, this.httpOptions).pipe(
      catchError(this.handleError)
    )
  }

  // Update
  updateGridProperty(data: any): Observable<any> {
    return this.http.patch(this.gridPropertyBasePath + 'update/', data, this.httpOptions).pipe(
      catchError(this.handleError)
    )
  }

  /**
   * reorder column
   * @param error 
   * @returns 
   */
  reorderColumn(fromIndex: any, toIndex: any) {
    return this.http.get(this.headerBasePath + 'reorder?fromIndex=' + fromIndex + '&toIndex=' + toIndex, this.httpOptions).pipe(
      catchError(this.handleError)
    )
  }

  /**
   * rowDragDrop
   * @param error 
   * @returns 
   */
  deleteDragData(body: any) {
    return this.http.post(this.basePath + 'deleteDragData', body, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  /**
   * update dropped data
   * @param error 
   * @returns 
   */
  updateDroppedData(body: any) {
    return this.http.post(this.basePath + 'updateDroppedData', body, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      )
  }

  // Handle API errors
  handleError(error: HttpErrorResponse) {
    var errorcode = "";
    var errormessage = "";
    if (error.error instanceof ErrorEvent) {
      errorcode = "00000";
    } else {
      errorcode = error.status.toString();
      errormessage = error.statusText;
    }
    return throwError({ "statusCode": errorcode, "statusMessage": errormessage });
  };

}