import { initSetting, text } from './initSetting.js';
window.addEventListener('load', async () => {
    const { data, map }= await text(document.querySelector('.markdown-body').innerHTML, {dataType: false, ansType: false});
    document.querySelector('.markdown-body').innerHTML = data;
    console.log(map);
    let version = document.querySelector('h2').innerHTML.match(/\d+/)?.[0];
    if(version){
        version = parseInt(version);
    } else {
        version = 1;
    }
    await initSetting(document.querySelectorAll('pre code'), document.querySelector('h1').innerHTML.replace(/\s/g, ''), map, version);
    window.addEventListener('contextmenu', e => e.preventDefault());
    window.addEventListener('selectstart', e => e.preventDefault());
    window.addEventListener('dragstart', e => e.preventDefault());
});