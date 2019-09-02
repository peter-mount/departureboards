import config from 'react-global-configuration';

// Retrieve current config. usually only used to load the global configuration
export function getConfig() {
    let json;
    try {
        json = JSON.parse(localStorage.getItem('config'));
    } catch (e) {
        json = null;
    }

    // No json or has old config then reset to defaults
    if (!json || json.version == null || json.version < 190902) {
        json = {
            version: 190902,
            showTerminated: false,
            refreshRate: 60000,
            serviceRefreshRate: 60000,
        };

        setServer(json, isUAT());

        saveConfig(json);
    }
    config.set(json, {freeze: false});
    return json;
}

// Save the config to local storage and update global configuration
export function saveConfig(json) {
    if (json) {
        localStorage.setItem('config', JSON.stringify(json));
        config.set(json, {freeze: false});
    }
}

// Returns true if this is the UAT environment
export function isUAT() {
    return document.domain !== null && document.domain.toLocaleLowerCase().indexOf("departureboards.mobi") < 0;
}

// Sets the appropriate API endpoint
export function setServer(cfg, useUAT) {
    cfg.useUAT = useUAT;
    if (useUAT) {
        cfg.ldbUrl = 'https://ldb.test.area51.dev';
        cfg.refUrl = 'https://ref.test.area51.dev'
    } else {
        cfg.ldbUrl = 'https://ldb.a.a51.li';
        cfg.refUrl = 'https://ref.a.a51.li'
    }
}
