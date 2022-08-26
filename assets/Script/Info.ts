import GlobalDef from "./Lib/GlobalDef";
import Main from "./Main";
import Setting from "./Setting";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Info extends cc.Component {
    private static instance: Info;
    public static getInstance(): Info {
        if (this.instance == null) { this.instance = new Info(); }
        return this.instance;
    }
    private Version: cc.Node = null;
    private Time: cc.Node = null;
    private BankerID: cc.Node = null;
    private Table: cc.Node = null;
    private GameNumber: cc.Node = null;
    private DeckNumber: cc.Node = null;

    start() {
        Info.instance = this;
        this.Version = this.node.getChildByName("Version");
        this.Time = this.node.getChildByName("Time");
        this.BankerID = this.node.getChildByName("Banker");
        this.Table = this.node.getChildByName("Table");
        this.GameNumber = this.node.getChildByName("Number");
        this.DeckNumber = this.node.getChildByName("Deck");
        this.GetTime();
    }

    Show() {//DownBar資訊
        this.Version.getComponent(cc.Label).string = "v" + GlobalDef.gameVer;
        this.BankerID.getComponent(cc.Label).string = GlobalDef.Nickname;
        this.Table.getComponent(cc.Label).string = GlobalDef.GameType + " 桌號 " + GlobalDef.TableNumber;
        this.GameNumber.getComponent(cc.Label).string = "局號 " + GlobalDef.GameNumber;
        this.DeckNumber.getComponent(cc.Label).string = "靴號 " + GlobalDef.DeckNumber;
    }

    GetTime() {//取得本地時間
        let date = new Date();
        let Hour: any = date.getHours();
        let Minute: any = date.getMinutes();
        let Second: any = date.getSeconds();
        if (Hour < 10) Hour = "0" + Hour;
        if (Minute < 10) Minute = "0" + Minute;
        if (Second < 10) Second = "0" + Second;
        this.Time.getComponent(cc.Label).string = date.toLocaleDateString() + " " + Hour + ":" + Minute + ":" + Second;
        setTimeout(() => { this.GetTime(); }, 1000);
    }
}