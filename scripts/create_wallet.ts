"use strict";
import * as bip39 from 'bip39';

let words = ""; //TODO: Store in background script?

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