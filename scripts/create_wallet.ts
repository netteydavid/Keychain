"use strict";
import * as $ from 'jquery';
import * as bip39 from 'bip39';

  export function create_mnemonic(){
    const words = bip39.generateMnemonic(256);
    let wordTable = $("#words").get(0) as HTMLTableElement;
    
    const wordArr = words.split(" ");
    for (let i = 0; i < wordArr.length/2; ++i){
      let row = wordTable.insertRow();
      let cell1 = row.insertCell();
      cell1.innerHTML = `${i + 1}. ${wordArr[i]}`;
      let cell2 = row.insertCell();
      cell2.innerHTML = `${i + 13}. ${wordArr[i + 12]}`;
    }

    chrome.storage.local.set({words});

    $("#create_pwd").show();
}