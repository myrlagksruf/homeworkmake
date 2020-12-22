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
            button.onclick = e => {
                const data = `<!doctype html>
                    <html><head>
                    <meta charset='UTF-8'><meta name='viewport' content='width=device-width initial-scale=1'>
                    <title>${title}</title>
                    <style>${markCSS}</style>
                    <style>${vs2015CSS}</style>
                    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.4.1/highlight.min.js"></script>
                    <script>${initJS}</script>
                    </head>
                    <body><article class="markdown-body">${raw}</article></body></html>`;
                const blob = new Blob([data], {type:'text/plain'});
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `${title}.html`;
                a.click();
            };
            await initSetting(document.querySelectorAll('pre code'), title, map, version);
        });
    });
}, {once: true});