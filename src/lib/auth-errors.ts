/**
 * Custom error types for authentication
 */

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor(message: string = "Invalid email or password") {
    super(message);
    this.name = "InvalidCredentialsError";
  }
}

export class MissingCredentialsError extends AuthError {
  constructor(message: string = "Email and password are required") {
    super(message);
    this.name = "MissingCredentialsError";
  }
}

export class UserNotFoundError extends AuthError {
  constructor(message: string = "User not found") {
    super(message);
    this.name = "UserNotFoundError";
  }
}

export class DatabaseError extends AuthError {
  constructor(message: string = "Database operation failed") {
    super(message);
    this.name = "DatabaseError";
  }
}
