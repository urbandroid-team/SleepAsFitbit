import { Message } from "../../app/model/message";
import { peerSocket } from "messaging";
import { QueueMessage } from "../../app/controller/messaging/queueMessage";
import { AppConfig } from "../../common/appConfig";
import { Context } from "../context";
import { me } from "companion";

export class WatchMessagingAdapter {

  debug = AppConfig.DEBUG_COMPANION;

  lastSentMessageID = -1;
  lastReceivedMessageID = -1;
  queue: any[] = []

  workerTimer: any = null;

  context: Context

  constructor(context: Context) {
    this.context = context
  }

  public init() {
    let self = this

    peerSocket.addEventListener("open", function () {
      self.maybeSendNext();
    });

    peerSocket.addEventListener("close", function () {
      self.stopWorker();
    });

    peerSocket.addEventListener("message", function (event) {
      let qMsg = event.data;
      // console.log(JSON.stringify(qMsg))
      if (!qMsg.ack) {
        self.debug && console.log("Received " + qMsg.body.command)
        if (qMsg.id > self.lastReceivedMessageID) {
          self.onMessageReceivedFromWatch(new Message(qMsg.body.command, qMsg.body.data))
          self.lastReceivedMessageID = qMsg.id;
        }
        try {
          // send acked back
          self.debug && console.log("Acking " + qMsg.body.command)
          peerSocket.send(new QueueMessage(qMsg.id));
        } catch (error) {
          self.debug && console.log(error);
        }
      } else {
        self.debug && console.log("Dequeue - got ack for " + qMsg.id)
        self.dequeue(qMsg.id);
      }
    });
  }

  public send(msg: Message) {
    this.enqueue(new QueueMessage(this.getNextId(), msg))
  }

  public sendIfNotEnqueued(msg: Message) {
    if (!this.isMsgEnqueued(msg)) {
      this.send(msg)
    }
  }

  private enqueue(qMsg: QueueMessage) {
    this.debug && console.log("MSG: enqueue " + qMsg);
    this.queue.push(qMsg);
    if (this.queue.length == 1) {
      this.maybeSendNext()
    }
  }

  // maybe we can just shift() as we always get the first message acked - no need to search - but maybe does not matter
  private dequeue(id: number) {
    for (var i = 0; i < this.queue.length; i++) {
      let qMsg = this.queue[i]
      if (qMsg.id === id) {
        this.debug && console.log("QMSG: remove acked" + qMsg)
        this.onMessageAcked(qMsg.body)
        this.queue.shift();
        if (this.queue.length == 0) {
          this.stopWorker();
        } else {
          this.maybeSendNext()
        }
        break;
      }
    }
  }

  private onMessageReceivedFromWatch(msg: Message) {
    this.context.phoneMessagingAdapter.enqueue(msg)
    me.wakeInterval = AppConfig.defaultCompanionWakeInterval
  }

  private onMessageAcked(ackedMsg: Message) {
    if (ackedMsg.command == "ping") {
      console.log("Sending connected")
      this.context.phoneMessagingAdapter.send('connected')
    }
    if (ackedMsg.command == "stop") {
      me.wakeInterval = undefined
    }

  }

  private isMsgEnqueued(msg: Message) {
    let res = this.queue.find((el: QueueMessage) => {
      return (el.body.command == msg.command)
    })
    if (res) { return true }
    return false
  }

  private getNextId() {
    if (this.lastSentMessageID < 0) {
      this.lastSentMessageID = Date.now() * 1000;
    }
    return ++this.lastSentMessageID;
  }

  private maybeSendNext() {
    this.debug && console.log("buffer:" + peerSocket.bufferedAmount)
    if (peerSocket.bufferedAmount < 100) {
      this.sendNext()
    } else {
      console.log("buffer: " + peerSocket.bufferedAmount)
      console.log("")
    }
  }

  private sendNext() {
    // this.debug && console.log("buffer:" + peerSocket.bufferedAmount)
    if (this.queue.length > 0) {
      let qMsg: QueueMessage = this.queue[0];

      // clear expired messages first
      if (qMsg.expired()) {
        console.log("Msg expired " + qMsg.body.command)
        this.queue.shift()
        this.maybeSendNext();
        return;
      }

      this.debug && console.log("MSG: sending " + qMsg)
      try {
        peerSocket.send(qMsg);
      } catch (error) {
        this.debug && console.log(error);
      }
      this.startWorker()
    }
  }

  private startWorker() {
    this.stopWorker();

    let self = this
    this.workerTimer = setInterval(function () {
      console.log("Worker tick")
      self.maybeSendNext();
    }, 2000);

  }

  private stopWorker() {
    if (this.workerTimer) {
      clearInterval(this.workerTimer)
    }
  }

}
