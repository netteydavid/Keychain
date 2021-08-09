"use strict";

export class Account {
    name: string;
    recieve_ind: number;
    change_ind: number;

    constructor(name: string, recieve_ind: number = 0, change_ind: number = 0) {
        this.name = name;
        this.recieve_ind = recieve_ind;
        this.change_ind = change_ind;
    }
}