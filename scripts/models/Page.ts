"use strict";

export class Page {
    fn: Function;
    params: Object[];

    constructor(fn: Function, params: Object[] = []){
        this.fn = fn;
        this.params = params;
    }
}