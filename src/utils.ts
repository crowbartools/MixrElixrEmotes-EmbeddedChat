import $ from 'jquery';
import { stateStore } from './store';

// Check if browser supports "matches" function
if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.webkitMatchesSelector;
}

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

    // The MutationObserver watches for when new elements are added to the DOM.
    let observer = new MutationObserver(function (mutations) {
        let matches = [];

        // For each mutation.
        for (let m = 0; m < mutations.length; m++) {

            // If this is an childList mutation, then inspect added nodes.
            if (mutations[m].type === 'childList') {
                // Search added nodes for matching selectors.
                for (let n = 0; n < mutations[m].addedNodes.length; n++) {
                    if (!(mutations[m].addedNodes[n] instanceof Element)) continue;
                    const node = mutations[m].addedNodes[n] as Element;
                    // Check if the added node matches the selector
                    if (node.matches(selector)) {
                        matches.push(node);
                    }
                }
            }
        }

        // For each match, call the callback using jQuery.each() to initialize the element (once only.)
        if (matches.length > 0) {
            matches.forEach((n) => {
                $(n).each(callback);
            });
        }
    });

    // Observe the target element.
    const defaultObeserverOpts = { childList: true, subtree: true, attributes: false };
    observer.observe(document.documentElement, defaultObeserverOpts);

    return observer;
}

export function log(message: string) {
    console.log(`[MixrElixr-Emotes] ${message}`);
}

export function chatIsFromCurrentChannel(): boolean {
    let chatFromCurrentChannel = true;
    let chatTabs = $('b-channel-chat-tabs');
    if (chatTabs != null && chatTabs.length > 0) {
        let selectedTab = chatTabs.find('.selected');
        if (selectedTab != null && selectedTab.length > 0) {
            let chatChannelName = selectedTab.text().trim();
            chatFromCurrentChannel = chatChannelName === stateStore.channel.token;
        }
    }
    return chatFromCurrentChannel;
}

export function escapeHTML(unsafeText: string): string {
    let div = document.createElement('div');
    div.innerText = unsafeText;
    return div.innerHTML.replace(/"/g, '&quot;');
}

export function escapeRegExp(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
}