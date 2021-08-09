"use strict";
import * as $ from 'jquery';
import * as bip32 from "bip32";
import { decryptXpriv } from "./manage_keys";
import { goto_home } from "./navigation";
import { get_settings } from './popup';

export function login(){
  const pwd = $("#pass").val();
  decryptXpriv(pwd, (xpriv) =>{
    //TODO: Pass xpriv rather than saving xpub
    if (xpriv != null){
      chrome.storage.local.set({ last_login: Date.now() }, () => {
        goto_home(get_settings().advanced);
      });
    }
  });
}