import { assertID, Constructor, director, ISchedulable, macro, Node, Scheduler } from 'cc';
import { ModulerMgr } from './ModulerMgr';

export class ModulerBase  {
    
    protected _node: Node = null;

    addToScene(root: Node, modulerName: string) {
        !this._node && (this._node = new Node(modulerName));
        this._node.parent = root;
    }

    init(...args: any[]) {

    }

    // 生命周期
    onStart() {

    }
    update(deltaTime: number) {

    }
    onDestroy() {

    }

    unscheduleAll() {
        const scheduler = director.getScheduler();
        Scheduler.enableForTarget(this);
        scheduler.unscheduleAllForTarget(this);
    }

    getModuler<T extends ModulerBase>(modulerName: string | Constructor<T>): T {
        return ModulerMgr.Instance.getModuler<T>(modulerName);
    }

    schedule(callback: any, interval?: number, repeat?: number, delay?: number,p:boolean=true): void {
        assertID(Boolean(callback), 1619);

        interval = interval || 0;
        assertID(interval >= 0, 1620);

        repeat = Number.isNaN(repeat) ? macro.REPEAT_FOREVER : repeat;
        delay = delay || 0;

        const scheduler = director.getScheduler();
        // 把当前脚本作为引擎定时器的一个有效对象
        Scheduler.enableForTarget(this);

        const paused = scheduler.isTargetPaused(this);
        if (!p) {
            scheduler.schedule(callback, this, interval, repeat, delay,paused);
            return;
        }
        scheduler.schedule(callback, this, interval, repeat, delay);
        
    }

    public scheduleOnce (callback:any, delay:number = 0): void {
        this.schedule(callback, 0, 0, delay,false);
    }
    public unschedule(callbackFunc):void{
        if(!callbackFunc){
            return;
        }
        director.getScheduler().unschedule(callbackFunc,this)
    }
}


