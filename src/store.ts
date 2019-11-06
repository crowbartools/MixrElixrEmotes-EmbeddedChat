import { IElixrStore, IMixerChannel, IGetEmotesResponse } from "./interfaces";

import * as api from "./api";

export let stateStore: IElixrStore;

export async function populateState(channelIdOrName: string) {
    const channelData = await api.getChannelData(channelIdOrName);
    const emoteData = await api.getElixrEmotes(channelData.id);
    stateStore = mapChannelAndEmoteDataToStore(channelData, emoteData);
}

function mapChannelAndEmoteDataToStore(channelData: IMixerChannel, emoteData: IGetEmotesResponse): IElixrStore {
    return {
        channel: channelData,
        channelEmotes: emoteData.channelEmotes,
        globalEmotes: emoteData.globalEmotes,
        channelEmoteUrlTemplate: emoteData.channelEmoteUrlTemplate,
        globalEmoteUrlTemplate: emoteData.globalEmoteUrlTemplate
    };
}