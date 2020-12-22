const promiseEvent = (elem, type="success", fun = e => e) => {
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
export default promiseEvent;