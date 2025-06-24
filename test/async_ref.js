function catch_server_response(event_name, mode, handler) {
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

async function display_message() {
    console.log("fetching...");
    const result = await catch_server_response("server_text_response", "once");
    console.log(`message received!`)
  }

// on
const stop = catch_server_response("message", "on", (msg) => {
    console.log("got msg:", msg);
});