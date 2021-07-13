"use strict";
import * as $ from 'jquery';
import * as bip32 from "bip32";
import { decryptXpriv } from "./manage_keys";
import { goto_home } from "./navigation";

export function login(){
  const pwd = $("#pass").val();
  decryptXpriv(pwd, (xpriv) =>{
    //TODO: Pass xpriv rather than saving xpub
    chrome.storage.local.set({ xpriv_temp: (xpriv as bip32.BIP32Interface).toBase58() }, () => {
      goto_home();
    });
  });
}