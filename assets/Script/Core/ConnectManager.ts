import GlobalDef from "../Lib/GlobalDef";
import ErrorCode from "../PopUp/ErrorCode";
import Client from "./Client";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ConnectManager extends cc.Component {
    private static instance: ConnectManager;
    public static getInstance(): ConnectManager {
        if (this.instance == null) { this.instance = new ConnectManager(); }
        return this.instance;
    }
    public logined: boolean = false;
    private connected: boolean = false;
    private tries: number = 0;
    public elapsed = 0;

    onLoad() { ConnectManager.instance = this; }

    update(dt) {
        if (!this.logined) return;
        this.elapsed += dt;
        if (this.elapsed < 3.5) return;

        this.elapsed = 0;
        this.connected = false;

        if (this.tries < 10) {//斷線重連
            this.tries++;
            Client.getInstance().login();
        } else ErrorCode.getInstance().ErrorInfo("網路連接錯誤", true, false);
    }

    reset(logined: boolean) {//重置
        this.elapsed = 0;
        this.tries = 0;
        this.logined = logined;
        this.connected = logined;
    }

    /*reConnect() {
        this.tries = 1;
        this.elapsed = 0;
        Client.getInstance().login();
    }*/
}
