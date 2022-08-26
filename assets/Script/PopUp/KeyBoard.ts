import Main from "..//Main";
import Setting from "..//Setting";
import ErrorCode from "./ErrorCode";
import AudioManager from "../AudioManager";
import Client from "../Core/Client";
import Cards from "../Cards";
import GlobalDef from "../Lib/GlobalDef";

const { ccclass, property } = cc._decorator;
interface Password {
    password: string,
    memo: string
}
@ccclass
export default class KeyBoard extends cc.Component {//教練工具
    private password: Password;
    private KeyBoardBtn: Array<cc.Node> = [];
    private ConfirmBtn: cc.Node = null;
    private CancelBtn: cc.Node = null;
    private EditBox: cc.Node = null;
    private KeyBoard: cc.Node = null;
    private inputStr: string = "";
    public static State: string = "";

    start() {
        this.KeyBoard = this.node.getChildByName("KeyBoard");
        this.ConfirmBtn = this.node.getChildByName("Confirm");
        this.CancelBtn = this.node.getChildByName("Cancel");
        this.EditBox = this.node.getChildByName("Input");
        this.EditBox.getComponent(cc.EditBox).enabled = false;
        this.password = { password: "", memo: "" };
        for (let i = 0; i < this.KeyBoard.childrenCount; i++) {
            if (this.KeyBoard.children[i].name != "Empty")
                this.KeyBoardBtn.push(this.KeyBoard.children[i]);
        }
        this.BtnEvent();
    }

    BtnEvent() {
        for (let i = 0; i < this.KeyBoardBtn.length; i++) {
            this.KeyBoardBtn[i].on('click', () => {
                AudioManager.getInstance().PlayAudio("Btn_Input");
                if (this.KeyBoardBtn[i].name == "backspace") this.BackSpace();
                else this.ChangeText(this.KeyBoardBtn[i].name);
            });
        }
        this.ConfirmBtn.on('click', () => { this.Confirm(); });
        this.CancelBtn.on('click', () => { this.Cancel(); });
    }

    BackSpace() {//刪除
        if (this.inputStr != "") { this.inputStr = this.inputStr.substr(0, this.inputStr.length - 1); }
        this.EditBox.getComponent(cc.EditBox).string = this.inputStr;
        this.EditBox.getChildByName("TEXT_LABEL").getComponent(cc.Label).string;
    }

    ChangeText(latter: string) {//改字串
        this.inputStr = this.inputStr + latter;
        this.EditBox.getComponent(cc.EditBox).string = this.inputStr;
    }

    Confirm() {//確認
        AudioManager.getInstance().PlayAudio("Btn_Click");
        this.password.password = this.inputStr;
        if (KeyBoard.State == "Card") this.password.memo = "改牌";
        if (KeyBoard.State == "Clear") this.password.memo = "棄局";

        Client.getInstance().send("livebaijiale", "baijiadealer.AuthKey", this.password, (resp, err) => {
            if (err) { ErrorCode.getInstance().ErrorInfo(err); }
            else {
                if (resp == "ok") {
                    this.node.parent.active = false;
                    if (KeyBoard.State == "Card") { }//換牌
                    if (KeyBoard.State == "Clear") {//棄局
                        Main.CanReset = true;
                        Client.getInstance().send("livebaijiale", "baijiadealer.Reset", Setting.TableID, (resp, err) => {
                            if (err) { ErrorCode.getInstance().ErrorInfo(err); }
                            if (resp == "ok") {
                                GlobalDef.GameNumber = GlobalDef.GameNumber + 1;
                                Main.getInstance().GiveUpThisRound();
                            }
                        });
                        KeyBoard.State = "";
                    }
                }
            }
        });
        this.inputStr = "";
        this.EditBox.getComponent(cc.EditBox).string = this.inputStr;
    }

    Cancel() {//取消
        AudioManager.getInstance().PlayAudio("Btn_Input");
        this.node.parent.active = false;
        KeyBoard.State = "";
        Cards.getInstance().ChangeCard = false;
        if (Cards.getInstance().InputPanel.active = true) Cards.getInstance().InputPanel.active = false;
    }
}