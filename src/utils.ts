import $ from 'jquery';
import { stateStore } from './store';
import { MaxSize } from  './enums';

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

export function mapEmoteSizeToClass(size: MaxSize): string {
    switch (size) {
        case MaxSize.TwentyFour:
            return 'twentyfour';
        case MaxSize.Thirty:
            return 'thirty';
        case MaxSize.Fifty:
        default:
            return 'fifty';
    }
}

export function updateChatTextfield(newString: string) {
    let textAreaElement = $('#chat-input').children('textarea');

    textAreaElement.trigger("focus");

    textAreaElement.val(newString);

    textAreaElement.trigger("input");
    textAreaElement.trigger("change");
    textAreaElement.trigger("blur");
}