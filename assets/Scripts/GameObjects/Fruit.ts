import { _decorator, Camera, CircleCollider2D, Component, Contact2DType, find, Input, input, Node, RigidBody2D, Sprite, UITransform, Vec3 } from 'cc';
import { ResManager } from '../FrameWork/ResManager';
import { FruitCtrl } from '../Modules/FruitCtrl';
import { ModulerMgr } from '../FrameWork/ModulerMgr';
const { ccclass, property } = _decorator;

@ccclass('Fruit')
export class Fruit extends Component {
    private _tiger: number = 0;
    private rigidBody: RigidBody2D = null;
    private collider: CircleCollider2D = null;
    private canvasUITrans: UITransform = null;
    public isCombined: boolean = false;
    private fruitCtrl: FruitCtrl = null;
    private _isFirst: boolean = true;
    private _isCreated: boolean = false;
    onLoad() {
        this.canvasUITrans = find("Canvas").getComponent(UITransform);
        this.fruitCtrl = ModulerMgr.Instance.getModuler<FruitCtrl>("FruitCtrl");  
    }
    protected start(): void { 
        this.rigidBody = this.getComponent(RigidBody2D);
        this.collider = this.getComponent(CircleCollider2D);
        this.collider.tag = this._tiger;
        if (this._isFirst) {
            if (this.rigidBody)
               this.rigidBody.enabled = false;
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchFinish, this);
        input.on(Input.EventType.TOUCH_CANCEL, this.onTouchFinish, this);  
        }
        const uiTrans = this.node.getComponent(UITransform);
        if (this.collider && uiTrans) this.collider.radius = uiTrans.width / 2;
        this.initContact();
    }
    initContact() {
        if (!this.collider) return;
        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }
    onTouchMove(event) {
        const touchPos = event.getUILocation();
        //// 全是只读 不能赋值
        // node.positionX / node.positionY / node.positionZ
        // node.worldPositionX / node.worldPositionY / node.worldPositionZ
        // node.scaleX / node.scaleY / node.scaleZ
        // node.rotationX / node.rotationY / node.rotationZ
        const nodePos = this.canvasUITrans.convertToNodeSpaceAR(new Vec3(touchPos.x, touchPos.y, 0));
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
        this.scheduleOnce(() => {
               this.fruitCtrl.createFruit(1, new Vec3(360, 800, 0));
            }, 1);
    }

    init(index: number, isFirst: boolean) {
        this.isCombined = false;
        this._tiger = index;
        this._isFirst = isFirst;
        const fruitName = `fruit_${index}`;
        this.node.getComponent(Sprite)!.spriteFrame = ResManager.Instance.getSpriteFrame(fruitName);
    }
    onBeginContact(selfCollider: CircleCollider2D, otherCollider: CircleCollider2D) {
        if(otherCollider.tag === -1) return;
        if (selfCollider.node.uuid > otherCollider.node.uuid) return;
        const selfFruit = selfCollider.node.getComponent(Fruit);
        const otherFruit = otherCollider.node.getComponent(Fruit);
        if (selfCollider.tag != otherCollider.tag) {
            return;
        }
        selfFruit.isCombined = true;
        otherFruit.isCombined = true;
        this.scheduleOnce(() => {
            this.fruitCtrl.combineFruit(selfCollider.node, otherCollider.node);
        }, 0);
       
      
        this.scheduleOnce(() => {
            if (selfCollider.node && selfCollider.node.isValid) {
                selfCollider.node.destroy();
            }
            if (otherCollider.node && otherCollider.node.isValid) {
                otherCollider.node.destroy();
            }
        }, 0.01);



    }
    update(deltaTime: number) {

    }
}


