import $ from 'jquery';

interface IMutationSelectorObserver {
    selector: string,
    callback: any
}

// Check if browser supports "matches" function
if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.webkitMatchesSelector;
}

let msobservers: IMutationSelectorObserver[] = [];

export function initialize(selector: string, callback: any) {

    // Wrap the callback so that we can ensure that it is only
    // called once per element.
    const seen = [];
    const callbackOnce = function () {
        if (seen.indexOf(this) === -1) {
            seen.push(this);
            $(selector).each(callback);
        }
    };

    // See if the selector matches any elements already on the page.
    $(selector).each(callbackOnce);

    // Then, add it to the list of selector observers.
    msobservers.push({
        selector: selector,
        callback: callbackOnce
    });
}

// The MutationObserver watches for when new elements are added to the DOM.
let observer = new MutationObserver(function (mutations) {
    // For each mutation.
    for (let m = 0; m < mutations.length; m++) {
        // If this is an childList mutation, then inspect added nodes.
        if (mutations[m].type === 'childList') {
            // Search added nodes for matching selectors.
            for (let n = 0; n < mutations[m].addedNodes.length; n++) {
                if (!(mutations[m].addedNodes[n] instanceof Element)) continue;
                for(let msobserver of msobservers) {
                    $(msobserver.selector).each(msobserver.callback);
                }           
            }
        }
    }
});

// Observe the target element.
const defaultObeserverOpts = { childList: true, subtree: true, attributes: false };
observer.observe(document.documentElement, defaultObeserverOpts);