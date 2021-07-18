"use strict";
import * as $ from 'jquery';
import { create_mnemonic } from "./create_wallet";
import { compile_mnemonic } from './recover_wallet';
import { set_password } from './create_pwd';
import { login } from './login';
import {load_account} from './account';
import { add_account, close_account_creation, create_account, list_accounts, list_addresses } from './home';

//Goes to the initialization page
export function goto_init(){
    $("#content").load("../content/init.html", () => {
        //Add click event listeners to the buttons
        $("#create_btn").on("click", goto_create);
        $("#recover_btn").on("click", goto_recover);
    });
}

export function goto_create(){
    $("#content").load("../content/create_wallet.html", () => {
      $("#create_wallet_script").load("create_wallet.js");
      $("#make_mnemonic").on("click", create_mnemonic);
      $("#create_pwd").on("click", goto_create_pwd);
    });
}

export function goto_recover(){
    $("#content").load("../content/recover_wallet.html", () => {
        $("#recover_script").load("recover_wallet.js");
        $("#recover_btn").on("click", compile_mnemonic);
    });
}

export function goto_create_pwd(){
    $("#content").load("../content/create_pwd.html", () => {
        $("#set_pwd_script").load("create_pwd.js");
        $("#set_pwd").on("click", set_password);
    });
}

export function goto_login(){
    $("#content").load("../content/login.html", () => {
        $("#login_script").load("login.js");
        $("#login_btn").on("click", login);
    });
}

export function goto_home(){
    $("#content").load("../content/home.html", () => {
        $("#add_account_btn").on("click", create_account);
        $("#new_account_btn").on("click", add_account);
        $("#cancel_account_btn").on("click", close_account_creation);
        $("#home_script").load("home.js");
        // list_addresses();
        list_accounts();
    });
}

export function goto_account(eventObject){
    $("#content").load("../content/account.html", () => {
        $("#account_script").load("account.js");
        load_account(eventObject.data.i);
    });
}