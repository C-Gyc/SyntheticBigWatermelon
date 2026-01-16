import { _decorator, Component, director, Node } from 'cc';
import { createNodeWithPrefab } from './Tools/Tools';
import { UIManager } from './UIManager';
import { UIName } from './Tools/UIConfig';
const { ccclass, property } = _decorator;

@ccclass('AppStart')
export class AppStart extends Component {
    protected onLoad(): void {
        UIManager.Instance.openUI(UIName.StartUI);
    }
}


