import $ from 'jquery';
import { initialize, chatIsFromCurrentChannel, log } from './utils';
import * as store from './store';
import * as chatProccessor from './chat-processor';

$(() => {
    start();
});

async function start() {

    log('Starting MixrElixr Emotes for Embedded Chat');

    const url = new URL(window.location.href);
    const embeddedChatRegex = new RegExp('\\/embed\\/chat\\/(\\w+).*', 'gi');
    const embeddedPathCheck = embeddedChatRegex.exec(url.pathname);

    if (url.host.toLowerCase() !== 'mixer.com'
        || embeddedPathCheck == null
        || embeddedPathCheck.length < 2) {
        // We arent on an embedded chat page, stop here
        log('We are not on an embedded chat page, stopping!');
        return;
    }

    log('We are in an embedded chat page!');

    const channelNameOrId = embeddedPathCheck[1];

    await store.populateState(channelNameOrId);

    chatProccessor.addEmoteCss();

    initialize('div[class*="message_"]:not([class*="pending_"])', function() {

        const messageContainer = $(this);

        const alreadyChecked = messageContainer.attr('elixr-emotes') != null;
        // Check to see if we have already looked at this chat messsage.
        if (alreadyChecked) {
            return;
        }

        messageContainer.attr('elixr-emotes', 'true');

        const chatFromCurrentChannel = chatIsFromCurrentChannel();

        if (chatFromCurrentChannel) {
            chatProccessor.processMessage(messageContainer);
        }

    });
}

