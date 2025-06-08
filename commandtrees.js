export class ServerStats {
    constructor() {
        this.online_player_count = 10;
        this.online_party_list = 40;
        this.existing_char_data = 20;
    }
}

export class Comms {

}

export class UserCred { 
    register_user(username, password) {
        console.log(`Registering user: ${username} with password: ${password}`);
        return true;
    }
}

export class CmdTree {
    constructor(io, socket) { 
        this.userCred = new UserCred(); 
        this.io = io; 
        this.socket = socket;
        this.login = {
            register: {
                '{username} {password} {confirm_password}': (username, password, confirm_password) => {
                    if (password === confirm_password) {
                        if (this.userCred.register_user(username, password)) { // Access via this.userCred
                            this.io.to(this.socket.id).emit("server_response", `successfully registered user ${username}`);
                        } else {
                            this.io.to(this.socket.id).emit("server_response", `Failed to register user ${username}`);
                        }
                    } else {
                        this.io.to(this.socket.id).emit("server_response", `Passwords do not match for ${username}`);
                    }
                }
            }
        };
        this.test = {
            test: {
                swap: () => {
                    this.current = this.swapped_command_tree;
                    io.to(socket.id).emit("server_response", "successfully swapped!")
                    io.to(socket.id).emit("init_command_tree", this.deepCloneAndModify(this.swapped_command_tree))
                },
                rename: {
                    '{name} {newName} {anotherarg}': (name, newName, anotherarg) => {
                        io.to(socket.id).emit("server_response", `hi there, renaming ${name} to ${newName}, additional arg also available ${anotherarg}`)
                    }
                },
                combat_init: {
                    alone: () => io.to(socket.id).emit("server_response", "you chose to fight alone..."),
                    party: () => io.to(socket.id).emit("server_response", "you chose to fight together..."),
                },
                char_select: {
                    clarissa: () => io.to(socket.id).emit("server_response", "you selected clarissa as your character"),
                    chloe: () => io.to(socket.id).emit("server_response", "you selected chloe as your character"),
                    mia: () => io.to(socket.id).emit("server_response", "you selected mia as your character"),

                },
                enemy_select: {
                    goblin: () => io.to(socket.id).emit("server_response", "you chose to fight a goblin"),
                    skeleton: () => io.to(socket.id).emit("server_response", "you chose to fight a skeleton"),
                    wolves: () => io.to(socket.id).emit("server_response", "you chose to fight wolves"),
                },
                party: {
                    invite: () => io.to(socket.id).emit("server_response", "you chose to invite to a party"),
                    view_member: () => io.to(socket.id).emit("server_response", "you are viewing party members"),
                },
                attack: {
                    '{target}': (name, newName, anotherarg) => io.to(socket.id).emit("server_response", `hi there, renaming ${name} to ${newName}, additional arg also available ${anotherarg}`)
                }
            }
        };
        this.swapped_command_tree = {
            swapped_success: () => io.to(socket.id).emit("server_response", "you chose to fight alone..."),
        }
        this.current = this.test;
    }
    deepCloneAndModify(source) {
        const target = {};
        for (const key in source) {
            if (typeof source[key] === 'object' && source[key] !== null) {
                target[key] = this.deepCloneAndModify(source[key]);
            } else if (typeof source[key] === 'function') {
                target[key] = 'function';
            } else {
                target[key] = source[key];
            }
        }
        return target;
    }
}
// io.on('connection', (socket) => {
//     cmdtreeInstance = new CmdTree(io, socket)

// })
