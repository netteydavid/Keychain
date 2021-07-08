"use strict";
exports.__esModule = true;
var bip32 = require("bip32");
var bip39 = require("bip39");
var crypto = require("crypto");
var $ = require("jquery");
//Variables
var words = "";
window.onload = function () {
    $("#clear_btn").on("click", clear_memory);
    chrome.storage.local.get(["xpriv", "settings"], function (result) {
        if (result.xpriv != null) {
            goto_login();
            // if (result.settings != null){
            // }
            // else{
            // }
        }
        else {
            goto_init();
        }
    });
};
//Goes to the initialization page
function goto_init() {
    $("#content").load("../content/init.html", function () {
        //Add click event listeners to the buttons
        $("#create_btn").on("click", goto_create);
        $("#recover_btn").on("click", goto_recover);
    });
}
function goto_create() {
    $("#content").load("../content/create_wallet.html", function () {
        $("#make_mnemonic").on("click", create_mnemonic);
        $("#create_pwd").on("click", goto_create_pwd);
    });
}
function goto_recover() {
    $("#content").load("../content/recover_wallet.html", function () {
        $("#recover_btn").on("click", compile_mnemonic);
    });
    //TODO: Make recover screen take 24 words
    //TODO: Create recover_wallet.ts
    //todo: Generate xpriv
    //TODO: Ask for password on new screen
}
function goto_create_pwd() {
    $("#content").load("../content/create_pwd.html", function () {
        $("#set_pwd").on("click", set_password);
    });
}
function goto_login() {
    $("#content").load("../content/login.html", function () {
        $("#login_btn").on("click", login);
    });
}
function goto_home() {
    $("#content").load("../content/home.html");
    //TODO: Display all generated addresses
}
function encryptXpriv(password, mnemonic) {
    //Get seed
    var seed = bip39.mnemonicToSeedSync(mnemonic);
    //Generate xpriv
    var root = bip32.fromSeed(seed);
    //Encryption prep
    var vector = crypto.randomBytes(16);
    var hashPass = crypto.createHash("sha256")
        .update(password)
        .digest();
    var hashed = crypto.createHash("sha256")
        .update(hashPass)
        .digest();
    //Encrypt
    var cipher = crypto.createCipheriv("aes256", hashed, vector);
    var encrypted = cipher.update(root.toBase58(), "utf-8", "hex");
    encrypted += cipher.final("hex");
    //Save
    chrome.storage.local.set({ xpriv: encrypted, iv: vector.toString("hex") });
}
function decryptXpriv(password, callback) {
    var hashPass = crypto.createHash("sha256")
        .update(password)
        .digest();
    var hashed = crypto.createHash("sha256")
        .update(hashPass)
        .digest();
    //Decrypt xpriv and print
    chrome.storage.local.get(["xpriv", "iv"], function (result) {
        try {
            var decipher = crypto.createDecipheriv("aes256", hashed, hexToBuffer(result.iv));
            var decrypted = decipher.update(result.xpriv, "hex", "utf-8");
            decrypted += decipher.final("utf-8");
            callback(bip32.fromBase58(decrypted));
        }
        catch (_a) {
            $("#incorrect_pass").html("Incorrect Password.");
        }
    });
}
function hexToBuffer(hex) {
    var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
        return parseInt(h, 16);
    }));
    return Buffer.from(typedArray);
}
function create_mnemonic() {
    words = bip39.generateMnemonic(256);
    var wordTable = document.getElementById("words");
    var wordArr = words.split(" ");
    for (var i = 0; i < wordArr.length / 2; ++i) {
        var row = wordTable.insertRow();
        var cell1 = row.insertCell();
        cell1.innerHTML = i + 1 + ". " + wordArr[i];
        var cell2 = row.insertCell();
        cell2.innerHTML = i + 13 + ". " + wordArr[i + 12];
    }
    $("#create_pwd").show();
}
function compile_mnemonic() {
    words = "";
    var incomplete = false;
    //Clear any errors
    $("#valid").hide();
    for (var i = 1; i < 25; ++i) {
        var id = "#word" + i;
        $(id + "_req").hide();
    }
    //Check each word and add it to the mnemonic
    for (var i = 1; i < 25; ++i) {
        var id = "#word" + i;
        var word = $(id).val();
        if (word == "" || word == null) {
            if (!incomplete)
                incomplete = true;
            $(id + "_req").show();
        }
        else {
            words += word;
            if (i < 24)
                words += " ";
        }
    }
    //Validate the mnemonic
    var valid = bip39.validateMnemonic(words);
    if (!incomplete && !valid) {
        $("#valid").show();
    }
    //Autoscroll to the top if there are errors
    if (incomplete || !valid)
        $("#content").scrollTop(0);
    //If each word has been entered and the mnemonic is valid, continue
    if (!incomplete && valid)
        goto_create_pwd();
}
function set_password() {
    // $("#no_match").hide();
    var pwd1 = $("#pass1").val();
    var pwd2 = $("#pass2").val();
    if (pwd1 == pwd2) {
        encryptXpriv(pwd1, words);
        goto_home();
    }
    else {
        $("#no_match").show();
    }
}
function login() {
    var pwd = $("#pass").val();
    decryptXpriv(pwd, function (xpriv) {
        goto_home();
    });
}
function clear_memory() {
    chrome.storage.local.clear();
}
