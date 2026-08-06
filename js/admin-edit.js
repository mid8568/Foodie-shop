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




// =======================
// 数据
// =======================


let mainImages=[];

let detailImages=[];

let skuData=[];




// =======================
// 初始化
// =======================


document.addEventListener(
"DOMContentLoaded",
()=>{


loadProduct();


document
.getElementById("addSkuBtn")
?.addEventListener(
"click",
addSku
);


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
"status",
data.status || data.stock_status
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
.forEach(
url=>{


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



// 加载SKU

loadSku();


}







// =======================
// 主图渲染
// =======================


function renderMainImages(){


const box =
document.getElementById(
"main-images"
);



if(!box)return;



box.innerHTML="";



mainImages.forEach(
(url,index)=>{


box.innerHTML+=`

<div class="image-item">

<img src="${url}">


<button onclick="deleteMainImage(${index})">

删除

</button>


</div>

`;

});


}






// =======================
// 详情图渲染
// =======================


function renderDetailImages(){


const box =
document.getElementById(
"detail-images"
);



if(!box)return;



box.innerHTML="";



detailImages.forEach(
(url,index)=>{


box.innerHTML+=`

<div class="image-item">


<img src="${url}">


<button onclick="deleteDetailImage(${index})">

删除

</button>


</div>


`;

});


}






// =======================
// 删除Storage图片
// =======================


async function deleteStorageImage(url){


if(!url)return false;



let path =
url.split(
"/product-images/"
)[1];



if(!path)return false;



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
// 删除主图
// =======================


async function deleteMainImage(index){


if(
!confirm("确定删除主图?")
)return;



let result =
await deleteStorageImage(
mainImages[index]
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
!confirm("确定删除详情图片?")
)return;



let result =
await deleteStorageImage(
detailImages[index]
);



if(result){


detailImages.splice(
index,
1
);


renderDetailImages();


}


}
// =======================
// SKU加载
// =======================


async function loadSku(){


const {

data,

error

}=await supabaseClient

.from("product_skus")

.select("*")

.eq(
"product_id",
productId
)

.order("id");



if(error){

console.log(
"SKU读取失败",
error
);

return;

}



skuData =
data || [];



renderSku();


}







// =======================
// 渲染SKU
// =======================


function renderSku(){


const box =
document.getElementById(
"skuList"
);



if(!box){

return;

}



box.innerHTML="";



skuData.forEach(
(sku,index)=>{


box.innerHTML += `


<tr>


<td>

<input

value="${sku.sku_code || ""}"

onchange="updateSku(${index},'sku_code',this.value)">

</td>




<td>

<input

value="${sku.sku_name || ""}"

onchange="updateSku(${index},'sku_name',this.value)">

</td>




<td>

<input

value='${JSON.stringify(
sku.attributes || {}
)}'

onchange="updateSku(${index},'attributes',this.value)">

</td>




<td>

<input

type="number"

value="${sku.cost_price || 0}"

onchange="updateSku(${index},'cost_price',this.value)">

</td>




<td>

<input

type="number"

value="${sku.sale_price || 0}"

onchange="updateSku(${index},'sale_price',this.value)">

</td>




<td>

<input

type="number"

value="${sku.stock_quantity || 0}"

onchange="updateSku(${index},'stock_quantity',this.value)">

</td>




<td>


<button

onclick="deleteSku(${index})">

删除

</button>


</td>



</tr>


`;


});


}








// =======================
// 添加SKU
// =======================


function addSku(){


skuData.push({


sku_code:
"",


sku_name:
"",


attributes:
{},


cost_price:
0,


sale_price:
0,


stock_quantity:
0


});



renderSku();


}








// =======================
// 修改SKU
// =======================


function updateSku(
index,
key,
value
){


skuData[index][key]=value;


}








// =======================
// 删除SKU
// =======================


function deleteSku(index){


skuData.splice(
index,
1
);



renderSku();


}








// =======================
// 保存SKU
// =======================


async function saveSku(){



// 删除旧SKU

const {

error:deleteError

}=await supabaseClient

.from("product_skus")

.delete()

.eq(
"product_id",
productId
);



if(deleteError){

console.log(
"删除旧SKU失败",
deleteError
);

return;

}





if(
skuData.length===0
){

return;

}






let rows =

skuData.map(
item=>({


product_id:
productId,


sku_code:
item.sku_code,


sku_name:
item.sku_name,



attributes:

typeof item.attributes==="string"

?

parseAttributes(
item.attributes
)

:

item.attributes,



cost_price:

Number(
item.cost_price
),



sale_price:

Number(
item.sale_price
),



stock_quantity:

Number(
item.stock_quantity
)



})

);






const {

error

}=await supabaseClient

.from("product_skus")

.insert(
rows
);




if(error){

console.log(
"SKU保存失败",
error
);

}

else{


console.log(
"SKU保存成功"
);


}



}








// =======================
// 属性JSON处理
// =======================


function parseAttributes(str){


try{


return JSON.parse(str);


}catch(e){


return {
规格:str
};


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

console.log(
"上传失败",
error
);

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

?.addEventListener(
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

?.addEventListener(
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
// 保存商品
// =======================


async function saveProduct(){



let updateData={



name:

value("name"),



name_en:

value("name_en"),



category:

value("category"),



description:

value("description"),



description_en:

value("description_en"),



status:

value("status"),



stock_status:

value("status"),




"1688_url":

value("1688_url"),




supplier:

value("supplier"),




supplier_url:

value("supplier_url"),




supplier_contact:

value("supplier_contact"),





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

error

}=await supabaseClient

.from("products")

.update(
updateData
)

.eq(
"id",
productId
);






if(error){


console.log(
error
);


alert(
"保存失败"
);


return;


}






// 保存SKU

await saveSku();






alert(
"保存成功"
);



location.href =
"admin-products.html";



}








// =======================
// 工具函数
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








// =======================
// 全局函数
// =======================


window.saveProduct =
saveProduct;



window.backList =
backList;



window.deleteMainImage =
deleteMainImage;



window.deleteDetailImage =
deleteDetailImage;



window.deleteSku =
deleteSku;



window.updateSku =
updateSku;
