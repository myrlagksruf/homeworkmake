import marked from './marked/lib/marked.esm.js';
import digestMessage from './hash.js';
import hljs from './highlight/highlight.module.js';
import promisify from './promisify.js';
import getDB from './DB.js';
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
        console.log(store);
        const objectStore = db.transaction([store], "readwrite").objectStore(store);
        const req = objectStore.get(`${i}`);
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
                alert(`${v.dataset.id}번 문제를 맞췄습니다!!!`);
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
    map.forEach(v => console.log(v));
    console.log(map);
    const raw = data.replace(reg, a => {
        const data = toJSON(a);
        data.ans = map.get(data.num);
        return `/*%${JSON.stringify(data)}%*/`;
    });
    data = data.replace(reg, '');
    return { data, map, raw };
};
export { initSetting, text};