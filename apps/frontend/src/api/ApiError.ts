/**
 * Error raised by the HTTP client. `status` follows docs/CONTRATO.md:
 * 422 = invalid input, 503 = a required data source is unavailable,
 * 0 = network failure, timeout or a response that does not match the contract.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly path: string;
  /** Parsed error body when the server sent JSON (FastAPI sends `{ detail }`). */
  readonly body: unknown;

  constructor(message: string, status: number, path: string, body: unknown = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.path = path;
    this.body = body;
  }
}
