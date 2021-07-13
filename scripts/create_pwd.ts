"use strict";
import * as $ from 'jquery';
import { goto_login } from './navigation';
import { encryptXpriv } from './manage_keys';

export function set_password(){
    // $("#no_match").hide();

    const pwd1 = $("#pass1").val();
    const pwd2 = $("#pass2").val();

    if (pwd1 == pwd2){
        chrome.storage.local.get(["words"], (result) => {
            encryptXpriv(pwd1, result.words);
            chrome.storage.local.remove(["words"], () => {
                goto_login();
            });
        });
    }
    else{
        $("#no_match").show();
    }
}