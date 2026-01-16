import { instantiate, Prefab, resources, Node, find, director } from "cc";
import { UIBase, UIType } from "./UIBase";
import { UIName, UIPath, UIRoot } from "./Tools/UIConfig";
export class UIManager {
    // 容器来装UIBase
    // Map   底层结构哈希表   c++ 红黑树map hashmap  Java TreeMap
    // string UI的名字   UIBase UI的脚本
    private _uis: Map<string, UIBase> = new Map();
    private _uiNodes: Map<string, Node> = new Map();
    private _uiPrefabs: Map<string, Prefab> = new Map();

    private static _instance: UIManager = null;
    private constructor() { }
    static get Instance(): UIManager {
        if (!this._instance) {
            this._instance = new UIManager();
        }
        return this._instance;
    }

    


    // 打开UI   'Logo'
    async openUI(uiName: string, type: UIType = UIType.Page, ...args: any[]) {
        // 曾经打开过的UI  已经存储好了 
        if (this._uis.has(uiName)) {
            this._uis.get(uiName).show(...args);
            return;
        }
        // 层级打开过并存储的UI节点（没有脚本的）
        if (this._uiNodes.has(uiName)) {
            this._uiNodes.get(uiName).active = true;
            return;
        }

        let prefab: Prefab = this._uiPrefabs.get(uiName);
        if (!prefab) {
            // 从来没有打开过的UI 找预制体 加载
            prefab = await new Promise((resolve, reject) => {
                resources.load(UIPath + uiName, Prefab, (err: Error, asset: Prefab) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(asset);
                })
            });
            // 每次有进行预制资源下载 就存储起来 方便下次直接使用
            this._uiPrefabs.set(uiName, prefab);
        }

        const uiNode: Node = instantiate(prefab);
        // 挂载到场景中
        const uiRoot: Node = find(UIRoot);
        const parent: Node = uiRoot.children[type];
        uiNode.parent = parent;
        // 找到UI脚本
        const ui: UIBase = uiNode.getComponent(UIBase);
        if (ui) {
            ui.UIName = uiName;
            ui.init(...args);
            // 存储起来
            this._uis.set(uiName, ui);
            return;
        }
        this._uiNodes.set(uiName, uiNode);
    }

     // 切换场景
    loadScene(sceneName:string,...uiName:UIName[]){
        
        director.loadScene(sceneName,async ()=>{
            this.clear();
            for (const ui of uiName) {
                await this.openUI(ui);
            }
        });
        
    }

    clear(){
        this._uiNodes.clear();
        this._uis.clear();
    }

    // 关闭UI
    closeUI(ui: string | UIBase, clear: boolean = false) {
        // 预设了一个UI脚本
        let uiBase: UIBase = null;
        if (ui instanceof UIBase) {
            // 传进来的就是要找的UI脚本
            uiBase = ui;
        }
        else if (!uiBase) {
            // 去容器中找UI脚本
            uiBase = this._uis.get(ui);
        }
        // 找到了UI脚本
        if (uiBase) {
            uiBase.hide(clear);
            return;
        }
        if (typeof ui === 'string') {
            let node: Node = this._uiNodes.get(ui);
            if (node) {
                if (clear) {
                    node.destroy();
                    this._uiNodes.delete(ui);
                    return;
                }
                node.active = false;
            }
        }

    }

    // 从容器中移除
    removeUI(ui: string | UIBase) {
        if (ui instanceof UIBase) {
            this._uis.delete(ui.UIName);
            return;
        }
        this._uis.delete(ui);
    }

    // 获取UI
    getUI<T extends UIBase>(name: string): T {
        return <T>this._uis.get(name);
    }

    // 获取存储好的没有脚本的UI节点
    getUINode(name: string): Node {
        return this._uiNodes.get(name);
    }
}