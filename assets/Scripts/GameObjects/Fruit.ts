import { _decorator, Camera, CircleCollider2D, Component, find, Input, input, Node, RigidBody2D, Sprite, UITransform, Vec3 } from 'cc';
import { ResManager } from '../FrameWork/ResManager';
const { ccclass, property } = _decorator;

@ccclass('Fruit')
export class Fruit extends Component {
    private rigidBody: RigidBody2D = null;
    private collider: CircleCollider2D = null;
    private canvasUITrans: UITransform = null;
    onLoad() {
        this.rigidBody = this.node.getComponent(RigidBody2D);
        this.collider = this.node.getComponent(CircleCollider2D);
        this.canvasUITrans = find("Canvas").getComponent(UITransform);
    }
    onTouchMove(event) {
        const touchPos = event.getUILocation();
        //// 全是只读 不能赋值
        // node.positionX / node.positionY / node.positionZ
        // node.worldPositionX / node.worldPositionY / node.worldPositionZ
        // node.scaleX / node.scaleY / node.scaleZ
        // node.rotationX / node.rotationY / node.rotationZ
       const nodePos = this.canvasUITrans.convertToNodeSpaceAR(new Vec3(touchPos.x, touchPos.y, 0));
        //this.node.setPosition(worldPos.x, this.node.position.y, this.node.position.z);
        this.node.setPosition(nodePos.x, this.node.position.y, this.node.position.z);
    }
    onTouchFinish() {
        if (this.rigidBody)
            this.rigidBody.enabled = true;
        if (this.collider)
            this.collider.enabled = true;
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.off(Input.EventType.TOUCH_END, this.onTouchFinish, this);
        input.off(Input.EventType.TOUCH_CANCEL, this.onTouchFinish, this);
    }

    init(index: number) {
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchFinish, this);
        input.on(Input.EventType.TOUCH_CANCEL, this.onTouchFinish, this);
        const fruitName = `fruit_${index}`;
        this.node.getComponent(Sprite)!.spriteFrame = ResManager.Instance.getSpriteFrame(fruitName);
        this.collider.radius = this.node.getComponent(UITransform)!.width / 2;
        if (this.rigidBody) this.rigidBody.enabled = false;
        if (this.collider) this.collider.enabled = false;
    }
    update(deltaTime: number) {

    }
     onDestroy() {
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.off(Input.EventType.TOUCH_END, this.onTouchFinish, this);
        input.off(Input.EventType.TOUCH_CANCEL, this.onTouchFinish, this);
    }

}


