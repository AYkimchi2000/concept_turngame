function add_previous_turn(speed_time_data, combat_log) {
    for (const entry of combat_log) {
        const [key, value] = Object.entries(entry)[0];

        for (const speed_entry of speed_time_data) {
            if (speed_entry.hasOwnProperty(key)) {
                speed_entry[key] += value;
                break; // no need to keep looking after a match
            }
        }
    }
}
let combat_log = [
    { "alice": 2 },
    { "elliot": 2 }
]
let speed_time_data = [
    {"alice": 2},
    {"emily": 2}
]

add_previous_turn(speed_time_data, combat_log)

console.log(speed_time_data)