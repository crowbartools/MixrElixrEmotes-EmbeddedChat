import { MaxSize } from './enums';

/**
 *  Data representing a Mixer channel
 */
export interface IMixerChannel {
    /** The channels ID */
    id: number;
    /** The channels name */
    token: string;
}

/**
 *  An Elixr Emote
 */
export interface IElixrEmote {
    /** The Emotes ID */
    id: string;
    /** The text code that should be replaced in a chat message with the emote */
    code: string;
    /** Whether or not this emote is animated */
    animated: boolean;
    /** The max size of the emote (24/30/50) */
    maxSize: MaxSize;
}

/**
 *  Response to the elixr API GET emotes call
 */
export interface IGetEmotesResponse {
    /** ID of the channel */
    channelId: number;
    /** Array of channel emotes */
    channelEmotes: IElixrEmote[];
    /** Array of global emotes */
    globalEmotes: IElixrEmote[];
    /** URL template for channel emotes */
    channelEmoteUrlTemplate: string;
    /** URL template for global emotes */
    globalEmoteUrlTemplate: string;
}

/**
 *  The state store for Elixr Emotes
 */
export interface IElixrStore {
    /** Mixer channel data */
    channel: IMixerChannel;
    /** URL template for channel emotes */
    channelEmotes: IElixrEmote[];
    /** Array of global emotes */
    globalEmotes: IElixrEmote[];
    /** URL template for channel emotes */
    channelEmoteUrlTemplate: string;
    /** URL template for global emotes */
    globalEmoteUrlTemplate: string;
}