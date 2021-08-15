"use strict";
import * as $ from 'jquery';
import { Account } from './models/Account';
import { get_accounts } from './popup';

export function load_account(account){
    const accounts: Account[] = get_accounts();
    let acct = accounts[account];
    $("#account_name").html(acct.name);
    $("#balance").html("0 sats");
}