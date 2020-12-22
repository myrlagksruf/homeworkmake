const initJS = `const digestMessage = async m => btoa(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(m))).reduce((a, b) => a + String.fromCharCode(b), ''));

const promisify = (elem, type="success", fun = e => e) => {
    let resolve, reject;
    const pro = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
        elem.addEventListener(type, res, {once:true});
        elem.addEventListener('error', rej, {once:true});
    }).then(e => {
        elem.removeEventListener('error', reject, {once:true});
        return e;
    }).then(fun)
    .catch(err => {
        console.error(err);
        elem.removeEventListener(type, resolve, {once:true});
    });
    return pro;
};

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
        const objStr = dbTemp.transaction(store, "readwrite").objectStore(store);
        document.querySelectorAll('[data-id]').forEach(v => objStr.add({num:v.dataset.id, correct:0, tryArr:[]}));
        return dbTemp;
    } else {
        if(objVersion > version){
            if(!confirm('데이터가 전 버전입니다. 그래도 그대로 하시겠습니까?')) return false;
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
                const objStr = transaction.objectStore(store);
                const objVH = transaction.objectStore('VH');
                objVH.put({name: store, version });
                document.querySelectorAll('[data-id]').forEach(v => objStr.add({num:v.dataset.id, correct:0, tryArr:[]}));
            };
        };
        const { target:{ result } } = await promisify(dbReq);
        return result;
    }
};

const initSetting = async (code, store, map, version = 1) => {
    const db = await getDB('myDB', store, version);
    if(!db){
        alert('프로그램을 종료합니다.');
        window.close();
        return false;
    }
    for(const i in code){
        if(isNaN(i)) break;
        const block = code[i];
        hljs.highlightBlock(block);
        const par = block.parentElement;
        const objectStore = db.transaction([store], "readwrite").objectStore(store);
        const req = objectStore.get('' + i);
        const { target: { result: { correct } } } = await promisify(req);
        if(correct == 1){
            par.classList.add('wrong');
        } else if(correct == 2){
            par.classList.add('correct');
        }
    }
    document.querySelectorAll('[data-id]').forEach(async v => {
        let div = document.createElement('div');
        let but = document.createElement('button');
        but.innerHTML = '제출하기';
        but.dataset.ans = map.get(v.dataset.id);
        but.onclick = async e => {
            let val = await digestMessage(v.value);
            let what = '';
            if(val == e.target.dataset.ans){
                alert(v.dataset.id + '번 문제를 맞췄습니다!!!');
                what = 'correct';
            } else {
                alert('틀렸습니다 ㅠㅠ');
                what = 'wrong';
            }
            const start = code[v.dataset.id].parentElement;
            const objectStore = db.transaction([store], "readwrite").objectStore(store);
            const req = objectStore.get(v.dataset.id);
            let { target:{ result:{ correct, tryArr } } } = await promisify(req);
            tryArr.push(v.value);
            // const objectStore = db.transaction([store], "readwrite").objectStore(store);
            if(what == 'correct'){
                correct = 2;
            } else if(what == 'wrong' && correct < 2){
                correct = 1;
            }
            objectStore.put({num:v.dataset.id, correct, tryArr});
            start.classList.add(what);
            v.value = '';
        };
        div.appendChild(but);
        v.insertAdjacentElement('afterend', div);
    });
};

const text = async (txt, option = {dataType : true, ansType : true}) => {
    const reg = /\\/\\*\\%([^]+?)\\%\\*\\//g;
    const textReg = /\\&((\\#\\d+?)|(\\w+?))\\;/g;
    const textObj = {
        qAElig: "Æ",
        Aacute: "A",
        Acirc: "A",
        Agrave: "A",
        Aring: "A",
        Atilde: "A",
        Auml: "A",
        Ccedil: "C" ,
        ETH: "Ð",
        Eacute: "E",
        Ecirc: "E",
        Egrave: "E",
        Euml: "E",
        Iacute: "I",
        Icirc: "I",
        Igrave: "I",
        Iuml: "I",
        Ntilde: "N",
        Oacute: "O",
        Ocirc: "O",
        Ograve: "O",
        Oslash: "Ø",
        Otilde: "O",
        Ouml: "O",
        THORN: "Þ",
        Uacute: "U",
        Ucirc: "U",
        Ugrave: "U",
        Uuml: "U",
        Yacute: "Y",
        aacute: "a",
        acirc: "a",
        acute: "´",
        aelig: "æ",
        agrave: "a",
        amp: "&",
        aring: "a",
        atilde: "a",
        auml: "a",
        brvbar: "|",
        ccedil: "c",
        cedil: "¸",
        cent: "￠",
        copy: "ⓒ",
        curren: "¤",
        deg: "°",
        divide: "÷",
        eacute: "e",
        ecirc: "e",
        egrave: "e",
        eth: "ð",
        euml: "e",
        frac12: "½",
        frac14: "¼",
        frac34: "¾",
        gt: ">",
        iacute: "i",
        icirc: "i",
        iexcl: "¡",
        igrave: "i",
        iquest: "¿",
        iuml: "i",
        laquo: "≪",
        lt: "<",
        micro: "μ",
        middot: "·",
        nbsp: "",
        not: "￢",
        ntilde: "n",
        oacute: "o",
        ocirc: "o",
        ograve: "o",
        ordf: "ª",
        ordm: "º",
        oslash: "ø",
        otilde: "o",
        ouml: "o",
        para: "¶",
        plusmn: "±",
        pound: "￡",
        quot: '"',
        raquo: "≫",
        reg: "?",
        sect: "§",
        shy: "­",
        sup1: "¹",
        sup2: "²",
        sup3: "³",
        szlig: "ß",
        thorn: "þ",
        times: "×",
        uacute: "u",
        ucirc: "u",
        ugrave: "u",
        uml: "¨",
        uuml: "u",
        yacute: "y",
        yen: "￥",
        yuml: "y",
    };
    const toJSON = v => JSON.parse(v.replace(reg, '$1').replace(textReg, (_, b) => {
        if(b[0] === '#'){
            return String.fromCharCode(parseInt(b.slice(1)));
        } else {
            const res = textObj[b];
            if(res) return res;
            else return '';
        }
    }));
    let data = '';
    if(option.dataType){
        data = marked(txt);
    } else {
        data = txt;
    }
    const ans = data.match(reg).map(toJSON);
    const map = new Map();
    if(option.ansType){
        for(let v of ans){
            const x = await digestMessage(v.ans);
            map.set(v.num, x);
        }
    } else {
        for(let v of ans){
            map.set(v.num, v.ans);
        }
    }
    const raw = data.replace(reg, a => {
        const data = toJSON(a);
        data.ans = map.get(data.num);
        return '/*%' + JSON.stringify(data) + '%*/';
    });
    data = data.replace(reg, '');
    return { data, map, raw };
};

window.addEventListener('load', async () => {
    const { data, map }= await text(document.querySelector('.markdown-body').innerHTML, {dataType: false, ansType: false});
    document.querySelector('.markdown-body').innerHTML = data;
    let version = document.querySelector('h2')?.innerHTML?.match(/\d+/)?.[0];
    if(version){
        version = parseInt(version);
    } else {
        version = 1;
    }
    await initSetting(document.querySelectorAll('pre code'), document.querySelector('h1').innerHTML.replace(/\s/g, ''), map, version);
    window.addEventListener('contextmenu', e => e.preventDefault());
    window.addEventListener('selectstart', e => e.preventDefault());
    window.addEventListener('dragstart', e => e.preventDefault());
});`;
export default initJS;