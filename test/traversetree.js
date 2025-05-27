let command_tree = {
    test: {
        rename: {
            '{name}': (name) => io.to(socket.id).emit("server_broadcast_all", `hi there, ${name}`)
        },
        combat_init: {
            third_layer: {
                test_key: 'test_value'
            }
        },
        char_select: {
            clarissa: () => io.to(socket.id).emit("server_broadcast_all", "you selected clarissa as your character"),
            chloe: () => io.to(socket.id).emit("server_broadcast_all", "you selected chloe as your character"),
            mia: () => io.to(socket.id).emit("server_broadcast_all", "you selected mia as your character"),

        },
        enemy_select: {
            goblin: () => io.to(socket.id).emit("server_broadcast_all", "you chose to fight a goblin"),
            skeleton: () => io.to(socket.id).emit("server_broadcast_all", "you chose to fight a skeleton"),
            wolves: () => io.to(socket.id).emit("server_broadcast_all", "you chose to fight wolves"),
        },
        party: {
            invite: () => io.to(socket.id).emit("server_broadcast_all", "you chose to invite to a party"),
            view_member: () => io.to(socket.id).emit("server_broadcast_all", "you are viewing party members"),
        },
    }
};


for (const key in command_tree) {
    const val = command_tree[key]
    console.log(key)
    console.log(val)
}