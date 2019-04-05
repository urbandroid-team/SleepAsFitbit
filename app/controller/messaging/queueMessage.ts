
export class QueueMessage {
  body: Any
  id: Number
  created: Number = Date.now()
  timeout: Number = 60000
  ack = false

  constructor(id: Number) {
    this.id = id
    ack = true
  }


  constructor(id: Number, body : Any) {
    this.id = id
    this.body = body
  }

  expired() {
    return timeout < 0 || (Date.now() >= created + timeout);
  }

  toString() {
    return "Msg #" + id + " body '" + body + "' ack=" + ack;
  }

}