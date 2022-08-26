import AudioManager from "./AudioManager";
import Main from "./Main";
import ErrorCode from "./PopUp/ErrorCode";
import KeyBoard from "./PopUp/KeyBoard";
import Setting from "./Setting";

const { ccclass, property } = cc._decorator;
@ccclass
export default class Cards extends cc.Component {
    private static instance: Cards;
    public static getInstance(): Cards {
        if (this.instance == null) { this.instance = new Cards(); }
        return this.instance;
    }

    public static CardsArr: Array<string> = [];//六張牌陣列
    public SmallCards: Array<cc.Node> = [];
    public SmallCardIndex: number = 6;
    public ChangeCard: boolean = false;
    private InputBtn: cc.Node = null;
    public InputPanel: cc.Node = null;

    start() {
        Cards.instance = this;
        this.SmallCards = this.node.getChildByName("Card").children;
        this.InputBtn = this.node.getChildByName("Input");
        this.InputPanel = this.node.parent.getChildByName("InputPanel");
        this.BtnEvent();
    }

    BtnEvent() {
        this.InputBtn.on('click', () => {
            this.InputCheck();
            AudioManager.getInstance().PlayAudio("Btn_Open");
            if (this.ChangeCard == false) {
                this.node.parent.getChildByName("PassWord").active = true;
                KeyBoard.State = "Card";
                this.ChangeCard = true;
            }
            if (Cards.getInstance().SmallCardIndex != 6 && this.ChangeCard == true) this.InputPanel.active = true;
        });
    }

    InputCheck() {//選要換的牌張
        for (let i = 0; i < 6; i++) {
            if (this.SmallCards[i].getComponent(cc.Toggle).isChecked) {
                Cards.getInstance().SmallCardIndex = i;
                return;
            } else { if (i == 5) Cards.getInstance().SmallCardIndex = 6; }
        }
    }

    LoadCard(index: number, CardCode: string): Promise<string> {//讀牌圖檔
        return new Promise<string>((resolve, reject) => {
            cc.assetManager.loadBundle("Art/Cards", (err, bundle) => {
                bundle.load(CardCode, cc.SpriteFrame, (err, assets: any) => {
                    if (err) {
                        ErrorCode.getInstance().ErrorInfo("無法辨識此QR code");
                        Main.getInstance().CanShow[index] = false;
                        Setting.getInstance().ShowBtn.active = false;
                    }
                    else {
                        let Sprite;
                        Sprite = this.SmallCards[index].getComponent(cc.Sprite);
                        Sprite.spriteFrame = assets;
                    }
                });
            });
        });
    }
}