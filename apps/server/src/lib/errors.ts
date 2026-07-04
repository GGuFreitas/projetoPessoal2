export class AppError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Não autenticado") {
    super(401, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Não encontrado") {
    super(404, message);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflito") {
    super(409, message);
  }
}
