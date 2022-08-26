const { ccclass, property } = cc._decorator;

interface RewardInfo {
    "player_id": number,
    "player_nickname": string,
    "dealer_id": number,
    "dealer_nickname": string,
    "amount": number,
    "count": number,
    "product_name": string,
    "reply_msg": string
}
@ccclass
export default class Channel extends cc.Component {
    private static instance: Channel;
    public static getInstance(): Channel {
        if (this.instance == null) { this.instance = new Channel(); }
        return this.instance;
    }

    private rewardInfo: RewardInfo;
    public Text: cc.Node = null;
    private Info: cc.Node = null;
    public NewStr: string = "";
    private TemIndex: number = 0;

    start() {
        Channel.instance = this;
        this.Info = this.node.getChildByName("Info");
        this.Text = this.Info.getChildByName("Text");
        this.rewardInfo = { player_id: 0, player_nickname: "", dealer_id: 0, dealer_nickname: "", amount: 0, count: 0, product_name: "", reply_msg: "" }
    }

    GetNewMessage(info) {//得到打賞資訊
        this.rewardInfo = info;
        let NewString = this.rewardInfo.player_nickname + "打賞了" + this.rewardInfo.count + this.rewardInfo.product_name + "給" + this.rewardInfo.dealer_nickname;
        this.NewText(NewString);
    }

    NewText(NewStr: string) {//生成訊息
        let NewText = cc.instantiate(this.Text);
        NewText.color = cc.color(255, 255, 255);
        NewText.getComponent(cc.Label).string = NewStr;
        this.Info.addChild(NewText);
        this.TemIndex = this.TemIndex - 1;
        NewText.zIndex = this.TemIndex - 1;
        if (this.Info.childrenCount > 10) this.Info.children[5].destroy();
    }
}