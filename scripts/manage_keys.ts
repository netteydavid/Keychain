"use strict";

import * as bip32 from 'bip32';
import * as bip39 from 'bip39';
import * as crypto from 'crypto';
import * as $ from 'jquery';
import { Account } from './models/Account';
import { get_settings } from './popup';
import * as bitcoin from 'bitcoinjs-lib';

export function encryptXpriv(password, mnemonic){
    //Get seed
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    
    //Generate xpriv
    const root = bip32.fromSeed(seed);
  
    //Encryption prep
    const vector = crypto.randomBytes(16);
    const hashPass = crypto.createHash("sha256")
      .update(password)
      .digest();
    const hashed = crypto.createHash("sha256")
      .update(hashPass)
      .digest();
  
    //Encrypt
    const cipher = crypto.createCipheriv("aes256", hashed, vector);
    let encrypted = cipher.update(root.toBase58(), "utf-8", "hex");
    encrypted += cipher.final("hex");
  
    //Save
    chrome.storage.local.set({xpriv: encrypted, iv: vector.toString("hex")});
  }
  
export function decryptXpriv(password, callback){
    const hashPass = crypto.createHash("sha256")
      .update(password)
      .digest();
    const hashed = crypto.createHash("sha256")
      .update(hashPass)
      .digest();
  
    //Decrypt xpriv and print
    chrome.storage.local.get(["xpriv", "iv"], (result) => {
      try{
        const decipher = crypto.createDecipheriv("aes256", hashed, hexToBuffer(result.iv));
        let decrypted = decipher.update(result.xpriv, "hex", "utf-8");
        decrypted += decipher.final("utf-8");
        callback(bip32.fromBase58(decrypted));
      }
      catch{
        $("#incorrect_pass").html("Incorrect Password.");
      }
    });
  }

  function hexToBuffer(hex){
    let typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
      return parseInt(h, 16)
    }));
  
    return Buffer.from(typedArray);
  }

export function check_accounts(xpriv: bip32.BIP32Interface, callback: Function){
  chrome.storage.local.get("accounts", (results) => {
    let accounts: Account[] = results.accounts;
    if (accounts != null){
      for (let i = 0; i < accounts.length; ++i){
        if (accounts[i].xpub_testnet == "") {
          let key = xpriv.deriveHardened(84)
            .deriveHardened(1)
            .deriveHardened(i);
          accounts[i].xpub_testnet = key.neutered().toBase58();
        }
        if (accounts[i].xpub == "") {
          let key = xpriv.deriveHardened(84)
            .deriveHardened(0)
            .deriveHardened(i);
          accounts[i].xpub = key.neutered().toBase58();
        }
      }
      
      //TODO: Figure out why this isn't saving
      chrome.storage.local.set({ accounts: accounts }, callback());
    }
    else{
      callback();
    }
  });
}

export function all_addresses(xpriv: bip32.BIP32Interface, callback: Function){
  chrome.storage.local.get("accounts", (results) => {
    let accounts: Account[] = results.accounts;
    let result: string[] = [];
    if (accounts != null){
      for (let i = 0; i < accounts.length; ++i){
        let account_addrs: string[] = list_addresses(xpriv, i, accounts[i]);
        for (let j = 0; j < account_addrs.length; ++j){
          result.push(account_addrs[i]);
        }
      }
    }
    callback(result);
  });
}

export function list_addresses(xpriv: bip32.BIP32Interface, account_ind: number, account: Account){
  let results: string[] = [];
  const settings = get_settings();
  for (let i = 0; i < account.recieve_ind + 1; ++i){
    let key = gen_child(xpriv, settings.testnet, account_ind, false, i);
    const keyPair = bitcoin.ECPair.fromPrivateKey(key.privateKey);
    const address = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey });
    results.push(address.address);
  }
  for (let i = 0; i < account.change_ind + 1; ++i){
    let key = gen_child(xpriv, settings.testnet, account_ind, true, i);
    const keyPair = bitcoin.ECPair.fromPrivateKey(key.privateKey);
    const address = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey });
    results.push(address.address);
  }
  return results;
}

export function get_account_addresses(account: Account){
  let testnets: string[] = [];
  let mainnets: string[] = [];

  console.log(`Testnet: ${account.xpub_testnet}`);
  console.log(`Mainnet: ${account.xpub}`);

  //Testnet
  for (let i = 0; i < account.recieve_ind + 1; ++i){
    let xpub = bip32.fromBase58(account.xpub_testnet);
    let key = gen_child_pub(xpub, false, i);
    const address = bitcoin.payments.p2wpkh({ pubkey: key.publicKey });
    testnets.push(address.address);
  }
  for (let i = 0; i < account.change_ind + 1; ++i){
    let xpub = bip32.fromBase58(account.xpub_testnet);
    let key = gen_child_pub(xpub, true, i);
    const address = bitcoin.payments.p2wpkh({ pubkey: key.publicKey });
    testnets.push(address.address);
  }

  //Mainnet
  for (let i = 0; i < account.recieve_ind + 1; ++i){
    let xpub = bip32.fromBase58(account.xpub);
    let key = gen_child_pub(xpub, false, i);
    const address = bitcoin.payments.p2wpkh({ pubkey: key.publicKey });
    mainnets.push(address.address);
  }
  for (let i = 0; i < account.change_ind + 1; ++i){
    let xpub = bip32.fromBase58(account.xpub);
    let key = gen_child_pub(xpub, true, i);
    const address = bitcoin.payments.p2wpkh({ pubkey: key.publicKey });
    mainnets.push(address.address);
  }

  return {mainnets, testnets};
}

export function gen_child(xkey: bip32.BIP32Interface, testnet: boolean, account: number, change: boolean, index: number){
  return xkey.derivePath(`m/84'/${testnet ? 1 : 0}'/${account}'/${change ? 1 : 0}/${index}`);
}

export function gen_child_pub(xkey: bip32.BIP32Interface, change: boolean, index: number){
  return xkey.derive(change ? 1 : 0).derive(index);
}
