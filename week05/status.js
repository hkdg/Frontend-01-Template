// 找出字符c
// function fn(str){
//     let status_c = false;
//     for(let item of str){
//         if(item === 'c'){
//             status_c = true;
//         }
//     }
//     return status_c;
// }
// console.log(fn('abcdef'));

// 找出字符cd
// function fn(str){
//     let status_c = false;
//     let status_d = false;
//     for(let item of str){
//         if(item === 'c'){
//             status_c = true;
//         }else if(status_c && item === 'd'){
//             status_d = true;
//             return status_c&&status_d;
//         }else{
//             status_c = false;
//             status_d = false;
//         }
//     }
//     return status_c&&status_d;
// }
// console.log(fn('abcdef'));

function fn(str){
    let status = start;
    for(let item of str){
        status = status(item);
    }
    return status === end;
};
console.log(fn('tabcabcabcfdfeg'));
;

function start(c){
    if(c === 'a'){
        return founda;
    }
    return start;
}
function end(c){
    return end;
}

function founda(c){
    if(c === 'b'){
        return foundb;
    }
    return start(c);
}

function foundb(c){
    if(c === 'c'){
        return foundc;
    }
    return start(c);
}
function foundc(c){
    if(c === 'd'){
        return end;
    }
    return start(c);
}