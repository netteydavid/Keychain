"use strict";
import * as $ from 'jquery';
import { all_addresses, check_xpubs, decryptXpriv } from "./manage_keys";
import { goto_home } from "./navigation";
import { get_settings } from './popup';

export function login(){
  $("#incorrect_pass").hide();
  const pwd = $("#pass").val();

  decryptXpriv(pwd, (xpriv) =>{
    if (xpriv != null){
      chrome.storage.local.set({ last_login: Date.now() });
      check_xpubs(xpriv, () => {
          goto_home(get_settings().advanced);
        });
      }
  });
      // all_addresses(xpriv, (addresses) => {
      //   chrome.storage.local.set({ addresses });
      // });
      
}