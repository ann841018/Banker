import Client from "../Core/Client";
import Info from "../Info";
import GlobalDef from "../Lib/GlobalDef";
import Main from "../Main";
import Setting from "../Setting";
import ErrorCode from "./ErrorCode";
const { ccclass, property } = cc._decorator;
interface TableInfo {
    id: string;
    open: boolean;
}
@ccclass
export default class ChoseTable extends cc.Component {
    private static instance: ChoseTable;
    public static getInstance(): ChoseTable {
        if (this.instance == null) { this.instance = new ChoseTable(); }
        return this.instance;
    }
    @property(cc.Prefab) TablePrefab: cc.Prefab = null;
    private TableInfo: Array<TableInfo> = [];
    private TableArr: Array<cc.Node> = [];
    private Content: cc.Node = null;
    private LogOutBtn: cc.Node = null;

    onLoad() { ChoseTable.instance = this; }
    start() {
        this.Content = this.node.getChildByName("Table").getChildByName("Content");
        this.LogOutBtn = this.node.getChildByName("LogOut");
        this.TableInfo = [{ id: "", open: false }];
        this.node.opacity = 255;
        this.LogOutBtn.on('click', () => { parent.postMessage("logout", "*"); });
    }

    GetAllTable(info) {//取得桌子資訊
        this.TableInfo = info;
        for (let i = 0; i < info.length; i++) {
            let newTable = cc.instantiate(this.TablePrefab);
            newTable.name = info[i].id.toString();
            this.Content.addChild(newTable);
            this.TableArr[i] = newTable;
            this.TableArr[i].on('click', () => { this.EnterTable(); });
        }
        this.ResetTable();
    }

    ResetTable() {//桌子開關
        for (let i = 0; i < this.TableArr.length; i++) {
            this.TableArr[i].getChildByName("No").active = !this.TableInfo[i].open;
            this.TableArr[i].getChildByName("Num").getComponent(cc.Label).string = this.TableInfo[i].id;
        }
    }

    EnterTable() {//入桌
        let Text = this.node.parent.getChildByName("Right").getChildByName("Channel").getChildByName("Info").getChildByName("Text")
        Text.getComponent(cc.Label).string = "已進入桌號 : " + GlobalDef.TableNumber;
        Setting.TableID = { room_id: GlobalDef.TableNumber };
        Client.getInstance().send("livebaijiale", "baijiadealer.ApplyDealer", Setting.TableID, (resp, err) => {
            if (err) ErrorCode.getInstance().ErrorInfo(err, false, true);
            else {
                GlobalDef.GameNumber = resp.ju_count;
                GlobalDef.DeckNumber = resp.paixuehao;
                GlobalDef.VipRoom = resp.type;
                if (GlobalDef.VipRoom == true) {
                    this.node.getChildByName("FakeStop").active = true;
                    this.node.getChildByName("TimeLeft").active = false;
                }
                Info.getInstance().Show();
                this.Reset();
                this.node.active = false;
            }
        });
    }

    Reset() {//重置
        Main.CanReset = true;
        Main.getInstance().Clear();
        let OpenBtn = this.node.parent.getChildByName("Right").getChildByName("Open");
        Main.getInstance().TVBtn.active = true;
        OpenBtn.parent.getChildByName("Clear").active = false;
        OpenBtn.parent.getChildByName("Start").active = false;
        OpenBtn.active = true;
    }
}
