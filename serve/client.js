// #region imports init
import { Client_ui } from "./client_modules.js";
const socket = io();
const client_ui = new Client_ui(socket);


// #region global variables
let tab_panel_visible = false;
let client_command_tree = {}

socket.on('init_command_tree', (command_tree) => {
    client_command_tree = command_tree
});
socket.on('change_playername', (username) => {
    document.getElementById('id_prompt_prefix_player_id').innerHTML = `${username}@`
});

// socket.on('server_broadcast', )
// #endregion

// #region global mouse click events 
document.getElementById("id_prompt_panel").addEventListener("click", event => {
    document.getElementById('id_command_input_box').focus();
});
// #endregion

// #region global document keypress events
document.addEventListener("keydown",  (event)=> { 
    //play keystroke sounds
    const sound = (event.key === 'Enter' || event.key === ' ' || event.key === 'Backspace' || event.key === 'Escape') ? '2.wav' : '1.wav';
    new Audio(sound).play();

    //toggle bottom panel
    if (event.key === "`") {
        
    }



});
// #endregion

// #region input box keypress events
document.getElementById("id_command_input_box").addEventListener("keydown", (event) => {

    if (event.key === "Enter") {
        event.preventDefault();
        if (document.getElementById("id_command_input_box").value.trim()) {
            client_ui.send_command_to_server("client_command_input")
            client_ui.command_history.push(document.getElementById("id_command_input_box").value);
            client_ui.history_index = client_ui.command_history.length;
            client_ui.display_response_client("Server")
        }


    }
    if (event.key === "\\") {
        event.preventDefault();
        client_ui.toggle_autocomplete_visibility(event)
    }


    // #region up down arrow navigate history
    if (event.key === "PageUp" && client_ui.history_index > 0) {
        event.preventDefault();
        client_ui.history_index--;
        document.getElementById("id_command_input_box").value = client_ui.command_history[client_ui.history_index];
        const inputEvent = new Event("input", { bubbles: true });
        document.getElementById("id_command_input_box").dispatchEvent(inputEvent);// force re-render by sending a null keypress event
        return;
    }
    if (event.key === "PageDown" && client_ui.history_index < client_ui.command_history.length - 1) {
        event.preventDefault();
        client_ui.history_index++;
        document.getElementById("id_command_input_box").value = client_ui.command_history[client_ui.history_index];
        const inputEvent = new Event("input", { bubbles: true });
        document.getElementById("id_command_input_box").dispatchEvent(inputEvent);// force re-render by sending a null keypress event
        return;
    }
    // #endregion

});
// #endregion

// #region input box value change events
document.getElementById("id_command_input_box").addEventListener("input", (event) => {
    // console.log(`object.keys(getsuggestion) is = ${Object.keys(getSuggestions())}`)
    // console.log(`object.values(getsuggestion) is = ${Object.values(getSuggestions())}`)
    if (String(Object.keys(getSuggestions())) === "append") {
        autoCompleteJS.resultItem.highlight = false;
        autoCompleteJS.data.src = [""]
    }
    else if (String(Object.keys(getSuggestions())) === "data.src") {
        // console.log("getsuggestion successfuly linked to data.src!")
        autoCompleteJS.data.src = String(Object.values(getSuggestions())).split(',');
    }
    else {
        // console.log("untagged query!")
        return
    }
try {
        // console.log(
        //     `getSuggestion() = ${getSuggestions()}\n` +
        //     `getSuggestion() type is = ${typeof getSuggestions()}\n` +
        //     `autoCompleteJS.data.src is = ${autoCompleteJS.data.src}\n`
        // );
} catch (error) {
    
}
});

// #endregion

// #region autocomplete

const autoCompleteJS = new autoComplete({
    limit: Infinity,
    trigger: () => client_ui.autocomplete_visibility,
    query: (input) => {
        const current_segment = document.getElementById("id_command_input_box").value.split(" ")
        return current_segment[current_segment.length - 1];
    },
    selector: "#id_command_input_box",
    placeHolder: "press \\ to open autocomplete",
    data: {
        src: [""],
        cache: false,
    },
    resultsList: {
        element: (list, data) => {
            if (String(Object.keys(getSuggestions())) === "append") {
                const message = document.createElement("div");
                message.setAttribute("class", "no_result");
                message.innerHTML = `<span>${String(Object.values(getSuggestions()))}</span>`;
                list.prepend(message);
            }
            else {
                if (data.results.length === 0) {
                    // console.log(`${data.results}`)
                    const message = document.createElement("div");
                    message.setAttribute("class", "no_result");
                    message.innerHTML = `<span>No matching command!</span>`;
                    list.prepend(message);
                }
            }
        },
        noResults: true,
        tabSelect: true,
        maxResults: undefined
    },
    resultItem: {
        highlight: true,
    },
    events: {
        input: {
            selection: (event) => {
                const selection = event.detail.selection.value;
                const input = document.querySelector("#id_command_input_box");
                const parts = input.value.split(" ");
                parts[parts.length - 1] = selection;
                input.value = parts.join(" ");
            }
        }
      }
});

const input = document.getElementById("id_command_input_box");
const suggestionsBox = document.getElementById("suggestions");
let currentSuggestions = [];
function getSuggestions() { //this gets called everytime there's a value change in textbox
    function countArgumentsInString(str) {
        const regex = /{([^}]+)}/g;
        const matches = str.match(regex);
        return matches ? matches.length : 0;
    }
    const input_command_as_list = document.getElementById("id_command_input_box").value.trim().split(" ");
    let node = client_command_tree
    let endsWithSpace = document.getElementById("id_command_input_box").value.endsWith(" ");
    let current_segment_index = endsWithSpace ? input_command_as_list.length : input_command_as_list.length - 1;
    let traverse_counter;
    let arg_counter;
    //current_segment_index, "test" = 0, "test " = 1, "test rename" = 1, "test rename " = 2


    if (document.getElementById("id_command_input_box").value == "") {
        return {
            "data.src": Object.keys(node)
        }
    }
    else if (document.getElementById("id_command_input_box").value.startsWith(" ")) {
        return {
            "append": "Don't start with a space!"
        }
    }
    else if (document.getElementById("id_command_input_box").value.includes("  ")) {
        return {
            "append": "There's too many space!"
        }
    }
    else if (current_segment_index > 0) { //if it is not the first segment
        for (traverse_counter = 0; traverse_counter < current_segment_index; traverse_counter++) {
            if (input_command_as_list[traverse_counter] in node) {
                node = node[input_command_as_list[traverse_counter]] //traverse using last segment   
                arg_counter = traverse_counter
            }
            else if (String(Object.keys(node)).startsWith("{") && String(Object.keys(node)).endsWith("}")) { 
                // console.log("currently in arg!")
            }
            // else if (["login", "register"].some(key => key in Object.keys(node))) {
            //     document.getElementById('id_prompt_prefix_player_id').innerHTML = 'New Content Here';
            // }
            else {
                // console.log("failed traversal!")
                return {
                    "append": "No matching command!"
                }
            }
        }
    }
    
        if (node === "function") {
            // console.log("node is function!")
            return {
                "append": "No more subcommand!"
            }
        }
        else if (String(Object.keys(node)).startsWith("{") && String(Object.keys(node)).endsWith("}")) {
            suggestion_argcount = countArgumentsInString(String(Object.keys(node))) // number of args in suggestion
            
            if (current_segment_index - arg_counter <= suggestion_argcount) {
                return {
                    "append": Object.keys(node)
                }
            }
            else {
                return {
                    "append": "arguments fulfilled!"
                }
            }
        }
        else {
            autoCompleteJS.resultItem.highlight = true;
            if (node) {
                return {
                    "data.src": Object.keys(node)
                }
            }
        }
}

// #endregion

// if user currently in the login tree, open event listener.
// else, close event listener.