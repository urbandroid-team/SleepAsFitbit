import { Message } from "../../model/message";

export class MockAdapter {

  constructor() {
  }

  public init(msgReceivedCallback: any) {
    console.log("MOCK Messaging init")
  }

  public send(msg: Message) {
    console.log("MOCK Sending msg: " + msg.toString())
  }

}