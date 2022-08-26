import Cards from "..//Cards";
import Count from "..//Count";
import AudioManager from "../AudioManager";
import Main from "../Main";
import Setting from "../Setting";
import ErrorCode from "./ErrorCode";
import KeyBoard from "./KeyBoard";

const { ccclass, property } = cc._decorator;
@ccclass
export default class InputCard extends cc.Component {
    private ColorToggle: Array<cc.Node> = [];
    private NumberToggle: Array<cc.Node> = [];
    private ConfirmBtn: cc.Node = null;
    private CloseBtn: cc.Node = null;
    private TemCard: cc.Node = null;
    public static CardCode: string = "S1";
    private ErrPanel:cc.Node = null;

    start() {
        this.ColorToggle = this.node.getChildByName("Color").children;
        this.NumberToggle = this.node.getChildByName("Number").children;
        this.TemCard = this.node.getChildByName("Card");
        this.ConfirmBtn = this.node.getChildByName("Confirm");
        this.CloseBtn = this.node.getChildByName("Close");
        this.BtnEvent();
    }

    BtnEvent() {
        let firstLatter: any = "S";
        let SecondLatter: any = 1;
        let color: number = 0;
        let point: number = 0;
        for (let i = 0; i < 4; i++) {//花色
            this.ColorToggle[i].on('toggle', () => {
                if (i == 0) firstLatter = "S";
                if (i == 1) firstLatter = "H";
                if (i == 2) firstLatter = "D";
                if (i == 3) firstLatter = "C";
                AudioManager.getInstance().PlayAudio("Btn_Input"); color = i + 1;
                if (SecondLatter != 0) { InputCard.CardCode = firstLatter.toString() + SecondLatter.toString(); }
                else { InputCard.CardCode = "00"; }
                this.LoadCard(InputCard.CardCode);
            });
        }
        for (let i = 0; i < 14; i++) {//點數
            this.NumberToggle[i].on('toggle', () => {
                SecondLatter = i + 1; point = i + 1;
                if (SecondLatter == 10) SecondLatter = "A";
                if (SecondLatter == 11) SecondLatter = "B";
                if (SecondLatter == 12) SecondLatter = "C";
                if (SecondLatter == 13) SecondLatter = "D";
                if (SecondLatter == 14) SecondLatter = 0;
                AudioManager.getInstance().PlayAudio("Btn_Input");
                if (SecondLatter != 0) { InputCard.CardCode = firstLatter.toString() + SecondLatter.toString(); }
                else { InputCard.CardCode = "00"; }
                this.LoadCard(InputCard.CardCode);
            });
        }
        this.ConfirmBtn.on('click', () => { this.ConFirm(); });
        this.CloseBtn.on('click', () => { AudioManager.getInstance().PlayAudio("Btn_Input"); this.node.active = false; });
    }

    ConFirm() {//教練密碼
        AudioManager.getInstance().PlayAudio("Btn_Click");
        if (Cards.getInstance().ChangeCard == false) this.node.parent.getChildByName("PassWord").active = true;
        KeyBoard.State = "Card";
        this.node.active = false;
        if (KeyBoard.State == "Card") InputCard.CheckConfirm();
    }

    static CheckConfirm() {//確認
        Cards.CardsArr[Cards.getInstance().SmallCardIndex] = this.CardCode;
        Cards.getInstance().LoadCard(Cards.getInstance().SmallCardIndex, this.CardCode);
        Main.getInstance().CanShow[Cards.getInstance().SmallCardIndex] = true;
        if (Count.getInstance().isShow == false) {
            if (Main.getInstance().CanShow[0] == true && Main.getInstance().CanShow[1] == true && Main.getInstance().CanShow[2] == true && Main.getInstance().CanShow[3] == true)
                Setting.getInstance().ShowBtn.active = true;
        } else {
            if (Main.getInstance().CanShow[4] == true && Main.getInstance().CanShow[5] == true) Setting.getInstance().ShowBtn.active = true;
        }
    }

    LoadCard(CardCode: string): Promise<string> {//讀牌圖檔
        return new Promise<string>((resolve, reject) => {
            cc.assetManager.loadBundle("Art/Cards", (err, bundle) => {
                bundle.load(CardCode, cc.SpriteFrame, (err, assets: any) => {
                    if (err) { ErrorCode.getInstance().ErrorInfo("無法辨識此卡"); }
                    else {
                        let Sprite;
                        Sprite = this.TemCard.getComponent(cc.Sprite);
                        Sprite.spriteFrame = assets;
                    }
                });
            });
        });
    }
}
