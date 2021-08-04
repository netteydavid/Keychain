"use strict";

import * as $ from 'jquery';
import { Settings } from './models/Settings';

window.onload = () => {
    $("#save_btn").on("click", () => {
        let timeout: number = $("#timeout").val() as number;
        let logout_on_exit: boolean = ($("#logout_on_exit").get(0) as HTMLInputElement).checked;
    
        let settings: Settings = new Settings();
        settings.login_timeout = timeout;
        settings.logout_on_exit = logout_on_exit;
        
        chrome.storage.local.set({ settings }, () => {
            console.log("Saved!");
        });
    });
};