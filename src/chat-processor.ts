import $ from 'jquery';
import { stateStore } from './store';
import { escapeHTML, escapeRegExp, log } from './utils';
import { IElixrEmote } from './interfaces';
import { MaxSize } from  './enums';

export function addEmoteCss() {
    $('#elixr-emote-styles').remove();

    $('body').prepend(`
        <style id="elixr-emote-styles">

            .elixr-emote {
                vertical-align: bottom;
                margin-left: 2px;
            }

            .elixr-emote img {
                vertical-align: bottom;
            }

            .elixr-emote.fifty img {
                max-width:50px;
                max-height:50px;
            }

            .elixr-emote.thirty img {
                max-width:30px;
                max-height:30px;
            }

            .elixr-emote.twentyfour img {
                max-width:24px;
                max-height:24px;
            }

            .elixr-emote-tabs {
                line-height: 50px;
                width: 100%;
                display: flex;
                background: #222d3c;
                border-bottom: 1px solid #3E4A5B;
            }

            .elixr-emote-tabs .elixr-emote-tab {
                padding: 10px 0;
                width: 50%;
                display:flex;
                align-items: center;
                justify-content: center;
            }

            .elixr-emote-tabs .elixr-emote-tab:first-child {
                border-right: 1px solid #3E4A5B;
            }

            .elixr-emote-tabs .elixr-emote-tab.elixr-tab-selected {
                background: #16202e;
            }
            
            .elixr-emote-tabs .elixr-emote-tab img {
                width: 35px;
            }

            .elixr-emote-tabs .elixr-emote-tab:not(.elixr-tab-selected):hover {
                cursor: pointer;
                opacity: 0.6;
            }
            
            .elixr-emotes-wrapper {
                overflow-y: auto;
                padding: 16px;
            }

            .elixr-emote-preview {
                cursor: pointer;
                margin-right: 5px;
                margin-bottom: 5px;
            }

            .elixr-emote-section-header {
                margin: 12px 0 5px 0;
                font-size: .9em;
                color: #8f94ae;
                font-weight: bold;             
            }

        </style>
    `);
}

export function processMessage(messageContainer: JQuery<any>) {
    messageContainer.find('span:not([class])').each(function() {

        const component = $(this);

        // we've already replaced emotes on this, skip it
        if (component.hasClass('elixr-custom-emotes')) {
            return;
        }

        // tag this component so we dont attempt to look for emotes again
        component.addClass('elixr-custom-emotes');

        let text = component.text().trim();

        // loop through all emotes
        let allEmoteCodes: string[] = [];

        allEmoteCodes = stateStore.channelEmotes.map(e => e.code);

        allEmoteCodes = allEmoteCodes.concat(stateStore.globalEmotes.map(e => e.code));

        // remove dupes
        allEmoteCodes = [...new Set(allEmoteCodes)];

        // build emote name group end result will look like: "emoteName1|emoteName2|emoteName3"
        let emoteNameRegexGroup = '';
        for (let emote of allEmoteCodes) {
            if (emoteNameRegexGroup.length > 0) {
                emoteNameRegexGroup += '|';
            }
            emoteNameRegexGroup += escapeRegExp(emote);
        }

        const regexPattern = `(?:^|\\s)(?:${emoteNameRegexGroup})(?=\\s|$)`;

        // emote name regex
        let emoteNameRegex: RegExp;
        try {
            emoteNameRegex = new RegExp(regexPattern, 'gm');
        } catch (err) {
            log('REGEX ERROR!');
            console.error(err);
            return;
        }

        // html escape current text
        text = escapeHTML(text);

        let foundEmote = false;

        // replace emote codes with img tags
        text = text.replace(emoteNameRegex, match => {
            match = match && match.trim();
            log('Found emote match: ' + match);

            // search for channel emote first
            let emote: IElixrEmote;
            if (stateStore.channelEmotes.length > 0) {
                emote = stateStore.channelEmotes.find(e => e.code === match);
            }

            // if we didnt find anything, search global if enabled
            let isGlobal = false;
            if (emote == null && stateStore.globalEmotes.length) {
                emote = stateStore.globalEmotes.find(e => e.code === match);
                isGlobal = true;
            }

            if (emote) {
                foundEmote = true;

                const urlTemplate = isGlobal ? stateStore.globalEmoteUrlTemplate : stateStore.channelEmoteUrlTemplate;

                const emoteUrl = urlTemplate.replace('{{emoteId}}', escapeHTML(emote.id));

                let sizeClass = mapEmoteSizeToClass(emote.maxSize);

                let imgTag = `
                    <span
                        class="elixr-emote ${sizeClass}"
                        title="Mixr Elixr: Custom emote '${escapeHTML(emote.code)}'"
                        style="display: inline-block;">
                            <img src="${emoteUrl}">
                    </span>`;

                return imgTag;
            }
            return match;
        });

        if (foundEmote) {
            // update component html with text containing img tags
            component.html(text.trim());

            component
                .find('.elixr-emote')
                .children('img')
                .on('load', function() {
                    const username = messageContainer.find('[class*="Username"]');
                    if (username != null && username.length > 0) {
                        const usernameTop = username.position().top;

                        const avatar = messageContainer.find('[class*="ChatAvatar"]');
                        if (usernameTop > 6 && avatar != null && avatar.length > 0) {
                            avatar.css('top', usernameTop - 3 + 'px');
                        }
                    }
                });
        }
    });
}

function mapEmoteSizeToClass(size: MaxSize): string {
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