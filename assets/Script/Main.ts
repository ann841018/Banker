import AudioManager from "./AudioManager";
import Cards from "./Cards";
import Client from "./Core/Client";
import Count from "./Count";
import Info from "./Info";
import GlobalDef from "./Lib/GlobalDef";
import ErrorCode from "./PopUp/ErrorCode";
import KeyBoard from "./PopUp/KeyBoard";
import Setting from "./Setting";
const { ccclass, property } = cc._decorator;
interface SendCard {
    "ju_hao": number,
    "xue_hao": string,
    "color": number,
    "point": number
    "memo": string
}
@ccclass
export default class Main extends cc.Component {
    private static instance: Main;
    public static getInstance(): Main {
        if (this.instance == null) { this.instance = new Main(); }
        return this.instance;
    }
    private SendCard: SendCard;
    public InputPanel: cc.Node = null;
    private OpenBtn: cc.Node = null;
    private ClearBtn: cc.Node = null;
    public newCard: cc.Node = null;
    public testBtn: cc.Node = null;
    private newCardPanel: cc.Node = null;
    private TestPanel: cc.Node = null;
    public TVBtn: cc.Node = null;

    private InputStr: string = "";
    public CanShow: Array<boolean> = [false, false, false, false, false, false];

    public static CanReset: boolean = false;
    start() {
        Main.instance = this;
        this.OpenBtn = this.node.parent.getChildByName("Right").getChildByName("Open");
        this.ClearBtn = this.node.parent.getChildByName("Right").getChildByName("Clear");
        this.InputPanel = this.node.getChildByName("Input");
        this.newCard = this.node.getChildByName("NewCard");
        this.newCardPanel = this.node.parent.getChildByName("NewCardPanel");
        this.TestPanel = this.node.parent.getChildByName("TestPanel");
        this.testBtn = this.node.getChildByName("Test");
        this.TVBtn = this.node.getChildByName("TV");
        this.SendCard = { "ju_hao": 0, "xue_hao": "", "color": 0, "point": 0, "memo": "" };
        this.BtnEvent();
    }

    BtnEvent() {
        this.ClearBtn.on('click', () => { this.Clear(); });
        this.TVBtn.on('click', () => { this.OpenTV(); });
        this.newCard.on('click', () => {
            AudioManager.getInstance().PlayAudio("Btn_Open");
            this.newCardPanel.active = true;
        });
        this.testBtn.on('click', () => { AudioManager.getInstance().PlayAudio("Btn_Open"); this.TestPanel.active = true; });
        this.InputPanel.on('text-changed', () => { this.Enter(); });
        this.InputPanel.on('editing-did-began', () => {
            this.InputPanel.getChildByName("Color").active = true;
            Setting.getInstance().Message = "請掃描";
        });
        this.InputPanel.on('editing-did-ended', () => { this.ClearTem(); this.InputPanel.getChildByName("Color").active = false; });
    }

    StartBtn() {//開局
        AudioManager.getInstance().PlayAudio("Btn_Click");
        this.newCard.active = false;
        this.testBtn.active = false;
        this.node.getChildByName("FakeNew").active = true;
        this.node.getChildByName("FakeTest").active = true;
        this.Open();
    }

    Open() {//新局
        KeyBoard.State = "";
        Main.CanReset = false;
        Count.getInstance().isFinish = false;
        this.ClearBtn.active = true;
        this.OpenBtn.active = false;
        this.ClearBtn.getComponentInChildren(cc.Label).string = "棄局";
    }

    Send(tem: string) {//給Server記Log
        let color: any; let point: any;
        color = tem.slice(0, 1);
        point = tem.slice(1, 2);
        if (color == "S") color = 1;
        if (color == "H") color = 2;
        if (color == "D") color = 3;
        if (color == "C") color = 4;
        if (point == "A") point = 10;
        if (point == "B") point = 11;
        if (point == "C") point = 12;
        if (point == "D") point = 13;
        point = parseInt(point);
        this.SendCard.color = color;
        this.SendCard.point = point;
        this.SendCard.ju_hao = GlobalDef.GameNumber;
        this.SendCard.xue_hao = GlobalDef.MixNumber;
        if (Cards.CardsArr.length % 2 == 0) this.SendCard.memo = "Banker " + Math.round(Cards.CardsArr.length / 2);
        else this.SendCard.memo = "Player " + Math.round(Cards.CardsArr.length / 2);
        Client.getInstance().send("livebaijiale", "baijiadealer.ScanCardLog", this.SendCard, (resp, err) => {
            if (err) {
                ErrorCode.getInstance().ErrorInfo(err);
                Main.getInstance().CanShow[Cards.CardsArr.length - 1] = false;
                Setting.getInstance().ShowBtn.active = false;
            }
            else {
                if (resp.toString().includes("卡片不合法")) {
                    Main.getInstance().CanShow[Cards.CardsArr.length - 1] = false;
                    Setting.getInstance().ShowBtn.active = false;
                } else Main.getInstance().CanShow[Cards.CardsArr.length - 1] = true;
                if (Cards.CardsArr.length >= 4) {
                    //QAQ新增掃完四張傳Server
                    if (Cards.CardsArr.length == 5 && Count.getInstance().temPlayer == 3) { }
                    else Setting.getInstance().StopPeek();
                }
            }
        });
    }

    Enter() {//掃描//QRCode
        this.InputStr = this.InputPanel.getComponent(cc.EditBox).string;
        this.InputPanel.getChildByName("TEXT_LABEL").opacity = 0;
        let tem = this.InputStr.slice(this.InputStr.length - 2);
        if (tem.includes("\n") == false && tem.length == 2) {
            AudioManager.getInstance().PlayAudio("Btn_Scan");
            if (Cards.CardsArr.length < 6) Cards.CardsArr.push(tem);
            else AudioManager.getInstance().PlayAudio("Btn_Error");
            let len = Cards.CardsArr.length;
            Cards.getInstance().SmallCards[len - 1].active = true;
            Count.getInstance().IsNormal = true;
            Count.getInstance().CheckBtn.active = true;
            if (Count.getInstance().isShow == true) {
                if (Cards.CardsArr.length == 6) {
                    this.InputPanel.active = false;
                    this.InputPanel.getChildByName("Color").active = false;
                    this.node.getChildByName("FakeInput").active = true;
                }
            }
            if (len >= 4) {
                if (Count.getInstance().isShow == false) {
                    AudioManager.getInstance().PlayAudio("Btn_Error");
                    this.InputPanel.active = false;
                    this.InputPanel.getChildByName("Color").active = false;
                    this.node.getChildByName("FakeInput").active = true;
                }
                if (len == 5 && Count.getInstance().temPlayer == 3) { }
                else {
                    if (len == 5) {
                        this.InputPanel.active = false;
                        this.InputPanel.getChildByName("Color").active = false;
                        this.node.getChildByName("FakeInput").active = true;
                    }
                    Count.getInstance().CheckBtn.active = true;
                }
            }
            this.Send(tem);
        }
    }

    ClearTem() { this.InputPanel.getComponent(cc.EditBox).string = ""; }//清除輸入框

    Clear() {//棄局//新局
        AudioManager.getInstance().PlayAudio("Btn_Click");
        if (Main.CanReset == false) {
            Cards.getInstance().ChangeCard = false;
            AudioManager.getInstance().PlayAudio("Btn_Password");
            this.node.parent.getChildByName("PassWord").active = true;
            KeyBoard.State = "Clear";
        } else {
            this.node.getChildByName("FakeNew").active = true;
            this.node.getChildByName("FakeTest").active = true;
            this.ClearBtn.getComponentInChildren(cc.Label).string = "新局";
            this.testBtn.active = false;
            this.newCard.active = false;
            this.InputStr = "";
            this.InputPanel.active = false;
            this.InputPanel.getChildByName("Color").active = false;
            this.InputPanel.parent.getChildByName("FakeInput").active = true;
            this.InputPanel.getComponent(cc.EditBox).string = "";
            this.InputPanel.getChildByName("Text").getComponent(cc.Label).string = "掃描";
            for (let i = 0; i < 6; i++) {
                this.CanShow[i] = false;
                Cards.getInstance().SmallCards[i].getComponent(cc.Toggle).isChecked = false;
                Cards.getInstance().SmallCards[i].getComponent(cc.Toggle).enabled = true;
                Cards.getInstance().SmallCards[4].getComponent(cc.Toggle).enabled = false;
                Cards.getInstance().SmallCards[5].getComponent(cc.Toggle).enabled = false;
                Cards.getInstance().LoadCard(i, "00");
                Cards.getInstance().SmallCards[i].active = false;
            }
            Cards.CardsArr = [];
            Setting.getInstance().Reset();
            Count.getInstance().Reset();
            Count.getInstance().temPlayer = 0;
            for (let i = 0; i < 6; i++) { Count.getInstance().ResetSeat(i); }
            Client.getInstance().send("livebaijiale", "baijiadealer.NextStage", Setting.TableID, (resp, err) => {
                if (err) {
                    if (err == "太頻繁的請求") Count.getInstance().ReSend();
                    else ErrorCode.getInstance().ErrorInfo(err);
                }
            });
            Main.getInstance().StartBtn();
            Cards.getInstance().ChangeCard = false;
            if (GlobalDef.VipRoom == true) { Setting.getInstance().StopBtn.active = true; }
            else {
                Setting.getInstance().CountDown = 30;
                Setting.getInstance().StartCountDown();
            }
            Info.getInstance().Show();
            //Cards.getInstance().node.getChildByName("FakeShow").getChildByName("Text").getComponent(cc.Label).string = "驗牌";
        }
    }

    GiveUpThisRound() {//棄局
        AudioManager.getInstance().PlayAudio("Btn_Click");
        this.node.getChildByName("FakeNew").active = false;
        this.node.getChildByName("FakeTest").active = false;
        this.ClearBtn.active = false;
        this.testBtn.active = true;
        this.newCard.active = true;
        this.InputStr = "";
        this.InputPanel.active = false;
        this.InputPanel.getChildByName("Color").active = false;
        this.InputPanel.parent.getChildByName("FakeInput").active = true;
        this.InputPanel.getComponent(cc.EditBox).string = "";
        this.InputPanel.getChildByName("Text").getComponent(cc.Label).string = "掃描";
        for (let i = 0; i < 6; i++) {
            this.CanShow[i] = true
            Cards.getInstance().SmallCards[i].getComponent(cc.Toggle).isChecked = false;
            Cards.getInstance().SmallCards[i].getComponent(cc.Toggle).enabled = true;
            Cards.getInstance().SmallCards[4].getComponent(cc.Toggle).enabled = false;
            Cards.getInstance().SmallCards[5].getComponent(cc.Toggle).enabled = false;
            Cards.getInstance().LoadCard(i, "00");
            if (Cards.getInstance().SmallCards[i].active = true) {
                Cards.getInstance().SmallCards[i].active = false;
            }
        }
        Cards.CardsArr = [];
        Count.getInstance().temPlayer = 0;
        Count.getInstance().Reset();
        Setting.getInstance().Reset();
        Setting.getInstance().StartBtn.active = true;
        //Cards.getInstance().node.getChildByName("FakeShow").getChildByName("Text").getComponent(cc.Label).string = "驗牌";
    }

    OpenTV() {//開啟大電視
        AudioManager.getInstance().PlayAudio("Btn_Open");
        window.open(GlobalDef.TVIP + "/?id=" + GlobalDef.id);
    }

    InProcess() {//在流程中 不能按其他UI
        this.newCard.active = false;
        this.testBtn.active = false;
        this.OpenBtn.active = false;
        this.ClearBtn.active = true;
        this.node.getChildByName("FakeNew").active = true;
        this.node.getChildByName("FakeTest").active = true;
        this.ClearBtn.getComponentInChildren(cc.Label).string = "棄局";
    }
}