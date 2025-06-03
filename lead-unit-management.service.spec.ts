import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LeadUnitManagementService } from './lead-unit-management.service';
import { BaseService } from '@pams-fe/shared/common/base-service';
import { environment } from '@pams-fe/shared/environment';
import { ErrorHandlingService } from './error-handling.service';

describe('LeadUnitManagementService', () => {
  let service: LeadUnitManagementService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{
        provide: ErrorHandlingService, useValue: jasmine.createSpyObj('ErrorHandlingService', ['handleError'])
      ],
    });
    // Inject the service and the HttpTestingController
    service = TestBed.inject(LeadUnitManagementService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // After every test, assert that there are no outstanding requests.
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#searchBasic', () => {
    it('should make a GET request to the correct URL with parameters', () => {
      const mockPayload = {
        search: 'test search',
        status: 1,
        size: 10,
        page: 0,
      };
      const mockResponse = { data: { content: [], totalElements: 0, number: 0 } };

      service.searchBasic(mockPayload).subscribe();

      const req = httpTestingController.expectOne(
        `${environment.pamsCommon}/v1.0/risk-focal-units/search?search=${encodeURIComponent(mockPayload.search)}&status=${mockPayload.status}&size=${mockPayload.size}&page=${mockPayload.page}`
      );
      expect(req.request.method).toEqual('GET');
      req.flush(mockResponse);
    });

    it('should call handleError on HTTP error', () => {
      const mockPayload = {
        search: 'test',
        status: null, // Test with null status
        size: 10,
        page: 0,
      };
      const mockError = new ErrorEvent('Network error', { message: 'Simulated network error' });
      const errorHandlingService = TestBed.inject(ErrorHandlingService) as jasmine.SpyObj<ErrorHandlingService>;

      service.searchBasic(mockPayload).subscribe({ error: () => {} });

      httpTestingController.expectOne(`${environment.pamsCommon}/v1.0/risk-focal-units/search?search=${mockPayload.search}&size=${mockPayload.size}&page=${mockPayload.page}`).error(mockError);
      expect(errorHandlingService.handleError).toHaveBeenCalled();
    });
  });

  describe('#budgetCommon', () => {
    it('should make a GET request to the correct URL', () => {
      const mockResponse = { data: [] };

      service.budgetCommon().subscribe();

      const req = httpTestingController.expectOne(`${environment.pamsCommon}/v1.0/budget-common`);
      expect(req.request.method).toEqual('GET');
      req.flush(mockResponse);
    });

    it('should call handleError on HTTP error', () => {
      const mockError = new ErrorEvent('Network error', { message: 'Simulated network error' });
      const errorHandlingService = TestBed.inject(ErrorHandlingService) as jasmine.SpyObj<ErrorHandlingService>;

      service.budgetCommon().subscribe({ error: () => {} });

      httpTestingController.expectOne(`${environment.pamsCommon}/v1.0/budget-common`).error(mockError);
      expect(errorHandlingService.handleError).toHaveBeenCalled();
    });
  });

  describe('#deleteById', () => {
    it('should make a DELETE request to the correct URL with ID', () => {
      const mockId = '123';
      const mockResponse = { success: true };

      service.deleteById(mockId).subscribe();

      const req = httpTestingController.expectOne(`${environment.pamsCommon}/v1.0/risk-focal-units/${mockId}`);
      expect(req.request.method).toEqual('DELETE');
      req.flush(mockResponse);
    });

    it('should call handleError on HTTP error', () => {
      const mockId = '123';
      const mockError = new ErrorEvent('Network error', { message: 'Simulated network error' });
      const errorHandlingService = TestBed.inject(ErrorHandlingService) as jasmine.SpyObj<ErrorHandlingService>;

      service.deleteById(mockId).subscribe({ error: () => {} });

      httpTestingController.expectOne(`${environment.pamsCommon}/v1.0/risk-focal-units/${mockId}`).error(mockError);
      expect(errorHandlingService.handleError).toHaveBeenCalled();
    });
  });

  describe('#confirmSource', () => {
    it('should make a POST request to the correct URL with payload', () => {
      const mockPayload = { id: '123', source: 'test source' };
      const mockResponse = { success: true };

      service.confirmSource(mockPayload).subscribe();

      const req = httpTestingController.expectOne(`${environment.pamsCommon}/v1.0/risk-focal-units/confirm-source`);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(mockPayload);
      req.flush(mockResponse);
    });

    it('should call handleError on HTTP error', () => {
      const mockPayload = { id: '123', source: 'test source' };
      const mockError = new ErrorEvent('Network error', { message: 'Simulated network error' });
      const errorHandlingService = TestBed.inject(ErrorHandlingService) as jasmine.SpyObj<ErrorHandlingService>;

      service.confirmSource(mockPayload).subscribe({ error: () => {} });

      httpTestingController.expectOne(`${environment.pamsCommon}/v1.0/risk-focal-units/confirm-source`).error(mockError);
      expect(errorHandlingService.handleError).toHaveBeenCalled();
    });
  });

  describe('#export', () => {
    it('should make a POST request to the correct URL with payload', () => {
      const mockPayload = { search: 'test', status: 1 };

      service.export(mockPayload).subscribe();

      const req = httpTestingController.expectOne(`${environment.pamsCommon}/v1.0/risk-focal-units/export`);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(mockPayload);
      req.flush(new Blob()); // Mock a Blob response for file download
    });

    it('should call handleError on HTTP error', () => {
      const mockPayload = { search: 'test', status: 1 };
      const mockError = new ErrorEvent('Network error', { message: 'Simulated network error' });
      const errorHandlingService = TestBed.inject(ErrorHandlingService) as jasmine.SpyObj<ErrorHandlingService>;

      service.export(mockPayload).subscribe({ error: () => {} });

      httpTestingController.expectOne(`${environment.pamsCommon}/v1.0/risk-focal-units/export`).error(mockError);
      expect(errorHandlingService.handleError).toHaveBeenCalled();
    });
  });

  describe('#getListUnit', () => {
    it('should make a GET request to the correct URL', () => {
      const mockResponse = { data: [] };

      service.getListUnit().subscribe();

      const req = httpTestingController.expectOne(`${environment.pamsCommon}/v1.0/lead-units`);
      expect(req.request.method).toEqual('GET');
      req.flush(mockResponse);
    });

    it('should call handleError on HTTP error', () => {
      const mockError = new ErrorEvent('Network error', { message: 'Simulated network error' });
      const errorHandlingService = TestBed.inject(ErrorHandlingService) as jasmine.SpyObj<ErrorHandlingService>;

      service.getListUnit().subscribe({ error: () => {} });

      httpTestingController.expectOne(`${environment.pamsCommon}/v1.0/lead-units`).error(mockError);
      expect(errorHandlingService.handleError).toHaveBeenCalled();
    });
  });

  describe('#getDetailRiskManagement', () => {
    it('should make a GET request to the correct URL with ID', () => {
      const mockId = '456';
      const mockResponse = { data: {} };

      service.getDetailRiskManagement(mockId).subscribe();

      const req = httpTestingController.expectOne(`${environment.pamsCommon}/v1.0/risk-focal-units/${mockId}`);
      expect(req.request.method).toEqual('GET');
      req.flush(mockResponse);
    });

    it('should call handleError on HTTP error', () => {
      const mockId = '456';
      const mockError = new ErrorEvent('Network error', { message: 'Simulated network error' });
      const errorHandlingService = TestBed.inject(ErrorHandlingService) as jasmine.SpyObj<ErrorHandlingService>;

      service.getDetailRiskManagement(mockId).subscribe({ error: () => {} });

      httpTestingController.expectOne(`${environment.pamsCommon}/v1.0/risk-focal-units/${mockId}`).error(mockError);
      expect(errorHandlingService.handleError).toHaveBeenCalled();
    });
  });

  describe('#getLeadUnitUpdateData', () => {
    it('should make a GET request to the correct URL with ID', () => {
      const mockId = '789';
      const mockResponse = { data: {} };

      service.getLeadUnitUpdateData(mockId).subscribe();

      const req = httpTestingController.expectOne(`${environment.pamsCommon}/v1.0/lead-units/${mockId}`);
      expect(req.request.method).toEqual('GET');
      req.flush(mockResponse);
    });

    it('should call handleError on HTTP error', () => {
      const mockId = '789';
      const mockError = new ErrorEvent('Network error', { message: 'Simulated network error' });
      const errorHandlingService = TestBed.inject(ErrorHandlingService) as jasmine.SpyObj<ErrorHandlingService>;

      service.getLeadUnitUpdateData(mockId).subscribe({ error: () => {} });

      httpTestingController.expectOne(`${environment.pamsCommon}/v1.0/lead-units/${mockId}`).error(mockError);
      expect(errorHandlingService.handleError).toHaveBeenCalled();
    });
  });
});