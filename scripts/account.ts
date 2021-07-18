"use strict";
import * as $ from 'jquery';

export function load_account(account){
    chrome.storage.local.get(["accounts"], (results) => {
        let acct = results.accounts[account];
        $("#account_name").html(acct.name);
        $("#balance").html("0 sats");
    });
}