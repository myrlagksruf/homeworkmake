import { initSetting, text } from './initSetting.js';
import markCSS from './markcss.js';
import vs2015CSS from './vs2015css.js';
import initJS from './initJS.js';
window.addEventListener('load', e => {
    const body = document.querySelector('#control-bar');
    const input = document.createElement('input');
    const button = document.createElement('button');
    button.innerHTML = '문제집 다운로드';
    input.type = 'file';
    body.appendChild(input);
    body.appendChild(button);
    const reader = new FileReader();
    input.addEventListener('change', e => {
        reader.readAsText(e.target.files[0]);
        reader.addEventListener('load', async e => {
            const { data, map, raw }= await text(e.target.result);
            document.querySelector('.markdown-body').innerHTML = data;
            let version = document.querySelector('h2').innerHTML.match(/\d+/)?.[0];
            if(version){
                version = parseInt(version);
            } else {
                version = 1;
            }
            const title = document.querySelector('h1').innerHTML.replace(/\s/g, '');
            button.onclick = async e => {
                const res = await fetch('study://download/', {
                    method:'POST',
                    body:JSON.stringify({title, raw})
                });
                const blob = await res.blob();
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `${title}.html`;
                a.click();
            };
            await initSetting(document.querySelectorAll('pre code'), title, map, version);
        });
    });
}, {once: true});