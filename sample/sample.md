# for문, Array, Event 문제

## version : 2

### 다음 코드를 보고 console.log의 결과를 작성하시오.

```javascript
let arr = [];
let x = 0;
for(let i = 0; i < 3; i++){
    arr[i] = [];
    for(let j = 0; j < 10; j++){
        arr[i][j] = x;
        x += 1;
    }
}
console.log(arr[2][5]);
/*%{"num":"0", "ans": "25"}%*/
```

<input type="text" data-id="0">



```javascript
let s = 0;
for(let i = 0; i < 30; i++){
    if(i % 3 == 0 && i % 2 == 0) {
        s += i;
    }
}
console.log(s);
/*%{"num":"1", "ans": "60"}%*/
```

<input type="text" data-id="1">



```javascript
let str = '';
for(let i = 0; i < 4; i++){
    for(let j = 0; j < 4; j++){
        if(j == i) continue;	//모르면 인터넷에서 찾아볼 것.
        str += `${i}${j}`;
    }
}
console.log(str);
/*%{"num":"2", "ans": "010203101213202123303132"}%*/
```

<input type="text" data-id="2">



```javascript
let a = '';
for(let i = 0; i < 10; i++){
    if(i % 2 == 0){
        continue;	
    } else {
        a = `${a}${i}`;
    }
}
console.log(a);
/*%{"num":"3", "ans": "13579"}%*/
```

<input type="text" data-id="3">



```javascript
let s = '';
for(let i = 7; i >= 0; i -= 2){
    for(let j = 7; j >= i; j -= 2){
        s = `${s} `;
    }
    for(let j = 0; j < i; j++){
        s = `${s}*`;
    }
    s = `${s}\n`;
}
console.log(s);
/*%{"num":"4", "ans": "*******\n *****\n  ***\n   *"}%*/
```

<textarea style="height: 100px;" data-id="4"></textarea>



```html
<table>
    <thead>
        <tr>
            <th>학년</th>
            <th>반</th>
            <th>번호</th>
            <th>이름</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>1학년</td>
            <td>3반</td>
            <td>5번</td>
            <td>김한결</td>
        </tr>
        <tr>
            <td>2학년</td>
            <td>2반</td>
            <td>8번</td>
            <td>문성준</td>
        </tr>
        <tr>
            <td>3학년</td>
            <td>7반</td>
            <td>1번</td>
            <td>황승현</td>
        </tr>
    </tbody>
</table>
<script>
    let trs = document.querySelectorAll('tbody > tr');
    let who = '';
    for(let i = 0; i < trs.length; i++){
        let tr = trs[i].children;
        if(parseInt(tr[0].innerHTML) == 3){
            who = tr[0].innerHTML;
            for(let j = 1; j < tr.length; j++){
                who += `,${tr[j].innerHTML}`;
            }
        }
    }
    console.log(who);
</script>
/*%{"num":"5", "ans": "3학년,7반,1번,황승현"}%*/
```

<input type="text" data-id="5">



### 다음 코드에 주석에 달린 행동을 한 뒤 console.log를 했을 때 결과를 작성하시오.

```html
<table>
    <tbody>
    </tbody>
</table>
<script>
    let tbody = document.querySelector('tbody');
    let result = 0;
    for(let i = 0; i < 10; i++){
        let tr = document.createElement('tr');
        tbody.appendChild(tr);
        for(let j = 0; j < 10; j++){
            let td = document.createElement('td');
            td.innerHTML = i * 10 + j;
            tr.appendChild(td);
        }
    }
    tbody.onclick = e => {
        if(e.target.nodeName == 'TD'){
            result += parseInt(e.target.innerHTML);
        }
    }
    //table에 맨 왼쪽에 있는 칸들을 전부 한 번씩 클릭한 뒤 console.log(result)
</script>
/*%{"num":"6", "ans": "450"}%*/
```

<input type="text" data-id="6">



```html
<head>
    <style>
        .red{
            background-color: red;
        }
        .green{
            background-color:green;
        }
        .blue{
            background-color: blue;
        }
        #container div{
            width: 100px;
            height: 100px;
        }
	</style> 
</head>
<body>
    <div id="container">
        <div class="red"></div>
        <div class="green"></div>
        <div class="blue"></div>
    </div>
    <script>
        let cont = document.querySelector('#container');
        let result = 0;
        let getString = res => {
            let arr = [];
            for(let i = 0; i < 3; i++){
                arr[i] = res % 256;
                res = parseInt(res / 256);
            }
            return `rgb(${arr.join(',')})`;
        }
        cont.onclick = e => {
            let cor = e.target.classList.value;
            if(cor == 'red'){
                result += 256 * 256;
            } else if(cor == 'green'){
                result += 256;
            } else if(cor == 'blue'){
                result += 1;
            }
        }
        
        //.red를 100번클릭, .green를 10번 클릭, .blue를 1번 클릭 후 console.log(getString(result))
    </script>
</body>
/*%{"num":"7", "ans": "rgb(100,10,1)"}%*/
```

<input type="text" data-id="7">



```html
<h1>다음 중 6의 약수가 아닌 것은?</h1>
<select></select>
<script>
    let sel = document.querySelector('select');
    let arr = [1, 2, 3, 4, 6];
    let result = '';
    for(let i = arr.length - 1; i >= 0; i--){
        let opt = document.createElement('option');
        opt.value = arr.length - i;
        opt.innerHTML = arr[i];
        sel.appendChild(opt);
    }
    result = sel.value;
    sel.onchange = e => {
        result = e.target.value;
    }
    //h1태그에 있는 문제를 풀어 답을 맞춘 뒤 console.log(result)
</script>
/*%{"num":"8", "ans": "2"}%*/
```

<input type="text" data-id="8">



```javascript
let map = [[0, 1, 0, 0],
          [0, 0, 1, 0],
          [1, 0, 0, 0],
          [0, 0, 1, 0]];
let len = map.length;
let char = [0, 0];
let obj = {
    ArrowLeft: 0,
    ArrowRight: 1,
    ArrowUp: 2,
    ArrowDown: 3
}
window.onkeydown = e => {
    let val = obj[e.key];
    if(!isNaN(val)){
        let w = parseInt(val / 2);
        val = parseInt((val % 2 - 0.5) * 2);
        char[w] += val;
        if(char[w] < 0) char[w] = 0;
        else if(char[w] >= len) char[w] = len - 1;
        else if(map[char[1]][char[0]] == 1) char[w] -= val;
    }
}
//방향키를 순서대로 ↓, →, ↓, →, ↓, ←, ↓, ←, ←, ←, ↑, → 를 누른 뒤 console.log(`x:${char[0]},y:${char[1]}`)
/*%{"num":"9", "ans": "x:1,y:3"}%*/
```

<input type="text" data-id="9">



```html
<input type="text">
<div></div><div></div><div></div>
<script>
    let input = document.querySelector('input');
    let i = 0;
    let divs = document.querySelectorAll('div');
    let getBox = e => {
        let arr = [];
        for(let i = 0; i < e.length; i++){
            let w = parseInt(e[i].style.width);
            let h = parseInt(e[i].style.height);
            arr.push(`${e[i].style.backgroundColor},${w * h}`);
        }
        return arr.join(';');
    }
    input.onkeydown = e => {
        let arr = e.target.value.split(';');
        if(e.key == 'Enter'){
            divs[i].style.backgroundColor = arr[0];
            divs[i].style.width = `${arr[1]}px`;
            divs[i].style.height = `${arr[2]}px`;
            e.target.value = '';
            i += 1;
        }
    };
    //input태그에 red;100;50치고 엔터 green;50;50치고 엔터, blue;100;100치고 엔터를 누른 뒤
    //console.log(getBox(divs))
</script>
/*%{"num":"10", "ans": "red,5000;green,2500;blue,10000"}%*/
```

<input type="text" data-id="10">