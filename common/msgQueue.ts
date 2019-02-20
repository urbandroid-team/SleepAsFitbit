import { Message } from "../app/model/message";

export class MsgQueue {
  queue:any[]
  name:string = ""

  constructor(name:string) {
    this.queue = []
    this.name = name
  }

  // obsolete, not using Message
  // addToQueue(command:string, data:any) {
  //   this.queue.push([command, data])
  // }

  addToQueue(message:Message) {
    this.queue.push(message)
  }

  getNextMessage():Message {
    let nextMsg = this.peekNextMessage()
    this.removeNextMessage()
    return nextMsg
  }

  peekNextMessage():Message {
    return this.queue[0]
  }

  removeNextMessage() {
    this.queue.shift()
  }

  clearQueue() {
    this.queue.length = 0
  }

  logQueue() {
    let commands:any[] = []
    this.queue.forEach((msg:Message) => {
      commands.push(msg.command)
    })

    console.log("MsgQueue " + this.name + ": " + commands)
    // console.log("MsgQueue " + this.name + " len: " + this.queue.length)
  }

  getMsgCount() {
    return this.queue.length
  }

}