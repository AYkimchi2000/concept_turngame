export class Server_States {
    constructor(io, socket) {
        this.server_online_player_count = 10;
        this.server_online_party_list = 40;
        this.server_existing_parties = {};
    }
}
export class Client_States {
    constructor() {
        this.character_name = ""
        this.character_current_stats = ""
        this.charactre_inv = ""
        this.character_default_stats = ""
    }
}
export class UserCred { 
    register_user(username, password) {
        // console.log(`Registering user: ${username} with password: ${password}`);
        return true;
    }
    login_user() {
        
    }
}
export class CmdTree {
    constructor(io, socket, server_state_instance_arg, cli_table, gamestate, combat) { 
        this.userCred = new UserCred(); 
        this.io = io; 
        this.socket = socket;
        this.server_state_instance = server_state_instance_arg
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
                            if (![...socket.rooms].some(r => r !== socket.id)) { // if client is in any room other than the original, spits false 
                                try{
                                    await socket.join(roomid)
                                    this.server_state_instance.server_existing_parties[roomid] =  ""
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
                    join_party: {
                        '{roomid}': async (roomid) => {
                            //
                            if (![...socket.rooms].some(r => r !== socket.id)) { // if client is in any room other than the original, spits false 
                                try {
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
                    leave_current_party: async () => {
                        if (![...socket.rooms].some(r => r !== socket.id)) { 
                            try {
                                await socket.leave(roomid)
                                io.to(socket.id).emit("server_text_response", `You left the room: ${roomid}`)
                            }
                            catch (err) {
                                io.to(socket.id).emit("server_text_response", `${err}`)
                            }

                        }
                    },
                    view_available_party: () => {
                        const table = new MyCLITable({ head: ['party_name', 'member_count'] });
                        for (const [key, value] of Object.entries(this.server_state_instance.server_existing_parties)) {
                            table.push([key, value]);
                        }

                        io.to(socket.id).emit("server_text_response", table.toString())
                    },
                    view_party_member: async () => { 
                         if ([...socket.rooms].some(r => r !== socket.id)) { 
                            const room = [...socket.rooms].filter(r => r !== socket.id);
                            const party_member_sockets = await io.in(room).fetchSockets();
                            const sockets_stringify = party_member_sockets.map(s => s.id).join(', ');
                            
                            io.to(socket.id).emit("server_text_response", `${sockets_stringify}`)
                         }
                         else {
                             io.to(socket.id).emit("server_text_response", `you are not in a party!`)
                         }
                    },
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
        this.combat_log = [];
        this.all_participant_id = []; //this is added in externally with instancename.all_participant_id.push({object})
        this.placeholder_player_data = [
            { id: 'Player1', speed: 10 },
            { id: 'Player2', speed: 15 }
        ]
        this.placeholder_enemy_data = [
            { id: 'Enemy1', speed: 12 },
            { id: 'Enemy2', speed: 12 },
            { id: 'Enemy2', speed: 12 },
        ]
        this.all_unit_speed = []
    }
    enqueue(item) {
        this.queue_holder.push(item);
        this.queue_holder.sort((a, b) => a.time - b.time); //
    }
    dequeue() {
        return this.queue_holder.shift();
    }
    isEmpty() {  // if this.queue_holder has no elements. It returns true if this.queue_holder.length is 0, otherwise false.
        return this.queue_holder.length === 0;
    }
    round_seq_calc(units, actions = 5) {
        const combatLog = [];
        for (const unit of units) {
            const timeToAct = 25 / unit.speed;
            this.enqueue({ unit, time: timeToAct });
        }

        while (combatLog.length < actions && !this.isEmpty()) { 
            const { unit, time } = this.dequeue(); 
            combatLog.push(unit.name);

            // Schedule next turn for this unit
            const nextTime = time + (25 / unit.speed);
            this.enqueue({ unit, time: nextTime });
        }
        return combatLog;
    }











    
    next_unit_to_combat_log(party_units, enemy_units){
        function calculate_speed_time(participant_data) { //arg is list with character data objects {}
            const transformed = participant_data.map(obj => {
                const [name, speed] = Object.entries(obj)[0];
                return { [name]: 20 / speed }
            });
            return transformed
        }
        function add_previous_turn(speed_time_data, combat_log) {
            for (const entry of combat_log) {
                const [key, value] = Object.entries(entry)[0];

                for (const speed_entry of speed_time_data) {
                    if (speed_entry.hasOwnProperty(key)) {
                        speed_entry[key] += value;
                        break; // no need to keep looking after a match
                    }
                }
            }
        }
        function sort_fastest(current_round_speed_time_list) {
            current_round_speed_time_list.sort((a, b) => Object.values(a)[0] - Object.values(b)[0]);
            return sorted_speed_time_list
        }

        // party_units_data = correlate_unit_data(party_units) // id to data
        // enemy_units_data = correlate_unit_data(enemy_units) //id to data
        this.all_unit_speed = [
            ...this.placeholder_player_data,
            ...this.placeholder_enemy_data
        ];
        let speed_time_list = calculate_speed_time(this.all_unit_speed)
        let cumulative_speed_time_list = add_previous_turn(speed_time_list, this.combat_log)
        let sorted_speed_time_list = sort_fastest(cumulative_speed_time_list)
        const { unit, time } = sorted_speed_time_list.shift()
        this.combat_log.push(unit.name);
        


        // _holder_seq = calculate_speed_time(participant_data)
        // _holder_seq = add_combat_log_nums(holder_seq)
        // _holder_seq.sort()
        // the left most in combat_seq gets pushed into combat_log
        // then the corresponding index unit in combat_log gets prompted for action






        // let in_combat = true;
        while (in_combat = true) {
            //something

        }

    }

 






    // 3. send prompt based on the 

}
export class Gamestate {
    constructor() {
        this.state1 = true;
        this.state2 = false;
    }

}
export class MyCLITable {
    constructor(options = {}) {
        this.headers = options.head || [];
        this.rows = [];
    }
    push(row) {
        this.rows.push(row);
    }
    toString() {
        const allRows = [this.headers, ...this.rows];
        const colWidths = this.headers.map((_, i) =>
            Math.max(...allRows.map(row => (row[i] ? row[i].toString().length : 0)))
        );

        const drawLine = (charL, charM, charR, charH) =>
            charL + colWidths.map(w => charH.repeat(w + 2)).join(charM) + charR;

        const drawRow = row =>
            '│ ' +
            row.map((cell, i) => (cell || '').toString().padEnd(colWidths[i]) + ' ').join('│ ') +
            '│';

        const top = drawLine('┌', '┬', '┐', '─');
        const mid = drawLine('├', '┼', '┤', '─');
        const bot = drawLine('└', '┴', '┘', '─');

        const output = [top, drawRow(this.headers), mid];
        for (const row of this.rows) {
            output.push(drawRow(row));
        }
        output.push(bot);

        return output.join('\n');
    }
}
export class Unit {
    constructor(unit_data){

    }
}

// Example usage
let combat_instance = new Combat;
combat_instance.round_seq_calc([
    { name: "Knight", speed: 5 },
    { name: "Rogue", speed: 7 },
    { name: "Mage", speed: 3 }
], 15);