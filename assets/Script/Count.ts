import AudioManager from "./AudioManager";
import Cards from "./Cards";
import Client from "./Core/Client";
import Main from "./Main";
import ErrorCode from "./PopUp/ErrorCode";
import Setting from "./Setting";
interface CardScan {
    zhuang_cards: [{
        "color": number,
        "point": number
    }, {
        "color": number,
        "point": number
    }],
    xian_cards: [{
        "color": number,
        "point": number
    }, {
        "color": number,
        "point": number
    }],
}
const { ccclass, property } = cc._decorator;
@ccclass
export default class Count extends cc.Component {
    private static instance: Count;
    public static getInstance(): Count {
        if (this.instance == null) { this.instance = new Count(); }
        return this.instance;
    }
    private CardScan: CardScan = null;
    public BankerPoint: number = 0;
    public PlayerPoint: number = 0;

    private TopBanker: cc.Node = null;
    private TopPlayer: cc.Node = null;
    private TopTie: cc.Node = null;
    private TopBPair: cc.Node = null;
    private TopPPair: cc.Node = null;
    private TopLucky: cc.Node = null;

    public PlayerSeat: Array<cc.Node> = [];
    public PlayerSeatBtn: Array<cc.Node> = [];
    public PlayerID: Array<number> = [0, 0, 0, 0, 0, 0];

    private BottomBanker: cc.Node = null;
    private BottomPlayer: cc.Node = null;
    public CheckBtn: cc.Node = null;
    private ShowBtn: cc.Node = null;
    private BottomBtn: cc.Node = null;

    public isShow: boolean = false;
    public temPlayer: number;
    public plusStr: string = "";
    public isFinish: boolean = false;

    private WinNum: number;
    public SendCard: number = 4;
    public IsNormal: boolean = false;
    private IsResult: boolean = false;

    start() {
        Count.instance = this;
        let light = this.node.parent.getChildByName("Middle").getChildByName("Light");
        this.CheckBtn = this.node.parent.getChildByName("Middle").getChildByName("Check");
        this.ShowBtn = this.node.parent.getChildByName("Middle").getChildByName("Show");
        this.BottomBtn = this.node.parent.getChildByName("Middle").getChildByName("Bottom");

        this.PlayerSeat = this.node.getChildByName("Seat").children;
        this.TopBanker = light.getChildByName("Banker");
        this.TopPlayer = light.getChildByName("Player");
        this.TopTie = light.getChildByName("Tie");
        this.TopBPair = light.getChildByName("BankerPair");
        this.TopPPair = light.getChildByName("PlayerPair");
        this.TopLucky = light.getChildByName("Lucky");

        this.BottomBanker = this.BottomBtn.getChildByName("Banker");
        this.BottomPlayer = this.BottomBtn.getChildByName("Player");

        for (let i = 0; i < 6; i++) {
            this.PlayerSeat[i].getChildByName("ClearBtn").on('click', () => {
                let Player = { player_id: 0 };
                Player.player_id = this.PlayerID[i];
                Client.getInstance().send("livebaijiale", "baijiadealer.KickOutSeat", Player, (resp, err) => {
                    this.ResetSeat(i, false);
                });
            });
        }
        this.CheckBtn.on('click', () => { this.IsNormal = true; this.Check(); });
        this.ShowBtn.on('click', () => { this.IsNormal = true; this.Show(); });
        this.CardScan = { zhuang_cards: [{ color: 0, point: 0 }, { color: 0, point: 0 }], xian_cards: [{ color: 0, point: 0 }, { color: 0, point: 0 }] };
        this.ShowPoint();
    }

    ResetSeat(i: number, HavePlayer: boolean = true) {//入座的玩家重置
        if (HavePlayer == false) {
            this.PlayerSeat[i].active = false;
            this.PlayerSeat[i].getChildByName("ID").getComponent(cc.Label).string = "";
            this.PlayerSeat[i].getChildByName("Money").getComponent(cc.Label).string = "";
        }
        this.PlayerSeat[i].getChildByName("BetPlayer").getChildByName("BetMoney").getComponent(cc.Label).string = "";
        this.PlayerSeat[i].getChildByName("BetBanker").getChildByName("BetMoney").getComponent(cc.Label).string = "";
        this.PlayerSeat[i].getChildByName("BetPlayer").active = false;
        this.PlayerSeat[i].getChildByName("BetBanker").active = false;
        this.PlayerSeat[i].getChildByName("BetPlayerBtn").active = false;
        this.PlayerSeat[i].getChildByName("BetBankerBtn").active = false;
    }

    Check() {//驗牌
        let len = Cards.CardsArr.length;
        for (let i = 0; i <= len - 1; i++) { Cards.getInstance().LoadCard(i, Cards.CardsArr[i]); }
        for (let j = 4; j > len; j--) { Cards.getInstance().LoadCard(j - 1, "00"); Cards.getInstance().SmallCards[j - 1].active = true; }
        if (len == 4) { Cards.getInstance().SmallCards[4].active = false; Cards.getInstance().SmallCards[5].active = false; }
        if (this.temPlayer == 1) {//閒補
            Cards.getInstance().SmallCards[4].active = true;
            Cards.getInstance().SmallCards[4].getComponent(cc.Toggle).enabled = true;
        }
        if (this.temPlayer == 2) {//莊補
            Cards.getInstance().SmallCards[5].active = true;
            Cards.getInstance().SmallCards[5].getComponent(cc.Toggle).enabled = true;
        }
        if (this.temPlayer == 3) {//一起補
            Cards.getInstance().SmallCards[4].active = true; Cards.getInstance().SmallCards[5].active = true;
            Cards.getInstance().SmallCards[4].getComponent(cc.Toggle).enabled = true;
            Cards.getInstance().SmallCards[5].getComponent(cc.Toggle).enabled = true;
        }
        this.CheckBtn.active = false;
        if (this.isShow == false) { if (Main.getInstance().CanShow[0] == true && Main.getInstance().CanShow[1] == true && Main.getInstance().CanShow[2] == true && Main.getInstance().CanShow[3] == true) Setting.getInstance().ShowBtn.active = true; }
        else { if (Main.getInstance().CanShow[4] == true && Main.getInstance().CanShow[5] == true) Setting.getInstance().ShowBtn.active = true; }
        Main.getInstance().InputPanel.active = false;
        Main.getInstance().InputPanel.parent.getChildByName("FakeInput").active = true;
        this.node.parent.getChildByName("Middle").getChildByName("Input").active = true;
        this.plusStr = "";
    }

    Show() {//現牌
        AudioManager.getInstance().PlayAudio("Btn_Click");
        let len = 4;
        this.ShowPoint();
        this.ShowBtn.active = false;
        this.ShowBtn.parent.getChildByName("Input").active = false;
        Main.getInstance().InputPanel.active = true;
        Main.getInstance().InputPanel.parent.getChildByName("FakeInput").active = false;
        let color = []; let point = [];
        for (let i = 0; i < Cards.CardsArr.length; i++) {
            color[i] = Cards.CardsArr[i].slice(0, 1);
            point[i] = Cards.CardsArr[i].slice(1, 2);
            if (color[i] == "S") color[i] = 1;
            if (color[i] == "H") color[i] = 2;
            if (color[i] == "D") color[i] = 3;
            if (color[i] == "C") color[i] = 4;
            if (point[i] == "A") point[i] = 10;
            if (point[i] == "B") point[i] = 11;
            if (point[i] == "C") point[i] = 12;
            if (point[i] == "D") point[i] = 13;
            point[i] = parseInt(point[i]);
        }
        if (this.isShow == false) {
            this.CardScan.xian_cards[0].color = color[0];
            this.CardScan.xian_cards[0].point = point[0];
            this.CardScan.zhuang_cards[0].color = color[1];
            this.CardScan.zhuang_cards[0].point = point[1];

            this.CardScan.xian_cards[1].color = color[2];
            this.CardScan.xian_cards[1].point = point[2];
            this.CardScan.zhuang_cards[1].color = color[3];
            this.CardScan.zhuang_cards[1].point = point[3];

            this.isShow = true;
            Cards.CardsArr.length = 4;
            for (let i = 0; i < 4; i++) {
                Cards.getInstance().SmallCards[i].getComponent(cc.Toggle).isChecked = false;
                Cards.getInstance().SmallCards[i].getComponent(cc.Toggle).enabled = false;
                Cards.getInstance().SmallCards[4].getComponent(cc.Toggle).enabled = true;
                Cards.getInstance().LoadCard(4, "00");
                Cards.getInstance().LoadCard(5, "00");
            }
        }
        else {
            this.SendCard = this.SendCard + 1; len = this.SendCard;
            if (this.temPlayer == 1) {
                this.CardScan.xian_cards[0].color = color[4];
                this.CardScan.xian_cards[0].point = point[4];
                Cards.getInstance().SmallCards[4].getComponent(cc.Toggle).enabled = true;
            }
            if (this.temPlayer == 2) {
                this.CardScan.zhuang_cards[0].color = color[5];
                this.CardScan.zhuang_cards[0].point = point[5];
                Cards.getInstance().SmallCards[4].getComponent(cc.Toggle).isChecked = false;
                Cards.getInstance().SmallCards[4].getComponent(cc.Toggle).enabled = false;
                Cards.getInstance().SmallCards[5].getComponent(cc.Toggle).enabled = true;
            }
            if (this.temPlayer == 3) {
                this.CardScan.xian_cards[0].color = color[4];
                this.CardScan.xian_cards[0].point = point[4];
                this.CardScan.zhuang_cards[0].color = color[5];
                this.CardScan.zhuang_cards[0].point = point[5];
                Cards.getInstance().SmallCards[4].getComponent(cc.Toggle).enabled = true;
                Cards.getInstance().SmallCards[5].getComponent(cc.Toggle).enabled = true;
            }
            this.CardScan.xian_cards[1].color = 0;
            this.CardScan.xian_cards[1].point = 0;
            this.CardScan.zhuang_cards[1].color = 0;
            this.CardScan.zhuang_cards[1].point = 0;
            Setting.getInstance().Message = this.plusStr;
        }
        if (this.IsNormal == true) {
            Client.getInstance().send("livebaijiale", "baijiadealer.ScanCard", this.CardScan, (resp, err) => {//QAQ是否更改現牌功能
                if (err) {
                    if (err == "逼逼！ 現在狀態是 押注 不能掃牌和換牌") ErrorCode.getInstance().ErrorInfo(err);
                    else {
                        ErrorCode.getInstance().ErrorInfo("異常的掃牌，請更改置入錯誤牌的牌面");
                        Cards.getInstance().node.getChildByName("FakeShow").getChildByName("Text").getComponent(cc.Label).string = "遞交";
                    }
                    this.CardScan = { zhuang_cards: [{ color: 0, point: 0 }, { color: 0, point: 0 }], xian_cards: [{ color: 0, point: 0 }, { color: 0, point: 0 }] };
                    Main.getInstance().InputPanel.active = true;
                    if (err.includes("異常的掃牌, 你應該傳 1 張莊 1 張閒")) {
                        this.SendCard = 4; Cards.CardsArr.length = 4;
                        Main.getInstance().CanShow[4] = false;
                        Main.getInstance().CanShow[5] = false;
                        Cards.getInstance().LoadCard(4, "00");
                        Cards.getInstance().LoadCard(5, "00");
                        Cards.getInstance().SmallCards[4].getComponent(cc.Toggle).enabled = true;
                        Cards.getInstance().SmallCards[5].getComponent(cc.Toggle).enabled = true;
                        this.plusStr = "補兩張，請按下掃描"; this.temPlayer = 3;
                    } else if (err.includes("閒")) {
                        this.SendCard = 4; Cards.CardsArr.length = 4;
                        this.temPlayer = 1;
                        Main.getInstance().CanShow[4] = false;
                        Main.getInstance().CanShow[5] = true;
                        Cards.getInstance().LoadCard(4, "00");
                        Cards.getInstance().LoadCard(5, "00");
                        this.plusStr = "閑家補一張，請按下掃描";
                    } else if (err.includes("莊")) {
                        this.temPlayer = 2;
                        Main.getInstance().CanShow[4] = true;
                        Main.getInstance().CanShow[5] = false;
                        Cards.getInstance().LoadCard(5, "00");
                        this.plusStr = "庄家補一張，請按下掃描";
                    } else {
                        this.isShow = false;
                        Cards.CardsArr = [];
                        for (let i = 0; i < 6; i++) {
                            Cards.getInstance().LoadCard(i, "00");
                            for (let i = 0; i < 4; i++) {
                                Cards.getInstance().SmallCards[i].getComponent(cc.Toggle).isChecked = false;
                                Cards.getInstance().SmallCards[i].getComponent(cc.Toggle).enabled = true;
                                Cards.getInstance().SmallCards[4].getComponent(cc.Toggle).enabled = false;
                                Cards.getInstance().SmallCards[5].getComponent(cc.Toggle).enabled = false;
                            }
                        }
                    }
                    Setting.getInstance().Message = this.plusStr;
                } else {
                    this.CardScan.xian_cards[0].color = 0;
                    this.CardScan.xian_cards[0].point = 0;
                    this.CardScan.zhuang_cards[0].color = 0;
                    this.CardScan.zhuang_cards[0].point = 0;
                    this.PlayerPoint = resp.xian_total;
                    this.BankerPoint = resp.zhuang_total;
                    this.ShowPoint();
                    if (resp.bu_pai_name == "莊補") {
                        this.plusStr = "庄家補一張，請按下掃描";
                        this.temPlayer = 2;
                        Main.getInstance().CanShow[4] = true;
                        Main.getInstance().CanShow[5] = false;
                    }
                    if (resp.bu_pai_name == "閒補") {
                        this.plusStr = "閑家補一張，請按下掃描";
                        this.temPlayer = 1;
                        Main.getInstance().CanShow[4] = false;
                        Main.getInstance().CanShow[5] = true;
                    }
                    if (resp.bu_pai_name == "補閒補莊") {
                        this.plusStr = "補兩張，請按下掃描";
                        this.temPlayer = 3;
                        Main.getInstance().CanShow[4] = false;
                        Main.getInstance().CanShow[5] = false;
                        Cards.getInstance().SmallCards[5].getComponent(cc.Toggle).enabled = true;
                    }//一起補
                    if (len == 4) if (resp.bu_pai_name == "莊補") { Cards.CardsArr[4] = "00"; this.SendCard = 5; this.temPlayer = 2; }
                    if (resp.bu_pai_name == "不補") {
                        this.BottomResult();
                        Main.getInstance().InputPanel.active = false;
                        Main.getInstance().InputPanel.parent.getChildByName("FakeInput").active = true;
                        setTimeout(() => {
                            Client.getInstance().send("livebaijiale", "baijiadealer.NextStage", Setting.TableID, (resp, err) => {
                                this.IsResult = true;
                                if (err) {
                                    if (err == "太頻繁的請求") this.ReSend();
                                    else ErrorCode.getInstance().ErrorInfo(err);
                                } else { this.Result(); }
                            });
                        }, 1000);
                    }
                    Setting.getInstance().Message = this.plusStr;
                }
            });
        } else {
            for (let i = 0; i < 4; i++) {//QAQ改成全部都可以改
                Cards.getInstance().SmallCards[i].getComponent(cc.Toggle).isChecked = false;
                Cards.getInstance().SmallCards[i].getComponent(cc.Toggle).enabled = false;
                Main.getInstance().CanShow[i] = true;
            }
            if (this.SendCard > Cards.CardsArr.length) this.SendCard = Cards.CardsArr.length;
            if (this.SendCard == 4 && len == 6) {
                Cards.CardsArr[4] = "00";
                Cards.CardsArr.length = 5;
                Cards.getInstance().LoadCard(4, "00");
                len = 5;
                this.temPlayer = 2;
            }
            Cards.getInstance().SmallCards[this.SendCard].getComponent(cc.Toggle).enabled = true;
        }
    }

    ShowPoint() {//點數
        this.BottomPlayer.getComponent(cc.Label).string = this.PlayerPoint.toString();
        this.BottomBanker.getComponent(cc.Label).string = this.BankerPoint.toString();
    }

    BottomResult() {//輸贏結果判斷
        this.BottomBtn.width = 1000; this.BottomBtn.height = 80;
        if (this.PlayerPoint > this.BankerPoint) { this.WinNum = 1; }
        else if (this.PlayerPoint < this.BankerPoint) { this.WinNum = 0; }
        else if (this.PlayerPoint == this.BankerPoint) { this.WinNum = 2; }
    }

    Result() {//結果
        this.IsResult = false;
        AudioManager.getInstance().PlayAudio("Btn_Click");
        this.isFinish = true;
        this.SendCard = 4;
        this.BottomBtn.width = 0; this.BottomBtn.height = 0;
        if (this.WinNum == 1) { this.plusStr = "閑家 勝"; }
        else if (this.WinNum == 0) { this.plusStr = "庄家 勝"; }
        else if (this.WinNum == 2) { this.plusStr = "和局"; }
        Main.CanReset = true;
        let ClearBtn = cc.find("Right").getChildByName("Clear").getComponentInChildren(cc.Label);
        ClearBtn.string = "新局";
        Client.getInstance().send("livebaijiale", "baijiadealer.NextStage", Setting.TableID, (resp, err) => {
            if (err) {
                if (err == "太頻繁的請求") this.ReSend();
                else ErrorCode.getInstance().ErrorInfo(err);
            }
        });
        Main.getInstance().testBtn.active = true;
        Main.getInstance().newCard.active = true;
        Setting.getInstance().Message = this.plusStr;
    }

    Reset() {//重置
        let light = this.node.parent.getChildByName("Middle").getChildByName("Light");
        for (let i = 0; i < 6; i++) {
            light.children[i].active = false;
            cc.find("Middle").getChildByName("Top").children[i].getChildByName("Bet").getComponent(cc.Label).string = "0";
        }
        this.CardScan = {
            zhuang_cards: [{ color: 0, point: 0 }, { color: 0, point: 0 }],
            xian_cards: [{ color: 0, point: 0 }, { color: 0, point: 0 }]
        };
        this.isShow = false;
        this.PlayerPoint = 0; this.BankerPoint = 0;
        this.BottomBtn.width = 0; this.BottomBtn.height = 0;
        this.CheckBtn.active = false;
        this.ShowBtn.active = false;
        this.ShowBtn.parent.getChildByName("Input").active = false;
        this.ShowBtn.parent.getChildByName("FakeInput").active = true;
        this.ShowBtn.parent.getChildByName("FakeShow").active = true;
        this.ShowPoint();
    }

    ResultLight(Light: Array<any>) {//燈號
        this.TopPPair.active = Light[0];
        this.TopBPair.active = Light[1];
        this.TopPlayer.active = Light[2];
        this.TopBanker.active = Light[3];
        this.TopTie.active = Light[4];
        this.TopLucky.active = Light[5];
    }

    ReSend() {//沒過重發
        setTimeout(() => {
            Client.getInstance().send("livebaijiale", "baijiadealer.NextStage", Setting.TableID, (resp, err) => {
                if (err) {
                    if (err == "太頻繁的請求") this.ReSend();
                    else ErrorCode.getInstance().ErrorInfo(err);
                } else { if (this.IsResult == true) this.Result(); }
            });
        }, 1000);
    }
}