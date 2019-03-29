import { inbox, outbox } from "file-transfer";
import { Message } from "../../app/model/message";
import { TextEncoder } from "../../common/encoding";

export class FileTransferAdapter {

  public init(msgReceivedCallback: any) {
    var self = this
    inbox.addEventListener("newfile", function () {
      self.processAllFiles(msgReceivedCallback)
    })
    this.processAllFiles(msgReceivedCallback);
  }

  public send(msg: Message) {
    outbox.enqueue('msg' + Math.floor(Math.random() * 100000000) + '.txt', new TextEncoder().encode(msg.toString()))
  }

  private async processAllFiles(msgReceivedCallback: any) {
    try {
      let file;
      while ((file = await inbox.pop())) {
        const payload = await file.text();
        console.log('companion received from watch');
        msgReceivedCallback(Message.fromString(payload))
      }
    } catch (error) {
      console.log(error)
    }
  }

}