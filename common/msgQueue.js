export class MsgQueue {
  constructor() {
    // if (instance) {
    //   return instance;
    // }
    // this.instance = this
    this.queue = []
  }

  addToQueue(command, data) {
    this.queue.push([command, data])
  }

  getNextMessage() {
    return this.queue.shift()
  }

  clearQueue() {
    this.queue.length = 0
  }

  logQueue() {
    console.log("MsgQueue:" + this.queue)
  }

  getMsgCount() {
    return this.queue.length
  }

}