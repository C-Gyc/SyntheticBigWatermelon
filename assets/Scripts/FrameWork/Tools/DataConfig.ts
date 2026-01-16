import { sp, SpriteFrame } from "cc";
export class DataConfig {
    // 静态变量
    private static _instance: DataConfig = null;
    // 静态函数 公有  唯一获取单例的接口
    static get Instance(): DataConfig {
        if (!this._instance) {
            this._instance = new DataConfig();
        }
        return this._instance;
    }
    
    // 把构造函数私有化
    private constructor() { }


    private _coinCount:number = 0;
    private _killedCount: number = 0;
    private _selectedRole:string= null;
    private _count:number =  0
    private _type :string = null;
    private _percent:number = 0;
     private _flash: number = 0;
    private _gold: number = 0;
    private _beryl: number = 0;
    private _lv:number = 0;

    //体力
    set Flash(flash:number){
        this._flash = flash;
    }
    get Flash(){
        return this._flash;
    }

    //金币
    set Gold(gold: number){
        this._gold = gold;
    }
    get Gold(){
        return this._gold;
    }

    //绿宝石
    set Beryl(beryl: number){
        this._beryl = beryl;
    }
    get Beryl(){
        return this._beryl;
    }
    set SelectRole(selectedRole){
        this._selectedRole = selectedRole;
    }
    get SelectRole(){
        return this._selectedRole;
    }
     
    set Count(index: number) {
        this._count = index;
    }
    get Count(): number {
        return this._count;
    }
     set Type(type){
        this._type = type;
    }
    get Type(){
        return this._type;
    }
     set CoinCount(coin: number){
        this._coinCount = coin;
    }
    get CoinCount(){
        return this._coinCount;
    }

    set KilledCount(kill: number){
        this._killedCount = kill;
    }
    get KilledCount(){
        return this._killedCount;
    }

    set Percent(percent:number){
        this._percent=percent
    }
    get Percent(){
        return this._percent;
    }

    get LV(){
        return this._lv;
    }
    set LV(lv){
    this._lv=lv;
    }
}
