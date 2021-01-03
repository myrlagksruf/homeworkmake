import marked from './marked/lib/marked.esm.js';
import digestMessage from './hash.js';
import promisify from './promisify.js';
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
        const find = data.matchAll(/<[A-Za-z0-9\_\=\"\s-]*?src="(.*?)"[A-Za-z0-9\/\_\=\"\s-]*?>/g);
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
export default text;