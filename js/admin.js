// =========================
// Supabase配置
// =========================
console.log("admin.js加载");

const SUPABASE_URL =
"https://ukxxmxnubxjezkwbbxdr.supabase.co";


const SUPABASE_KEY =
"sb_publishable_2IFHfms3ombozpvZCvaeEg_2VZ2z5hJ";


const supabaseClient =
supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);



let currentProduct=null;





// ========================
// 加载商品列表
// ========================

async function loadProducts(){


let {data,error}=await supabaseClient
.from("products")
.select("*")
.order("created_at",{ascending:false});



if(error){

console.log(error);
return;

}



let select=
document.getElementById(
"productSelect"
);



data.forEach(p=>{


let option=
document.createElement("option");


option.value=p.id;

option.innerHTML=
p.name;


select.appendChild(option);



});


}




// ========================
// 加载商品
// ========================


async function loadProduct(){


let id=
document.getElementById(
"productSelect"
).value;



if(!id)return;



let {data}=await supabaseClient
.from("products")
.select("*")
.eq("id",id)
.single();



currentProduct=data;



name.value=data.name || "";

name_en.value=data.name_en || "";

description.value=
data.description || "";


description_en.value=
data.description_en || "";


cost_price.value=
data.cost_price || "";


sale_price.value=
data.sale_price || "";


stock_status.value=
data.stock_status || "上架";





mainImagePreview.innerHTML=
`
<img src="${data.image}">
`;




detailImages.innerHTML="";



[
data.image2,
data.image3,
data.image4

]
.forEach(img=>{


if(img){

detailImages.innerHTML+=
`
<img src="${img}" width="120">
`;

}


});




}









// ========================
// 修改商品
// ========================


async function updateProduct(){


if(!currentProduct){

alert(
"请选择商品"
);

return;

}




let update={


name:name.value,


name_en:name_en.value,


description:
description.value,


description_en:
description_en.value,


cost_price:
cost_price.value,


sale_price:
sale_price.value,


stock_status:
stock_status.value


};





let {error}=await supabaseClient

.from("products")

.update(update)

.eq(
"id",
currentProduct.id
);




if(error){

alert(error.message);

}
else{


alert(
"保存成功"
);


}



}







// ========================
// 利润计算
// ========================


function calcPrice(){


let cost=
Number(cost_price.value);


if(!cost)return;



let rate=30;



let sale=
cost/(1-rate/100);



sale_price.value=
sale.toFixed(2);



profit_rate.value=
rate+"%";



}







loadProducts();
