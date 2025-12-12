import Input from "../../lib/Input.js";
import State from "../../lib/State.js";
import { context, input } from "../globals.js";

export default class TitleScreenState extends State {
	constructor() {
		super();
	}

	enter(){
		//start playing the soundtrack
	}

	exit(){
		//stop playing the soundtrack
		//enter playstate
	}

	update(){
		if(input.isKeyHeld(Input.KEYS.ENTER)){
			//enter playstate
		}

	}
	render(){
		context.save();
		this.renderText();
		context.restore();
	}
	renderText(){
		
	}
}
