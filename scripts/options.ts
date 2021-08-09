"use strict";

import * as $ from 'jquery';
import { Settings } from './models/Settings';
import { get_settings } from './popup';

window.onload = () => {
    //Get the settings
    const settings: Settings = get_settings();
    $("#timeout").val(settings.login_timeout);
    ($("#use_testnet").get(0) as HTMLInputElement).checked = settings.testnet;
    ($("#advanced").get(0) as HTMLInputElement).checked = settings.advanced;

    //Save button
    $("#save_btn").on("click", () => {
        let timeout: number = $("#timeout").val() as number;
        let use_testnet: boolean = ($("#use_testnet").get(0) as HTMLInputElement).checked;
        let advanced: boolean = ($("#advanced").get(0) as HTMLInputElement).checked;
    
        let settings: Settings = new Settings();
        settings.login_timeout = timeout;
        settings.testnet = use_testnet;
        settings.advanced = advanced;
        
        chrome.storage.local.set({ settings }, () => {
            console.log("Saved!");
        });
    });
};