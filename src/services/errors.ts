// Define custom error types for the application
export class FileProcessingError extends Error {
  constructor(message: string, public fileName: string) {
    super(message);
    this.name = 'FileProcessingError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AIProcessingError extends Error {
  constructor(message: string, public fileName: string) {
    super(message);
    this.name = 'AIProcessingError';
  }
}