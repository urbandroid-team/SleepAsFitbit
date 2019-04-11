import { inbox, outbox } from "file-transfer";
import { Message } from "../../model/message";
import { readFileSync } from "fs";
import { TextDecoder, TextEncoder } from "../../../common/encoding";

export class FileTransferAdapter {

  constructor() {
  }

  public init(msgReceivedCallback:any) {
    var self = this
    inbox.addEventListener("newfile", function () {
      self.processAllFiles(msgReceivedCallback)
    })
    this.processAllFiles(msgReceivedCallback);
  }

  public send(msg: Message) {
    outbox.enqueue('msg' + Math.floor(Math.random() * 100000000) + '.txt', new TextEncoder().encode(msg.toString()))
  }

  private processAllFiles(msgReceivedCallback:any) {
    let fileName;
    while (fileName = inbox.nextFile()) {
      msgReceivedCallback(Message.fromString(new TextDecoder().decodeFromArrayBuffer(readFileSync(fileName))))
      // TODO delete the file after reading
      // TODO don't do this in a while block but return the control to the app
    }
  }



}