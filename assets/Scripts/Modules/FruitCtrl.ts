import { _decorator, CircleCollider2D, Collider, Component, Node, RigidBody2D, Vec3 } from 'cc';
import { ModulerBase } from '../FrameWork/ModulerBase';
import { createNodeWithPrefab } from '../FrameWork/Tools/Tools';
import { ResManager } from '../FrameWork/ResManager';
import { Fruit } from '../GameObjects/Fruit';
const { ccclass, property } = _decorator;

@ccclass('FruitCtrl')
export class FruitCtrl extends ModulerBase {
    onStart(): void {
        this.createFruit(1, new Vec3(360, 800, 0));
    }
    //生成水果
    createFruit(index: number, position?: Vec3, isFirst: boolean = true) {
        const fruitPrefab = ResManager.Instance.getPrefab('Fruit');
        const fruitNode = createNodeWithPrefab(fruitPrefab, this._node, position);
        fruitNode.getComponent(Fruit).init(index, isFirst);
    }
    //合成水果
    combineFruit(fruitNodeA: Node, fruitNodeB: Node) {
        const newFruitPos = fruitNodeA.getWorldPosition().add(fruitNodeB.getWorldPosition()).multiplyScalar(0.5);
        const newFruitIndex = fruitNodeA.getComponent(CircleCollider2D).tag + 1;
        if(newFruitIndex > 11){
            this.scheduleOnce(() => {   
            fruitNodeA.destroy();
            fruitNodeB.destroy();
            }, 0);
            return;
        }
        this.createFruit(newFruitIndex, newFruitPos, false);
    }
    update(deltaTime: number) {

    }
}


