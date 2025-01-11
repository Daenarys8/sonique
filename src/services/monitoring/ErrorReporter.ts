interface ErrorReport {
  errorMessage: string;
  errorCode?: string;
  stackTrace?: string;
  componentName?: string;
  userId?: string;
  timestamp: number;
  environment: string;
}

class ErrorReporter {
  private static instance: ErrorReporter;
  private errors: ErrorReport[] = [];
  private isProduction: boolean;

  private constructor() {
    this.isProduction = import.meta.env.PROD || false;
  }

  public static getInstance(): ErrorReporter {
    if (!ErrorReporter.instance) {
      ErrorReporter.instance = new ErrorReporter();
    }
    return ErrorReporter.instance;
  }

  public reportError(error: Error, componentName?: string, userId?: string): void {
    const errorReport: ErrorReport = {
      errorMessage: error.message,
      errorCode: (error as any).code,
      stackTrace: this.isProduction ? undefined : error.stack,
      componentName,
      userId,
      timestamp: Date.now(),
      environment: this.isProduction ? 'production' : 'development'
    };

    this.errors.push(errorReport);

    // In production, send to error tracking service
    if (this.isProduction) {
      this.sendToErrorTrackingService(errorReport);
    } else {
      console.error('Error Report:', errorReport);
    }
  }

  private async sendToErrorTrackingService(errorReport: ErrorReport): Promise<void> {
    try {
      // TODO: Implement actual error tracking service integration
      // Example: Sentry, LogRocket, etc.
      console.log('Sending error to tracking service:', errorReport);
    } catch (error) {
      console.error('Failed to send error to tracking service:', error);
    }
  }

  public getErrors(): ErrorReport[] {
    return this.errors;
  }

  public clearErrors(): void {
    this.errors = [];
  }
}

export default ErrorReporter;