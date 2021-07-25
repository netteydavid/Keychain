"use strict";

export class Account {
    name: string;
    rec: number;
    change: number;

    constructor(name: string, rec: number = 0, change: number = 0) {
        this.name = name;
        this.rec = rec;
        this.change = change;
    }
}