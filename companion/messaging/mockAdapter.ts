import { Message } from "../../app/model/message";

export class MockAdapter {

  constructor() {
  }

  public init(msgReceivedCallback: any) {
    console.log("MOCK Messaging init")
  }

  public sendPlain(command: string, data: any) {
    this.send(new Message(command, data))
  }

  public send(msg: Message) {
    console.log("MOCK Sending msg: " + msg.toString())
  }

}