import * as getRandomValues from 'get-random-values';

class Shortid {
  private dec2hex(dec: any) {
    return dec.toString(16).padStart(2, '0');
  }

  generateId(len: number) {
    var arr = new Uint8Array((len || 40) / 2);
    getRandomValues(arr);
    return '_' + Array.from(arr, this.dec2hex).join('');
  }
}

const shortid = new Shortid();

export { shortid };
