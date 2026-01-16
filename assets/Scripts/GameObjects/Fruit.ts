import { _decorator, Component, Node, Sprite } from 'cc';
import { ResManager } from '../FrameWork/ResManager';
const { ccclass, property } = _decorator;

@ccclass('Fruit')
export class Fruit extends Component {

    start() {

    }

    
    init(id: number) {
        const fruitName = `fruit_${id}`;
        this.node.getComponent(Sprite)!.spriteFrame = ResManager.Instance.getSpriteFrame(fruitName);
    }
    update(deltaTime: number) {
        
    }
}


