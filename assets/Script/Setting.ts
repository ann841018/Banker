import AudioManager from "./AudioManager";
import Client from "./Core/Client";
import { Util as ut } from "./Core/Util";
import GlobalDef from "./Lib/GlobalDef";
import Count from "./Count";
import Info from "./Info";
import Main from "./Main";
import ErrorCode from "./PopUp/ErrorCode";
import { thousandComma } from "./Math";
const { ccclass, property } = cc._decorator;
interface TableID { room_id: number; }
interface PostURL { state: string, url: string }
@ccclass
export default class Setting extends cc.Component {
    private static instance: Setting;
    public static getInstance(): Setting {
        if (this.instance == null) { this.instance = new Setting(); }
        return this.instance;
    }
    public static TableID: TableID = null;
    public static postURL: PostURL;
    private BackBtn: cc.Node = null;
    public StartBtn: cc.Node = null;
    public ShowBtn: cc.Node = null;
    public StopBtn: cc.Node = null;
    public TimeLeft: cc.Node = null;
    private Marquee: cc.Node = null;
    public CardCount: cc.Node = null;
    public Message: string = "";
    public CountDown: number = 30;
    public timer;

    onLoad() { Setting.instance = this; Setting.TableID = { room_id: 0 }; }

    start() {
        Client.getInstance().login();
        this.CardCount = this.node.getChildByName("CardCount").getChildByName("Text");
        this.ShowBtn = this.node.parent.getChildByName("Middle").getChildByName("Show");
        this.TimeLeft = this.node.getChildByName("TimeLeft").getChildByName("Text");
        this.BackBtn = this.node.getChildByName("Back");
        this.StartBtn = this.node.getChildByName("Open");
        this.StopBtn = this.node.getChildByName("Stop");
        this.Marquee = this.node.parent.getChildByName("BackGround").getChildByName("Marquee").getChildByName("Text");
        this.Message = "請開局";
        Setting.postURL = { state: "", url: "" };
        window.addEventListener("message", (info) => { GlobalDef.token = info.data; });
        this.BtnEvent();
    }

    BtnEvent() {
        this.BackBtn.on('click', () => {
            AudioManager.getInstance().PlayAudio("Btn_Open");
            this.Jump("lobby_banker", (info) => {
                Setting.postURL = { state: "lobby_banker", url: info.data.url };
                Client.getInstance().send("livebaijiale", "baijiadealer.Leave", Setting.TableID, (resp, err) => {
                    if (!err) { parent.postMessage(Setting.postURL, "*"); }
                    else ErrorCode.getInstance().ErrorInfo(err);
                });
            });
        });
        this.StartBtn.on('click', () => {
            Client.getInstance().send("livebaijiale", "baijiadealer.NextStage", Setting.TableID, (resp, err) => {
                if (err) {
                    if (err == "太頻繁的請求") Count.getInstance().ReSend();
                    else ErrorCode.getInstance().ErrorInfo(err);
                }
            });
            Main.getInstance().StartBtn();
            if (GlobalDef.VipRoom == true) { this.StopBtn.active = true; }
            else { this.CountDown = 30; this.StartCountDown(); }
        });
        this.StopBtn.on('click', () => {
            Client.getInstance().send("livebaijiale", "baijiadealer.NextStage", Setting.TableID, (resp, err) => {
                if (err) {
                    if (err == "太頻繁的請求") Count.getInstance().ReSend();
                    else ErrorCode.getInstance().ErrorInfo(err);
                }
            });
            this.Stop();
        });
    }

    Reset() {//重置
        AudioManager.getInstance().PlayAudio("Btn_Click");
        this.Message = "請開局";
        this.StartBtn.active = false;
        clearTimeout(this.timer);
        this.CountDown = 30;
        this.TimeLeft.getComponent(cc.Label).string = this.CountDown.toString();
        this.TimeLeft.color = cc.color(255, 255, 255);
        this.StopBtn.active = false;
    }

    StopPeek() {//掃完還沒送
        if (Count.getInstance().isShow == false) {
            if (Main.getInstance().CanShow[0] == true && Main.getInstance().CanShow[1] == true && Main.getInstance().CanShow[2] == true && Main.getInstance().CanShow[3] == true)
                this.Message = "請按下驗牌，或置入結果(更改錯誤)";
        } else {
            if (Main.getInstance().CanShow[4] == true && Main.getInstance().CanShow[5] == true) this.Message = "請更改置入錯誤牌的牌面";
        }
    }
    Stop() {//停止下注
        clearTimeout(this.timer);
        this.Message = "請抽4張牌";//按下掃描，並到牌盒
        AudioManager.getInstance().PlayAudio("Btn_Click");
        Main.getInstance().InputPanel.parent.getChildByName("FakeInput").active = false;
        Main.getInstance().InputPanel.active = true;
        Main.getInstance().InputPanel.getComponent(cc.EditBox).focus();
        this.StopBtn.active = false;
        this.CountDown = 1;
    }
    TimesUp() {//倒數完
        AudioManager.getInstance().PlayBGSE("CountDownStop");
        this.CountDown = 0;
        this.TimeLeft.getComponent(cc.Label).string = this.CountDown.toString();
        this.Stop();
    }

    StartCountDown() {//開始倒數
        this.Message = "開放下注中...";
        this.StartBtn.active = false;
        this.ShowBtn.active = false;
        if (this.CountDown > 0) this.ShowCountDown();
        else this.TimesUp();
    }

    ShowCountDown() {//倒數的數字UI
        this.TimeLeft.getComponent(cc.Label).string = this.CountDown.toString();
        if (this.CountDown <= 3) this.TimeLeft.color = cc.color(255, 0, 0);
        else if (this.CountDown <= 10) this.TimeLeft.color = cc.color(255, 255, 0);
        else this.TimeLeft.color = cc.color(255, 255, 255);
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            if (this.CountDown > 0) {
                this.CountDown = this.CountDown - 1;
                AudioManager.getInstance().PlayBGSE("CountDown");
                this.ShowCountDown();
            } else { this.CountDown = 0; }
        }, 1000);
    }

    EnterTable() {//入桌
        let Text = this.node.getChildByName("Channel").getChildByName("Info").getChildByName("Text")
        Text.getComponent(cc.Label).string = "已進入桌號 : " + GlobalDef.TableNumber;
        Setting.TableID = { room_id: GlobalDef.TableNumber };
        Client.getInstance().send("livebaijiale", "baijiadealer.ApplyDealer", Setting.TableID, (resp, err) => {
            if (err) ErrorCode.getInstance().ErrorInfo(err, false, true);
            else {
                GlobalDef.GameNumber = resp.ju_count;
                GlobalDef.DeckNumber = resp.paixuehao
                GlobalDef.MixNumber = resp.juhao_mix;
                GlobalDef.VipRoom = resp.type;
                if (GlobalDef.VipRoom == true) {
                    this.node.getChildByName("FakeStop").active = true;
                    this.node.getChildByName("TimeLeft").active = false;
                }
                for (let i = 0; i < 6; i++) {
                    if (resp.seats.settle_player_bets[i] != null) {
                        let Seat = Count.getInstance().PlayerSeat[i];
                        let Info = resp.seats.settle_player_bets[i];
                        Seat.active = true;
                        Count.getInstance().PlayerID[i] = Info.id;
                        Seat.getChildByName("ID").getComponent(cc.Label).string = Info.nickname;
                        Seat.getChildByName("Money").getComponent(cc.Label).string = thousandComma(Info.gold / 10000);
                        Seat.getChildByName("BetPlayer").active = Info.player_bets[2];
                        Seat.getChildByName("BetBanker").active = Info.player_bets[3];
                        Seat.getChildByName("BetPlayer").getChildByName("BetMoney").getComponent(cc.Label).string = (Info.player_bets[2] / 10000).toString();
                        Seat.getChildByName("BetBanker").getChildByName("BetMoney").getComponent(cc.Label).string = (Info.player_bets[3] / 10000).toString();
                        if (resp.seats.max_xian_index == i) Seat.getChildByName("BetPlayerBtn").active = true;
                        else Seat.getChildByName("BetPlayerBtn").active = false;
                        if (resp.seats.max_zhuang_index == i) Seat.getChildByName("BetBankerBtn").active = true;
                        else Seat.getChildByName("BetBankerBtn").active = false;
                    }
                }
                Info.getInstance().Show();
            }
        });
    }
    update() { this.Marquee.getComponent(cc.Label).string = this.Message; }//提示訊息

    Jump(platform: string, okCB: Function) {//更新token
        parent.postMessage("retoken", "*");
        setTimeout(() => {
            this.GetUrl(`${GlobalDef.loginServer}/game_router/jump`, platform, okCB);
        }, 500)
    }

    GetUrl(url: string, platform: string, okCB) {//跳轉
        ut.httpRequest({
            url: url,
            method: "POST",
            params: { destination: platform, token: GlobalDef.token, },
            ok: (msg) => {
                let info = JSON.parse(msg);
                if (okCB) { okCB(info); }
                if (!info.Err) { }
            },
            error: (err) => { ErrorCode.getInstance().ErrorInfo(err); }
        });
    }
}
