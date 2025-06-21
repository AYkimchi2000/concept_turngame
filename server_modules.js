export class Server_States {
    constructor() {
        this.server_online_player_count = 10;
        this.server_online_party_list = 40;
    }
}
export class UserCred { 
    register_user(username, password) {
        console.log(`Registering user: ${username} with password: ${password}`);
        return true;
    }
}
export class CmdTree {
    constructor(io, socket, gamestate, combat) { 
        this.userCred = new UserCred(); 
        this.io = io; 
        this.socket = socket;
        this.test = {
            test: {
                swap: () => {
                    this.current = this.swapped_command_tree; //swappes current ot 
                    io.to(socket.id).emit("server_text_response", "successfully swapped!")
                    io.to(socket.id).emit("init_command_tree", this.deepCloneAndModify(this.swapped_command_tree))
                },
                rename: {
                    '{name} {newName} {anotherarg}': (name, newName, anotherarg) => {
                        io.to(socket.id).emit("server_text_response", `hi there, renaming ${name} to ${newName}, additional arg also available ${anotherarg}`)
                        
                    }
                },
                char_select: {
                    clarissa: () => io.to(socket.id).emit("server_text_response", "you selected clarissa as your character"),
                    chloe: () => io.to(socket.id).emit("server_text_response", "you selected chloe as your character"),
                    mia: () => io.to(socket.id).emit("server_text_response", "you selected mia as your character"),

                },
                party: {
                    create_party: {
                        '{roomid}': async (roomid) => {
                            //
                            if (![...socket.rooms].some(r => r !== socket.id)) { // if client is in any room other than the original
                                try{
                                    await socket.join(roomid)
                                    io.to(socket.id).emit("server_text_response", `Successfully created room: ${roomid}`)
                                }
                                catch (err) {
                                    io.to(socket.id).emit("server_text_response", `${err}`)
                                }
                            }
                            else {
                                io.to(socket.id).emit("server_text_response", `You're already in a room!`)
                            }
                            
                        }
                          
                    },
                    view_member: () => io.to(socket.id).emit("server_text_response", "you are viewing party members"),
                },
                emit_objecct: () => io.to(socket.id).emit("server_text_response", {
                    speaker: "",
                    data_type: "",
                    speaker_name: "", 
                    room_id: "",
                }),
                if_block: () => {
                    let x = 10;
                    if (x >= 5) {
                        io.to(socket.id).emit("server_text_response", "if block works as intended")
                    }
                }
            }
        };
        this.login = {
            register: {
                '{username} {password} {confirm_password}': (username, password, confirm_password) => {
                    if (password === confirm_password) {
                        if (this.userCred.register_user(username, password)) { // Access via this.userCred
                            this.io.to(this.socket.id).emit("server_text_response", `successfully registered user ${username}`);
                            this.io.to(this.socket.id).emit("change_playername", username);
                            
                        } else {
                            this.io.to(this.socket.id).emit("server_text_response", `Failed to register user ${username}`);
                        }
                    } else {
                        this.io.to(this.socket.id).emit("server_text_response", `Passwords do not match for ${username}`);
                    }
                }
            },
            login: {

            }
        };
        this.title_menu = {
            singleplayer: {

            },
            multiplayer: {
                host_party: {},
                join_party: {}  
            },
            settings: {

            },
            patchnote:{
                
            },
            exitgame: {
            },
            

        }
        this.swapped_command_tree = {
            swapped_success: () => io.to(socket.id).emit("server_text_response", "you chose to fight alone..."),
        }
        this.surface = {
            guild: {
                front_desk: {
                    kath_the_receptionist: {
                        conclude_quest: {
                        },
                        ask_room_availability: {
                        },
                        banter: {
                        }
                    },
                },
                adventurer_ledger: {
                    chloe_the_registrar: {
                        check_status: {},
                        banter: {}
                    }
                },
                canteen: {
                    sit_and_chat: {
                    },
                    order_food: {
                    },
                    look_for_partymember: {
                    }
                },
                quest_board: {
                    raw_list:{},
                    filter_list:{
                        unclear: {},
                        escort:{},
                        retrieve:{},
                        investigate:{},
                        hunt:{},
                        bounty:{},
                        deliver:{}
                    }
                },
                library: {
                    mob_wiki: {},
                    relic_wiki: {},
                },
                upstairs: {
                    guildmaster_office: {},
                    clerk_office: {},
                    archives: {},
                    guest_bedroom: {}
                },
                chat: {

                }


            },
            inn: {
            },
            restaurant: {
            },
            church: {
            },
            dungeon: {
                enter: () => {
                this.current = this.dungeon_layer1
                io.to(socket.id).emit("init_command_tree", this.deepCloneAndModify(this.dungeon_layer1)) 
            }
                
            }

        }
        this.dungeon_layer1 = {
            
        }
        this.combat = {
            start_combat: () => {
                
                combat.round_seq_calc(gamestate.all_participants, 1)
            }
        }
        this.current = this.test; //set initial tree to the test tree
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
export class Combat {
    constructor() {
        this.queue_holder = [];
        this.all_participant_id = []; //this is added in externally with instancename.all_participant_id.push({object})
        this.round_seq_preview = [];
    }
    enqueue(item) {
        this.queue_holder.push(item);
        this.queue_holder.sort((a, b) => a.time - b.time);
    }
    dequeue() {
        return this.queue_holder.shift();
    }
    isEmpty() {  // if this.queue_holder has no elements. It returns true if this.queue_holder.length is 0, otherwise false.
        return this.queue_holder.length === 0;
    }
    participants_current_stats() {
        for (let x in this.all_participant_id){
            
        }
    }
    round_seq_calc(units, actions = 5) {
        const combatLog = [];

        for (const unit of units) {
            const timeToAct = 25 / unit.speed;
            this.enqueue({ unit, time: timeToAct });
        }

        while (combatLog.length < actions && !this.isEmpty()) { //
            const { unit, time } = this.dequeue();
            combatLog.push(unit.name);

            // Schedule next turn for this unit
            const nextTime = time + (25 / unit.speed);
            this.enqueue({ unit, time: nextTime });
        }
        return combatLog;
    }
    combat_loop() {
        //while exit combat = false
            
    }

}
export class Gamestate {
    constructor() {
        this.state1 = true;
        this.state2 = false;
    }

}

// Example usage
let combat_instance = new Combat;
combat_instance.round_seq_calc([
    { name: "Knight", speed: 5 },
    { name: "Rogue", speed: 7 },
    { name: "Mage", speed: 3 }
], 15);