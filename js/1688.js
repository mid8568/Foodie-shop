//================================
// 1688商品采集模块
//================================


let product1688 = {};



//================================
// 输入1688链接采集
//================================


async function collect1688(){


let url =
document.getElementById(
"1688Url"
).value;



if(!url){

alert(
"请输入1688商品链接"
);

return;

}



//显示结果

document.getElementById(
"collectResult"
).style.display="block";





/*
这里以后接真实1688 API

目前模拟返回数据

*/

product1688={


title:
"测试1688商品名称",



cost:
25,



main_images:[

"https://picsum.photos/400/400"

],



detail_images:[

"https://picsum.photos/600/600",

"https://picsum.photos/601/600",

"https://picsum.photos/602/600"

]

};





//填充标题


document.getElementById(
"productTitle"
).value =
product1688.title;





//填采购价


document.getElementById(
"costPrice"
).value =
product1688.cost;





//计算售价

calcPrice();





//显示图片

show1688Images();



}






//================================
// 自动计算销售价格
//================================


function calcPrice(){


let cost = Number(

document.getElementById(
"costPrice"
).value

);



if(!cost){

return;

}





// 成本 ×2

let price =
(cost*2).toFixed(2);




document.getElementById(
"sellPrice"
).value =
price;



}








//================================
// 显示图片
//================================


function show1688Images(){



let mainHTML="";



product1688.main_images.forEach(
img=>{


mainHTML +=

`

<img src="${img}">

`;


});




document.getElementById(
"mainImages"
).innerHTML =
mainHTML;





let detailHTML="";



product1688.detail_images.forEach(
img=>{


detailHTML +=

`

<img src="${img}">

`;



});



document.getElementById(
"detailImages"
).innerHTML =
detailHTML;



}









//================================
// 保存到Supabase products表
//================================


async function save1688Product(){



let product={



name:

document.getElementById(
"productTitle"
).value,





cost_price:

Number(

document.getElementById(
"costPrice"
).value

),





price:

Number(

document.getElementById(
"sellPrice"
).value

),






currency:

"USD",






image:

product1688.main_images[0],





image2:

product1688.detail_images[0],





image3:

product1688.detail_images[1],





image4:

product1688.detail_images[2],






supplier_url:

document.getElementById(
"1688Url"
).value,





stock_status:

"上架"



};





let {

data,

error

}=await db

.from(
"products"
)

.insert(
product
);







if(error){



console.log(error);



alert(
"保存失败:"
+
error.message
);



return;



}





alert(
"1688商品保存成功"
);



}
