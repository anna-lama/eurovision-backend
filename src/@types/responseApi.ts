/*
Classe che definisce lo scheletro della response delle API
 */
export default class ResponseApi {
  error = false;
  code = '';
  msg = 'ok';
  data: any;
  constructor (data: any, err?: boolean, code?: string, msg?: string) {
    this.data = data;
    if (err) { this.error = err; }
    if (code) { this.code = code; }
    if (msg) { this.msg = msg; }
  }
}
