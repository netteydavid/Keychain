"use strict";
import * as $ from 'jquery';
import * as QRCode from 'qrcode';
import { Account } from './models/Account';

export function generate_address(account_ind: number = 0){
    chrome.storage.local.get(["accounts", "addresses"], results => {
        if (results.accounts != null && results.accounts.length > 0){
            let accounts: Account[] = results.accounts;
            
            
        }
    });
}