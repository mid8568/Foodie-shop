console.log("admin.js启动");


// =======================
// Supabase配置
// =======================


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






// =======================
// 页面加载
// =======================


window.onload=function(){


loadProducts();


};









// =======================
// 获取商品列表
// =======================


async function loadProducts(){



const {

data,
error

}=await supabaseClient

.from("products")

.select(
"id,name"
)

.order(
"created_at",
{
ascending:false
}

);





if(error){

console.log(error);

return;

}




let select=
document.getElementById(
"productSelect"
);



data.forEach(product=>{


let option=
document.createElement(
"option"
);



option.value=
product.id;


option.innerHTML=
product.name;



select.appendChild(option);


});





select.onchange=
loadProduct;



}









// =======================
// 加载商品详情
// =======================


async function loadProduct(){



let id=
productSelect.value;



if(!id)
return;





let {

data,
error

}=await supabaseClient


.from("products")

.select("*")

.eq(
"id",
id
)

.single();






if(error){

alert(error.message);

return;

}




currentProduct=data;






name.value=
data.name || "";



name_en.value=
data.name_en || "";



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





// 主图


mainImage.innerHTML=
`


<img src="${data.image}">


`;







// 详情图


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
<img src="${img}">

`;


}


});



}









// =======================
// 保存商品
// =======================


async function saveProduct(){



if(!currentProduct){

alert(
"请先选择商品"
);

return;

}




let update={



name:
name.value,


name_en:
name_en.value,


description:
description.value,


description_en:
description_en.value,


cost_price:
Number(cost_price.value),


sale_price:
Number(sale_price.value),


stock_status:
stock_status.value



};







let {

error

}=await supabaseClient


.from("products")


.update(update)


.eq(
"id",
currentProduct.id
);







if(error){

alert(
error.message
);

}
else{


alert(
"商品修改成功"
);


}





}









// =======================
// 利润计算
// =======================


cost_price.oninput=function(){



let cost=
Number(
cost_price.value
);



if(!cost)
return;



let rate=30;



let sale=
cost/(1-rate/100);




sale_price.value=
sale.toFixed(2);



profit_rate.value=
rate+"%";



}









// =======================
// 上传主图
// =======================


mainUpload.onchange=async function(e){


let file=
e.target.files[0];



if(!file)
return;





let path=
Date.now()
+
"_"
+
file.name;





let {

error

}=await supabaseClient


.storage

.from(
"product-images"
)

.upload(
path,
file
);





if(error){

alert(error.message);

return;

}





let {

data:urlData

}=supabaseClient

.storage

.from(
"product-images"
)

.getPublicUrl(
path
);





await supabaseClient


.from("products")


.update({

image:
urlData.publicUrl

})


.eq(
"id",
currentProduct.id
);





alert(
"主图更新成功"
);


loadProduct();


};









// =======================
// 上传详情图片
// =======================


detailUpload.onchange=
async function(e){



let files=
e.target.files;



let urls=[];




for(let file of files){



let path=
Date.now()
+
file.name;



await supabaseClient


.storage


.from(
"product-images"
)


.upload(
path,
file
);





let {

data

}=supabaseClient


.storage


.from(
"product-images"
)


.getPublicUrl(
path
);



urls.push(
data.publicUrl
);


}






let update={};





if(urls[0])

update.image2=urls[0];


if(urls[1])

update.image3=urls[1];


if(urls[2])

update.image4=urls[2];






await supabaseClient


.from("products")


.update(update)


.eq(
"id",
currentProduct.id
);





alert(
"详情图片更新成功"
);



loadProduct();


};
