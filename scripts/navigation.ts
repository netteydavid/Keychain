"use strict";
import * as $ from 'jquery';
import { create_mnemonic } from "./create_wallet";
import { compile_mnemonic } from './recover_wallet';
import { set_password } from './create_pwd';
import { login } from './login';
import {load_account} from './account';
import { add_account, close_account_creation, create_account, list_accounts } from './home';
import { Page } from './models/Page';
import exp = require('constants');

let breadcrumbs: Page[] = [];

//Goes to the initialization page
export function goto_init(){
    $("#content").load("../pages/init.html", () => {
        //Add click event listeners to the buttons
        $("#create_btn").on("click", goto_create);
        $("#recover_btn").on("click", goto_recover);
        breadcrumbs.push(new Page(goto_init));
    });
}

export function goto_create(){
    $("#content").load("../pages/create_wallet.html", () => {
    //   $("#create_wallet_script").load("./create_wallet.js");
      $(".back_btn").on("click", back);
      $("#make_mnemonic").on("click", create_mnemonic);
      $("#create_pwd").on("click", goto_create_pwd);
      breadcrumbs.push(new Page(goto_create));
    });
}

export function goto_recover(){
    $("#content").load("../pages/recover_wallet.html", () => {
        // $("#recover_script").load("./recover_wallet.js");
        $(".back_btn").on("click", back);
        $("#recover_btn").on("click", compile_mnemonic);
        breadcrumbs.push(new Page(goto_recover));
    });
}

export function goto_create_pwd(){
    $("#content").load("../pages/create_pwd.html", () => {
        // $("#set_pwd_script").load("./create_pwd.js");
        $(".back_btn").on("click", back);
        $("#set_pwd").on("click", set_password);
        breadcrumbs.push(new Page(goto_create_pwd));
    });
}

export function goto_login(){
    $("#content").load("../pages/login.html", () => {
        // $("#login_script").load("./login.js");
        $("#login_btn").on("click", login);
    });
}

export function goto_home(){
    $("#content").load("../pages/home.html", () => {
        $("#add_account_btn").on("click", create_account);
        $("#new_account_btn").on("click", add_account);
        $("#cancel_account_btn").on("click", close_account_creation);
        // $("#home_script").load("./home.js");
        list_accounts();
    });
}

export function goto_account(eventObject){
    $("#content").load("../pages/account.html", () => {
        // $("#account_script").load("./account.js");
        $(".back_btn").on("click", back);
        load_account(eventObject.data.i);
        
        breadcrumbs.push(new Page(goto_account, [eventObject]));
    });
}

export function back(){
    if (breadcrumbs == null){
        return;
    }
    else{
        breadcrumbs.pop();
        if (breadcrumbs.length < 1){
            chrome.storage.local.get(["xpriv", "xpriv_temp"], (results) =>
            {
                if (results.xpriv_temp != null && results.xpriv != null){
                    goto_home();
                }
                else if (results.xpriv_temp != null){
                    goto_login();
                }
                else{
                    goto_init();
                }
            });
        }
        else{
            const page = breadcrumbs[breadcrumbs.length - 1];
            if (page.params != null && page.params.length > 0){
                page.fn.apply(page.params);
            }
            else{
                page.fn();
            }
        }
    }

}

export function logout(){
    breadcrumbs = [];
    chrome.storage.local.remove("xpriv_temp");
    goto_login();
}