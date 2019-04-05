import { Message } from "../../app/model/message";
import { peerSocket } from "messaging";

export class MessagingAdapter {

  debug = true;
  last_generated_message_id = -1;
  last_received_message_id = -1;
  resend_timer: any = null;
  queue: any[] = []

  constructor() {
  }

  public init(msgReceivedCallback: any) {
    let self = this

    this.set_last_generated_id_according_to_queue();

    setTimeout(function () {
      self.send_next();
    }, 1000);

    peerSocket.addEventListener("open", function () {
      self.send_next();
    });

    peerSocket.addEventListener("message", function (event) {
      let data = event.data;
      if (data._asap_id) {
        if (!data._asap_ack) {
          if (data._asap_id > self.last_received_message_id) {
            msgReceivedCallback(Message.fromString(data._asap_message));
            self.last_received_message_id = data._asap_id;
          }
          try {
            peerSocket.send({ _asap_ack: true, _asap_id: data._asap_id });
          }
          catch (error) {
            self.debug && console.log(error);
          }
        } else {
          self.debug && console.log("Dequeue - got ack for " + data._asap_id)
          self.dequeue(data._asap_id);
          self.clear_resend_timer();
          self.send_next();
        }
      }
    });
  }

  public send(msg: Message) {
    this.doSend(msg.toString(), { timeout: "session" })
  }

  private enqueue(data: any) {
    this.debug && console.log("Enqueue Message ID #" + data._asap_id);
    this.queue.push(data);
  }

  private dequeue(id: number) {
    for (var i = 0; i < this.queue.length; i++) {
      if (this.queue[i]._asap_id === id) {
        this.debug && console.log("remove " + this.queue[i]._asap_message)
        this.queue.splice(i, 1);
        break;
      }
    }
  }

  private doSend(message: string, options: any) {
    let now = Date.now();
    options = options || {};
    options.timeout = options.timeout || 2592000000;
    let data = {
      _asap_id: this.get_next_id(),
      _asap_created: now,
      _asap_timeout: options.timeout,
      _asap_message: message,
      _asap_ack: false
    };
    this.enqueue(data);
    if (this.queue.length == 1) {
      this.send_next();
    }
  }

  private get_next_id() {
    if (this.last_generated_message_id < 0) {
      this.last_generated_message_id = Math.floor(Math.random() * 10000000000);
    }
    return ++this.last_generated_message_id;
  }

  private send_next() {
    this.debug && console.log("buffer:" + peerSocket.bufferedAmount)
    if (this.resend_timer == null) {
      if (this.queue.length > 0) {
        try {
          if (this.is_message_expired(this.queue[0])) {
            return;
          }
          this.debug && console.log(peerSocket.readyState)
          this.debug && console.log("Trying to send " + this.queue[0]._asap_id + " " + this.queue[0]._asap_message)
          peerSocket.send(this.queue[0]);
          this.set_resend_timer();
        }
        catch (error) {
          this.debug && console.log(error);
          this.set_resend_timer();
        }
      }
    }
  }

  private is_message_expired(message: any) {
    if (!isNaN(message._asap_timeout)) {
      return (Date.now() >= message._asap_created + message._asap_timeout);
    }
    return false;
  }

  private set_resend_timer() {
    let self = this
    this.resend_timer = setTimeout(function () {
      self.clear_resend_timer()
      self.send_next();
    }, 5000);
  }

  private clear_resend_timer() {
    if (this.resend_timer) {
      clearTimeout(this.resend_timer);
      this.resend_timer = null;
    }
  };

  private set_last_generated_id_according_to_queue() {
    let last_message = this.queue.slice(-1)[0];
    if (last_message && last_message._asap_id) {
      this.last_generated_message_id = last_message._asap_id + 1;
    }
  };

}



