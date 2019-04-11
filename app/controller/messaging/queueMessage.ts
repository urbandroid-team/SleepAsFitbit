import { Message } from "../../model/message";

export class QueueMessage {
  body:Message
  id:number
  created:number = Date.now()
  timeout:number = 60000
  ack = false

  constructor(id: number, body?: Message) {
    this.id = id

    if (body) {
      this.body = body
    } else {
      this.ack = true
    }
  }

  expired() {
    return this.timeout < 0 || (Date.now() >= this.created + this.timeout);
  }

  toString() {
    return "Msg #" + this.id + " body '" + this.body + "' ack=" + this.ack;
  }

}