import AudioManager from "../AudioManager";
import Client from "../Core/Client";
import GlobalDef from "../Lib/GlobalDef";
import ErrorCode from "./ErrorCode";

const { ccclass, property } = cc._decorator;
interface SendCard {
    "ju_hao": number,
    "xue_hao": string,
    "color": number,
    "point": number,
    "memo": string,
    "test": boolean
}
@ccclass
export default class TestBtn extends cc.Component {
    private SendCard: SendCard;
    private InputStr: string = "";
    private InputPanel: cc.Node = null;
    private Card: cc.Node = null;
    private CloseBtn: cc.Node = null;

    start() {
        this.InputPanel = this.node.getChildByName("Input");
        this.Card = this.node.getChildByName("Card");
        this.CloseBtn = this.node.getChildByName("Close");
        this.InputPanel.on('text-changed', () => { this.Enter(); });
        this.InputPanel.on('editing-did-began', () => { AudioManager.getInstance().PlayAudio("Btn_Click"); });
        this.CloseBtn.on('click', () => { this.Close(); });
        this.SendCard = { "ju_hao": 0, "xue_hao": "", "color": 0, "point": 0, "memo": "", "test": false };
    }

    Enter() {//掃描
        this.InputStr = this.InputPanel.getComponent(cc.EditBox).string;
        let tem = this.InputStr.slice(this.InputStr.length - 2);
        if (tem.includes("\n") == false && tem.length == 2) {
            this.LoadCard(tem);
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
        this.SendCard.ju_hao = GlobalDef.GameNumber;
        this.SendCard.xue_hao = GlobalDef.MixNumber;
        this.SendCard.test = true;
        Client.getInstance().send("livebaijiale", "baijiadealer.ScanCardLog", this.SendCard, (resp, err) => {
            if (err) ErrorCode.getInstance().ErrorInfo(err);
        });
    }

    Close() {//關閉
        AudioManager.getInstance().PlayAudio("Btn_Input");
        this.InputStr = "";
        this.LoadCard("00");
        this.node.active = false;
    }

    LoadCard(CardCode: string): Promise<string> {//讀牌圖檔
        return new Promise<string>((resolve, reject) => {
            cc.assetManager.loadBundle("Art/Cards", (err, bundle) => {
                bundle.load(CardCode, cc.SpriteFrame, (err, assets: any) => {
                    if (err) { ErrorCode.getInstance().ErrorInfo("無法辨識此QR code"); }
                    else {
                        let Sprite;
                        Sprite = this.Card.getComponent(cc.Sprite);
                        Sprite.spriteFrame = assets;
                    }
                });
            });
        });
    }
}
