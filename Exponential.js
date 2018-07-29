var o = {x:1}
var len = 10
for(var i=0;i<len;i++) {
    o = {a:o}
    console.log(JSON.stringify(o).length)
}
/*
13
19
25
31
37
43
49
55
61
67
/*



var o = {x:1}
var len = 10
for(var i=0;i<len;i++) {
    o = {a:o,b:o}
    console.log(JSON.stringify(o).length)
}
/*
25
61
133
277
565
1141
2293
4597
9205
18421
*/



var o = {x:1}
var len = 10
for(var i=0;i<len;i++) {
    o = {a:o,b:o,c:o}
    console.log(JSON.stringify(o).length)
}
/*
37
127
397
1207
3637
10927
32797
98407
295237
885727
*/



var o = {x:1}
var len = 10
for(var i=0;i<len;i++) {
    o = {a:o,b:o,c:o,d:o}
    console.log(JSON.stringify(o).length)
}
/*
49
217
889
3577
14329
57337
229369
917497
3670009
14680057
*/