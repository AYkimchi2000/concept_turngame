import { Gamestate, Combat, CmdTree } from "./game_modules/commandtrees";

let gamestate = new Gamestate()
let combat = new Combat()
let cmdtree = new CmdTree(io, Socket, gamestate, combat)

