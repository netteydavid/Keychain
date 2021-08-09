"use strict";

import * as $ from 'jquery';
import { Settings } from './models/Settings';
import { get_settings } from './popup';

window.onload = () => {

    //Events
    $("#use_testnet").on("click", () => net_toggle());
    $("#advanced").on("click", () => adv_toggle());

    //Get the settings
    const settings: Settings = get_settings();
    $("#timeout").val(settings.login_timeout);
    ($("#use_testnet").get(0) as HTMLInputElement).checked = settings.testnet;
    ($("#advanced").get(0) as HTMLInputElement).checked = settings.advanced;
    $("#testnet_node").val(settings.testnet_node);
    $("#mainnet_node").val(settings.mainnet_node);
    adv_toggle();

    //Save button
    $("#save_btn").on("click", () => {
        let timeout: number = $("#timeout").val() as number;
        let use_testnet: boolean = ($("#use_testnet").get(0) as HTMLInputElement).checked;
        let advanced: boolean = ($("#advanced").get(0) as HTMLInputElement).checked;
        let mainnet_node: string = $("#mainnet_node").val() as string;
        let testnet_node: string = $("#testnet_node").val() as string;
    
        let settings: Settings = new Settings();
        settings.login_timeout = timeout;
        settings.testnet = use_testnet;
        settings.advanced = advanced;
        settings.testnet_node = testnet_node;
        settings.mainnet_node = mainnet_node;
        
        chrome.storage.local.set({ settings }, () => {
            console.log("Saved!");
        });
    });
};

function adv_toggle(){
    const advanced: boolean = ($("#advanced").get(0) as HTMLInputElement).checked;
    if (advanced){
        $("#advanced_features").show()
        net_toggle();
    }
    else{
        $("#advanced_features").hide()
    }
}

function net_toggle(){
    const advanced: boolean = ($("#advanced").get(0) as HTMLInputElement).checked;
    const use_testnet: boolean = ($("#use_testnet").get(0) as HTMLInputElement).checked;
    if (advanced && use_testnet){
        $(".testnet").show();
        $(".mainnet").hide();
    }
    else if (advanced) {
        $(".testnet").hide();
        $(".mainnet").show();
    }
}