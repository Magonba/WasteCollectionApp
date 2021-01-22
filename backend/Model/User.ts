import {Project} from './Project';

export class User {
    private email: string;
    private admin: boolean;
    private passwordUnsafeVar: string; //should be modified!!!
    private projects: Project[];

    constructor(email: string, admin: boolean, passwordUnsafeVar: string, projects: Project[]){
        this.email = email;
        this.admin = admin;
        this.passwordUnsafeVar = passwordUnsafeVar;
        this.projects = projects;
    }

    //Write test
    public getMail() : string {
        return this.email;
    }

    //Write test (method is not complete)
    public setMail(email: string) : void {
        this.email = email;
    }


}
