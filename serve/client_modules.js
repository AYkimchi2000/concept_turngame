
export class Client_ui {
    constructor(socket, Typed) {
        this.autocomplete_visibility = false;
        this.command_history = [];
        this.history_index = 0;
        // this.io = io;
        // this.event = event
        this.socket = socket;

    }

    display_response_client(speaker) {
        this.autocomplete_visibility = false;
        const inputEvent = new Event("input", { bubbles: true });
        document.getElementById("id_command_input_box").dispatchEvent(inputEvent);

        if (document.getElementById("id_command_input_box").value.trim()) {
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

            //construct server response row element 
            const response_row_container = document.createElement('div');
            const response_row_prefix = document.createElement('div');
            const response_row_content = document.createElement('pre');

            response_row_container.classList.add('response_row_container');
            response_row_prefix.classList.add('response_prefix_container');
            response_row_content.classList.add('response_row_content');

            response_row_container.appendChild(response_row_prefix);
            response_row_container.appendChild(response_row_content);

            document.getElementById('id_text_row_container').style.display = 'none';
            document.getElementById('id_command_input_box').disabled = true;
            //loading message until message received from server
            let count = 0;
            response_row_prefix.textContent = `${speaker}: `;
            const response_dot_loading = setInterval(() => {
                count = (count + 1) % 4;
                response_row_content.textContent = 'fetching server response' + '.'.repeat(count);
            }, 500);
            clearInterval(response_dot_loading);


            this.socket.once(`server_text_response`, (msg) => {
                // const parsed_msg = JSON.parse(msg)
                // console.log(`msg data type is ${typeof msg}`)
                response_row_content.textContent = msg;
            });

            document.getElementById('id_text_row_container').style.display = '';
            document.getElementById('id_command_input_box').disabled = false;
            document.getElementById('id_command_input_box').focus();
            //insert element to page
            document.getElementById("id_text_interface_container").insertBefore(clone_of_previous_textrow, document.getElementById("id_text_row_container")); // insert previous text row element
            document.getElementById("id_text_interface_container").insertBefore(response_row_container, document.getElementById("id_text_row_container")); // insert server response row element
            document.getElementById('id_command_input_box').value = ""; // clear text input box
            new Typed(response_row_content, {
                strings: [msg],
                typeSpeed: 30,
                showCursor: false
            });

        }
    }
    send_command_to_server(event_name) {    
        this.socket.emit(`${event_name}`, document.getElementById("id_command_input_box").value);
    }
    catch_server_response(event_name, mode, handler) {
        if (mode === "once") {
            return new Promise((resolve) => {
                this.socket.once(event_name, resolve);
            });
        } else if (mode === "on") {
            this.socket.on(event_name, handler);
            // optionally return a cleanup function
            return () => this.socket.off(event_name, handler);
        }
    }
    async display_server_response() {
    
    }


    toggle_autocomplete_visibility() {
        document.getElementById('id_command_input_box').focus();
        this.autocomplete_visibility = !this.autocomplete_visibility;
        const inputEvent = new Event("input", { bubbles: true });
        document.getElementById("id_command_input_box").dispatchEvent(inputEvent);
    }
    panel_toggle_bottom_visibility() {
        
    }
    panel_toggle_right_visibility() {
    }
}




// export class Comms {
//     constructor() {

//     }

// }