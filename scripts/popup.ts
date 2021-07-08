"use strict";
import * as bip32 from 'bip32';
import * as bip39 from 'bip39';
import * as crypto from 'crypto';
import * as $ from 'jquery';
import * as bitcoin from 'bitcoinjs-lib';
import { clear } from 'console';

//Variables
let words = "";

window.onload = () => {
    $("#clear_btn").on("click", clear_memory);
    chrome.storage.local.get(["xpriv", "settings"], (result) => {
        if (result.xpriv != null){
            goto_login();
            // if (result.settings != null){
    
            // }
            // else{
    
            // }
        }
        else{
            goto_init();
        }
    });
};

//Goes to the initialization page
function goto_init(){
    $("#content").load("../content/init.html", () => {
        //Add click event listeners to the buttons
        $("#create_btn").on("click", goto_create);
        $("#recover_btn").on("click", goto_recover);
    });
}

function goto_create(){
    $("#content").load("../content/create_wallet.html", () => {
      $("#make_mnemonic").on("click", create_mnemonic);
      $("#create_pwd").on("click", goto_create_pwd);
    });
}

function goto_recover(){
    $("#content").load("../content/recover_wallet.html", () => {
      $("#recover_btn").on("click", compile_mnemonic);
    });
}

function goto_create_pwd(){
  $("#content").load("../content/create_pwd.html", () => {
    $("#set_pwd").on("click", set_password);
  });
}

function goto_login(){
    $("#content").load("../content/login.html", () => {
      $("#login_btn").on("click", login);
    });
}

function goto_home(){
    $("#content").load("../content/home.html");
    //TODO: Display all generated addresses
}

function encryptXpriv(password, mnemonic){
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
  
  function decryptXpriv(password, callback){
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

  function create_mnemonic(){
    words = bip39.generateMnemonic(256);
    let wordTable = document.getElementById("words") as HTMLTableElement;
    
    const wordArr = words.split(" ");
    for (let i = 0; i < wordArr.length/2; ++i){
      let row = wordTable.insertRow();
      let cell1 = row.insertCell();
      cell1.innerHTML = `${i + 1}. ${wordArr[i]}`;
      let cell2 = row.insertCell();
      cell2.innerHTML = `${i + 13}. ${wordArr[i + 12]}`;
    }

    $("#create_pwd").show();
}

function compile_mnemonic(){
  words = "";
  let incomplete = false;
  
  //Clear any errors
  $("#valid").hide();
  for (let i = 1; i < 25; ++i){
    let id = "#word" + i;
    $(id + "_req").hide();
  }

  //Check each word and add it to the mnemonic
  for (let i = 1; i < 25; ++i){
    let id = "#word" + i;
    let word = $(id).val()
    if (word == "" || word == null){
      if (!incomplete) incomplete = true;
      $(id + "_req").show();
    }
    else{
      words += word;
      if (i < 24) words += " ";
    }
  }

  //Validate the mnemonic
  const valid = bip39.validateMnemonic(words);
  if (!incomplete && !valid){
    $("#valid").show();
  }

  //Autoscroll to the top if there are errors
  if (incomplete || !valid) $("#content").scrollTop(0);

  //If each word has been entered and the mnemonic is valid, continue
  if (!incomplete && valid) goto_create_pwd();
}

function set_password(){

  // $("#no_match").hide();

  const pwd1 = $("#pass1").val();
  const pwd2 = $("#pass2").val();

  if (pwd1 == pwd2){
    encryptXpriv(pwd1, words);
    goto_home();
  }
  else{
    $("#no_match").show();
  }
}

function login(){
  const pwd = $("#pass").val();
  decryptXpriv(pwd, (xpriv) =>{
    goto_home();
  });
}

function clear_memory(){
  chrome.storage.local.clear();
}