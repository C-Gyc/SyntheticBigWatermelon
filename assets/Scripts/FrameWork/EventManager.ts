// 类： 观察者 1 属性：消息 2 函数（别人告诉观察者他需要执行的某件事情）
class Listener {
    private _msg:string = '';
    private _target:any = null;
    private _callback:Function = null;
    // 只要创建一个观察者 就把消息和需要做的事件告诉他
    // 'refresh',this.clear,this
    constructor(msg:string, call:Function, target:any) {
        this._msg = msg;
        this._callback = call;
        this._target = target;
    }
    // Rest 剩余参数
    callfunc(...args:any[]) {
        //  [...args] Spread 复制对象或数组                                           
        this._callback  && this._callback.apply(this._target, [...args]);
    }
    // 判断别人是不是找我
    equals(msg:string | Function){
        return this._msg === msg || this._callback === msg;
    }
}

export class EventMgr {
    // 存储所有的观察者
    private _listeners:Listener[] = [];
    // 静态变量
    private static _instance:EventMgr = null;
    // 静态函数 公有  唯一获取单例的接口
    static get Instance():EventMgr {
        if (!this._instance) {
            this._instance = new EventMgr();
        }
        return this._instance;
    }
    // 把构造函数私有化
    private constructor() { }


    // 注册消息  别人来到我的平台 注册账户 并且可能需要做某件事
    // msg 消息，call 可能需要办理的某件事
    // 'dir',this.setDir,this(snake)
    // 'refresh',this.clear,this
    on(msg:string, call:Function, target:any) {
        // 限制同一个函数被重复注册
        for (const lis of this._listeners) {
            if (lis.equals(call)) {
                return;
            }
        }
        let listener = new Listener(msg, call, target);
        this._listeners.push(listener);
    }

    off(msg:string | Function, target = null) {
        // 1 通过传函数进来删除对应的事件
        // 传递的参数 如果是函数 通过判断函数 删除事件
        if (typeof (msg) === 'function') {
            for (let i = 0; i < this._listeners.length; i++) {
                if (this._listeners[i].equals(msg)) {
                    this._listeners.splice(i--, 1);
                }
            }
            return;
        }
        // 2 通过传消息进来
        for (let i = 0; i < this._listeners.length; i++) {
            if (this._listeners[i].equals(msg)) {
                this._listeners.splice(i--, 1);
            }
        }
    }

    clear() {
        this._listeners = [];
    }

    // 如果某人有需要 激活某个消息 可能携带参数信息
    // 'dir',e.key
    // 'refresh'
    emit(msg:string, ...args:any[]) {
        // 召集所有的观察者 你们谁负责msg消息 你去告诉你的客户 执行他的函数
        for (const listener of this._listeners) {
            if (listener.equals(msg)) {
                listener.callfunc(...args);
            }
        }
    }
}