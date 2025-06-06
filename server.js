
// Imports
import express from 'express'; 
import { createServer } from 'node:http'; 
import { join } from 'node:path'; 
import { Server } from 'socket.io'; 
import { Command } from 'commander'; 

// Instantiations (these remain the same)
const app = express();
const server = createServer(app);
const io = new Server(server);
const program = new Command();

// If you have your own classes like UserCred and CmdTree in a separate file (e.g., 'myClasses.js')
// myClasses.js:
/*
export class UserCred { ... }
export class CmdTree { ... }
*/

// Then in main.js, you would import them like this:
// import { UserCred, CmdTree } from './myClasses.js'; // Note the .js extension is often required in ESM imports





let online_player_count = ""
let online_party_list = ""
let party_info = ""
let created_character_data = ""


const help_descriptions = {
  main: 'Main command',
  test: 'Test command help',
  rename: 'Rename something',
  '<name>': 'Name argument help',
  combat_init: 'Combat setup',
  alone: 'Alone mode',
  party: 'Party mode'
};

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
function buildCommands(name, tree, descriptions = {}) {
  const cmd = new Command(name);
  cmd.exitOverride();
  // if (descriptions[name]) { 
  //   cmd.description(descriptions[name]);
  // } else {
  //   console.log(`error: no help message tree found for command "${name}"`);
  // }
  for (const key in tree) {
    const val = tree[key];  

    if (typeof val === 'function') { //execute if traversed to functions
      cmd.command(key)
        // .description(descriptions[key] || '') 
        .action(val)
        .exitOverride();
    } 
    else { //keep traversing
      const subKeys = Object.keys(val);
      const isArgCommand = subKeys.length === 1 && (
        subKeys[0].includes('{') || subKeys[0].includes('[')
      );

      if (isArgCommand) {
        const argPattern = subKeys[0]; 
        const fn = val[argPattern];

        // Create the command with the key (e.g., 'rename') and the argument pattern
        const commandDefinition = `${key} ${argPattern}`;

        cmd.command(commandDefinition)
          .description(descriptions[key] || '')
          .action((...args) => {
            fn(...args);
          })
          .exitOverride();
      } else {
        // Nested commands (sub-commands)
        const subCmd = buildCommands(key, val, descriptions);
        cmd.addCommand(subCmd);
      }
    }
  }

  return cmd;
}

app.use(express.static('serve'));


io.on('connection', (socket) => {
  console.log(`user ${socket.id} connected`);
  socket.on('disconnect', () => {
    console.log(`user ${socket.id} disconnected`);
  });
  let swapped_command_tree = {
    successfully_swapped: () => io.to(socket.id).emit("server_broadcast_all", "swapped command tree works..."),
  };

  let command_tree = {
    test: {
      swap: () => {
        io.to(socket.id).emit("swap_command_tree", deepCloneAndModify(swapped_command_tree))
        console.log("command tree function triggered!")
      },
      rename: {
        '{name} {newName} {anotherarg}': (name, newName, anotherarg) => {
          io.to(socket.id).emit("server_broadcast_all", `hi there, renaming ${name} to ${newName}, additional arg also available ${anotherarg}`)
          console.log("multiline execution worked!")
        }
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
      attack: {
        '{target}': (name, newName, anotherarg) => io.to(socket.id).emit("server_broadcast_all", `hi there, renaming ${name} to ${newName}, additional arg also available ${anotherarg}`)
      }
    }
  };

  let modified_command_tree = deepCloneAndModify(command_tree)
  io.to(socket.id).emit("init_command_tree", modified_command_tree)
  







  socket.on('client_command_input', (msg) => {
    console.log(`user ${socket.id} sent something`);
    
    // #region command tree + parsing
    const program = buildCommands('main', command_tree, help_descriptions);
    program.exitOverride();
    program.helpInformation = () => {
      return 'Custom help message goes here';
    };
    program.commands.find(cmd => cmd.name() === 'test').helpInformation = () => {
      return 'this is help message for test';
    };
    let x = msg.trim().split(" ")
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




























server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});






