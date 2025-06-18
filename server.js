
// Imports
import express from 'express'; 
import { createServer } from 'node:http'; 
// import { join } from 'node:path'; 
import { Server } from 'socket.io'; 
import { Command } from 'commander'; 
import { CmdTree } from './server_modules.js'

// Instantiations (these remain the same)
const app = express();
const server = createServer(app);
const io = new Server(server);
const program = new Command();


const help_descriptions = {
  main: 'Main command',
  test: 'Test command help',
  rename: 'Rename something',
  '<name>': 'Name argument help',
  combat_init: 'Combat setup',
  alone: 'Alone mode',
  party: 'Party mode'
};

function buildCommands(name, tree) {
  const cmd = new Command(name);
  cmd.exitOverride();
  // if (descriptions[name]) { 
  //   cmd.description(descriptions[name]);
  // } else {
  //   console.log(`error: no help message tree found for command "${name}"`);
  // }
  for (const key in tree) {
    const val = tree[key];  
    console.log(`this is val: ${val}`)
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
          // .description(descriptions[key] || '')
          .action((...args) => {
            fn(...args);
          })
          .exitOverride();
      } else {
        // Nested commands (sub-commands)
        const subCmd = buildCommands(key, val);
        cmd.addCommand(subCmd);
      }
    }
  }
  return cmd;
}

app.use(express.static('serve'));


io.on('connection', (socket) => {
  console.log(`user ${socket.id} connected`);
  const cmdtree = new CmdTree(io, socket);


  socket.on('joinRoom', (room_id) => {
    socket.join(room_id);
  });

  socket.on('disconnect', () => {
    console.log(`user ${socket.id} disconnected`);
  });

  io.to(socket.id).emit("init_command_tree", cmdtree.deepCloneAndModify(cmdtree.current)) //initial command tree


  socket.on('client_command_input', (msg) => {
    const program = buildCommands('main', cmdtree.current);
    program.exitOverride();
    // program.helpInformation = () => {
    //   return 'Custom help message goes here';rat 
    // };
    // program.commands.find(cmd => cmd.name() === 'test').helpInformation = () => {
    //   return 'this is help message for test';
    // };
    let x = msg.trim().split(" ")
    try {
      program.parse(x, { from: 'user' }); 
    } catch (err) {
      if (err.exitCode !== undefined) {
        io.to(socket.id).emit("server_text_response", err.message);        // It's a CommanderError
      } else {
        io.to(socket.id).emit("server_text_response", err.message);        // It's a general error
      }
    }

    
  });
});




























server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});






