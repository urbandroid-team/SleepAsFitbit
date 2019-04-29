import { Message } from "../../model/message";
import { peerSocket } from "messaging";
import { QueueMessage } from "./queueMessage";
import { launchApp, memory } from "system";
// @ts-ignore
import fitlogger from "../../../node_modules/fitbit-logger/app"


export class MessagingAdapter {

  debug = true;

  last_send_message_id = -1;
  last_received_message_id = -1;
  resend_timer: any = null;
  queue: any[] = []

  worker_timer: any = null;

  msgAckedCallback: any = null

  constructor() {
  }

  public init(msgReceivedCallback: any, msgAckedCallback: any) {
    let self = this
    this.msgAckedCallback = msgAckedCallback

    peerSocket.addEventListener("open", function () {
      self.send_next();
    });

    // Do we have closed?
    peerSocket.addEventListener("close", function () {
      self.stop_worker();
    });

    peerSocket.addEventListener("message", function (event) {
      let qMsg = event.data;
      console.log(JSON.stringify(qMsg))
      if (!qMsg.ack) {
        self.debug && console.log("Received " + qMsg.body.command)
        if (qMsg.id > self.last_received_message_id) {
          msgReceivedCallback(new Message(qMsg.body.command, qMsg.body.data));
          self.last_received_message_id = qMsg.id;
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

  public sendPlain(command: string, data: any) {
    this.send(new Message(command, data))
  }

  public send(msg: Message) {
    let m = memory.js.used + "/" + memory.js.peak
    this.enqueue(new QueueMessage(this.get_next_id(), msg, m))
  }

  public stop() {
    this.stop_worker()
    this.queue.length = 0
  }

  private enqueue(qMsg: QueueMessage) {
    this.debug && console.log("MSG: enqueue " + qMsg);
    this.queue.push(qMsg);
    if (this.queue.length == 1) {
        this.send_next()
    }
  }

  // maybe we can just shift() as we always get the first message acked - no need to search - but maybe does not matter
  private dequeue(id:number) {
    for (var i = 0; i < this.queue.length; i++ ) {
      let qMsg = this.queue[i]
      if (qMsg.id === id) {
        this.debug && console.log("QMSG: remove acked " + qMsg)
        this.msgAckedCallback(qMsg.body)
        this.queue.shift();
        if (this.queue.length == 0) {
          this.stop_worker();
        } else {
          this.send_next()
        }
        break;
      }
    }
  }

  private get_next_id() {
    if (this.last_send_message_id < 0) {
      this.last_send_message_id = Date.now() * 1000;
    }
    return ++this.last_send_message_id;
  }

  private send_next() {
    fitlogger.log("send_next")


    this.debug && console.log("buffer:" + peerSocket.bufferedAmount)
    if (this.queue.length > 0) {
      let qMsg:QueueMessage = this.queue[0];

      // clear expired messages first
      if (qMsg.expired()) {
        this.queue.shift()
        this.send_next();
        return;
      }

      this.debug && console.log("MSG: sending " + qMsg)
      try {
        peerSocket.send(qMsg);
      } catch (error) {
        this.debug && console.log(error);
      }
      this.start_worker()
    }
  }

  private start_worker() {
    this.stop_worker();

    let self = this
    this.worker_timer = setInterval(function () {
      self.send_next();
    }, 1000);

  }

  private stop_worker() {
    if (this.worker_timer) {
      clearInterval(this.worker_timer)
    }
  }

}



