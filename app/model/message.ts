import {MsgConstants} from "../../common/msgConstants";

export class Message {
  command: string
  data: any = ''

  constructor(command:string, data?:any) {
    this.command = command
    if (data) {
      this.data = data
    } 
  }

  serialize() {
    return [this.command, this.data]
  }

  static deserialize(array:any[]) {
    return new Message(array[0], array[1])
  }

  toString() {
    return this.command + '*' + this.data
  }

  static fromString(str: string): Message {
    console.log(str)
    console.dir(str)
    console.log(JSON.stringify(str))
    let ar = str.split("*")
    return (new Message(ar[0], ar[1]))
  }

  isMultiMessage(): boolean {
    return this.command === MsgConstants.FITBIT_MESSAGE_MULTI
  }
}
