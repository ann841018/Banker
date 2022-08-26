import Cards from "../Cards";
import Channel from "../Channel";
import Count from "../Count";
import Info from "../Info";
import GlobalDef from "../Lib/GlobalDef";
import Main from "../Main";
import { thousandComma } from "../Math";
import ErrorCode from "../PopUp/ErrorCode";
import Setting from "../Setting";
class livebaijiale {
  restStage(info) {//閒置
    GlobalDef.GameNumber = info.juhao;
    GlobalDef.DeckNumber = info.paixuehao;
    GlobalDef.MixNumber = info.juhao_mix;
    Info.getInstance().Show();
  }
  restStageCD(info) {//閒置
    GlobalDef.GameNumber = info.juhao;
    GlobalDef.DeckNumber = info.paixuehao;
    Info.getInstance().Show();
  }
  betStageCD(info) { if (info.msg == "切換到開牌階段") Setting.getInstance().TimesUp(); }//下注階段
  bettingChipStatus(info) {//下注階段
    Main.getInstance().StartBtn();
    Main.getInstance().InProcess();
    for (let i = 0; i < 6; i++) {
      cc.find("Middle").getChildByName("Top").children[i].getChildByName("Bet").getComponent(cc.Label).string = thousandComma(info.room_chips[i] / 10000);
    }
    if (GlobalDef.VipRoom == true) {
      Setting.getInstance().StopBtn.active = true;
      Setting.getInstance().Message = "請停止下注";
    } else {
      if (info.cd > 0) Setting.getInstance().CountDown = info.cd;
      else Setting.getInstance().CountDown = 0;
      Setting.getInstance().StartCountDown();
    }
  }
  playerBet(info) {
    for (let i = 0; i < 6; i++) {
      cc.find("Middle").getChildByName("Top").children[i].getChildByName("Bet").getComponent(cc.Label).string = thousandComma(info.room_chips[i] / 10000);
    }
  }
  seatBets(info) {//入座位的玩家資訊
    for (let i = 0; i < 6; i++) {
      let Seat = Count.getInstance().PlayerSeat[i];
      if (info.settle_player_bets[i] != null) {
        let Info = info.settle_player_bets[i];
        Seat.active = true;
        Count.getInstance().PlayerID[i] = Info.id;
        Seat.getChildByName("ID").getComponent(cc.Label).string = Info.nickname;
        Seat.getChildByName("Money").getComponent(cc.Label).string = thousandComma(Info.gold / 10000);
        Seat.getChildByName("BetPlayer").active = Info.player_bets[2];
        Seat.getChildByName("BetBanker").active = Info.player_bets[3];
        Seat.getChildByName("BetPlayer").getChildByName("BetMoney").getComponent(cc.Label).string = (Info.player_bets[2] / 10000).toString();
        Seat.getChildByName("BetBanker").getChildByName("BetMoney").getComponent(cc.Label).string = (Info.player_bets[3] / 10000).toString();
        if (info.max_xian_index == i) Seat.getChildByName("BetPlayerBtn").active = true;
        else Seat.getChildByName("BetPlayerBtn").active = false;
        if (info.max_zhuang_index == i) Seat.getChildByName("BetBankerBtn").active = true;
        else Seat.getChildByName("BetBankerBtn").active = false;
      } else {
        Seat.active = false;
        Count.getInstance().ResetSeat(i, false);
      }
    }
  }

  stageChange(info) { if (info.msg != null && info.msg != "") Setting.getInstance().Message = info.msg; }//狀態改變
  scanningCardStatus(info) {//開牌階段
    if (info.xian_cards.length != 0) {
      let Card, card;
      for (let i = 0; i < 6; i++) {
        if ((i == 4 && info.xian_cards.length != 3) || (i == 5 && info.zhuang_cards.length != 3)) {
          Count.getInstance().isShow = true;
        }
        else {
          Cards.getInstance().SmallCards[i].active = true;
          if (i % 2 == 0) Card = info.xian_cards[Math.floor(i / 2)];
          else Card = info.zhuang_cards[Math.floor(i / 2)];
          let color = Card.color;
          let point = Card.point;
          if (color == 1) color = "S";
          if (color == 2) color = "H";
          if (color == 3) color = "D";
          if (color == 4) color = "C";
          if (point == 10) point = "A";
          if (point == 11) point = "B";
          if (point == 12) point = "C";
          if (point == 13) point = "D";
          card = color + point;
          Count.getInstance().IsNormal = false;
          Cards.CardsArr[i] = card;
          Cards.getInstance().LoadCard(i, card);
        }
      }
      if (info.bu_pai_name == "補閒補莊") {
        Count.getInstance().SendCard = 4;
        Count.getInstance().temPlayer = 3;
        Main.getInstance().CanShow[4] = false;
        Main.getInstance().CanShow[5] = false;
        Count.getInstance().plusStr = "補兩張，請按下掃描";
      }
      if (info.bu_pai_name == "閒補") {
        Count.getInstance().SendCard = 4;
        Count.getInstance().temPlayer = 1;
        Main.getInstance().CanShow[4] = false;
        Main.getInstance().CanShow[5] = true;
        Count.getInstance().plusStr = "閑家補一張，請按下掃描";
      }
      if (info.bu_pai_name == "莊補") {
        Count.getInstance().SendCard = 5;
        Count.getInstance().temPlayer = 2;
        Main.getInstance().CanShow[4] = true;
        Main.getInstance().CanShow[5] = false;
        Count.getInstance().plusStr = "庄家補一張，請按下掃描";
      }

      Setting.getInstance().Message = Count.getInstance().plusStr;
      Count.getInstance().PlayerPoint = info.xian_total;
      Count.getInstance().BankerPoint = info.zhuang_total;
      Count.getInstance().isShow = true;
      Count.getInstance().Show();
      Main.getInstance().InProcess();
    }
    else {
      Main.getInstance().InProcess();
      Setting.getInstance().TimesUp();
    }
  }
  thisRoundReset() { Setting.getInstance().Message = "請開始新的一局，或更換牌靴並燒牌完成。"; }//重置
  thisRoomClose() { ErrorCode.getInstance().ErrorInfo("加入的房间不存在", false, true); }//被關桌
  settleStage(info) {//牌局結果
    if (info.msg != null && info.msg != "") Setting.getInstance().Message = info.msg;
    if (info.win_area != null) { Count.getInstance().ResultLight(info.win_area); }
  }
}

module.exports = livebaijiale;