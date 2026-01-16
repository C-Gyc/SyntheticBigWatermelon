import { Component, instantiate, Prefab, Node } from "cc";

type Constructor<T = {}> = new (...args: any[]) => T;
interface IPoolHandler extends Component {
    unuse(): void;
    reuse(...args: any[]): void;
}

/**
 * 对象池：用于复用 `Node` 实例，减少频繁创建/销毁带来的性能开销。
 * - 使用指定的 `Prefab` 预制体创建初始对象
 * - 支持放入（put）与获取（get）操作
 * - 可选的池对象处理组件（实现 `IPoolHandler`）用于回收/重用时的额外逻辑
 */
export class INodePool {
    private _nodes: Node[] = [];
    private _nodePrefab: Prefab = null;
    private _defaulCount: number = 10;

    private _poolHandlerComp?: Constructor<IPoolHandler> | string;

    /**
     * 创建一个节点池
     * @param prefab 用于实例化节点的 `Prefab`
     * @param poolHandlerComp 可选的池处理组件（类或组件名），在 put/get 时调用 `unuse`/`reuse`
     * @param count 初始创建的节点数量，默认 10
     */
    constructor(prefab: Prefab, poolHandlerComp?: Constructor<IPoolHandler> | string, count: number = 10) {
        this._nodePrefab = prefab;
        this._poolHandlerComp = poolHandlerComp;
        this._defaulCount = count;
        this.Init();
    }

    /**
     * 示例：创建并使用一个节点池
     * @example
     * const pool = new INodePool(myPrefab, 'MyPoolHandler', 5);
     * const node = pool.get();
     * // 使用 node ...
     * pool.put(node);
     */

    Init() {
        if (!this._nodePrefab) {
            console.warn("无预制体");
            return;
        }
        for (let i = 0; i < this._defaulCount; i++) {
            const node = instantiate(this._nodePrefab);
            this._nodes.push(node);
        }
    }

    size(): number {
        return this._nodes.length;
    }

    /**
     * 清空池中的空闲节点引用
     * 注意：此方法仅清空内部引用数组，若需要主动销毁节点（释放内存/资源），请在调用前自行处理
     */
    clear() {
        this._nodes = [];
    }

    /**
     * 从池中获取一个节点
     * - 若池内有空闲节点则直接返回
     * - 若池为空则会尝试用预制体补充一批节点后返回新节点
     * @returns 如果成功返回 `Node`，否则在无预制体时返回 `null`
     * @example
     * const node = pool.get();
     */
    get(): Node | null {
        let node = this._nodes.pop();
        if (!node) {
            if (!this._nodePrefab) {
                console.warn("无预制体");
                return;
            }
            this.Init();
            node = this._nodes.pop();
        }
        return node;
    }

    /**
     * 将节点放回池中
     * - 如果构造池时指定了 `poolHandlerComp`，且节点上存在该组件，则会调用组件的 `unuse()` 方法以便组件处理回收逻辑
     * - 会自动将节点从父节点移除（`removeFromParent()`），然后推入空闲列表
     * @param obj 要回收的节点（如果为 null 或已在池中则忽略）
     */
    put(obj: Node): void {
        if (obj && this._nodes.indexOf(obj) === -1) {
            //@ts-ignore
            const handler = this._poolHandlerComp ? obj.getComponent(this._poolHandlerComp) : null;
            if (handler && handler.unuse) {
                handler.unuse();
            }
            obj.removeFromParent();
            this._nodes.push(obj);
        }
    }

}


/**
 * 全局对象池管理器（单例）
 * - 维护多个以名称为键的 `INodePool`
 * - 提供注册池、回收节点、获取节点的便捷接口
 */
export class PoolManager {
    private _pools: Map<string, INodePool> = new Map();

    private static _instance: PoolManager = null;
    private constructor() { }

    /** 单例访问 */
    static get Instance(): PoolManager {
        if (!this._instance) {
            this._instance = new PoolManager();
        }
        return this._instance;
    }

    /**
     * 注册一个命名的节点池，若已存在则忽略
     * @param name 池名称（键）
     * @param pool 节点池实例
     */
    addPool(name: string, pool: INodePool) {
        if (this._pools.has(name)) {
            return;
        }
        this._pools.set(name, pool);
    }

    /**
     * 回收节点到指定池，若不传 `poolName` 则使用节点自身的 `name`
     */
    put(obj: Node, poolName?: string) {
        // 说明：当前实现会优先使用节点自身的 `name` 作为池名（若存在），否则使用传入的 `poolName`。
        // 若希望以传入的 `poolName` 优先，请调整为 `poolName = poolName || obj.name`。
        poolName = obj.name || poolName;
        let pool = this._pools.get(poolName);
        if (!pool) {
            return;
        }
        pool.put(obj);
    }

    get(poolName?: string,prefab: Prefab = null): Node | null {
        let pool = this._pools.get(poolName);
        if (!pool) {
            if(!prefab){
                return null;
            }
            pool = new INodePool(prefab);
        }
        return pool.get();
    }
}