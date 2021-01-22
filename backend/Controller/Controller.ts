import {Model} from '../Model/Model';

export class Controller {
    readonly model: Model = new Model();

    /*constructor(){
        
    }*/

    className() : string {
        return "Controller";
    }
}
