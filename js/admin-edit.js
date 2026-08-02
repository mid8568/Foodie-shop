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




// =======================
// 商品ID
// =======================


const params =
new URLSearchParams(
window.location.search
);


const productId =
params.get("id");




// 图片数组

let mainImages=[];

let detailImages=[];







// =======================
// 初始化
// =======================


document.addEventListener(
"DOMContentLoaded",
()=>{


loadProduct();


});








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
"加载失败"
);

return;

}



console.log(data);



// 普通字段


setValue(
"name",
data.name
);


setValue(
"name_en",
data.name_en
);


setValue(
"category",
data.category
);


setValue(
"1688_url",
data["1688_url"]
);


setValue(
"supplier",
data.supplier
);


setValue(
"supplier_url",
data.supplier_url
);


setValue(
"supplier_contact",
data.supplier_contact
);



setValue(
"description",
data.description
);


setValue(
"description_en",
data.description_en
);



setValue(
"cost_price",
data.cost_price
);



setValue(
"sale_price",
data.sale_price
);



setValue(
"stock_quantity",
data.stock_quantity
);



setValue(
"status",
data.status || data.stock_status
);



setValue(
"seo_title",
data.seo_title
);



setValue(
"seo_description",
data.seo_description
);





setValue(
"specifications",

JSON.stringify(
data.specifications || {},
null,
2
)

);







// =======================
// 主图
// =======================


mainImages=[];


[
data.image,
data.image2,
data.image3,
data.image4

]
.forEach(url=>{


if(url){

mainImages.push(url);

}


});



renderMainImages();







// =======================
// 详情图
// =======================


detailImages =

Array.isArray(
data.detail_images
)

?

data.detail_images

:

[];




renderDetailImages();



}









// =======================
// 渲染主图
// =======================


function renderMainImages(){


const box =
document.getElementById(
"main-images"
);


box.innerHTML="";



mainImages.forEach(
(url,index)=>{


let div =
document.createElement(
"div"
);


div.className =
"image-item";



div.innerHTML = `


<img src="${url}">


<button onclick="deleteMainImage(${index})">

删除

</button>


`;



box.appendChild(div);



});


}









// =======================
// 渲染详情图
// =======================


function renderDetailImages(){


const box =
document.getElementById(
"detail-images"
);



box.innerHTML="";



detailImages.forEach(
(url,index)=>{


let div =
document.createElement(
"div"
);


div.className =
"image-item";



div.innerHTML = `


<img src="${url}">


<button onclick="deleteDetailImage(${index})">

删除

</button>


`;



box.appendChild(div);



});



}









// =======================
// 删除 Storage 文件
// =======================


async function deleteStorageImage(url){


if(!url){

return false;

}



let path =
url.split(
"/product-images/"
)[1];



if(!path){

console.log(
"路径错误",
url
);

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
"Storage删除失败",
error
);


return false;

}



console.log(
"Storage删除成功:",
path
);



return true;


}









// =======================
// 删除主图
// =======================


async function deleteMainImage(index){



if(
!confirm(
"确定删除主图?"
)

){

return;

}



let url =
mainImages[index];



let result =
await deleteStorageImage(
url
);



if(result){



mainImages.splice(
index,
1
);



renderMainImages();



}



}









// =======================
// 删除详情图
// =======================


async function deleteDetailImage(index){



if(
!confirm(
"确定删除详情图片?"
)

){

return;

}



let url =
detailImages[index];



console.log(
"删除详情图:",
url
);



let result =
await deleteStorageImage(
url
);



if(result){


detailImages.splice(
index,
1
);



console.log(
"剩余详情图片:",
detailImages
);



renderDetailImages();


}



}









// =======================
// 上传图片
// =======================


async function uploadFile(file){



let filename =

Date.now()

+"_"

+file.name;





const {

error

}=await supabaseClient

.storage

.from(
"product-images"
)

.upload(
filename,
file
);



if(error){

console.log(error);

return null;

}




const {

data

}=supabaseClient

.storage

.from(
"product-images"
)

.getPublicUrl(
filename
);



return data.publicUrl;



}









// =======================
// 主图上传
// =======================


document
.getElementById(
"main-image-upload"
)
.addEventListener(
"change",
async(e)=>{


let files =
Array.from(
e.target.files
);



for(
let file of files
){



if(
mainImages.length>=4
){

alert(
"主图最多4张"
);

break;

}



let url =
await uploadFile(file);



if(url){

mainImages.push(url);

}


}



renderMainImages();


});









// =======================
// 详情图上传
// =======================


document
.getElementById(
"detail-image-upload"
)
.addEventListener(
"change",
async(e)=>{


let files =
Array.from(
e.target.files
);



for(
let file of files
){



let url =
await uploadFile(file);



if(url){

detailImages.push(url);

}


}



renderDetailImages();



});









// =======================
// 保存
// =======================


async function saveProduct(){



console.log(
"保存详情图片:",
detailImages
);





let specifications={};


try{


specifications =

JSON.parse(

value(
"specifications"
)

);



}catch(e){


alert(
"规格JSON错误"
);


return;


}






let updateData={



name:value("name"),


name_en:value("name_en"),


category:value("category"),



description:value("description"),


description_en:value("description_en"),



cost_price:

Number(
value("cost_price")
),



sale_price:

Number(
value("sale_price")
),



stock_quantity:

Number(
value("stock_quantity")
),



status:value("status"),



stock_status:value("status"),



"1688_url":

value("1688_url"),



supplier:

value("supplier"),



supplier_url:

value("supplier_url"),



supplier_contact:

value("supplier_contact"),



seo_title:

value("seo_title"),



seo_description:

value("seo_description"),



specifications:



specifications,





image:

mainImages[0] || "",



image2:

mainImages[1] || "",



image3:

mainImages[2] || "",



image4:

mainImages[3] || "",




detail_images:

JSON.parse(
JSON.stringify(
detailImages
)
)



};






const {

data,

error

}=await supabaseClient

.from("products")

.update(
updateData
)

.eq(
"id",
productId
)

.select();






if(error){


console.log(error);


alert(
"保存失败"
);


return;


}




console.log(
"更新结果:",
data
);



alert(
"保存成功"
);



location.href =
"admin-products.html";



}









// =======================
// 工具
// =======================


function setValue(id,val){


let el =
document.getElementById(id);


if(el){

el.value =
val || "";

}


}



function value(id){


let el =
document.getElementById(id);


return el ?

el.value

:

"";


}







function backList(){


location.href =
"admin-products.html";


}







window.saveProduct =
saveProduct;


window.backList =
backList;


window.deleteMainImage =
deleteMainImage;


window.deleteDetailImage =
deleteDetailImage;
