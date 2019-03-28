import * as scientific from 'scientific'

// used for accelerometer DATA
// for each 10 second sensor data array
export function computeMaxDiffFromArray(xArr:Float32Array, yArr:Float32Array, zArr:Float32Array): number {
  return scientific.max(
    xArr.map((v, i, arr) => {
      if (i == xArr.length-1) {
        return 0
      }
      let xDiff = Math.abs(Number((xArr[i + 1] - xArr[i])));
      let yDiff = Math.abs(Number((yArr[i + 1] - yArr[i])));
      let zDiff = Math.abs(Number((zArr[i + 1] - zArr[i])));
      return (xDiff + yDiff + zDiff)
    })
  )
}

// used for accelerometer NEW_DATA
export function computeMaxRawFromArray(xArr: Float32Array, yArr: Float32Array, zArr: Float32Array): number {
  var res = xArr.map(function (x:number, i:number) {
    return Math.sqrt((x * x) + (yArr[i] * yArr[i]) + (zArr[i] * zArr[i]));
  })
  return scientific.max(res)
}

// Used for heart rates
export function computeMedianFromArray(arr:any[]) {
  arr.sort();
  return arr[Math.round(arr.length / 2) - 1];
}

// // used for accelerometer DATA
// export function computeMaxDiff(x: number, y: number, z: number, lastX: number, lastY: number, lastZ: number) {
//   return Math.abs(x - lastX) + Math.abs(y - lastY) + Math.abs(z - lastZ);
// }

// // used for accelerometer NEW_DATA
// export function computeMaxRaw(x: number ,y: number, z: number) {
//   return scientific.sqrt(new Float32Array((x * x) + (y * y) + (z * z)));
// }