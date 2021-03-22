import { Message } from "../../app/model/message";
import { MsgQueue } from "../../common/msgQueue";
import { version } from "../../version";
import { me } from "companion";
import { AppConfig } from "../../common/appConfig";
import { MsgConstants } from '../../common/msgConstants'
import { Context } from "../context";

export class PhoneMessagingAdapter {

  POLLING_INTERVAL = 1000

  toPhoneQueue = new MsgQueue("toSleep")
  toSleepTimer: any
  context: Context

  constructor(context: Context) {
    this.context = context
  }

  public init() {
    this.startSleepPollingTimer(this.toPhoneQueue, this.toSleepTimer)
    this.enqueue(new Message("version", version))
  }

  public send(command: string, data?: any) {
    this.sendMessageToPhone(new Message(command, data))
  }

  public enqueueRaw(command: string, data?: any) {
    this.enqueue(new Message(command, data))
  }
  public enqueue(msg: Message) {
    this.toPhoneQueue.addToQueue(msg)
  }

  private startSleepPollingTimer(queue: MsgQueue, timer: any) {

    this.enqueue(new Message("companionStart", " peerApp " + (me.launchReasons.peerAppLaunched ? 1 : 0) + " fileTrans " + (me.launchReasons.fileTransfer ? 1 : 0) + " wakeUp " + (me.launchReasons.wokenUp ? 1 : 0)))

    timer = setInterval(() => {
      // console.log(">> msg timer to Sleep TICK")
      if (queue.getMsgCount() > 0) {
        queue.logQueue()
        this.sendMessageToPhone(queue.peekNextMessage())
      } else {
        this.sendMessageToPhone(new Message('poll', '0'))
      }
    }, this.POLLING_INTERVAL);
  }

  private sendMessageToPhone(msg: Message) {
    // console.log("app readystate: " + app.readyState)

    if (AppConfig.companionMockSleep) {
      this.toPhoneQueue.clearQueue()
      return
    }

    let url = 'http://127.0.0.1:1764/' + encodeURIComponent(msg.command) + '?data=' + encodeURIComponent(msg.data)
    // console.log("sendMessageToSleep " + url)
    fetch(url)
      .then((response: any) => {
        // console.log("sendMessageToSleep", response)
        this.runMessageSpecificHooks()
        this.toPhoneQueue.removeNextMessage()
        return response.text();
      })
      .then((fromSleepMsg: any) => {
        // console.log("sendMessageToSleep fromSleepMsg")
        this.processMessageFromPhone(fromSleepMsg)
      })
      .catch((error: any) => {
        if (error == "TypeError: Failed to fetch") {
          // this most probably means server on phone is not started
          console.warn("Can't connect to Sleep. Is sleep tracking running on the phone?")
        } else {
          !AppConfig.DEBUG_COMPANION && console.error("sendMessageToSleep err " + error)
        }
      });
  }

  private runMessageSpecificHooks() {
    let nextMsg: Message = this.toPhoneQueue.peekNextMessage()
    if (nextMsg) {
      switch (nextMsg.command) {
        case MsgConstants.FITBIT_MESSAGE_STOP_TRACK:
          this.context.watchMessagingAdapter.send(new Message(MsgConstants.FITBIT_MESSAGE_STOP_SENT_TO_SLEEP_FROM_COMPANION))
          break;
        default:
          break;
      }
    }
  }

  private processMessageFromPhone(unparsedMsg: any) {
    // console.log("unparsedMsg " + unparsedMsg)
    // console.log("unparsedMsg length " + unparsedMsg.length)
    let msgs = JSON.parse(unparsedMsg)
    // console.log("parsedMsgArray length " + msgArray.length)
    if (msgs.length > 0) {
      msgs = this.filterOutStopIfStartPresent(msgs)

      msgs.forEach((msg: any) => {
        let command = msg['name']
        let data = msg['data']
        if (data == 'null') {
          data = undefined
        }

        console.log("Enqueue to watch: " + command + " " + data)
        if (command == 'ping') {
          this.context.watchMessagingAdapter.sendIfNotEnqueued(new Message(command, data))
        } else {
          this.context.watchMessagingAdapter.send(new Message(command, data))
        }
      });
    }
  }

  private filterOutStopIfStartPresent(msgs: any[]) {
    var startPresent: boolean = msgs.filter(msg => {
      return msg['name'] === 'start'
    }).length > 0

    if (startPresent) {
      return msgs.filter(msg => {
        if (msg['name'] == MsgConstants.FITBIT_MESSAGE_STOP_TRACK) {
          console.log('PhoneMsgAdapter: Filtering out stop')
        }
        return msg['name'] !== MsgConstants.FITBIT_MESSAGE_STOP_TRACK
      })
    }
    return msgs
  }

}
