class Comms {
    server_
}

export class UserCred { 
    register_user(username, password) {
        console.log(`Registering user: ${username} with password: ${password}`);
        return true; // Indicate success
    }
}

export class CmdTree {
    constructor(io, socket) { // Pass io and socket if they are dependencies
        this.userCred = new UserCred(); // Instantiate UserCred here
        this.io = io; // Store io if it's a dependency for later use
        this.socket = socket; // Store socket if it's a dependency for later use

        this.login = {
            register: {
                '{username} {password} {confirm_password}': (username, password, confirm_password) => {
                    if (password === confirm_password) {
                        if (this.userCred.register_user(username, password)) { // Access via this.userCred
                            this.io.to(this.socket.id).emit("server_broadcast_all", `successfully registered user ${username}`);
                        } else {
                            this.io.to(this.socket.id).emit("server_broadcast_all", `Failed to register user ${username}`);
                        }
                    } else {
                        this.io.to(this.socket.id).emit("server_broadcast_all", `Passwords do not match for ${username}`);
                    }
                }
            }
        };
        this.town; // Consider initializing these as well, e.g., this.town = {};
        this.smith; // Consider initializing these as well, e.g., this.smith = {};
    }
}
// io.on('connection', (socket) => {
//     cmdtreeInstance = new CmdTree(io, socket)

// })
