import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {

  constructor(private toastr: ToastrService) { }

  /**
   * Handles API errors and displays a user-friendly message.
   * @param error The error object received.
   * @param customMessage An optional custom message to display.
   */
  handleError(error: any, customMessage?: string): void {
    let errorMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại sau.'; // Default message

    if (customMessage) {
      errorMessage = customMessage;
    } else if (error && error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error && error.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    this.toastr.error(errorMessage);
  }
}