"use strict";
import { BIP32Interface } from 'bip32';
import { bip32 } from 'bitcoinjs-lib';
import * as $ from 'jquery';
import { all_addresses, check_xpubs, decryptXpriv, gen_child_pub } from "./manage_keys";
import { Settings } from './models/Settings';
import { goto_home } from "./navigation";
import { get_accounts, get_settings, set_accounts } from './popup';
import * as bitcoin from 'bitcoinjs-lib';
import { get_address_balance } from './api_calls';

export function login(recovered: boolean = false){
  $("#incorrect_pass").hide();
  const pwd = $("#pass").val();

  decryptXpriv(pwd, (xpriv) =>{
    if (xpriv != null){
      chrome.storage.local.set({ last_login: Date.now() });
      //TODO: check if first login AND recovered wallet (do it with default false param)
      //TODO: If first login and recovered, Load accounts and addresses in accordance with respective gaps
        //Note: don't limit account creation.
      //TODO: In callback of initial load, call the method as stated below
      if (recovered){
        recover_addresses(xpriv, 0, () => {
          check_xpubs(xpriv, () => {
            goto_home(get_settings().advanced);
          });
        });
      }
      else{
        check_xpubs(xpriv, () => {
            goto_home(get_settings().advanced);
          });
      }
    }
  });
}

export function recover_addresses(xpriv: BIP32Interface, account: number, callback: Function){
  recover_addresses_helper(xpriv, get_settings(), account, false, false, 0, 0, () => {
    recover_addresses_helper(xpriv, get_settings(), account, false, true, 0, 0, callback);
  });
}

function recover_addresses_helper(xpriv: BIP32Interface, settings: Settings, i: number, recover: boolean, change: boolean, ind: number, gap_count: number, callback: Function){

  const bipXpub = settings.testnet ? xpriv.deriveHardened(84).deriveHardened(1).deriveHardened(i) 
  : xpriv.deriveHardened(84).deriveHardened(1).deriveHardened(i);

  let key = gen_child_pub(bipXpub, change, ind);
    
  let address = bitcoin.payments.p2wpkh({ pubkey: key.publicKey, 
    network: settings.testnet ? bitcoin.networks.testnet : bitcoin.networks.bitcoin });

  get_address_balance(address.address, (balance: number) => {
    if (balance > 0){
      recover_addresses_helper(xpriv, settings, i, true, change, ++ind, 0, callback);
    }
    else if (!change && gap_count < settings.address_gap) {
      recover_addresses_helper(xpriv, settings, i, recover, change, ++ind, ++gap_count, callback);
    }
    else if (recover){
      let accounts = get_accounts();
      if (accounts.length > i){
        if (change){
          accounts[i].change_ind = ind;
        }
        else{
          accounts[i].recieve_ind = ind;
          accounts[i].gap_count = gap_count;
        }
        set_accounts(accounts, callback);
      }
    }
  });
}