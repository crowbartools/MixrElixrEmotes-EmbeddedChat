import $ from 'jquery';
import { escapeHTML, mapEmoteSizeToClass, updateChatTextfield } from './utils';
import { initialize } from './element-watcher';
import { mixerLogoDataUrl, elixrLogoDataUrl } from './resources';
import * as store from './store';
import { IElixrEmote } from './interfaces';

export function handleEmoteModal() {
    initialize('[class*=\'modal_\']', function () {
        let modal = $(this);

        let showChannelEmotes = store.stateStore.channelEmotes != null && store.stateStore.channelEmotes.length > 0;
        let showGlobalEmotes = store.stateStore.globalEmotes != null && store.stateStore.globalEmotes.length > 0;

        waitForModalContainer(modal)
            .then(emotesContainer => {
                if (showChannelEmotes || showGlobalEmotes) {
                    emotesContainer.addClass('mixer-emotes-wrapper');
                    emotesContainer.show();

                    if ($('.elixr-emote-tabs').length > 0) {
                        $('.elixr-emote-tabs').remove();
                    }

                    $(`
                        <div class="elixr-emote-tabs">
                            <div class="elixr-emote-tab mixer elixr-tab-selected" title="Mixer Emotes">
                                <img src="${mixerLogoDataUrl}">
                            </div>
                            <div class="elixr-emote-tab elixr" title="MixrElixr Emotes">
                                <img src="${elixrLogoDataUrl}">
                            </div>
                        </div>
                    `).insertBefore(emotesContainer);

                    $('.elixr-emote-tab').off('click');
                    $('.elixr-emote-tab').on('click', function () {
                        let clickedTab = $(this);
                        if (!clickedTab.hasClass('elixr-tab-selected')) {
                            clickedTab.addClass('elixr-tab-selected');
                            let otherTabType = clickedTab.hasClass('elixr') ? 'mixer' : 'elixr';
                            $(`.${otherTabType}`).removeClass('elixr-tab-selected');
                            let elixrEmotes = $('.elixr-emotes-wrapper');
                            let mixerEmotes = $('.mixer-emotes-wrapper');
                            if (otherTabType === 'mixer') {
                                mixerEmotes.hide();
                                elixrEmotes.show();
                            } else {
                                elixrEmotes.hide();
                                mixerEmotes.show();
                            }
                        }
                    });

                    if ($('.elixr-emotes-wrapper').length > 0) {
                        $('.elixr-emotes-wrapper').remove();
                    }

                    let elixrEmotesContainer = $(`<div class="elixr-emotes-wrapper"></div>`);
                    elixrEmotesContainer.hide();

                    if (showGlobalEmotes) {
                        let header = 'MixrElixr Global Emotes';
                        let emotesSection = buildEmotesSection(header, store.stateStore.globalEmotes, store.stateStore.globalEmoteUrlTemplate);
                        elixrEmotesContainer.prepend(emotesSection);
                    }

                    if (showChannelEmotes) {
                        let header = `${store.stateStore.channel.token}'s Custom Emotes`;
                        let emotesSection = buildEmotesSection(header, store.stateStore.channelEmotes, store.stateStore.channelEmoteUrlTemplate);
                        elixrEmotesContainer.prepend(emotesSection);
                    }

                    elixrEmotesContainer.insertBefore(emotesContainer);

                    $('.elixr-emote-preview').off('click');
                    $('.elixr-emote-preview').on('click', function () {
                        let emoteName = $(this).attr('emote-name');
                        let chatTextarea = $('#chat-input').children('textarea');
                        let currentValue = chatTextarea.val();
                        let newValue = `${currentValue}${currentValue === '' ? ' ' : ''}${emoteName} `;
                        updateChatTextfield(newValue);
                    });
                }
            })
            .catch(() => { });
    });
}

function buildEmotesSection(header: string, emotes: IElixrEmote[], emoteUrlTemplate: string) {
    let customEmotesWrapper = $(
        `<div><h3 class="elixr-emote-section-header">${header}</h3><div class="elixr-emote-section"></div></div>`
    );
    let emoteList = customEmotesWrapper.children('.elixr-emote-section');

    // loop through all emotes
    for (let emote of emotes) {
        const emoteUrl = emoteUrlTemplate.replace('{{emoteId}}', escapeHTML(emote.id));
        let name = escapeHTML(emote.code);
        let sizeClass = mapEmoteSizeToClass(emote.maxSize);
        emoteList.append(`
        <span class="elixr-emote ${sizeClass} elixr-emote-preview" title="${name}" emote-name="${name}" style="display: inline-block;">
            <img src="${emoteUrl}">
        </span>`);
    }

    return customEmotesWrapper;
}

const lookForEmoteClass = function (modalContainer: JQuery<HTMLElement>, counter = 0): Promise<boolean> {
    return new Promise(resolve => {
        if (counter >= 4) {
            return resolve(false);
        }
        counter++;

        let foundEmoteClass = modalContainer.find('[class*=\'emoteGroupHeader\']').length > 0;

        if (!foundEmoteClass) {
            setTimeout(() => {
                resolve(lookForEmoteClass(modalContainer, counter));
            }, 100);
        } else {
            resolve(true);
        }
    });
};

const waitForModalContainer = function (modal: JQuery<HTMLElement>, counter = 0): Promise<JQuery<HTMLElement>> {
    return new Promise(async (resolve, reject) => {
        if (counter >= 20) {
            return reject();
        }
        counter++;

        let emotesContainer = modal.find('[class*=\'container\']') as JQuery<HTMLElement>;

        if (emotesContainer == null || emotesContainer.length < 1) {
            setTimeout(() => {
                resolve(waitForModalContainer(modal, counter));
            }, 100);
        } else {
            const isEmoteModal = await lookForEmoteClass(emotesContainer);

            if (isEmoteModal) {
                resolve(emotesContainer);
            } else {
                reject();
            }
        }
    });
};
