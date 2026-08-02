console.log(
"admin-edit.js启动"
);


// =======================
// Supabase
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





let productId=null;

let currentProduct=null;





// =======================
// 页面启动
// =======================


window.onload=function(){


const params =
new URLSearchParams(
window.location.search
);


productId =
params.get("id");



if(!productId){

alert(
"商品ID不存在"
);

return;

}



loadProduct();


};







// =======================
// 加载商品
// =======================


async function loadProduct(){



const {

data,

error

}=await supabaseClient

.from("products")

.select("*")

.eq(
"id",
productId
)

.single();




if(error){

console.log(error);

alert(
"商品加载失败"
);

return;

}



currentProduct=data;



// 基础信息


document.getElementById(
"name"
).value =
data.name || "";



document.getElementById(
"name_en"
).value =
data.name_en || "";



document.getElementById(
"description"
).value =
data.description || "";





if(
document.getElementById("price")
){

document.getElementById(
"price"
).value =
data.sale_price || data.price || "";

}



if(
document.getElementById("status")
){

document.getElementById(
"status"
).value =
data.stock_status || "上架";

}




renderImages();



}









// =======================
// 渲染图片
// =======================


function renderImages(){



// ===== 四张主图 =====


const mainBox =
document.getElementById(
"main-images"
);



if(mainBox){



mainBox.innerHTML="";



[
"image",
"image2",
"image3",
"image4"

].forEach(field=>{


let url =
currentProduct[field];



mainBox.innerHTML += `


<div class="image-item">


${
url
?
`
<img src="${url}">
`
:
`
<div class="empty-image">
暂无图片
</div>
`
}



<button
onclick="deleteMainImage('${field}')">

删除

</button>


<br>


<input
type="file"
onchange="replaceMainImage(event,'${field}')">


</div>


`;



});



}





// ===== 全部详情图片 =====


const detailBox =
document.getElementById(
"detail-images"
);



if(detailBox){



detailBox.innerHTML="";



let images =
currentProduct.detail_images || [];



images.forEach(
(img,index)=>{


detailBox.innerHTML += `


<div class="image-item">


<img src="${img}">


<button
onclick="deleteDetailImage(${index})">

删除

</button>


</div>


`;


}

);



}



}









// =======================
// 上传图片
// =======================


async function uploadImage(file){



let filename =

Date.now()

+

"_"

+

file.name;



let path =

"products/"

+

filename;





const {

error

}=await supabaseClient.storage


.from(
"product-images"
)


.upload(
path,
file
);





if(error){

console.log(error);

alert(
"上传失败"
);

return null;

}






const {

data

}=supabaseClient.storage


.from(
"product-images"
)


.getPublicUrl(
path
);




return data.publicUrl;



}









// =======================
// 替换主图
// =======================


async function replaceMainImage(event,field){



let file =
event.target.files[0];


if(!file)

return;




let url =
await uploadImage(file);



if(!url)

return;




let update={};


update[field]=url;




await supabaseClient

.from("products")

.update(update)

.eq(
"id",
productId
);




alert(
"主图替换成功"
);



loadProduct();



}









// =======================
// 删除主图
// =======================


async function deleteMainImage(field){



let update={};


update[field]=null;



await supabaseClient

.from("products")

.update(update)

.eq(
"id",
productId
);



loadProduct();



}









// =======================
// 上传详情图片
// =======================


async function uploadDetailImages(){



let files =
document.getElementById(
"detail-upload"
).files;



if(!files.length)

return;




let images =

[

...(currentProduct.detail_images || [])

];





for(
let file of files
){



let url =
await uploadImage(file);



if(url){

images.push(url);

}


}




await supabaseClient

.from("products")

.update({

detail_images:images

})

.eq(
"id",
productId
);




alert(
"详情图片添加成功"
);



loadProduct();



}









// =======================
// 删除详情图片
// =======================


async function deleteDetailImage(index){



let images =

[

...(currentProduct.detail_images || [])

];




images.splice(
index,
1
);





await supabaseClient

.from("products")

.update({

detail_images:images

})

.eq(
"id",
productId
);




loadProduct();



}









// =======================
// 保存商品
// =======================


async function saveProduct(){



let update={



name:

document.getElementById(
"name"
).value,



name_en:

document.getElementById(
"name_en"
).value,



description:

document.getElementById(
"description"
).value,



stock_status:

document.getElementById(
"status"
).value,



detail_images:

currentProduct.detail_images || []



};




if(
document.getElementById("price")
){

update.sale_price =
Number(
document.getElementById("price").value
);

}





const {

error

}=await supabaseClient

.from("products")

.update(update)

.eq(
"id",
productId
);





if(error){

alert(
error.message
);

return;

}




alert(
"保存成功"
);



loadProduct();



}







// =======================
// 返回商品列表
// =======================


function backProducts(){


window.location.href =
"admin-products.html";


}
