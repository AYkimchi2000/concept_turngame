// export class classname {}

//import { classname } from './filepath.js'
//let x = new classname()


class Server_States {
    constructor() {
        this.online_player_list = []

    }
}

class Operation {
    push(text) {
        x.online_player_list.push(text)
    }
}
const x = new Server_States()
const y = new Operation()


y.push("test")
console.log(x.online_player_list)

