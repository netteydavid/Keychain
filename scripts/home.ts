"use strict";
import * as $ from 'jquery';
import * as bitcoin from 'bitcoinjs-lib';
import * as bip32 from "bip32";
import { gen_child } from './manage_keys';
import { goto_account } from './navigation';

export function list_addresses(){
    chrome.storage.local.get(["xpriv_temp", "accounts"], (results) => {
        let accounts = [];
        if (results.accounts == null){
            accounts.push({name: "Main Account", rec: 0, change: 0});
            chrome.storage.local.set({accounts});
        }
        else {
            accounts = results.accounts;
        }
        const xpriv_temp = bip32.fromBase58(results.xpriv_temp);
        let addressList = "";
        for(let i = 0; i < accounts.length; ++i){
            addressList += `${accounts[i].name}<br />`;
            //Recieve addresses
            for (let j = 0; j < accounts[i].rec + 1; ++j){
                let child = gen_child(xpriv_temp, false, i, false, j);
                let keypair = bitcoin.ECPair.fromPrivateKey(child.privateKey);
                let address = bitcoin.payments.p2wpkh({pubkey: keypair.publicKey});
                addressList += `${address.address}<br />`;
            }
            //Change addresses
            for (let j = 0; j < accounts[i].change + 1; ++j){
                let child = gen_child(xpriv_temp, true, i, true, j);
                let keypair = bitcoin.ECPair.fromPrivateKey(child.privateKey);
                let address = bitcoin.payments.p2wpkh({pubkey: keypair.publicKey});
                addressList += `${address.address}<br />`;
            }
            addressList += "<br />";
        }
        $("#addresses").html(addressList);
    });
}

export function list_accounts(){
    $("#accounts").html("");
    chrome.storage.local.get(["xpriv_temp", "accounts"], (results) => {
        let accounts = [];
        if (results.accounts != null){
            accounts = results.accounts;
        }
        let table = $("#accounts").get(0) as HTMLTableElement;
        for(let i = 0; i < accounts.length; ++i){
            let row = table.insertRow();
            let cell = row.insertCell();
            cell.innerHTML = `<button class="acct" id="acct${i}">${accounts[i].name}</button>`;
            $(`#acct${i}`).on("click", {i}, goto_account);
        }
    });
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