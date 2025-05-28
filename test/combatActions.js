// combatActions.js
const combatActions = {
    alone: (ioInstance, socketId) => {
        console.log(`  > (combatActions.js) Emitting 'server_broadcast_all' to ${socketId}: "you chose to fight alone..."`);
    },
    party: (ioInstance, socketId) => {
        console.log(`  > (combatActions.js) Emitting 'server_broadcast_all' to ${socketId}: "you chose to fight together..."`);
        ioInstance.to(socketId).emit("server_broadcast_all", "you chose to fight together...");
    },
};

console.log(combatActions.party("test", "this is socketID"))