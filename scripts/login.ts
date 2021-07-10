"use strict";
import { decryptXpriv } from "./manage_keys";
import { goto_home } from "./navigation";

export function login(){
    const pwd = $("#pass").val();
    decryptXpriv(pwd, (xpriv) =>{
      goto_home();
    });
  }