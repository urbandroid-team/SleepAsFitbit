// used for accelerometer DATA
export function computeMaxDiffFromArray(xArr, yArr, zArr) {
  var result = [];
  let xDiff; let yDiff; let zDiff;

  for (var i = 0; i < xArr.length - 1; i++) {
    xDiff = Math.abs(Number((xArr[i + 1] - xArr[i])));
    yDiff = Math.abs(Number((yArr[i + 1] - yArr[i])));
    zDiff = Math.abs(Number((zArr[i + 1] - zArr[i])));
    result.push(xDiff + yDiff + zDiff);
  }
  return result;
}

// used for accelerometer NEW_DATA
export function computeMaxRawFromArray(xArr, yArr, zArr) {
  var res = xArr.map(function (x, i) {
    return sqrt((x * x) + (yArr[i] * yArr[i]) + (zArr[i] * zArr[i]));
  })
  return max(res);
}

// Used for heart rates
export function computeMedianFromArray(arr) {
  arr.sort();
  return arr[Math.round(arr.length / 2) - 1];
}

// used for accelerometer DATA
export function computeMaxDiff(x,y,z,lastX,lastY,lastZ) {
  return Math.abs(x - lastX) + Math.abs(y - lastY) + Math.abs(z - lastZ);
}

// used for accelerometer NEW_DATA
export function computeMaxRaw(x,y,z) {
  return Math.sqrt((x * x) + (y * y) + (z * z));
}