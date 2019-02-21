// import { scientific } from 'scientific'
import * as scientific from 'scientific'

// used for accelerometer DATA
export function computeMaxDiffFromArray(xArr: any, yArr: any, zArr: any) {
  var result = [];
  let xDiff; let yDiff; let zDiff;

  for (var i = 0; i < xArr.length - 1; i++) {
    xDiff = Math.abs(Number((xArr[i + 1] - xArr[i])));
    yDiff = Math.abs(Number((yArr[i + 1] - yArr[i])));
    zDiff = Math.abs(Number((zArr[i + 1] - zArr[i])));
    result.push((xDiff + yDiff + zDiff).toFixed(2));
  }
  return result;
}

// used for accelerometer NEW_DATA
export function computeMaxRawFromArray(xArr: any, yArr: any, zArr: any): string {
  var res = xArr.map(function (x:number, i:number) {
    return Math.sqrt((x * x) + (yArr[i] * yArr[i]) + (zArr[i] * zArr[i]));
  })
  return scientific.max(res).toFixed(2)
}

// Used for heart rates
export function computeMedianFromArray(arr:any[]) {
  arr.sort();
  return arr[Math.round(arr.length / 2) - 1];
}

// used for accelerometer DATA
export function computeMaxDiff(x: number, y: number, z: number, lastX: number, lastY: number, lastZ: number) {
  return Math.abs(x - lastX) + Math.abs(y - lastY) + Math.abs(z - lastZ);
}

// used for accelerometer NEW_DATA
export function computeMaxRaw(x: number ,y: number, z: number) {
  return scientific.sqrt(new Float32Array((x * x) + (y * y) + (z * z)));
}