const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const app = express();
const server = createServer(app);
const io = new Server(server);
const fs = require('fs');
const { Command } = require('commander');
const program = new Command();

let online_player_count = ""
let online_party_list = ""
let party_info = ""
let created_character_data = ""

function deepCloneAndModify(source) {
  const target = {}; 
  for (const key in source) {
    if (typeof source[key] === 'object' && source[key] !== null) {
      target[key] = deepCloneAndModify(source[key]);
    } else if (typeof source[key] === 'function') {
      target[key] = 'function';
    } else {
      target[key] = source[key];
    }
  }
  return target; 
}


app.use(express.static('serve'));


io.on('connection', (socket) => {
  let command_tree = {
    test: {
      rename: {
        '{name}': (name) => io.to(socket.id).emit("server_broadcast_all", `hi there, ${name}`)
      },
      combat_init: {
        alone: () => io.to(socket.id).emit("server_broadcast_all", "you chose to fight alone..."),
        party: () => io.to(socket.id).emit("server_broadcast_all", "you chose to fight together..."),
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
  let modified_command_tree = deepCloneAndModify(command_tree) //command_tree with every function into strings
  io.to(socket.id).emit("init_command_tree", modified_command_tree)
  
  console.log(`user ${socket.id} connected`);

  socket.on('disconnect', () => {
    console.log(`user ${socket.id} disconnected`);
  });

  socket.on('client_command_input', (msg) => {
    console.log(`user ${socket.id} sent something`);

    // #region command tree + parsing
    const descriptions = {
      main: 'Main command',
      test: 'Test command help',
      rename: 'Rename something',
      '<name>': 'Name argument help',
      combat_init: 'Combat setup',
      alone: 'Alone mode',
      party: 'Party mode'
    };
    function buildCommands(name, tree, descriptions = {}) {
      const cmd = new Command(name);
      cmd.exitOverride(); 
      if (descriptions[name]) cmd.description(descriptions[name]);
      for (const key in tree) {
        const val = tree[key];
        if (typeof val === 'function') {
          cmd.command(key)
            .description(descriptions[key] || '')
            .action(val)
            .exitOverride();
        } else {
          const subKeys = Object.keys(val);
          const isArgCommand = subKeys.length === 1 && (subKeys[0].startsWith('{') || subKeys[0].startsWith('['));
          if (isArgCommand) {
            const [arg] = subKeys;
            const fn = val[arg];
            const subCmd = new Command(key);
            subCmd.exitOverride(); 
            if (descriptions[key]) subCmd.description(descriptions[key]);
            subCmd.argument(arg).action(fn);
            cmd.addCommand(subCmd);
          } else {
            const subCmd = buildCommands(key, val, descriptions);
            cmd.addCommand(subCmd);
          }
        }
      }

      return cmd;
    }
    const program = buildCommands('main', command_tree, descriptions);
    program.exitOverride();
    program.helpInformation = () => {
      return 'Custom help message goes here';
    };
    program.commands.find(cmd => cmd.name() === 'test').helpInformation = () => {
      return 'this is help message for test';
    };
    x = msg.trim().split(" ")
    try {
      program.parse(x, { from: 'user' }); 
    } catch (err) {
      if (err.exitCode !== undefined) {
        io.to(socket.id).emit("server_broadcast_all", err.message);        // It's a CommanderError
      } else {
        io.to(socket.id).emit("server_broadcast_all", err.message);        // It's a general error
      }
    }


    

    // #endregion

    
  });
});
// #endregion




server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});






