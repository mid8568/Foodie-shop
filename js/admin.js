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




// 1688 API
// 后面部署服务器以后修改这里

const API_URL =
"http://localhost:3000";





let currentProduct=null;


let materials=[];









// =======================
// 页面启动
// =======================


window.onload=function(){


loadProducts();


loadMaterials();


loadStoreConfig();


loadCategories();


loadSystem();



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



if(!select)
return;





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






select.onchange =
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


].forEach(img=>{


if(img){



detailImages.innerHTML +=


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
"商品修改成功"
);



loadProducts();



}

// =======================
// 主图上传
// =======================


mainUpload.onchange = async function(){


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


detailUpload.onchange = async function(){


let files =
detailUpload.files;



let urls=[];





for(let file of files){


let path =

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

update.image2 =
urls[0];



if(urls[1])

update.image3 =
urls[1];



if(urls[2])

update.image4 =
urls[2];







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











// =======================
// 删除详情图片
// =======================


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
// 素材中心
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




materials=data || [];



renderMaterials(
"全部"
);



}









function renderMaterials(type){



let box =
document.getElementById(
"materialList"
);



if(!box)
return;




box.innerHTML="";





materials

.filter(item=>{


if(type==="全部")

return true;



return item.type===type;



})


.forEach(item=>{



box.innerHTML +=


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



if(!file)
return;






let path =

"media/"

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












// 删除素材


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











// 复制链接


function copyUrl(url){



navigator.clipboard.writeText(url);



alert(
"复制成功"
);



}









// =======================
// Banner
// =======================


async function uploadBanner(){



let file =
bannerUpload.files[0];



if(!file)

return;





let path =

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
// =======================
// 店铺装修
// =======================


async function loadStoreConfig(){



let {

data,
error

}=await supabaseClient


.from("store_config")


.select("*")


.eq(
"id",
1
)


.single();




if(error){

console.log(error);

return;

}





if(!data)
return;






let noticeBox =
document.getElementById(
"notice"
);



let titleBox =
document.getElementById(
"homeTitle"
);



if(noticeBox)

noticeBox.value =
data.notice || "";



if(titleBox)

titleBox.value =
data.home_title || "";






let bannerBox =
document.getElementById(
"bannerPreview"
);



if(
bannerBox &&
data.banner
){


bannerBox.innerHTML=

`

<img src="${data.banner}" width="300">

`;

}


}












// 保存首页装修


async function saveDecoration(){



let noticeBox =
document.getElementById(
"notice"
);



let titleBox =
document.getElementById(
"homeTitle"
);






await supabaseClient


.from("store_config")


.update({


notice:

noticeBox.value,



home_title:

titleBox.value,



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











// =======================
// 1688采集
// =======================



async function startCollect(){



let url =
document.getElementById(
"collectUrl"
).value;





if(!url){


alert(
"请输入1688链接"
);


return;


}





let result =
document.getElementById(
"collectResult"
);





if(result)

result.innerHTML =
"正在采集...";








try{


let response =

await fetch(

API_URL + "/collect",

{


method:"POST",


headers:{


"Content-Type":

"application/json"


},



body:


JSON.stringify({

url:url

})


}


);






let data =
await response.json();





console.log(data);





if(result)

result.innerHTML =
"采集完成";




alert(
"采集完成"
);





loadProducts();




}

catch(error){



console.log(error);



if(result)

result.innerHTML =
"采集失败";



alert(
"采集失败"
);



}



}












// =======================
// 分类管理
// =======================



async function loadCategories(){



let {

data,
error

}=await supabaseClient


.from("categories")


.select("*")


.order(
"id",
{

ascending:false

}

);





if(error){

console.log(error);

return;

}





let box =
document.getElementById(
"categoryList"
);





if(!box)
return;





box.innerHTML="";






data.forEach(item=>{



box.innerHTML +=


`

<p>

${item.name}

</p>


`;



});





}









async function addCategory(){



let name =
document.getElementById(
"categoryName"
).value;





if(!name){


alert(
"请输入分类名称"
);


return;


}







await supabaseClient


.from("categories")


.insert({


name:name


});





document.getElementById(
"categoryName"
).value="";





loadCategories();



}












// =======================
// 系统设置
// =======================



async function loadSystem(){



let {

data

}=await supabaseClient


.from("system_config")


.select("*")


.eq(
"id",
1
)


.single();






if(!data)

return;






let api =
document.getElementById(
"apiUrl"
);



let site =
document.getElementById(
"siteName"
);





if(api)

api.value =
data.api_url || "";




if(site)

site.value =
data.site_name || "";





}









async function saveSystem(){



await supabaseClient


.from("system_config")


.upsert({


id:1,


api_url:


document.getElementById(
"apiUrl"
).value,



site_name:


document.getElementById(
"siteName"
).value



});






alert(
"设置保存成功"
);



}












// =======================
// Facebook分享
// =======================



async function loadShareProducts(){



let {

data

}=await supabaseClient


.from("products")


.select(
"id,name"
);


let box =
document.getElementById(
"shareProduct"
);



if(!box)
return;




box.innerHTML="";



data.forEach(item=>{


box.innerHTML +=


`

<option value="${item.id}">

${item.name}

</option>

`;



});



}








function createFacebookShare(){



let id =
document.getElementById(
"shareProduct"
).value;





let url =

window.location.origin

+

"/Foodie-shop/product.html?id="

+

id;






let text =

"China Direct Shop\n\n"

+

url;






navigator.clipboard.writeText(text);




alert(
"分享内容已复制"
);



}
