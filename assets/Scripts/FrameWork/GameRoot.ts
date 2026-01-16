import { _decorator, Component, log, Node, Vec3 } from 'cc';
import { ModulerMgr } from './ModulerMgr';
import { Modulers } from './Tools/ModulerConfig';
const { ccclass, property } = _decorator;
export enum GameRootType {
    Bg = 'Bg',
    Role = 'Role',
    Bullet = 'Bullet',
    
}

@ccclass('GameRoot')
export class GameRoot extends Component {

    protected onLoad(): void {

        ModulerMgr.Instance.Root = this.node;
        // 把游戏中所有的moduler全部存起来
        // 遍历Modulers对象 该对象所有的键和值（类，创建对象） 存储到管理者
        for (const key in Modulers) {
            const modulerClass = Modulers[key];
            ModulerMgr.Instance.addModuler(new modulerClass(), key);
        }  
    }
    start() {
        ModulerMgr.Instance.onStart();
    }

    update(deltaTime: number) {
        ModulerMgr.Instance.update(deltaTime);
    }

    protected onDestroy(): void {
        ModulerMgr.Instance.clear();
    }
}


