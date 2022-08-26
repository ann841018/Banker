import GlobalDef from "../Lib/GlobalDef";
import ConnectManager from "./ConnectManager";
interface Userinfo {
  id: number;
  token: string;
}
export default class Client {
  private static instance: Client;
  public static getInstance(): Client {
    if (this.instance == null) { this.instance = new Client(); }
    return this.instance;
  }

  private cbs: Array<Function>;
  private cbIdx: number;
  public myinfo: Userinfo;
  private cacheSplit: any;
  private _socket: any;

  constructor() {
    this.cbs = [];
    this.cacheSplit = {};
    this.cbIdx = 1;
    this.myinfo = { id: 0, token: "" };
  }

  pushCb(cb: Function) {
    this.cbs[this.cbIdx++] = cb;
    return this.cbIdx - 1;
  }
  peekCb(cbId: number) {
    let cbItem = this.cbs[cbId];
    delete this.cbs[cbId];
    return cbItem;
  }

  login() {//串Url
    let url = window.document.URL;
    let temurl = url.split("banker_token=")[1];
    temurl = temurl.split("?ignore=")[0];
    GlobalDef.token = temurl.split("&token=")[1];
    GlobalDef.TableNumber = parseInt(GlobalDef.token.split("&room_id=")[1]);
    GlobalDef.token = GlobalDef.token.split("&room_id=")[0];
    temurl = temurl.split("&token=")[0];
    this.myinfo.id = parseInt(temurl.split("&id=")[1]);
    this.myinfo.token = temurl.split("&id=")[0];
    GlobalDef.tokenBanker = this.myinfo.token;
    this.realConnect();
  }
  realConnect() { this.createWS(`${GlobalDef.loginServerWS}/login?id=${this.myinfo.id}&token=${this.myinfo.token}`); }//連線

  onMessage(data) {//訊息
    if (data.cbId) {
      let cb = this.peekCb(data.cbId);
      cb(data.args, data.err);
      return;
    }

    if (data.route) {
      let arr = this.cacheSplit[data.route];
      if (!arr) {
        arr = data.route.split(".");
        this.cacheSplit[data.route] = arr;
      }
      console.assert(arr.length == 2);
      let handler = require(arr[0]);
      if (handler.prototype.runnable && !handler.prototype.runnable()) { return; }
      let cb = handler.prototype[arr[1]];
      if (!cb) return;
      cb(data.args, data.err);
    }
  }

  createWS(url: string) {
    if (this._socket) { this._socket.close(); console.log("close old socket"); }
    this.cbs = [];
    let ws = new WebSocket(url);
    this._socket = ws;
    ws.binaryType = "arraybuffer";
    ws.onopen = (event) => {//創建WS
      ConnectManager.getInstance().logined = true;
      ConnectManager.getInstance().reset(true);
      if (ws != this._socket) { return; }
    };
    ws.onmessage = (event) => {//回傳內容
      if (ws == this._socket) {
        let data = JSON.parse(event.data);
        ConnectManager.getInstance().elapsed = 0;
        if (data.route != "MsgHandlers.ping") { console.log("【網路-接收】: " + event.data); }
        try { this.onMessage(data); }
        catch (err) { console.log(err); }// 例外處理
      }
    };
    //ws.onerror = (event) => { ErrorCode.getInstance().ErrorInfo("網路連接錯誤", true, false); };
    ws.onclose = (event) => {//關閉WS
      if (ws == this._socket) {
        ConnectManager.getInstance().logined = false;
        ConnectManager.getInstance().reset(false);
        this._socket = null;
      }
    };
  }

  send(svr: string, route: string, args: any, cb: Function) {//傳給Server
    if (this._socket == null) { return false; }
    if (this._socket.readyState != 1) { return false; }

    let sendData: any = {};
    sendData.svr = svr;
    sendData.route = route;
    sendData.args = args;
    sendData.cbId = cb ? this.pushCb(cb) : undefined;

    let msgStr = JSON.stringify(sendData);
    if (route != "pong") { console.log("【網路-請求】: ", msgStr); }
    this._socket.send(msgStr);
    return true;
  }

  close() {//把舊的WS關閉
    if (this._socket) { this._socket.close(); }
    this._socket = null;
  }
}