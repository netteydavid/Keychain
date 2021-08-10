import { get_account_addresses } from './manage_keys';
import { get_settings } from './popup';

export let balance: number = 0;

export function update_price(callback: Function){
    let settings = get_settings();
    
    fetch(settings.price_endpoint)
    .then(response => response.json())
    .then(data => {
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
    });
}

export function get_balance(callback: Function){
    let settings = get_settings();
    const url = settings.testnet ? settings.testnet_node : settings.mainnet_node;
    chrome.storage.local.get("accounts", (result) => {
        let addresses: string[] = [];
        if (result.accounts != null && result.accounts.length > 0){
            console.log(JSON.stringify(result.accounts));
            for (let i = 0; i < result.accounts.length; ++i){
                let account_addresses = get_account_addresses(result.accounts[i]);
                if (settings.testnet){
                    for (let j = 0; j < account_addresses.testnets.length; ++j){
                        addresses.push(account_addresses.testnets[j]);
                    }
                }
                else{
                    for (let j = 0; j < account_addresses.mainnets.length; ++j){
                        addresses.push(account_addresses.mainnets[j]);
                    }
                }
            }

            balance = 0;
            for (let i = 0; i < addresses.length; ++i){
                fetch(`${url}/address/${addresses[i]}/utxo`)
                    .then(response => response.json())
                    .then(data => {
                        console.log(`Balance data: ${JSON.stringify(data)}`);
                        for (let j = 0; j < data.length; ++j){
                            balance += data[j].value;
                        }
                        callback(balance);
                    });
            }
        }
        else{
            callback(0);
        }
    });
    // chrome.storage.local.get("addresses", (result) => {
    //     let addresses: string[] = [];
    //     if (result.addresses != null && result.addresses.length > 0){
    //         addresses = result.addresses;
    //         for (let i = 0; i < addresses.length; ++i){
    //             fetch(`${url}/address/${addresses[i]}/utxo`)
    //                 .then(response => response.json())
    //                 .then(data => {
    //                     console.log(`Balance data: ${JSON.stringify(data)}`);
    //                     let balance: number = 0;
    //                     for (let j = 0; j < data.length; ++j){
    //                         balance += data[j].value;
    //                     }
    //                     callback(balance);
    //                 });
    //         }
    //     }
    //     else{
    //         callback(0);
    //     }
    // });
}