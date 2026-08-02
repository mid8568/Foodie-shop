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
// 初始化
// =======================


document.addEventListener(
"DOMContentLoaded",
()=>{


loadImages();


});









// =======================
// 加载图片
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

return;

}



products =
data || [];



renderImages();



}









// =======================
// 渲染
// =======================


function renderImages(){


const box =
document.getElementById(
"image-list"
);


box.innerHTML="";




products.forEach(
product=>{


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





html += `

<div class="label">
主图
</div>

<div class="image-group">

`;





let main=[

product.image,

product.image2,

product.image3,

product.image4

];





main.forEach(
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







html += `


<div class="label">

详情图

</div>


<div class="image-group">

`;





(product.detail_images || [])

.forEach(
(url,index)=>{


html += imageHTML(

url,

"详情"+(index+1),

product.id,

"detail",

index

);


});





html += `

</div>

`;






div.innerHTML=html;


box.appendChild(div);



});


}









// =======================
// 图片组件
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


<input

class="image-check"

type="checkbox"

data-url="${url}"

data-id="${id}"

data-type="${type}"

data-index="${index}"


>



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

console.log(error);

return false;

}



return true;


}









// =======================
// 单个删除
// =======================


async function deleteImage(
url,
id,
type,
index
){



if(
!confirm(
"确定删除?"
)

){

return;

}




await deleteStorageImage(
url
);



await updateProductImage(

id,

type,

index

);



loadImages();



}









// =======================
// 更新商品图片
// =======================


async function updateProductImage(

id,

type,

index

){



let product =

products.find(
p=>p.id==id
);



let main=[

product.image,

product.image2,

product.image3,

product.image4

];



let detail=[

...(product.detail_images || [])

];





if(type==="main"){


main.splice(
index,
1
);


}



if(type==="detail"){


detail.splice(
index,
1
);


}






await supabaseClient

.from("products")

.update({

image:
main[0]||"",

image2:
main[1]||"",

image3:
main[2]||"",

image4:
main[3]||"",

detail_images:
detail


})

.eq(
"id",
id
);



}









// =======================
// 全选
// =======================


function selectAllImages(){



let list =

document.querySelectorAll(
".image-check"
);



let all =

Array.from(list)

.every(
x=>x.checked
);



list.forEach(
x=>{

x.checked=!all;

}

);



}









// =======================
// 批量删除
// =======================


async function batchDeleteImages(){



let checked =

document.querySelectorAll(
".image-check:checked"
);



if(
checked.length===0
){

alert(
"请选择图片"
);

return;

}



if(
!confirm(
"确定批量删除?"
)

){

return;

}




let groups={};




checked.forEach(
item=>{


let id =
item.dataset.id;



if(!groups[id]){

groups[id]=[];

}



groups[id].push({

url:item.dataset.url,

type:item.dataset.type,

index:Number(
item.dataset.index
)

});



});







for(
let id in groups
){


let product =

products.find(
p=>p.id==id
);



let main=[

product.image,

product.image2,

product.image3,

product.image4

];



let detail=[

...(product.detail_images || [])

];





for(
let item of groups[id]
){


await deleteStorageImage(
item.url
);



if(item.type==="main"){

main[item.index]=null;

}



if(item.type==="detail"){

detail[item.index]=null;

}



}



main =
main.filter(x=>x);


detail =
detail.filter(x=>x);







await supabaseClient

.from("products")

.update({

image:
main[0]||"",

image2:
main[1]||"",

image3:
main[2]||"",

image4:
main[3]||"",

detail_images:
detail

})

.eq(
"id",
Number(id)
);



}





alert(
"删除完成"
);



loadImages();



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


window.selectAllImages =
selectAllImages;


window.batchDeleteImages =
batchDeleteImages;
