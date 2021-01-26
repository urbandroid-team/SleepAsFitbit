import {Message} from "./message";
import {MsgConstants} from "../../common/msgConstants";

export class MultiMessage extends Message{
	MULTI_DELIMITER = '#'

	constructor() {
		super(MsgConstants.FITBIT_MESSAGE_MULTI, []);
	}

	addMessage(msg: Message) {
		(this.data as string[]).push(`${msg.command}${this.MULTI_DELIMITER}${msg.data}`)
	}

}
