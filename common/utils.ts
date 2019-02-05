export const inspect = obj => {
  for (const prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      console.log(`${prop}: ${obj[prop]}`)
    }
  }
}