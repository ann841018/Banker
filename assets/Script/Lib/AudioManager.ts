import ErrorCode from "./PopUp/ErrorCode";

const { ccclass, property } = cc._decorator;
@ccclass
export default class AudioManager extends cc.Component {
    @property(cc.AudioSource) Audio_SE: cc.AudioSource = null;
    @property(cc.AudioSource) Audio_BGSE: cc.AudioSource = null;

    private audioArr: Array<cc.AudioClip> = [];

    private static instance: AudioManager;
    public static getInstance(): AudioManager {
        if (this.instance == null) { this.instance = new AudioManager(); }
        return this.instance;
    }

    onLoad() { AudioManager.instance = this; this.LoadAudio(); }
    LoadAudio(): Promise<string> {//先把音效檔讀進來
        return new Promise<string>((resolve, reject) => {
            cc.assetManager.loadBundle("Audio", (err, bundle) => {
                bundle.loadDir("", cc.AudioClip, (err, assets: any) => {
                    if (err) { ErrorCode.getInstance().ErrorInfo(err.message); }
                    else {
                        this.audioArr = assets;
                    }
                });
            });
        });
    }

    PlayBGSE(name: string) {//播音效(倒數計時)
        for (let i = 0; i < this.audioArr.length; i++) {
            if (this.audioArr[i].name == name) {
                this.Audio_BGSE.clip = this.audioArr[i];
                this.Audio_BGSE.play();
                break;
            }

        }
    }
    PlayAudio(name: string) {//播音效
        for (let i = 0; i < this.audioArr.length; i++) {
            if (this.audioArr[i].name == name) {
                this.Audio_SE.clip = this.audioArr[i];
                this.Audio_SE.play();
                break;
            }
        }
    }
}