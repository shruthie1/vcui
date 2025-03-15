export interface ClientData {
    name: string;
    username: string;
    clientId: string;
    repl: string;
    dbcoll: string;
}

export type VideoListType = Array<string>;

export interface UserData {
    chatId: string;
    username: string;
    payAmount: number;
    demoGiven: boolean;
    secondShow: boolean;
    fullShow: number;
    videos: VideoListType;
    highestPayAmount: number;
    callTime: number;
    canReply: number;
    count: number;
    profile: string;
    limitTime?: number;
    paidReply?: boolean;
}

export interface PaymentStats {
    paid: number;
    demoGiven: number;
    secondShow: number;
    fullShow: number;
    latestCallTime: number;
    videos: number[];
}

export interface VideoDetails {
    duration: number;
    time: number;
}

export interface VideoDetailsMap {
    [key: string]: VideoDetails;
}

export interface NetworkConnection {
    downlink: number;
    effectiveType: string;
    rtt?: number;
    saveData?: boolean;
    type?: string;
}

export type CallState = 'idle' | 'connecting' | 'ringing' | 'playing' | 'disconnecting';