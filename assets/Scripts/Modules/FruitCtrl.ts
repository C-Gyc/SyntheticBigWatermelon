import { _decorator, Collider, Component, Node, RigidBody2D, Vec3 } from 'cc';
import { ModulerBase } from '../FrameWork/ModulerBase';
import { createNodeWithPrefab } from '../FrameWork/Tools/Tools';
import { ResManager } from '../FrameWork/ResManager';
import { Fruit } from '../GameObjects/Fruit';
const { ccclass, property } = _decorator;

@ccclass('FruitCtrl')
export class FruitCtrl extends ModulerBase {
  
    onStart() {
        this.createFruit(1);
    }
   
    createFruit(index: number) {
        const fruitPrefab = ResManager.Instance.getPrefab("Fruit");
        const fruitNode = createNodeWithPrefab(fruitPrefab, this._node, new Vec3(360, 640, 0));
        fruitNode.getComponent(Fruit).init(index);
    }
    update(deltaTime: number) {

    }
}


