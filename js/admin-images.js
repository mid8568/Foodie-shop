console.log(
"admin-images.js启动"
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





let products=[];







// =======================
// 页面加载
// =======================


document.addEventListener(
"DOMContentLoaded",
()=>{


loadImages();


});







// =======================
// 加载商品图片
// =======================


async function loadImages(keyword=""){



let query =

supabaseClient

.from("products")

.select(
"id,name,image,image2,image3,image4,detail_images"
)

.order(
"id",
{
ascending:false
}
);





if(keyword){


query =
query.ilike(
"name",
"%"+keyword+"%"
);


}






const {

data,

error

}=await query;



if(error){

console.log(error);

alert(
"读取失败"
);

return;

}



products=data || [];



renderImages();



}








// =======================
// 显示图片
// =======================


function renderImages(){



const box =
document.getElementById(
"image-list"
);



box.innerHTML="";




products.forEach(product=>{



let div =
document.createElement(
"div"
);



div.className =
"product-box";




let html = `


<div class="product-title">

${product.name}

</div>


`;






// 主图

html += `

<div class="label">

主图

</div>

<div class="image-group">

`;





let mainImages=[

product.image,

product.image2,

product.image3,

product.image4

];




mainImages.forEach(
(url,index)=>{


if(url){


html += imageHTML(
url,
"主图"+(index+1),
product.id,
"main",
index
);


}



});



html += `

</div>

`;








// 详情图


html += `


<div class="label">

详情图片

</div>


<div class="image-group">

`;





if(
Array.isArray(
product.detail_images
)

){


product.detail_images.forEach(
(url,index)=>{


html += imageHTML(
url,
"详情"+(index+1),
product.id,
"detail",
index
);


});


}




html += `

</div>

`;





div.innerHTML=html;


box.appendChild(div);



});



}









// =======================
// 图片HTML
// =======================


function imageHTML(
url,
title,
id,
type,
index
){



return `


<div class="image-item">


<img src="${url}">


<div>

${title}

</div>



<button

onclick="deleteImage(
'${url}',
${id},
'${type}',
${index}
)"

>

删除

</button>



</div>


`;



}









// =======================
// 删除图片
// =======================


async function deleteImage(
url,
productId,
type,
index
){



if(
!confirm(
"确定删除这张图片?"
)

){

return;

}





// 1 删除Storage


let result =

await deleteStorageImage(
url
);




if(!result){

alert(
"Storage删除失败"
);

return;

}







// 2 更新数据库


let product =

products.find(
p=>p.id===productId
);



if(!product){

return;

}








if(type==="main"){



let images=[

product.image,

product.image2,

product.image3,

product.image4

];




images.splice(
index,
1
);





await supabaseClient

.from("products")

.update({

image:
images[0] || "",

image2:
images[1] || "",

image3:
images[2] || "",

image4:
images[3] || ""

})

.eq(
"id",
productId
);




}










if(type==="detail"){



let images =

[...product.detail_images];



images.splice(
index,
1
);





await supabaseClient

.from("products")

.update({

detail_images:
images

})

.eq(
"id",
productId
);



}







alert(
"删除成功"
);



loadImages();



}











// =======================
// 删除Storage
// =======================


async function deleteStorageImage(url){



let path =

url.split(
"/product-images/"
)[1];



if(!path){

return false;

}





const {

error

}=await supabaseClient

.storage

.from(
"product-images"
)

.remove(
[
path
]
);





if(error){

console.log(
error
);

return false;

}



console.log(
"删除:",
path
);



return true;


}









// =======================
// 搜索
// =======================


function searchImages(){



let keyword =

document.getElementById(
"search"
).value;



loadImages(keyword);



}



window.searchImages =
searchImages;


window.deleteImage =
deleteImage;
