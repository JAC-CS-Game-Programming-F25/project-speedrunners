import State from "../../lib/State.js";
import Map from "../services/Map.js";

export default class PlayState extends State {
    constructor(mapDefinition) {
        super();
        this.mapDefinition = mapDefinition;
        this.map = null;
    }
    
    enter() {
        // Create a fresh map (and player) each time we enter PlayState
        this.map = new Map(this.mapDefinition);
    }
    
    update(dt) {
        this.map.update(dt);
    }
    
    render() {
        this.map.render();
    }
}