import {Project} from './Project';

export class User {
    email: string;
    passwordUnsafeVar: string; //should be modified!!!
    projects: Project[];

    constructor(email: string, passwordUnsafeVar: string, projects: Project[]){
        this.email = email;
        this.passwordUnsafeVar = passwordUnsafeVar;
        this.projects = projects;
    }
}
