export class ServerStats {
    constructor() {
        this.online_player_count = 10;
        this.online_party_list = 40;
        this.existing_char_data = 20;
    }
}
export class Comms {
    constructor() {
        // this.io = io;
        // this.socket = socket;
        // this.event = event
    }
    display_message_client(socket, event) {
        if (event.key === "Enter") {
            autocomplete_visibility = false
            event.preventDefault();
            const inputEvent = new Event("input", { bubbles: true });
            document.getElementById("id_command_input_box").dispatchEvent(inputEvent);

            if (document.getElementById("id_command_input_box").value.trim()) {

                //save to command_history
                command_history.push(document.getElementById("id_command_input_box").value);
                historyIndex = command_history.length;

                //clone and replace last input command container
                const clone_of_previous_textrow = document.getElementById('id_text_row_container').cloneNode(true);
                clone_of_previous_textrow.querySelector('div:nth-child(2) > div > ul').remove();
                //replaces the input element in the clone_of_previous_textrow with a span element
                const inputBox = clone_of_previous_textrow.querySelector('input');
                if (inputBox) {
                    const inputValue = inputBox.value;
                    const new_span_element = document.createElement('span');
                    new_span_element.textContent = inputValue;
                    inputBox.replaceWith(new_span_element);
                }
                clone_of_previous_textrow.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
                clone_of_previous_textrow.removeAttribute('id');


                //construct response row element 
                const response_row_container = document.createElement('div');
                const response_row_prefix = document.createElement('div');
                const response_row_content = document.createElement('div');

                response_row_container.classList.add('response_row_container');
                response_row_prefix.classList.add('response_prefix_container');
                response_row_content.classList.add('response_row_content');

                response_row_container.appendChild(response_row_prefix);
                response_row_container.appendChild(response_row_content);

                document.getElementById('id_text_row_container').style.display = 'none';
                document.getElementById('id_command_input_box').disabled = true;
                let count = 0;
                response_row_prefix.textContent = 'Server: ';
                const response_dot_loading = setInterval(() => {
                    count = (count + 1) % 4;
                    response_row_content.textContent = 'fetching server response' + '.'.repeat(count);
                }, 500);

                //send input box value to server
                socket.emit('client_command_input', document.getElementById("id_command_input_box").value);

                //catch server response
                socket.once("server_response", (msg) => {
                    clearInterval(response_dot_loading);
                    response_row_content.textContent = `${msg}`
                    document.getElementById('id_text_row_container').style.display = '';
                    document.getElementById('id_command_input_box').disabled = false;
                    document.getElementById('id_command_input_box').focus();
                });

                //insert element to page
                document.getElementById("id_text_interface_container").insertBefore(clone_of_previous_textrow, document.getElementById("id_text_row_container")); // insert previous text row element
                document.getElementById("id_text_interface_container").insertBefore(response_row_container, document.getElementById("id_text_row_container")); // insert server response row element
                document.getElementById('id_command_input_box').value = ""; // clear text input box


            }
        }

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
                    create_party: {
                        '{roomid}': (roomid) => {
                            io.to(socket.id).emit("party", roomid)
                            io.to(socket.id).emit("server_response", `created party ${roomid}`)
                        }
                            
                    },
                    view_member: () => io.to(socket.id).emit("server_response", "you are viewing party members"),
                }
            }
        };
        this.login = {
            register: {
                '{username} {password} {confirm_password}': (username, password, confirm_password) => {
                    if (password === confirm_password) {
                        if (this.userCred.register_user(username, password)) { // Access via this.userCred
                            this.io.to(this.socket.id).emit("server_response", `successfully registered user ${username}`);
                            this.io.to(this.socket.id).emit("change_playername", username);
                            
                        } else {
                            this.io.to(this.socket.id).emit("server_response", `Failed to register user ${username}`);
                        }
                    } else {
                        this.io.to(this.socket.id).emit("server_response", `Passwords do not match for ${username}`);
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
            swapped_success: () => io.to(socket.id).emit("server_response", "you chose to fight alone..."),
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