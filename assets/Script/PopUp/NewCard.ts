import AudioManager from "../AudioManager";
import Client from "../Core/Client";
import GlobalDef from "../Lib/GlobalDef";
import ErrorCode from "./ErrorCode";

const { ccclass, property } = cc._decorator;
interface SendCard {
    "ju_hao": number,
    "xue_hao": string,
    "color": number,
    "point": number
    "memo": string
}
@ccclass
export default class NewCard extends cc.Component {
    @property(cc.Prefab) NewCard: cc.Prefab = null;
    private SendCard: SendCard;
    private ConfirmBtn: cc.Node = null;
    private CloseBtn: cc.Node = null;
    private FinishBtn: cc.Node = null;
    private ScanPanel: cc.Node = null;
    private FirstCard: cc.Node = null;
    private NumStr: cc.Node = null;
    private Input: cc.Node = null;
    private Scan: cc.Node = null;
    private DeleteCount: number = 0;
    private SpaceCount: number = 0;

    start() {
        this.ConfirmBtn = this.node.getChildByName("Confirm");
        this.CloseBtn = this.node.getChildByName("Close");
        this.Input = this.node.getChildByName("Input");
        this.FirstCard = this.node.getChildByName("Card");
        this.ScanPanel = this.node.getChildByName("Scan");
        this.Scan = this.ScanPanel.getChildByName("Input");
        this.NumStr = this.ScanPanel.getChildByName("Num");
        this.FinishBtn = this.ScanPanel.getChildByName("Finish");
        this.FinishBtn.active = false;
        this.BtnEvent();
        this.SendCard = { "ju_hao": 0, "xue_hao": "", "color": 0, "point": 0, "memo": "" };
    }

    BtnEvent() {
        this.ConfirmBtn.on('click', () => { this.StartChange(); });
        this.CloseBtn.on('click', () => { AudioManager.getInstance().PlayAudio("Btn_Input"); this.node.active = false; });
        this.FinishBtn.on('click', () => { this.Reset(); });
        this.Input.on('editing-did-began', () => { AudioManager.getInstance().PlayAudio("Btn_Click"); });
        this.Input.on('text-changed', () => { this.Enter(); });
        this.Scan.on('text-changed', () => { this.ScanDelete(); });
        this.Scan.on('editing-did-began', () => {
            AudioManager.getInstance().PlayAudio("Btn_Click");
            this.ScanPanel.getChildByName("FakeFinish").active = true;
            this.ScanPanel.getChildByName("Layout").opacity = 255;
            this.ScanPanel.setPosition(0, 0);
            this.Scan.getChildByName("Shine").active = true;
            this.FirstCard.active = false;
        });
        this.Scan.on('editing-did-ended', () => { this.Scan.getChildByName("Shine").active = false; });
    }

    Enter() {//掃描
        let InputCard = this.Input.getComponent(cc.EditBox).string;
        let tem = InputCard.slice(InputCard.length - 2);
        if (tem.includes("\n") == false && tem.length == 2) {
            AudioManager.getInstance().PlayAudio("Btn_Scan");
            this.LoadCard(tem);
            let temNum: any = InputCard.slice(InputCard.length - 1);
            if (temNum < 10) { }
            else temNum = 10;
            this.DeleteCount = temNum;
            this.ScanCount();
            this.Input.active = false;
            this.ScanPanel.setPosition(130, 0);
            this.ScanPanel.active = true;
            this.Send(tem);
        }
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
        this.SendCard.memo = "Delete";
        this.SendCard.ju_hao = GlobalDef.GameNumber;
        this.SendCard.xue_hao = GlobalDef.MixNumber;
        Client.getInstance().send("livebaijiale", "baijiadealer.ScanCardLog", this.SendCard, (resp, err) => { if (err) ErrorCode.getInstance().ErrorInfo(err); });
    }

    StartChange() {//換牌盒
        AudioManager.getInstance().PlayAudio("Btn_Click");
        let room = { "room_id": GlobalDef.TableNumber };
        Client.getInstance().send("livebaijiale", "baijiadealer.ChangeNewDeck", room, (resp, err) => {
            if (err) ErrorCode.getInstance().ErrorInfo(err);
            else {
                this.ConfirmBtn.active = false;
                this.CloseBtn.active = false;
                this.Input.active = true;
                this.FirstCard.active = true;
                GlobalDef.GameNumber = 1;
            }
        });
    }

    ScanCount() {//掃第一張
        this.NumStr.getComponent(cc.Label).string = this.DeleteCount.toString();
        let Container = this.ScanPanel.getChildByName("Layout");
        let Empty = [];
        this.SpaceCount = 0;
        if (this.DeleteCount % 5 != 0) {
            this.SpaceCount = (5 - this.DeleteCount % 5);
            for (let i = 0; i < this.SpaceCount; i++) {
                Empty[i] = cc.instantiate(this.NewCard);
                Empty[i].getComponent(cc.Sprite).enabled = false;
                Container.addChild(Empty[i]);
            }
        }
        for (let i = 0; i < this.DeleteCount; i++) {
            let ScanNode = cc.instantiate(this.NewCard);
            Container.addChild(ScanNode);
        }
    }

    ScanDelete() {//要燒的牌
        this.ScanPanel.getChildByName("FakeFinish").active = true;
        let temStr = this.Scan.getComponent(cc.EditBox).string;
        let tem = temStr.slice(temStr.length - 2);
        let Container = this.ScanPanel.getChildByName("Layout");
        if (tem.includes("\n") == false && tem.length == 2) {
            AudioManager.getInstance().PlayAudio("Btn_Scan");
            this.DeleteCount = this.DeleteCount - 1;
            this.NumStr.getComponent(cc.Label).string = this.DeleteCount.toString();
            Container.children[this.DeleteCount + this.SpaceCount].getChildByName("ShowCard").active = true;
            temStr = tem;
            if (this.DeleteCount == 0) {
                this.ScanPanel.getChildByName("FakeScan").active = true;
                this.ScanPanel.getChildByName("FakeFinish").active = false;
                this.FinishBtn.active = true;
                this.Scan.active = false;
            }
            this.Send(tem);
        }
    }

    Reset() {//重置
        AudioManager.getInstance().PlayAudio("Btn_Open");
        let Container = this.ScanPanel.getChildByName("Layout");
        for (let i = Container.childrenCount - 1; i >= 0; i--) {
            Container.children[i].destroy();
        }
        this.ScanPanel.getChildByName("Layout").opacity = 0;
        this.ScanPanel.getChildByName("FakeFinish").active = false;
        this.ConfirmBtn.active = true;
        this.CloseBtn.active = true;
        this.FinishBtn.active = false;
        this.Scan.active = true;
        this.ScanPanel.active = false;
        this.node.active = false;
        this.Input.getComponent(cc.EditBox).string = "";
        this.Scan.getComponent(cc.EditBox).string = "";
        this.LoadCard("00");
    }

    LoadCard(CardCode: string): Promise<string> {//讀牌圖檔
        return new Promise<string>((resolve, reject) => {
            cc.assetManager.loadBundle("Art/Cards", (err, bundle) => {
                bundle.load(CardCode, cc.SpriteFrame, (err, assets: any) => {
                    if (err) { ErrorCode.getInstance().ErrorInfo("無法辨識此QR code"); }
                    else {
                        let Sprite;
                        Sprite = this.FirstCard.getComponent(cc.Sprite);
                        Sprite.spriteFrame = assets;
                    }
                });
            });
        });
    }
}
