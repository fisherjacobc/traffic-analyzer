import fs from "node:fs";
import data from "./data.json" with { type: "json" };

let result = "";

data.events.forEach(event => {
    result += `${event.timestamp},${event.type},${data.recorder},${data.startedAt},${data.endedAt},${data.id}\n`
})

fs.appendFile("data.csv", result, (err) => {
  if (err) throw err;
  console.log('The "data to append" was appended to file!');
});