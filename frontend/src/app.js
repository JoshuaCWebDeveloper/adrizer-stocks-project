/* app.js
 * AdRizer stocks frontend app
 * Dependencies: modules, services, classes
 * Author: Joshua Carter
 * Created: March 4, 2021
 */
"use strict";
//import dependencies
import { JCObject } from 'jcscript';
// fix babel issue
import regeneratorRuntime from "regenerator-runtime";
import React from 'react';
import ReactDOM from 'react-dom';
//import components
import { AdRizerApp } from './AdRizerApp.js';
import mainClasses from './styles/main.css';

class Config extends JCObject {
    
    constructor (data) {
        super({
            API_ROOT: ""
        });
        this.update(data);
    }
    
    async init () {
        const response = await fetch("../js/config.json");
        const data = await response.json();
        this.update(data);
    }
    
}

(async function (window) {
    window.ADRIZER_CONFIG = new Config();
    await window.ADRIZER_CONFIG.init();
    
    ReactDOM.render(
        (
            <AdRizerApp />
        ),
        window.document.getElementById("view")
    );
})(window);
