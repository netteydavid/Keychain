"use strict";
import * as bip32 from 'bip32';
import * as bip39 from 'bip39';
import * as crypto from 'crypto';
import * as $ from 'jquery';

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
