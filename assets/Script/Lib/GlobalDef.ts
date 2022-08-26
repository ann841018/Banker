const { ccclass, property } = cc._decorator;

@ccclass
export default class GlobalDef {
    public static loginServer: string = window.LS_IP;
    public static loginServerWS: string = window.WS_IP;
    public static TVIP: string = window.TV_IP;
    public static DebugMode: boolean = window.DebugMode;
    public static gameVer: string = window.gameVer;

    public static Nickname: string;
    public static id: string;
    public static token: string = "";
    public static tokenBanker: string = "";

    public static VipRoom: boolean;
    public static GameType: string = "百家樂";
    //public static group: number;
    public static TableNumber: number = 0;
    public static GameNumber: number = 0;
    public static DeckNumber: number = 0;
    public static MixNumber: string = "";
}