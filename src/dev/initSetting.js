import marked from './marked/lib/marked.esm.js';
import digestMessage from './hash.js';
import hljs from './highlight/highlight.module.js';
import promisify from './promisify.js';
import getDB from './DB.js';
const initSetting = async (code, store, map, version = 1) => {
    const DB = await getDB('myDB', store, version);
    DB처음체크 : {
        if(!DB){
            alert('프로그램을 종료합니다.');
            window.close();
            return false;
        }
        const transaction = DB.transaction([store], "readwrite");
        const workArr = [];
        const par = [];
        for(const i in code){
            if(isNaN(i)) break;
            const block = code[i];
            hljs.highlightBlock(block);
            par.push(block.parentElement);
            const objectStore = transaction.objectStore(store);
            const req = objectStore.get(`${i}`);
            workArr.push(promisify(req));
        }
        (await Promise.all(workArr)).forEach((v, i) => {
            const correct = v.target.result.correct;
            if(correct == 1){
                par[i].classList.add('wrong');
            } else if(correct == 2){
                par[i].classList.add('correct');
            }
        });
    }
    const setStyle = (node, arr) => {
        arr.slice(1).forEach(n => {
            const m = n.split(',');
            node.style[m[0]] = m[1];
        });
    };
    const makeType = v => t => {
        let node = null;
        if(t.indexOf('textarea') !== -1){
            node = document.createElement('textarea');
            setStyle(node, t.split(';'));
        } else if(t.indexOf('select') !== -1){
            node = document.createElement('select');
            let [tag, options] = t.split(/[\(\)]/);
            setStyle(node, tag.split(';'));
            options = options.split(',');
            for(const i of options){
                const opt = document.createElement('option');
                const str = i.trim();
                option.value = str;
                option.innerHTML = str;
                node.appendChild(opt);
            }
        } else {
            node = document.createElement('input');
            const arr = t.split(';');
            node.type = arr[0];
            setStyle(node, arr);
        }
        v.appendChild(node);
        v.appendChild(document.createElement('br'));
    };
    for(let num = 0; num < code.length; num++){
        let par = code[num];
        do{
            par = par.parentElement;
        } while(par.nodeName !== 'PRE');
        const v = document.createElement('div');
        v.dataset.id = num;
        par.dataset.id = num;
        const type = map[v.dataset.id].type;
        const answer = map[v.dataset.id].ans;
        const but = document.createElement('button');
        if(type){
            if(Array.isArray(type) && type.length === answer.length){
                type.forEach(makeType(v));
            } else {
                if(Array.isArray(type)){
                    answer.forEach(() => makeType(v)('text'));
                } else {
                    if(Array.isArray(answer)){
                        answer.forEach(() => makeType(v)(type));
                    } else {
                        makeType(v)(type)
                    }
                }
            }
        } else {
            if(Array.isArray(answer)){
                answer.forEach(() => makeType(v)('text'));
            } else {
                makeType(v)('text');
            }
        }
        but.innerHTML = '제출하기';
        v.appendChild(but);
        v.appendChild(document.createElement('br'));
        v.appendChild(document.createElement('br'));
        v.appendChild(document.createElement('br'));
        v.appendChild(document.createElement('br'));
        par.insertAdjacentElement('afterend', v);
        but.addEventListener('click', async e => {
            const DB = await getDB('myDB', store, version);
            let objectStore = DB.transaction([store], "readwrite").objectStore(store);
            const req = objectStore.get(v.dataset.id);
            let { target:{ result:{ correct, tryArr } } } = await promisify(req);
            const valNode = v.querySelectorAll('input, textarea, select');
            const start = document.querySelector(`pre[data-id="${v.dataset.id}"]`);
            const oriArr = [];
            let valArr = [];
            let what = '';
            for(const i of valNode){
                const val = i.value.trim();
                oriArr.push(val);
                valArr.push(digestMessage(val));
            }
            valArr = await Promise.all(valArr);
            if(Array.isArray(answer)){
                let ans = 0;
                for(let i = 0; i < valArr.length; i++){
                    if(valArr[i] === answer[i]) ans++;
                }
                if(ans === answer.length){
                    alert(`${v.dataset.id}번 문제를 맞췄습니다!!!`);
                    what = 'correct';
                } else {
                    alert(`${v.dataset.id}번 문제를 ${ans}문제 맞췄습니다.`);
                    what = 'wrong';
                }
                tryArr.push(oriArr);
            } else {
                if(valArr[0] == answer){
                    alert(`${v.dataset.id}번 문제를 맞췄습니다!!!`);
                    what = 'correct';
                } else {
                    alert('틀렸습니다 ㅠㅠ');
                    what = 'wrong';
                }
                tryArr.push(oriArr[0]);
            }
            if(what == 'correct'){
                correct = 2;
            } else if(what == 'wrong' && correct < 2){
                correct = 1;
            }
            objectStore = DB.transaction([store], "readwrite").objectStore(store);
            await promisify(objectStore.put({num:v.dataset.id, correct, tryArr}));
            DB.close();
            start.classList.add(what);
        });
    }
    DB.close();
};

const readBlob = async txt => {
    try{
        const FL = new FileReader();
        let res = await fetch(txt);
        res = await res.blob();
        FL.readAsDataURL(res);
        let {target: {result:data}} = await promisify(FL, 'load');
        return data;
    }catch(err){
        console.error(err);
        return false;
    }
};

const text = async (txt, option = {dataType : true, ansType : true}) => {
    const reg = /\/\*\%([^]+?)\%\*\//g;
    const textReg = /\&((\#\d+?)|(\w+?))\;/g;
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
        const find = data.matchAll(/<[A-Za-z0-9\_\=\"\s-]*?src="(.*?)"[A-Za-z0-9\_\=\"\s-]*?>/g);
        let arr = [];
        const origin = [];
        for(let i of find){
            origin.push(i[1]);
            arr.push(readBlob(i[1]));
        }
        arr = await Promise.all(arr);
        arr.forEach((v, i) => {
            if(v) data = data.replace(origin[i], v);
        });
    } else {
        data = txt;
    }
    const ans = data.match(reg).map(toJSON);
    let map = [];
    if(option.ansType){
        for(let v of ans){
            if(Array.isArray(v.ans)){
                const arr = [];
                for(let t of v.ans){
                    arr.push(await digestMessage(t));
                }
                v.ans = arr;
            } else {
                v.ans = await digestMessage(v.ans);
            }
            map.push(v);
        }
    } else {
        map = ans;
    }
    const raw = data.replace(reg, (c => a => {
        const data = toJSON(a);
        data.ans = map[c++].ans;
        return `/*%${JSON.stringify(data)}%*/`;
    })(0));
    data = data.replace(reg, '');
    return { data, map, raw };
};
export { initSetting, text };