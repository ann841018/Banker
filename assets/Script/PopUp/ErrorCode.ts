import AudioManager from "..//AudioManager";
import GlobalDef from "../Lib/GlobalDef";
import Setting from "../Setting";
const { ccclass, property } = cc._decorator;
@ccclass
export default class ErrorCode extends cc.Component {
    private ErrorText: cc.Label;
    private ConfirmBtn: cc.Node;
    private toLogin: boolean;
    private toLobby: boolean;

    private static instance: ErrorCode;
    public static getInstance(): ErrorCode {
        if (this.instance == null) { this.instance = new ErrorCode(); }
        return this.instance;
    }

    onLoad() {
        ErrorCode.instance = this;
        this.ErrorText = this.node.getChildByName("Panel").getChildByName("ErrorText").getComponent(cc.Label);
        this.ConfirmBtn = this.node.getChildByName("Confirm");
        this.node.active = false;
        this.node.opacity = 255;
        this.BtnEvent();
    }

    ErrorInfo(err: string, toLogin: boolean = false, toLobby: boolean = false) {//錯誤訊息
        this.node.active = true;
        if (err == "小姐請先入桌") { toLobby = true; }
        else if (err == "你不在房間裡") { toLobby = true; }
        this.toLogin = toLogin;
        this.toLobby = toLobby;
        this.ErrorText.string = err;
    }

    BtnEvent() {
        this.ConfirmBtn.on('click', () => {
            AudioManager.getInstance().PlayAudio("Btn_Click");
            if (this.toLogin == true) parent.postMessage("logout", "*");
            else if (this.toLobby == true) {
                Setting.getInstance().Jump("lobby_banker", (info) => {
                    Setting.postURL = { state: "lobby_banker", url: info.data.url };
                    parent.postMessage(Setting.postURL, "*");
                });
            }
            this.node.active = false;
        });
    }
}
