//===========================
// 1688商品采集模块
//===========================


let collectData={};



//开始采集

async function collect1688(){


let url=
document.getElementById(
"1688Url"
).value;



if(!url){

alert("请输入1688商品链接");

return;

}



document.getElementById(
"collectResult"
).style.display="block";



//测试数据
//以后这里连接1688 API


collectData={

title:
"测试1688商品",


cost:
50,


main_images:[

"https://picsum.photos/300/300?1"

],


detail_images:[

"https://picsum.photos/300/300?2",

"https://picsum.photos/300/300?3"

]


};




document.getElementById(
"productTitle"
).value=
collectData.title;



document.getElementById(
"costPrice"
).value=
collectData.cost;



calc1688Price();



show1688Images();


}






//===========================
// 自动计算销售价
//===========================


function calc1688Price(){


let cost=
Number(
document.getElementById(
"costPrice"
).value
);



if(!cost)return;



let price =
(cost*2).toFixed(2);



document.getElementById(
"sellPrice"
).value=
price;


}







//===========================
// 显示图片
//===========================


function show1688Images(){



let html="";



collectData.main_images.forEach(
img=>{


html+=`

<img src="${img}">

`;

});



document.getElementById(
"mainImages"
).innerHTML=html;




html="";


collectData.detail_images.forEach(
img=>{


html+=`

<img src="${img}">

`;

});



document.getElementById(
"detailImages"
).innerHTML=html;


}
