import TrackerController from "./tracker_controller";
import fstat from "fs/promises";
import yaml from "yaml";
let config = {
    checkInterval: 1_000,
    saveInterval: 10_000,
    activityTimeout: 30_000,
}
fstat.readFile('./options.yaml', 'utf-8').then(data=>{
    config = yaml.parse(data.toString());
}).catch(err=>{
    console.log('config file not found, using default options');
}).finally(()=>{
    console.log(config);
    const tracker = new TrackerController(config);
});