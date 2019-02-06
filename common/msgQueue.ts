export class MsgQueue {
  queue:any[]

  constructor() {
    this.queue = []
  }

  addToQueue(command:string, data:any) {
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