import {Message} from "../../model/message";

export abstract class MessagingAdapter {
	messagingMode: "single" | "multi" = 'single'

	public init(msgReceivedCallback: (msg: Message) => void, msgAckCallback: (ackedMsg: Message) => void) {
		console.log("Messaging init")
	}

	public sendPlain(command: string, data: any) {
		this.send(new Message(command, data))
	}

	public send(msg: Message) {
		console.log("Sending msg: " + msg.toString())
	}

	public stop() {
		console.log("Messaging stop")
	}

}
