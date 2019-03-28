export class TextEncoder {

  encoding = 'utf-8';

  encode = function (str:string) {
    var binstr = unescape(encodeURIComponent(str)),
      arr = new Uint8Array(binstr.length);
    const split = binstr.split('');
    for (let i = 0; i < split.length; i++) {
      arr[i] = split[i].charCodeAt(0);
    }
    return arr;
  };
}

export class TextDecoder {
  decodeFromArrayBuffer = function (buffer: ArrayBuffer) {
    var uint8 = new Uint8Array(buffer)
    return String.fromCharCode.apply(null, uint8)
  }
}
