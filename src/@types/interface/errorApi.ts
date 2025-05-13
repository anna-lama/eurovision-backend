export default class ErrorApi extends Error {
  public code: number;            // Codice HTTP (es. 500)
  public internalCode: string;    // Codice di errore interno (es. ERR_F_1)
  public data: any;               // Dati contenuti nell'errore

  constructor(message: string, code: number, internalCode: string, data: null | any = null) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.internalCode = internalCode;
    this.data = data;

    Object.setPrototypeOf(this, new.target.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

