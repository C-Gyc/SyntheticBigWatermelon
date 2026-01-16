import { instantiate, Node, Prefab, Sprite, SpriteFrame, Vec3 } from "cc";
import { ResManager } from "../ResManager";


// 创建一个节点
export function createNode(parent?:Node,worldPos?:Vec3):Node{
    const node = new Node();
    parent && (node.setParent(parent));
    worldPos && node.setWorldPosition(worldPos);
    return node;
}

// 预制体创建节点
export function createNodeWithPrefab(prefab:Prefab | string,parent?:Node,worldPos?:Vec3):Node{
    let pre = typeof(prefab)==='string'? ResManager.Instance.getPrefab(prefab):prefab;
    const node = instantiate(pre);
    parent && node.setParent(parent);
    worldPos && node.setWorldPosition(worldPos);
    return node;
}

// 创建一个精灵节点
export function createSprite(frame:SpriteFrame | string, parent?:Node,worldPos?:Vec3):Sprite{
    const node = createNode(parent,worldPos);
    let spriteFrame:SpriteFrame;
    if (typeof frame === 'string') {
        spriteFrame = ResManager.Instance.getSpriteFrame(frame);
    }
    else{
        spriteFrame = frame;
    }
    const sp = node.addComponent(Sprite);
    sp.spriteFrame = spriteFrame;
    return sp;
}

