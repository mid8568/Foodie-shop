console.log(
"商品编辑启动"
);





const SUPABASE_URL =
"https://ukxxmxnubxjezkwbbxdr.supabase.co";



const SUPABASE_KEY =
"sb_publishable_2IFHfms3ombozpvZCvaeEg_2VZ2z5hJ";



const db =
supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);






let productId=null;

let product=null;







window.onload=function(){



let params =
new URLSearchParams(
location.search
);



productId =
params.get("id");



loadProduct();



};












// 加载商品


async function loadProduct(){



let {

data,
error

}=await db


.from("products")


.select("*")


.eq(
"id",
productId
)


.single();





if(error){

console.log(error);

return;

}





product=data;





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





renderImages();



}











// 显示图片


function renderImages(){



mainImage.innerHTML =

`

<img src="${product.image}" width="200">

`;






detailImages.innerHTML="";





[

product.image2,

product.image3,

product.image4

]


.forEach(img=>{



if(img){


detailImages.innerHTML +=


`

<div>


<img src="${img}" width="120">


<button onclick="deleteImage('${img}')">

删除

</button>


</div>


`;


}



});



}











// 保存修改


async function saveProduct(){



await db


.from("products")


.update({



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



})


.eq(
"id",
productId
);





alert(
"保存成功"
);



}












// 上传主图


async function uploadMainImage(){



let file =
mainUpload.files[0];



if(!file)
return;






let path =

"products/"

+

Date.now()

+

file.name;






await db.storage


.from(
"product-images"
)


.upload(
path,
file
);






let {

data

}=db.storage


.from(
"product-images"
)


.getPublicUrl(
path
);






await db


.from("products")


.update({

image:

data.publicUrl


})


.eq(
"id",
productId
);






alert(
"主图更新成功"
);



loadProduct();



}












// 上传详情图


async function uploadDetailImages(){



let files =
detailUpload.files;



let update={};




let index=2;





for(let file of files){



if(index>4)

break;




let path =

"detail/"

+

Date.now()

+

file.name;





await db.storage


.from(
"product-images"
)


.upload(
path,
file
);






let {

data

}=db.storage


.from(
"product-images"
)


.getPublicUrl(
path
);






update[

"image"+index

]
=

data.publicUrl;




index++;





}






await db


.from("products")


.update(update)


.eq(
"id",
productId
);






alert(
"详情图片添加成功"
);



loadProduct();



}











// 删除详情图片


async function deleteImage(url){



let update={};



if(product.image2===url)

update.image2=null;


if(product.image3===url)

update.image3=null;


if(product.image4===url)

update.image4=null;






await db


.from("products")


.update(update)


.eq(
"id",
productId
);





loadProduct();



}
