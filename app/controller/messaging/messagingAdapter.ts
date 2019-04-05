import { Message } from "../../model/message";
import { peerSocket } from "messaging";

export class MessagingAdapter {

  debug = true;
  last_send_message_id = -1;
  last_received_message_id = -1;
  resend_timer:any = null;
  queue:any[] = []

  worker_timer:any = null;

  constructor() {
  }

  public init(msgReceivedCallback: any) {
    let self = this

    peerSocket.addEventListener("open", function () {
       self.send_next();
    });

// Do we have closed?
    peerSocket.addEventListener("closed", function () {
       self.stopWorker();
    });

    peerSocket.addEventListener("message", function (event) {
      let msg = event.data;
      if (!msg.ack) {
        if (msg.id > self.last_received_message_id) {
          msgReceivedCallback(Message.fromString(msg.body));
          self.last_received_message_id = msg.id;
        }
        try {
          // send acked back
          peerSocket.send(QueueMessage(msg.id));
        } catch (error) {
          self.debug && console.log(error);
        }
      } else {
        self.debug && console.log("Dequeue - got ack for " + data._asap_id)
        self.dequeue(msg.id);
      }
    });
  }

  public send(msg: Message) {
    enequeue(QueueMessage(this.get_next_id(), msg))
  }

  private enqueue(msg: QueueMessage) {
    this.debug && console.log("MSG: enqueue " + msg);
    this.queue.push(msg);
    if (this.queue.length == 1) {
        send_next()
    }
  }

  // maybe we can just shift() as we always get the first message acked - no need to search - but maybe does not matter
  private dequeue(id:number) {
    for (var i = 0; i < this.queue.length; i++ ) {
      let msg = queue[i]
      if (msg.id === id) {
        this.debug && console.log("MSG: remove " + msg)
        queue.splice(i, 1);
        if (queue.length == 0) {
          stopWorker();
        } else {
          sendNext()
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
    this.debug && console.log("buffer:" + peerSocket.bufferedAmount)
    if (queue.length > 0) {
      let msg = queue.peek();

      // clear expired messages first
      if (msg.expired()) {
        queue.shift()
        send_next();
        return;
      }

      this.debug && console.log("MSG: sending " + msg)
      try {
        peerSocket.send(msg);
      } catch (error) {
        this.debug && console.log(error);
      }
      start_worker()
    }
  }

  private start_worker() {
    stopWorker();

    let self = this
    this.worker_timer = setInterval(function () {
      self.send_next();
    }, 5000);

  }

  private stop_worker() {
    if (worker_timer) {
      clearInterval(worker_timer)
    }
  }


}



