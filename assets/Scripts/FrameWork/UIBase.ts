import { _decorator, BlockInputEvents, ImageAsset, instantiate, log, Prefab, Rect, renderer, Sprite, SpriteFrame, Texture2D, UITransform, utils } from 'cc'
const { ccclass, property } = _decorator;

import { Button, Component,Node } from "cc";
import { UIManager } from "./UIManager";

export enum UIType{
    Page,
    Widget,
    PopWin
}

export class UIBase extends Component{
    protected _uiName:string = 'ui';
    protected _nodes:Map<string,Node> = new Map();



    get UIName():string{return this._uiName;}
    set UIName(name:string){this._uiName = name;}

    init(...args:any[]){
        this.visit(this.node);
        this.onBtnsClicks();
        this.onUse(...args);  
        this.onStart(...args);
    }

    onStart(...args:any[]){

    }

    // 遍历当前UI整棵树
    visit(root:Node){
        // 查询每个节点的名字 是否以_开头
        if (root.name.startsWith('_')) {
            this._nodes.set(root.name,root);
        }
        for (const node of root.children) {
            this.visit(node);
        }
    }
    // 获取节点
    getNode(nodeName:string):Node{
        return this._nodes.get(nodeName);
    }


    // 注册指定按钮的点击事件
    onButtonClick(btnName:string,btnCall:(target:Button)=>void){
        const node = this._nodes.get(btnName);
        if (node) {
            node.on(Button.EventType.CLICK,btnCall,this);
        }
    }
    // 遍历整棵树上的所有Button
    onBtnsClicks(){
        const btns:Button[] = this.getComponentsInChildren(Button);
        // 让所有的按钮节点的名字 和 注册的函数的名字 一样
        for (const btn of btns) {
            const nodeName:string = btn.node.name;

            // 处理一下名字
            let funcName:string = nodeName[0]
            let i = 1;
            if (funcName === '_') {
                // 如果是_开头 不管 去拿后面那一位
                funcName = nodeName[1];
                i = 2;
            }
            // 第一个字母改小写
            funcName = funcName.toLocaleLowerCase();
            // 把改成小写的字母 和剩余的字母拼接起来
            funcName = funcName + nodeName.slice(i);
            
            // 核对一下 当前脚本中 有没有叫做nodeName的函数
            // 每个按钮 注册的函数 就是和自己节点名字相同的函数
            //   _Adventure  _Boss  _Nest
            const func = this[funcName];
            func && typeof(func) === 'function' && btn.node.on(Button.EventType.CLICK,func,this);
        }
    }

    // 显示UI自己
    show(...args){
        if (!this.node.active) {
            this.node.active = true;
            this.onUse(...args);
        }
    }

    onUse(...args){

    }


    // 关闭UI自己
    hide(clear:boolean = false){
        // 如果clear是true 意味着需要把它销毁掉
        if (clear) {
            this.node.destroy();
            // 把自己从UIManager的容器中 删除
            UIManager.Instance.removeUI(this);
            return;
        }
        this.node.active = false;
        this.unUse();
    }
    unUse(){

    }

    async openUI(uiName: string, type: UIType = UIType.Page, ...args: any[]) {
        await UIManager.Instance.openUI(uiName,type,...args);
    }

    closeUI(ui:string | UIBase,clear:boolean = false){
        UIManager.Instance.closeUI(ui,clear);
    }

    isActive(){
        return this.node.active;
    }
}

export class PopWin extends UIBase{
    
    init(...args:any[]): void {
        super.init(...args);
        
        // 1 添加背景
        const node = new Node();
        const sp = node.addComponent(Sprite);
        // 创建精灵帧
        // a 创建纹理
        const texture = new Texture2D();
        //   设置纹理的宽高
        texture.reset({width:1,height:1});
        //   设置纹理存储的颜色值
        texture.uploadData(new Uint8Array([0,0,0,100]));
        // b 创建精灵帧
        const frame = new SpriteFrame();
        frame.texture = texture;
        sp.spriteFrame = frame;
        // 放大node的大小
        node.getComponent(UITransform).contentSize = this.getComponent(UITransform).contentSize;
        // 背景要放到层级最低的位置
        // this.node.children.unshift(node);
        this.node.addChild(node);
        for(let i = this.node.children.length-1; i > 0;i--){
            this.node.children[i].setSiblingIndex(i);
        }
        node.setSiblingIndex(0);

        // 2 添加事件锁定
        this.addComponent(BlockInputEvents);
        
    }
}