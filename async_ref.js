function catch_server_response() {
    return new Promise(
        (resolve) => {
            socket.once("event_name", (msg) => {
                resolve(msg)   
            })
        }
    );
  }

async function display_message() {
    console.log("fetching...");
    const result = await catch_server_response();
    console.log(`message received!`)
  }


