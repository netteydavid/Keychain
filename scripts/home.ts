"use strict";
import * as $ from 'jquery';
import * as bitcoin from 'bitcoinjs-lib';
import * as bip32 from "bip32";
import { gen_child } from './manage_keys';
import { goto_account } from './navigation';
import { Settings } from './models/Settings';
import { get_settings } from './popup';
import { Account } from './models/Account';

function list_accounts(accounts: Account[] = []){
    $("#accounts").html("");
    let table = $("#accounts").get(0) as HTMLTableElement;
    for(let i = 0; i < accounts.length; ++i){
        let row = table.insertRow();
        let cell = row.insertCell();
        cell.innerHTML = `<button class="acct" id="acct${i}">${accounts[i].name}</button>`;
        $(`#acct${i}`).on("click", {i}, goto_account);
    }
}

export function add_account(){
    let name = $("#new_account_name").val();
    if (name == "" || name == null){
        $("#no_name_err").show();
    }
    else{
        chrome.storage.local.get(["accounts"], (results) => {
            let accounts = [];
            if (results.accounts != null){
                accounts = results.accounts;
            }
            accounts.push({name: name, rec: 0, change: 0});
            chrome.storage.local.set({accounts}, () => {
                close_account_creation();
                list_accounts();
            })
        });
    }
}

export function accounts_check(advanced: boolean){
    chrome.storage.local.get(["accounts"], (results) => {
        let accounts: Account[] = [];
        if (results.accounts != null){
            accounts = results.accounts;
        }
        if (accounts.length = 0){
            accounts.push(new Account("Main"));
            chrome.storage.local.set({accounts}, () => {
                if (advanced) list_accounts(accounts);
            })
        }
        else if (advanced){
            list_accounts(accounts);
        }
    });
}

export function create_account(){
    $("#new_account").show();
    $("#add_account_btn").hide();
}

export function close_account_creation(){
    $("#no_name_err").hide();
    $("#new_account_name").val("");
    $("#new_account").hide();
    $("#add_account_btn").show();
}