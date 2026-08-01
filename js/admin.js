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






// 页面启动

window.onload=()=>{


loadProducts();


loadMaterials();


loadStoreConfig();


};









// ===============================
// 商品列表
// ===============================


async function loadProducts(){



const {

data,
error

}=await supabaseClient


.from("products")

.select("*")

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




let select =
document.getElementById(
"productSelect"
);



data.forEach(product=>{


let option =
document.createElement(
"option"
);



option.value =
product.id;


option.textContent =
product.name;



select.appendChild(option);



});





select.onchange =
loadProduct;


}









// ===============================
// 加载商品
// ===============================


async function loadProduct(){



let id =
productSelect.value;



if(!id)return;




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

console.log(error);

return;

}



currentProduct=data;



name.value =
data.name || "";



name_en.value =
data.name_en || "";



description.value =
data.description || "";



description_en.value =
data.description_en || "";



cost_price.value =
data.cost_price || "";



sale_price.value =
data.sale_price || "";



stock_status.value =
data.stock_status || "上架";





mainImage.innerHTML =

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
<img src="${img}">

`;


}


});



}












// ===============================
// 保存商品
// ===============================


async function saveProduct(){



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

alert(error.message);

}
else{

alert(
"修改成功"
);

}



}









// ===============================
// 素材管理
// ===============================


async function loadMaterials(){



let {

data

}=await supabaseClient


.storage


.from(
"product-images"
)


.list();





let box =
document.getElementById(
"materialList"
);



box.innerHTML="";



data.forEach(item=>{



let {

data:url

}=supabaseClient


.storage


.from(
"product-images"
)


.getPublicUrl(
item.name
);





box.innerHTML+=


`

<img src="${url.publicUrl}">

`;



});



}









// ===============================
// 店铺装修
// ===============================


async function loadStoreConfig(){



let {

data

}=await supabaseClient


.from(
"store_config"
)


.select("*")


.single();





if(!data)return;



notice.value =
data.notice || "";


homeTitle.value =
data.home_title || "";





if(data.banner){


bannerPreview.innerHTML=

`

<img src="${data.banner}">

`;



}



}









// 保存装修


async function saveDecoration(){



let config={


notice:
notice.value,


home_title:
homeTitle.value



};





await supabaseClient


.from(
"store_config"
)


.upsert(
config
);





alert(
"装修保存成功"
);


}
