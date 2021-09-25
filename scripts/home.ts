"use strict";
import * as $ from 'jquery';
import { goto_account } from './navigation';
import { get_accounts, get_settings, set_accounts } from './popup';
import { Account } from './models/Account';
import { get_address_balance, get_balance, update_price } from './api_calls';
import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Interface } from 'bitcoinjs-lib';
import { Settings } from './models/Settings';
import { check_xpubs, decryptXpriv, gen_child_pub } from './manage_keys';

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
    //Reset errors
    $("#no_name_err").hide();
    $("#no_pass").hide();
    $("#incorrect_pass").hide();

    //Get fields
    let name = $("#new_account_name").val();
    let password = $("#password").val();
    //Error if no name
    if (name == "" || name == null){
        $("#no_name_err").show();
    }
    //Error if no password
    if (password == "" || password == null){
        $("#no_pass").show();
    }

    if (password != "" && password != null && name != "" && name != null){
        //Add the new account
        let accounts = get_accounts();
        accounts.push(new Account(name as string));
        set_accounts(accounts);

        //Get master private key
        decryptXpriv(password, (xpriv: BIP32Interface) =>{
            //Add a new xpriv
            check_xpubs(xpriv, null);
            //Check receive address gap for the new account
            check_addresses(xpriv, get_settings(), accounts.length - 1, false, false, 0, 0, () =>{
                //Check change addresses for the new account, then update balance
                check_addresses(xpriv, get_settings(), accounts.length - 1, false, true, 0, 0, () => call_update());
            });
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

function check_addresses(xpriv: BIP32Interface, settings: Settings, i: number, recover: boolean, change: boolean, ind: number, gap_count: number, callback: Function){
    //Get xpub
    const bipXpub = settings.testnet ? xpriv.deriveHardened(84).deriveHardened(0).deriveHardened(i) 
    : xpriv.deriveHardened(84).deriveHardened(1).deriveHardened(i);

    //Get the public key for the associated address
    let key = gen_child_pub(bipXpub, change, ind);
    
    //Generate the address from the public key
    let address = bitcoin.payments.p2wpkh({ pubkey: key.publicKey, 
        network: settings.testnet ? bitcoin.networks.testnet : bitcoin.networks.bitcoin });

    //Get the address balance
    get_address_balance(address.address, (balance: number) => {
        //We have a balance, reset the gap count, move on to the next address
        if (balance > 0){
            check_addresses(xpriv, settings, i, true, change, ++ind, 0, callback);
        }
        //No balance, increase gap count, check next address if we haven't reached gap limit
        else if (!change && gap_count < settings.address_gap) {
            check_addresses(xpriv, settings, i, recover, change, ++ind, ++gap_count, callback);
        }
        //We've reached gap limit, recover if we had any balances
        else if (recover){
            let accounts = get_accounts();
            if (accounts.length > i){
                if (change){
                    //If checking change addresses, set change index
                    accounts[i].change_ind = ind;
                }
                else{
                    //If checking receive addresses, set receive index and gap count
                    accounts[i].recieve_ind = ind;
                    accounts[i].gap_count = gap_count;
                }
                //Save account configuration
                set_accounts(accounts, callback);
            }
        }
    });
}