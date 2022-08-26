import ErrorCode from "../PopUp/ErrorCode";
import GlobalDef from "../Lib/GlobalDef";
import Client from "./Client";
import Setting from "../Setting";
import Channel from "../Channel";
import AudioManager from "../AudioManager";
class MsgHandlers {
  ping() { Client.getInstance().send("", "pong", null, (resp, err) => { }); }

  login(info, err) {//登入玩家資訊
    if (err != "" && err != null) { ErrorCode.getInstance().ErrorInfo(err, true, false); return; }
    GlobalDef.Nickname = info.nickname;
    GlobalDef.id = info.id;
    GlobalDef.group = info.group;
    Setting.getInstance().EnterTable();
    for (let k in info) { Client.getInstance().myinfo[k] = info[k]; }
  }

  logout(info) { ErrorCode.getInstance().ErrorInfo(info, true, false); }//登出

  daShangTonZhi(info) {//打賞通知
    if (info.dealer_nickname == GlobalDef.Nickname) {
      AudioManager.getInstance().PlayAudio("Coin");
      Channel.getInstance().GetNewMessage(info);
    }
  }
}

module.exports = MsgHandlers;