console.log("admin.js启动");


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



let currentProduct=null;

let materials=[];






// =======================
// 页面启动
// =======================


window.onload=function(){


loadProducts();


loadMaterials();


loadStoreConfig();


};











// =======================
// 商品列表
// =======================


async function loadProducts(){


let {

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



select.innerHTML=
`
<option>
请选择商品
</option>
`;




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





select.onchange=
loadProduct;



}









// =======================
// 加载商品
// =======================


async function loadProduct(){



let id =
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






mainImage.innerHTML=

`

<img src="${data.image}" width="200">

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

<div>


<img src="${img}" width="120">


<button onclick="deleteDetailImage('${img}')">

删除

</button>


</div>


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
"请选择商品"
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

alert(error.message);

return;

}



alert(
"修改成功"
);



}












// =======================
// 主图上传
// =======================


mainUpload.onchange=
async function(){



let file =
mainUpload.files[0];



if(!file)return;




let path=

"products/"

+

Date.now()

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

data

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
data.publicUrl

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
// 详情图片上传
// =======================


detailUpload.onchange=
async function(){



let files =
detailUpload.files;



let urls=[];



for(let file of files){



let path=

"detail/"

+

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
"详情图片添加成功"
);



loadProduct();


};











// 删除详情图片

async function deleteDetailImage(url){



let update={};



if(currentProduct.image2===url)

update.image2=null;


if(currentProduct.image3===url)

update.image3=null;


if(currentProduct.image4===url)

update.image4=null;




await supabaseClient


.from("products")


.update(update)


.eq(
"id",
currentProduct.id
);




loadProduct();


}












// =======================
// 素材管理
// =======================



async function loadMaterials(){



let {

data,
error

}=await supabaseClient


.from("media_library")


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



materials=data;


renderMaterials(
"全部"
);



}







function renderMaterials(type){



let box =
document.getElementById(
"materialList"
);



box.innerHTML="";





materials

.filter(item=>{


if(type==="全部")
return true;


return item.type===type;



})


.forEach(item=>{


box.innerHTML+=


`

<div class="material-card">


<img src="${item.url}" width="150">


<p>
${item.name}
</p>


<p>
${item.type}
</p>


<button onclick="copyUrl('${item.url}')">

复制

</button>



<button onclick="deleteMaterial(${item.id})">

删除

</button>


</div>

`;



});



}







function filterMaterials(){



renderMaterials(
materialCategory.value
);



}









// 上传素材


async function uploadMaterial(){



let file =
materialUpload.files[0];



if(!file)return;




let path=

"media/"

+

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





await supabaseClient


.from("media_library")


.insert({


url:
data.publicUrl,


name:
file.name,


type:
uploadType.value



});





alert(
"上传成功"
);



loadMaterials();



}







async function deleteMaterial(id){


await supabaseClient


.from("media_library")


.delete()


.eq(
"id",
id
);



loadMaterials();


}





function copyUrl(url){


navigator.clipboard.writeText(url);


alert(
"复制成功"
);


}









// =======================
// 店铺装修
// =======================


async function loadStoreConfig(){



let {

data

}=await supabaseClient


.from("store_config")


.select("*")


.eq(
"id",
1
)


.single();




if(!data)
return;




notice.value=
data.notice || "";



homeTitle.value=
data.home_title || "";





if(data.banner){


bannerPreview.innerHTML=

`

<img src="${data.banner}" width="300">

`;

}


}









// 上传Banner


async function uploadBanner(){



let file =
bannerUpload.files[0];


if(!file)
return;




let path=

"banner/"

+

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





await supabaseClient


.from("store_config")


.update({

banner:
data.publicUrl

})


.eq(
"id",
1
);





alert(
"Banner更新成功"
);



loadStoreConfig();



}








// 保存装修


async function saveDecoration(){



await supabaseClient


.from("store_config")


.update({

notice:
notice.value,


home_title:
homeTitle.value,


updated_at:
new Date()


})


.eq(
"id",
1
);




alert(
"保存成功"
);


}
