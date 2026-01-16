import { _decorator, Component, director, Node, ProgressBar } from 'cc';
import { ResManager } from '../FrameWork/ResManager';
import { UIBase } from '../FrameWork/UIBase';
const { ccclass, property } = _decorator;

@ccclass('StartUI')
export class StartUI extends UIBase {
    async startBtn(){
        const progress = this.node.getChildByName("ProgressBar")!.getComponent(ProgressBar);;
        await ResManager.Instance.loadAll((pecent) => { 
            progress.progress = pecent;
        })
        director.loadScene("GameScene");
    }
}



