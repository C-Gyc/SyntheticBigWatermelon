    // 面向对象的规范 不要轻易访问某个类或对象的属性
// 通过函数来访问

import { Asset, SpriteAtlas, SpriteFrame, Prefab, JsonAsset, AudioClip, resources, Constructor, AssetManager, assetManager, Skeleton, sp } from "cc";
interface AssetMap {
    frames: Map<string, SpriteFrame>;
    atlass: Map<string, SpriteAtlas>;
    audios: Map<string, AudioClip>;
    prefabs: Map<string, Prefab>;
    jsons: Map<string, JsonAsset>;
    spines:Map<string,sp.SkeletonData>
}
//  export 表示导出当前模块
export class ResManager {
    private _bundles: Map<string, AssetManager.Bundle> = new Map();
    // 所有资源存储在这里面
    // private _assets: Map<string, Asset> = new Map();
    // 不同类型的资源 使用了同一个名字
    private _assets: AssetMap = {
        frames: new Map(),
        atlass: new Map(),
        audios: new Map(),
        prefabs: new Map(),
        jsons: new Map(),
        spines:new Map()
    }

    private static _instance: ResManager = null;
    private constructor() { }
    static get Instance(): ResManager {
        if (!this._instance) {
            this._instance = new ResManager();
        }
        return this._instance;
    }


    // 存储资源接口
    addRes(asset: Asset): void {
        if (asset instanceof SpriteAtlas) {
            // 存储合图资源
            this._assets.atlass.set(asset.name, asset);
            // 把合图资源里面的小图 也存一遍
            for (const frame of asset.getSpriteFrames()) {
                this._assets.frames.set(asset.name, frame);
            }
            return;
        }
        // 判断资源类型是不是我们需要的
        if (asset instanceof SpriteFrame) {
            this._assets.frames.set(asset.name, asset);
        }
        else if (asset instanceof Prefab) {
            this._assets.prefabs.set(asset.name, asset);
        }
        else if (asset instanceof JsonAsset) {
            this._assets.jsons.set(asset.name, asset);
        }
        else if (asset instanceof AudioClip) {
            this._assets.audios.set(asset.name, asset);
        }
        else if (asset instanceof sp.SkeletonData) {
            this._assets.spines.set(asset.name, asset);
        }
    }

    // 获取资源的接口
    getSpriteFrame(assetName: string):SpriteFrame{
        return this._assets.frames.get(assetName);
    }
    getPrefab(assetName: string):Prefab{
        return this._assets.prefabs.get(assetName);
    }
    getAudio(assetName: string):AudioClip{
        return this._assets.audios.get(assetName);
    }
    getAtlas(assetName: string):SpriteAtlas{
        return this._assets.atlass.get(assetName);
    }
    getJson(assetName: string):JsonAsset{
        return this._assets.jsons.get(assetName);
    }
    getSpine(assetName: string):sp.SkeletonData{
        return this._assets.spines.get(assetName);
    }
    // getRes<T extends Asset>(assetName: string): T {
    //     // // 遍历存储进来的全部资源
    //     // for (const asset of this._assets) {
    //     //     // 如果找到某个资源的名字和实参名字一致的
    //     //     if (assetName === asset.name) {
    //     //         return <T>asset;
    //     //     }
    //     // }
    //     // return null;
    //     const asset = this._assets.get(assetName);
    //     if (asset) {
    //         return <T>asset;
    //     }
    //     return null;
    // }

    // (progress)=>{ }
    async loadAll(onProgress: (percent: number) => void = null) {
        // new Promise()  得到一个对象
        // 前缀 await 等待promise内部的异步函数执行完毕
        // 存在await的函数 前面要加上 async
        const ress: Asset[] = await this.loadDir('', onProgress);
        for (const asset of ress) {
            this.addRes(asset);
        }
    }

    async loadDir(dir: string, onProgress: (percent: number) => void = null, bundle: AssetManager.Bundle | string = null): Promise<Asset[]> {
        let loader: AssetManager.Bundle = null;
        if (bundle) {
            // 通过bundle的名字获取bundle
            if (typeof (bundle) === 'string') {
                loader = await this.getBundle(bundle);
            }
            else {
                loader = bundle;
            }
        }
        // 如果loader还是没有值 认为是resources
        !loader && (loader = resources);

        return new Promise((resolve, reject) => {
            loader.loadDir(dir,
                (finish, total) => {
                    // bar.progress = finish / total;
                    onProgress && onProgress(finish / total);
                },
                (err, assets) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(assets);
                }
            );
        });
    }

    async loadRes<T extends Asset>(path: string, type: Constructor<T>, bundle: AssetManager.Bundle | string = null): Promise<T> {
        let loader: AssetManager.Bundle = null;
        if (bundle) {
            // 通过bundle的名字获取bundle
            if (typeof (bundle) === 'string') {
                loader = await this.getBundle(bundle);
            }
            else {
                loader = bundle;
            }
        }
        // 如果loader还是没有值 认为是resources
        !loader && (loader = resources);
        return new Promise((resolve, reject) => {
            loader.load(path, type, (err, asset: T) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(asset);
            });
        });
    }

    async getBundle(bundleName: string): Promise<AssetManager.Bundle> {
        let bundle = this._bundles.get(bundleName);
        if (!bundle) {
            bundle = await this.loadBundle(bundleName);
        }
        return bundle;
    }

    async loadBundle(bundleName: string): Promise<AssetManager.Bundle> {
        const bundle: AssetManager.Bundle = await new Promise((resolve, reject) => {
            assetManager.loadBundle(bundleName, (err: Error, data: AssetManager.Bundle) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(data);
            });
        })
        this._bundles.set(bundleName, bundle);
        return bundle;
    }

    // async bundelLoadDir(bundle:AssetManager.Bundle){
    //     return new Promise((resolve, reject) => {
    //         bundle.loadDir(dir,
    //             (finish, total) => {
    //                 // bar.progress = finish / total;
    //                 onProgress && onProgress(finish / total);
    //             },
    //             (err, assets) => {
    //                 if (err) {
    //                     reject(err);
    //                     return;
    //                 }
    //                 resolve(assets);
    //             }
    //         );
    //     });
    // }

}