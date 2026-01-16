import { Constructor, Node } from "cc";
import { ModulerBase } from "./ModulerBase";

export class ModulerMgr {
    private _root: Node = null;
    // 存储所有的观察者
    private _modulers: Map<string, ModulerBase> = new Map();
    // 静态变量
    private static _instance: ModulerMgr = null;
    // 静态函数 公有  唯一获取单例的接口
    static get Instance(): ModulerMgr {
        if (!this._instance) {
            this._instance = new ModulerMgr();
        }
        return this._instance;
    }
    // 把构造函数私有化
    private constructor() { }
    set Root(node: Node) {
        this._root = node;
    }

    // 生命周期
    onStart(){
        this._modulers.forEach((moduler,key)=>{
            moduler.onStart();
        });
    }
    update(deltaTime:number){
        this._modulers.forEach((moduler,key)=>{
            moduler.update(deltaTime);
        });
    }

    clear(){
        this._modulers.forEach((moduler,key)=>{
            moduler.unscheduleAll();
            moduler.onDestroy();
        });
        this._modulers.clear();
    }

    // 添加模块
    addModuler(moduler: ModulerBase, modulerName: string, ...args: any[]) {
        if (this._modulers.has(modulerName)) {
            return;
        }
        moduler.init(...args);
        moduler.addToScene(this._root,modulerName);
        this._modulers.set(modulerName, moduler);
    }
    // 获取
    getModuler<T extends ModulerBase>(modulerName: string | Constructor<T>): T {
        if (typeof modulerName === 'string') {
            const moduler = this._modulers.get(modulerName);
            if (moduler) {
                return <T>moduler;
            }
            return null;
        }

        for (const m of this._modulers) {
            if (m[1] instanceof modulerName) {
                return <T>m[1];
            }
        }
        return null;
    }

    // 移除
    removeMuduler(moduler: string | ModulerBase) {
        if (typeof moduler === 'string') {
            const m = this._modulers.get(moduler);
            if (m) {
                m.onDestroy();
                m.unscheduleAll();
                this._modulers.delete(moduler);
            }
            return;
        }
        for (const m of this._modulers) {
            if (m[1] === moduler) {
                m[1].onDestroy();
                m[1].unscheduleAll();
                this._modulers.delete(m[0]);
            }
        }
    }
    
}