import initSetting from './initSetting.js';
import text from './text.js';
window.addEventListener('load', e => {
    const body = document.querySelector('#control-bar');
    const input = document.createElement('input');
    const button = document.createElement('button');
    const span = document.createElement('span');
    const label = document.createElement('label');
    const check = document.createElement('input');
    const now = Date.now();
    span.style.display = 'inline-block';
    span.style.paddingLeft = '30px';
    label.setAttribute('for', now);
    label.innerHTML = '시험 모드 : ';
    label.style.userSelect = 'none';
    check.id = now;
    check.type = 'checkbox';
    span.appendChild(label);
    span.appendChild(check);
    button.innerHTML = '문제집 다운로드';
    input.type = 'file';
    body.appendChild(input);
    body.appendChild(button);
    body.appendChild(span);
    const reader = new FileReader();
    input.addEventListener('change', event => {
        reader.readAsText(event.target.files[0]);
        reader.addEventListener('load', async e => {
            const { data, map, raw }= await text(e.target.result, {path:event.target.files[0].path});
            document.querySelector('.markdown-body').innerHTML = data;
            let version = document.querySelector('h2').innerHTML.match(/\d+/)?.[0];
            if(version){
                version = parseInt(version);
            } else {
                version = 1;
            }
            const title = document.querySelector('h1').innerHTML.replace(/\s/g, '');
            button.onclick = async e => {
                const res = await fetch(`study://download/${check.checked}`, {
                    method:'POST',
                    body:JSON.stringify({title, raw})
                });
                const blob = await res.blob();
                const a = document.createElement('a');
                const url = URL.createObjectURL(blob);
                a.href = url;
                a.download = `${title}.html`;
                a.click();
                URL.revokeObjectURL(url);
            };
            await initSetting(document.querySelectorAll('pre code'), title, map, version);
        });
    });
}, {once: true});