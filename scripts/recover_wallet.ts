"use strict";
import * as bip39 from 'bip39';
import * as $ from 'jquery';
import {goto_create_pwd} from "./navigation";

export function compile_mnemonic(){
    
    let words = "";
    let incomplete = false;
    
    //Clear any errors
    $("#valid").hide();
    for (let i = 1; i < 25; ++i){
      let id = "#word" + i;
      $(id + "_req").hide();
    }
  
    //Check each word and add it to the mnemonic
    for (let i = 1; i < 25; ++i){
      let id = "#word" + i;
      let word = $(id).val()
      if (word == "" || word == null){
        if (!incomplete) incomplete = true;
        $(id + "_req").show();
      }
      else{
        words += word;
        if (i < 24) words += " ";
      }
    }
  
    //Validate the mnemonic
    const valid = bip39.validateMnemonic(words);
    if (!incomplete && !valid){
      $("#valid").show();
    }
  
    //Autoscroll to the top if there are errors
    if (incomplete || !valid) $("#content").scrollTop(0);
  
    //If each word has been entered and the mnemonic is valid, continue
    if (!incomplete && valid){
        chrome.storage.local.set({words, recovered: true}, () => {
            goto_create_pwd(true);
        });
    } 
}