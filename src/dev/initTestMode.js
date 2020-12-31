import hljs from './highlight/highlight.module.js';
import promisify from './promisify.js';
import getDB from './DB.js';
const initSetting = async (code, store, map, version = 1) => {
    const DB = await getDB('myDB', store, version);
    const result = {};
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
            const tryArr = v.target.result.tryArr;
            result[i] = tryArr;
            if(tryArr.length){
                par[i].classList.add('correct');
            } else {
                par[i].classList.add('wrong');
            }
        });
    }
    const setStyle = (node, arr) => {
        arr.slice(1).forEach(n => {
            const m = n.split(',');
            node.style[m[0]] = m[1];
        });
    };
    const makeType = v => (t, val='') => {
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
        if(val) node.value = val;
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
        const make = makeType(v);
        if(type){
            if(Array.isArray(type) && type.length === answer.length){
                type.forEach((t, i) => make(t, result[num][i]));
            } else {
                if(Array.isArray(type)){
                    answer.forEach((t, i) => make('text', result[num][i]));
                } else {
                    if(Array.isArray(answer)){
                        answer.forEach((t, i) => make(type, result[num][i]));
                    } else {
                        make(type, result[num][0]);
                    }
                }
            }
        } else {
            if(Array.isArray(answer)){
                answer.forEach((t, i) => make('text', result[num][i]));
            } else {
                make('text', result[num][0]);
            }
        }
        but.innerHTML = '답 저장하기';
        v.appendChild(but);
        Array(4).fill(0).forEach(() => v.appendChild(document.createElement('br')));
        par.insertAdjacentElement('afterend', v);
        but.addEventListener('click', async e => {
            const DB = await getDB('myDB', store, version);
            const objectStore = DB.transaction([store], "readwrite").objectStore(store);
            const start = document.querySelector(`pre[data-id="${v.dataset.id}"]`);
            const valNode = v.querySelectorAll('input, textarea, select');
            const oriArr = [];
            for(const i of valNode){
                const val = i.value.trim();
                oriArr.push(val);
            }
            result[num] = oriArr;
            await promisify(objectStore.put({num:v.dataset.id, correct : 0, tryArr:oriArr}));
            DB.close();
            alert(`${num}번 문제를 풀었습니다.`);
            start.classList.add('correct');
        });
    }
    window.addEventListener('keydown', e => {
        if(e.ctrlKey && e.key === 's'){
            const blob = new Blob([JSON.stringify(result)]);
            const a = document.createElement('a');
            const url = URL.createObjectURL(blob);
            a.href = url;
            a.download = `${store}정답.json`;
            a.click();
            URL.revokeObjectURL(url);
            e.stopPropagation();
            e.preventDefault();
        }
    });
    DB.close();
};
export default initSetting;