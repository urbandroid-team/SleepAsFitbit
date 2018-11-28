export class MsgQueue {
  constructor() {
    this.queue = []
  }

  addToQueue(msg) {
    this.queue.push(msg)
  }

  getNextMessage() {
    return this.queue.shift()
  }

  clearQueue() {
    this.queue.length = 0
  }

}