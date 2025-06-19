function resolveAfter2Seconds() {
    return new Promise(
        (resolve) => {
            Socket.once("event_name", (msg) => {
                
            })
        }
    );
  }

async function asyncCall() {
    console.log("calling");
    const result = await resolveAfter2Seconds();
    console.log(result);
  }