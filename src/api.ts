import axios from 'axios';
import { IMixerChannel, IGetEmotesResponse } from './interfaces';

export async function getChannelData(channelIdOrName: number | string): Promise<IMixerChannel> {
    try {
        const channelResponse = await axios
            .get<IMixerChannel>(`https://mixer.com/api/v1/channels/${channelIdOrName}`);
        return channelResponse.data;
    } catch(error) {
        console.log(error);
        return null;
    }
}

export async function getElixrEmotes(channelId: number): Promise<IGetEmotesResponse> {
    try {
        const channelResponse = await axios
            .get<IGetEmotesResponse>(`https://api.mixrelixr.com/v1/emotes/${channelId}`);
        return channelResponse.data;
    } catch(error) {
        console.log(error);
        return null;
    }
}
