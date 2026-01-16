import { assetManager, AssetManager, JsonAsset, log, TextAsset } from "cc";
//数据基类
export interface DataBase {
    id: number
}

// 解析csv文件
class CSVCtrl {
    private _datas: Map<number, DataBase> = new Map();
    constructor(csv: TextAsset) {
        this._parseCSV(csv);
    }

    private _parseCSV(dataAsset: TextAsset | JsonAsset) {
        if (dataAsset instanceof JsonAsset) {
            const datas = dataAsset.json;
            if (Array.isArray(datas)) {
                for (const data of datas) {
                    this._datas.set(data.id,data);
                }
                return;
            }
            this._datas.set(datas.id,<DataBase>datas);
            return;
        }
        // console.log(csv.text);
        let dataString: string = dataAsset.text;
        // 通过\r\n 拆分成多行
        let datainfos: string[] = dataString.split('\r\n');
        // 最后一个空字符串 不要了
        datainfos.pop();
        // 获取第0行 作为每个数据对象的属性
        let propertys: string[] = datainfos[0].split(',');
        // 把表格第一列删除
        propertys.shift();
        // 去掉表格第一行
        datainfos.shift();
        // 数据类型
        let types: string[] = datainfos[0].split(',');
        types.shift();
        datainfos.shift();

        for (const info of datainfos) {
            let values = info.split(',');
            values.shift();
            // 创建一个对象
            let obj = {};
            for (let i = 0; i < values.length; i++) {
                // 拿到值
                let value = values[i];
                if (value === 'none') {
                    obj[propertys[i]] = undefined;
                    continue;
                }
                // 判断值的数据类型
                switch (types[i]) {
                    case 'number':
                        obj[propertys[i]] = Number(value);
                        break;
                    case 'string':
                        obj[propertys[i]] = value;
                        break;
                    case 'number[]':
                        obj[propertys[i]] = [];
                        for (const v of value.split(';')) {
                            obj[propertys[i]].push(Number(v));
                        }
                        break;
                    case 'string[]':
                        obj[propertys[i]] = value.split(';');
                        break;
                    default:
                        break;
                }
            }
            this._datas.set(obj['id'], <DataBase>obj);
        }
    }
    // 获取当前文件里存储的某一段数据（对象）
    getDataById<T extends DataBase>(id: number): T {
        const data = this._datas.get(id);
        if (data) {
            return <T>data;
        }
        return null;
    }

    getAllDatas<T extends DataBase>():T[]{
        let arr:T[] = [];
        // 遍历map容器  kv 第0个就是key  第1个就是value
        for (const kv of this._datas) {
            arr.push(<T>kv[1]);
        }
        return arr;
    }

}


export class DataManager {
    private _dataCtrls: Map<string, CSVCtrl> = new Map();
    private _dataBundle: AssetManager.Bundle = null;
    private static _instance: DataManager = null;
    private constructor() { }
    static get Instance(): DataManager {
        if (!this._instance) {
            this._instance = new DataManager();
        }
        return this._instance;
    }

    async loadAllData(bundleName: string) {
        if (!this._dataBundle) {
            this._dataBundle = await this.loadDataBundle(bundleName);
        }
        const textAssets:TextAsset[] = await new Promise((resolve, reject) => {
            this._dataBundle.loadDir('', (err:Error, datas: TextAsset[]) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(datas);
            });
        });
        // 存储数据的文件夹（bundle)当中的所有数据文件资源
        for (const text of textAssets) {
            this._dataCtrls.set(text.name, new CSVCtrl(text));
        }
        
    }


    async loadDataBundle(bundleName: string):Promise<AssetManager.Bundle> {
        return new Promise((resolve, reject) => {
            assetManager.loadBundle(bundleName, (err, data: AssetManager.Bundle) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(data);
            });
        });
    }

    async loadDataFile(fileName: string,bundleName?:string) {
        if (!this._dataBundle) {
            this._dataBundle = await this.loadDataBundle(bundleName);
        }
        const textAsset: TextAsset = await new Promise((resolve, reject) => {
            this._dataBundle.load(fileName, (err: Error, data: TextAsset) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(data);
            })
        });
        this._dataCtrls.set(fileName, new CSVCtrl(textAsset));
    }
    // 通过文件名 获取它存储的所有数据
    getAllDataByName<T extends DataBase>(fileName:string):T[]{
        const ctrl = this._dataCtrls.get(fileName);
        if (ctrl) {
            return ctrl.getAllDatas<T>();
        }
        return null;
    }
    // 通过文件名 以及 id 获取那个文件中存储的对应id的数据
    getDataById<T extends DataBase>(id:number,fileName?:string):T{
        if (!fileName) {
            // 如果没有传文件名 那就遍历所有数据文件
            for (const ctrl of this._dataCtrls) {
                // 每个文件操作者 都去查一下自己有没有id相符的数据对象
                const data = ctrl[1].getDataById<T>(id);
                if (data) {
                    return data;
                }
            }
            return null;
        }
        //如果传了文件名 直接针对文件名 找到ctrl
        const ctrl = this._dataCtrls.get(fileName);
        if (ctrl) {
            return ctrl.getDataById<T>(id);
        }
    }
}