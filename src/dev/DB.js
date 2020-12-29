import promisify from './promisify.js';
const getDB = async (name, store, version) => {
    let DBVH = (await indexedDB.databases()).find(v => v.name === name)?.version ?? 1;
    const dbconfirm = indexedDB.open(name, DBVH);
    dbconfirm.onupgradeneeded = e => {
        const db = e.target.result;
        if(!db.objectStoreNames.contains('VH')){
            const db = e.target.result;
            const objectStore = db.createObjectStore('VH', {keyPath: 'name'});
            objectStore.createIndex('version', 'version', {unique:false});
        }
    };
    let { target: { result:dbTemp } } = await promisify(dbconfirm);
    let objVersion;
    if(dbTemp.objectStoreNames.contains('VH')){
        const objectStore = dbTemp.transaction('VH', "readwrite").objectStore('VH');
        const { target: { result:ver } } = await promisify(objectStore.get(store));
        objVersion = ver?.version;
    } else {
        dbTemp.close();
        const dbconfirm = indexedDB.open(name, ++DBVH);
        dbconfirm.onupgradeneeded = e => {
            const db = e.target.result;
            const objectStore = db.createObjectStore('VH', {keyPath: 'name'});
            objectStore.createIndex('version', 'version', {unique:false});
        };
        dbTemp = (await promisify(dbconfirm)).target.result;
        const objectStore = dbTemp.transaction('VH', "readwrite").objectStore('VH');
        const { target: { result:ver } } = await promisify(objectStore.get(store));
        objVersion = ver?.version;
    }
    
    if(objVersion === version){
        return dbTemp;
    } else {
        if(objVersion > version){
            if(!confirm('데이터가 전 버전입니다. 그래도 그대로 하시겠습니까?')) return null;
        }
        dbTemp.close();
        const dbReq = indexedDB.open(name, ++DBVH);
        dbReq.onupgradeneeded = e => {
            const db = e.target.result;
            if(db.objectStoreNames.contains(store)){
                db.deleteObjectStore(store);
            }
            const objectStore = db.createObjectStore(store, {keyPath: 'num'});
            objectStore.createIndex('tryArr', 'tryArr', {unique:false});
            objectStore.createIndex('correct', 'correct', {unique: false});
            objectStore.transaction.oncomplete = e => {
                const transaction = db.transaction(['VH', store], "readwrite");
                const objVH = transaction.objectStore('VH');
                const objStore = transaction.objectStore(store);
                objVH.put({name: store, version });
                document.querySelectorAll('pre code').forEach((v, i) => objStore.add({num : `${i}`, tryArr: [], correct: 0}));
            };
        };
        const { target:{ result } } = await promisify(dbReq);
        return result;
    }
};
export default getDB;