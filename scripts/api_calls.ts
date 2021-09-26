import { get_account_addresses, get_change_addresses, get_recieve_addresses } from './manage_keys';
import { get_accounts, get_settings, get_xpubs } from './popup';

export let balance: number = 0;

export function update_price(callback: Function){
    let settings = get_settings();
    
    fetch(settings.price_endpoint)
    .then(response => response.json())
    .then(data => {
        if (callback != null){
            if (settings.fiat == 2){
                callback(data.bitcoin.eur, "EUR");
            }
            else if (settings.fiat == 3){
                callback(data.bitcoin.gpb, "GPB");
            }
            else if (settings.fiat == 4){
                callback(data.bitcoin.cny, "CNY");
            }
            else if (settings.fiat == 5){
                callback(data.bitcoin.jpy, "JPY");
            }
            else if (settings.fiat == 6){
                callback(data.bitcoin.rub, "RUB");
            }
            else if (settings.fiat == 7){
                callback(data.bitcoin.cad, "CAD");
            }
            else if (settings.fiat == 8){
                callback(data.bitcoin.aud, "AUD");
            }
            else {
                callback(data.bitcoin.usd, "USD");
            }
        }
    });
}

export function get_address_balance(address: string, callback: Function){
    let settings = get_settings();
    const url = settings.testnet ? settings.testnet_node : settings.mainnet_node;
    fetch(`${url}/address/${address}/utxo`)
                .then(response => response.json())
                .then(data => {
                    let total = 0;
                    for (let i = 0; i < data.length; ++i){
                        total += data[i].value;
                    }
                    
                    if (callback != null) callback(total);
                });
}

export function get_balance(callback: Function){
    let settings = get_settings();
    const accounts = get_accounts();
    const xpubs = get_xpubs();
    
    balance = 0;
    for (let i = 0; i < xpubs.length; ++i){
        let recieve_addresses = get_recieve_addresses(accounts[i], xpubs[i], settings.testnet);
        let change_addresses = get_change_addresses(accounts[i], xpubs[i], settings.testnet);

        let addresses = recieve_addresses.concat(change_addresses);
        for (let j = 0; j < addresses.length; ++j){
            get_address_balance(addresses[j], (total) => {
                balance += total;
                if (callback != null) callback(balance);
            });
        }
    }
}