
// const socket = io();

// let command_tree = {
//     test: {
//         rename: {
//             '<name>': (name) => io.to(socket.id).emit("server_broadcast_all", `hi there, ${name}`)
//         },
//         combat_init: {
//             alone: () => io.to(socket.id).emit("server_broadcast_all", "you chose to fight alone..."),
//             party: () => io.to(socket.id).emit("server_broadcast_all", "you chose to fight together..."),
//         },
//         char_select: {
//             clarissa: io.to(socket.id).emit("server_broadcast_all", "you selected clarissas as your character"),
//             chloe: io.to(socket.id).emit("server_broadcast_all", "you selected chloe as your character"),
//             mia: io.to(socket.id).emit("server_broadcast_all", "you selected mia as your character"),

//         },
//         enemy_select: {
//             goblin: io.to(socket.id).emit("server_broadcast_all", "you chose to fight a goblin"),
//             skeleton: io.to(socket.id).emit("server_broadcast_all", "you chose to fight a skeleton"),
//             wolves: io.to(socket.id).emit("server_broadcast_all", "you chose to fight a wolves"),
//         },
//         party: {
//             invite: io.to(socket.id).emit("server_broadcast_all", "you chose to fight together..."),
//             view_member: io.to(socket.id).emit("server_broadcast_all", "you chose to fight together..."),
//         }
        
//     }
// };

// module.exports = { command_tree }



// // test
// //   rename
// //     user_input_name
// //   combat_init
// //     y/n
// //   char_select
// //     elliot
// //     clarissa
// //     mia
// //   enemy_select
// //     goblin
// //     skeleton
// //     wolves
// //   party
// //     playername
// //     view_member
// //     invite