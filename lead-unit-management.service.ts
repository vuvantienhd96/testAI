import {Injectable} from '@angular/core';
import {BaseService} from "@pams-fe/shared/common/base-service";
import {map, Observable, catchError, throwError, forkJoin, of} from 'rxjs';
import {environment} from '@pams-fe/shared/environment';
import {format, parse, isValid} from 'date-fns';
import {
  Budget,
  ContentItem,
  Organization,
  PaginatedResponse,
  paramUpdatePush,
  SearchPayload
} from "./models/lead-unit-management.model";
import { ErrorHandlingService } from './error-handling.service';

@Injectable({
  providedIn: 'root'
})
export class LeadUnitManagementService extends BaseService { // Call the constructor of the BaseService
 private url = '/v1.0/risk-focal-units/';

 constructor(
    private readonly errorHandlingService: ErrorHandlingService
  ) {
 super();
  }


  public searchBasic(params: SearchPayload): Observable<PaginatedResponse<ContentItem>> {
    let urlEndPoint = this.url + 'search';
 const httpParams = this.toParams(params);
 return this.get(environment.pamsCommon, urlEndPoint, {params: httpParams}).pipe(
      catchError(err => {
 this.errorHandlingService.handleError(err);
        return throwError(() => err);
      }),
      map(res => res.data)
    );
  }

  public budgetCommon(): Observable<Budget[]> {
    let urlEndPoint = '/v1.0/budget/category-ancestor-code?flexValueSetName=PAM_COA_BUDGET_ROOT_LEVEL_BANK&transactionCateg=CONTRACT&page=0&size=10000&hideLoading=true';
    return this.get(environment.pamsCommon, urlEndPoint, undefined).pipe( // Keep catchError for the export file request
      map(res => res?.data?.content),
      catchError(err => {
        this.errorHandlingService.handleError(err);
        return throwError(() => err);
      }),
      map(res => res?.data?.content)
    );
  }


  public deleteById(id: number | null | undefined) {
    let urlEndPoint = this.url + `delete/${id}`;
    return this.delete(environment.pamsCommon, urlEndPoint, undefined).pipe(
 catchError(err => {
 this.errorHandlingService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  public confirmSource(param: any) {
    let urlEndPoint = `/v1.0/risk-focal-units/submit-import?key=${param?.data?.key}`;
    return this.post(environment.pamsCommon, urlEndPoint, undefined).pipe(
 catchError(err => {
 this.errorHandlingService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  public processExportError(bineArray: string): void {
    // This method doesn't make an HTTP request, so no catchError is needed here.
    // Remove data URI prefix if exists
    const base64Data = bineArray.replace(/^data:application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,/, '');
    import * as saveAs from "file-saver";
    const byteCharacters = atob(base64Data);
 const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    const blob = new Blob([byteArray], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const fileName = 'ImportDonViDauMoiLoi.xlsx';
    saveAs(blob, fileName);
  }


  public processImportData(data: any): Observable<any> {
 return this.post(environment.pamsCommon, 'v1.0/risk-focal-units/import-excel-data', data).pipe(
      catchError(err => {
 this.errorHandlingService.handleError(err);
        return throwError(() => err);
      })
 );
  }

  public processDeleteAction(id: number): Observable<any> {
    return this.deleteById(id); // deleteById already has catchError
  }

  export(params: any): Observable<any> {
    let urlEndPoint = 'v1.0/risk-focal-units/export';
    return this.getRequestFile(environment.pamsCommon, urlEndPoint, {params}).pipe( // Keep catchError for the export file request
 catchError(err => {
        this.errorHandlingService.handleError(err);
        return throwError(() => err);
      })
    );
  }
  getListUnit(search = ''): Observable<PaginatedResponse<Organization>> {
    let urlEndPoint = `/organization/searchOrganizationLevel?code=&hrisOrganizationId=&search=${search}&level=1&page=0&size=10000`;
    return this.get(environment.adminUrl, urlEndPoint, undefined).pipe(
      catchError(err => {
        this.errorHandlingService.handleError(err);
        return throwError(() => err);
      }));
  }

  parseFlexibleDate(input: string | Date): string {
    let date: Date;

    if (input instanceof Date) {
      date = input;
    } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(input)) {
      // Nếu là dạng 14/05/2025 thì dùng parse
      date = parse(input, 'dd/MM/yyyy', new Date());
    } else {
      // Nếu là dạng Wed May 14 2025 ... thì dùng new Date
      date = new Date(input);
    }

    // Kiểm tra hợp lệ
    if (!isValid(date)) {
      return 'Invalid Date';
    }

    return format(date, 'dd/MM/yyyy');
  }

  public getDetailRiskManagement(id: number) {
    let urlEndPoint = `v1.0/risk-focal-units/detail/${id}`;
 return this.get(environment.pamsCommon, urlEndPoint, undefined).pipe(
      map(res => res.data),
      catchError(err => {
        this.errorHandlingService.handleError(err);
        return throwError(() => err);
      })
    );
}

  public getLeadUnitUpdateData(id?: number): Observable<{ units: Organization[], budgets: Budget[], detail?: ContentItem, listDataOriginDropId?: ContentItem[] }> {
    const units$ = this.getListUnit().pipe(
      catchError(err => {
        this.errorHandlingService.handleError(err);
        this.toastrCustom.error("Lỗi khi tải danh sách đơn vị!");
        return of({ data: { content: [], totalElements: 0, number: 0 } });
      })
    );
    const budgets$ = this.budgetCommon().pipe(
      catchError(err => {
        this.errorHandlingService.handleError(err);
        this.toastrCustom.error("Lỗi khi tải thông tin ngân sách!");
        return of([]);
      })
    );

    const detail$ = id ? this.getDetailRiskManagement(id).pipe(
      catchError(err => {
        this.errorHandlingService.handleError(err);
        this.toastrCustom.error("Lỗi khi tải chi tiết đơn vị!");
        return of(undefined);
      })
    ) : of(undefined);

    return forkJoin([units$, budgets$, detail$]).pipe(
      map(([listUnitResponse, budgetResponse, detail]) => {
        const units = listUnitResponse?.content || [];
        const budgets = budgetResponse || [];
        const listDataOriginDropId = detail?.organizationDetails || [];

        if (detail) {
          // Logic to update _checked status on units list
          let bCodes = new Set(listDataOriginDropId.map(item => item.organizationId));
          units.forEach(el => {
            el._checked = bCodes.has(el.organizationId);
          });
        }

        return {
          units: units,
          budgets: budgets,
          detail: detail,
          listDataOriginDropId: listDataOriginDropId
        };
      })
    );
  }

  // Moved from component
  private buildPayloadToSend(a: any[], b: any[]) {
    const aIds = new Set(a.map(item => item.organizationId));
    const bIds = new Set(b.map(item => item.organizationId));
    const result: any[] = [];

    // ✅ TH1: item từ b mà không tồn tại trong a => Thêm mới (deleted = 0)
    for (const itemB of b) {
      if (!aIds.has(itemB.organizationId)) {
        result.push({
          organizationId: itemB.organizationId,
          deleted: 0
        });
      }
    }

    // ✅ TH2: item từ a mà không tồn tại trong b => Mark là đã xóa (deleted = 1)
    for (const itemA of a) {
      if (!bIds.has(itemA.organizationId)) {
        result.push({
          id: itemA.id,
          organizationId: itemA.organizationId,
          deleted: 1 // Mark as deleted
        });
      } else {
        // If item exists in both, include it with its existing 'deleted' status (should be 0)
        result.push({
          id: itemA.id,
          organizationId: itemA.organizationId,
          deleted: itemA.deleted
        });
      }
    }

    return result;
  }

  public buildLeadUnitPayload(formData: any, selectedUnits: Organization[], mode: 'add' | 'edit', existingDetail?: ContentItem): any {
    const payload = {
      ...formData,
 startDate: this.parseFlexibleDate(param.startDate),
      endDate: param.endDate === null ? '' : this.parseFlexibleDate(param.endDate),
      //budgetGroups: this.listBuggetGroup.filter((item: Budget) => this.formModal.value.budgetGroups.includes(item.code)), // Assume budgetGroups are handled elsewhere if needed in payload
    };

    if (mode === 'add') {
      payload.organizationDetails = selectedUnits.map(unit => ({ organizationId: unit.organizationId, deleted: 0 }));
    } else if (mode === 'edit' && existingDetail?.organizationDetails) {
      // Use the moved buildPayloadToSend logic
      payload.organizationDetails = this.buildPayloadToSend(existingDetail.organizationDetails, selectedUnits);
      payload.id = existingDetail.id;
    }

    return payload;
  }

  getDetailRiskManagement(id: number) {
    let urlEndPoint = `v1.0/risk-focal-units/detail/${id}`;
 return this.get(environment.pamsCommon, urlEndPoint, undefined).pipe(
      map(res => res.data),
      catchError(err => {
        this.errorHandlingService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  public saveLeadUnitUpdate(payload: any, mode: 'add' | 'edit'): Observable<any> {
    let urlEndPoint = 'v1.0/risk-focal-units/create';
    let request$;

    if (mode === 'add') {
      request$ = this.post(environment.pamsCommon, urlEndPoint, payload);
    } else {
      urlEndPoint = `v1.0/risk-focal-units/update/${payload?.id}`;
      request$ = this.put(environment.pamsCommon, urlEndPoint, payload);
    }

    return request$.pipe(
 catchError(err => {
 this.errorHandlingService.handleError(err);
 return throwError(() => err);
      }));
  }
}
