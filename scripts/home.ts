"use strict";
import * as $ from 'jquery';
import { goto_account } from './navigation';
import { get_settings } from './popup';
import { Account } from './models/Account';
import { get_balance, update_price } from './api_calls';

let update_timer = null;

export function list_accounts(accounts: Account[] = []){
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

export function accounts_check(advanced: boolean, callback: Function){
    chrome.storage.local.get(["accounts"], (results) => {
        let accounts: Account[] = [];
        if (results.accounts != null && advanced){
            accounts = results.accounts;
            callback(accounts)
        }
        else {
            accounts.push(new Account("Main"));
            chrome.storage.local.set({accounts}, () => {
                console.log("Added main account");
                callback(accounts)
            });
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

function update(balance: number = 0, price: number = 0, symbol: string = "USD"){
    const settings = get_settings();
    
    if (settings.unit == 2){
        $("#balance #num").text(`${balance/100000000}`);
        $("#balance #unit").text("BTC");
    }
    else{
        $("#balance #num").text(`${balance}`);
        $("#balance #unit").text("sats");
    }

    $("#price #num").text(`${price*balance/100000000}`);
    $("#price #unit").text(symbol);
    
    update_timer = window.setTimeout(call_update, 2 * 60000);
}

export function call_update(){
    //Get price
    update_price((price, symbol) => {
        //Update balance
        get_balance(balance => {
            console.log(`Balance: ${balance} sats`);
            update(balance, price, symbol);
        });
    });
    
}