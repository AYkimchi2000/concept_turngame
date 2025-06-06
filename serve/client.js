// #region imports init
const socket = io();

// #region global variables
const command_history = [];
let historyIndex = 0;
let no_result_visibility = true;
let autocomplete_visibility = false;
let tab_panel_visible = false;
let client_command_tree = {}

socket.on('init_command_tree', (modified_command_tree) => {
    client_command_tree = modified_command_tree
});
socket.on('swap_command_tree', (swapped_command_tree) => {
    console.log("command tree swapped!")
    client_command_tree = swapped_command_tree
});
// #endregion

// #region global mouse click events 
document.getElementById("id_prompt_panel").addEventListener("click", event => {
    document.getElementById('id_command_input_box').focus();
});
// #endregion

// #region document keypress events
document.addEventListener("keydown", event => {
    // play keystrike audio
    const sound = (e.key === 'Enter' || e.key === ' ' || e.key === 'Backspace' || e.key === 'Escape') ? '2.wav' : '1.wav';
    new Audio(sound).play();

    if (event.key === "Tab") {
        event.preventDefault();
        tab_panel_visible = !tab_panel_visible;
        document.getElementById("id_status_panel").style.display = tab_panel_visible ? "block" : "none";
    }

});


// #endregion

// #region input box keypress events
document.getElementById("id_command_input_box").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault()
        autocomplete_visibility = false;
        const inputEvent = new Event("input", { bubbles: true });
        document.getElementById("id_command_input_box").dispatchEvent(inputEvent);

        if (document.getElementById("id_command_input_box").value.trim()) {

            //save to command_history
            command_history.push(document.getElementById("id_command_input_box").value);
            historyIndex = command_history.length;

            //clone and replace last input command container
            const clone_of_previous_textrow = document.getElementById('id_text_row_container').cloneNode(true);
            clone_of_previous_textrow.querySelector('div:nth-child(2) > div > ul').remove();
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
            // response_row_prefix.textContent = 'LocalClient: ';


            document.getElementById('id_text_row_container').style.display = 'none';
            document.getElementById('id_command_input_box').disabled = true;
            let count = 0;
            response_row_prefix.textContent = 'Server: ';
            const response_dot_loading = setInterval(() => {
                count = (count + 1) % 4;
                response_row_content.textContent = 'fetching server response' + '.'.repeat(count);
            }, 500);


            socket.emit('client_command_input', document.getElementById("id_command_input_box").value);
            socket.once("server_broadcast_all", (broadcast_content) => {
                clearInterval(response_dot_loading);
                response_row_content.textContent = `${broadcast_content};`
                document.getElementById('id_text_row_container').style.display = '';
                document.getElementById('id_command_input_box').disabled = false;
                document.getElementById('id_command_input_box').focus();
            });
            socket.once("swap_command_tree", (broadcast_content) => {
                clearInterval(response_dot_loading);
                response_row_content.textContent = `${Object.keys(broadcast_content)};`
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
    if (event.key === "\\") {
        document.getElementById('id_command_input_box').focus();
        event.preventDefault();
        autocomplete_visibility = !autocomplete_visibility;
        const inputEvent = new Event("input", { bubbles: true });
        document.getElementById("id_command_input_box").dispatchEvent(inputEvent);// force re-render by sending a null keypress event
    }
    if (event.key === "`") {
        event.preventDefault();

    }


    // #region up down arrow navigate history
    if (event.key === "ArrowUp" && historyIndex > 0) {
        event.preventDefault();
        historyIndex--;
        document.getElementById("id_command_input_box").value = command_history[historyIndex];
        const inputEvent = new Event("input", { bubbles: true });
        document.getElementById("id_command_input_box").dispatchEvent(inputEvent);// force re-render by sending a null keypress event
        return;
    }
    if (event.key === "ArrowDown" && historyIndex < command_history.length - 1) {
        event.preventDefault();
        historyIndex++;
        document.getElementById("id_command_input_box").value = command_history[historyIndex];
        const inputEvent = new Event("input", { bubbles: true });
        document.getElementById("id_command_input_box").dispatchEvent(inputEvent);// force re-render by sending a null keypress event
        return;
    }
    // #endregion

});
// #endregion

// #region input box value change events
document.getElementById("id_command_input_box").addEventListener("input", (event) => {
    console.log(`object.keys(getsuggestion) is = ${Object.keys(getSuggestions())}`)
    console.log(`object.values(getsuggestion) is = ${Object.values(getSuggestions())}`)
    if (String(Object.keys(getSuggestions())) === "append") {
        autoCompleteJS.resultItem.highlight = false;
        console.log("trigger append!")
        autoCompleteJS.data.src = [""]
    }
    else if (String(Object.keys(getSuggestions())) === "data.src") {
        // console.log("getsuggestion successfuly linked to data.src!")
        autoCompleteJS.data.src = String(Object.values(getSuggestions())).split(',');
    }
    else {
        console.log("untagged query!")
        return
    }
    console.log(
        `getSuggestion() = ${getSuggestions()}\n` +
        `getSuggestion() type is = ${typeof getSuggestions()}\n` +
        `autoCompleteJS.data.src is = ${autoCompleteJS.data.src}\n`
    );
});

// #endregion

// #region autocomplete

const autoCompleteJS = new autoComplete({
    options: {
        searchEngine: "strict"
    },
    detached: true,
    trigger: () => autocomplete_visibility,
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
                    console.log(`${data.results}`)
                    const message = document.createElement("div");
                    message.setAttribute("class", "no_result");
                    message.innerHTML = `<span>No matching command!</span>`;
                    list.prepend(message);
                }
            }
        },
        noResults: true,
    },
    resultItem: {
        highlight: true,
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
                console.log("currently in arg!")
            }
            else {
                console.log("failed traversal!")
                return {
                    "append": "No matching command!"
                }
            }
        }
    }
    
        if (node === "function") {
            console.log("node is function!")
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
