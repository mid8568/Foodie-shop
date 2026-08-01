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
const API_URL =
"http://localhost:3000";




// =======================
// 页面启动
// =======================


window.onload=function(){


loadStoreConfig();


loadMaterials();


loadSEO();


};





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






let notice =
document.getElementById(
"notice"
);



let title =
document.getElementById(
"homeTitle"
);





if(notice)

notice.value =
data.notice || "";




if(title)

title.value =
data.home_title || "";






let banner =
document.getElementById(
"bannerPreview"
);



if(
banner &&
data.banner
){


banner.innerHTML=

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






let path =

"banner/"

+

Date.now()

+

file.name;







await supabaseClient.storage


.from(
"product-images"
)


.upload(
path,
file
);








let {

data

}=supabaseClient.storage


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
// =======================
// 图片管理
// media_library
// =======================


let materials=[];




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

复制链接

</button>




<button onclick="deleteMaterial(${item.id})">

删除

</button>



</div>


`;



});



}









function filterMaterials(){



let type =
document.getElementById(
"materialCategory"
).value;



renderMaterials(type);



}












// 上传图片素材


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

}=await supabaseClient.storage


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

}=supabaseClient.storage


.from(
"product-images"
)


.getPublicUrl(
path
);







await supabaseClient


.from("media_library")


.insert({



name:

file.name,



url:

data.publicUrl,



type:

uploadType.value



});







alert(
"上传成功"
);



loadMaterials();



}











// 删除图片


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
// SEO设置
// =======================



async function loadSEO(){



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






if(error)

return;






if(!data)

return;






if(
document.getElementById("seoTitle")
)

seoTitle.value =
data.seo_title || "";






if(
document.getElementById("seoDescription")
)

seoDescription.value =
data.seo_description || "";






if(
document.getElementById("seoKeywords")
)

seoKeywords.value =
data.seo_keywords || "";



}











// 保存SEO


async function saveSEO(){



await supabaseClient


.from("store_config")


.update({



seo_title:

seoTitle.value,



seo_description:

seoDescription.value,



seo_keywords:

seoKeywords.value,



updated_at:

new Date()



})


.eq(
"id",
1
);






alert(
"SEO保存成功"
);



}
// =======================
// 首页推荐商品
// =======================



async function loadRecommendProducts(){



let box =
document.getElementById(
"recommendProducts"
);



if(!box)
return;





let {

data,
error

}=await supabaseClient


.from("products")


.select(
"id,name,image"
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









// 保存推荐商品


async function saveRecommendProducts(){



let select =
document.getElementById(
"recommendProducts"
);




if(!select)

return;






let ids = [];


for(
let option of select.selectedOptions
){


ids.push(
Number(option.value)
);


}






await supabaseClient


.from("store_config")


.update({


recommend_products:

ids,


updated_at:

new Date()


})


.eq(
"id",
1
);






alert(
"推荐商品保存成功"
);



}












// =======================
// 读取推荐商品
// =======================



async function loadRecommendSetting(){



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





let select =
document.getElementById(
"recommendProducts"
);



if(
!select ||
!data.recommend_products
)

return;





Array.from(
select.options
)
.forEach(option=>{


if(
data.recommend_products.includes(
Number(option.value)
)
)

{

option.selected=true;

}


});



}











// =======================
// 1688采集入口
// =======================



function open1688Collector(){



window.location.href =

"collector.html";



}











// =======================
// eBay同步
// =======================



async function syncProducts(){



alert(
"开始同步商品"
);



// 后续接 eBay API


}








async function syncPrice(){



alert(
"同步价格"
);



}








async function syncStock(){



alert(
"同步库存"
);



}








async function syncStatus(){



alert(
"同步上下架状态"
);



}












// =======================
// Facebook分享设置
// =======================



async function saveFacebook(){



let title =
document.getElementById(
"facebookTitle"
);



let desc =
document.getElementById(
"facebookDescription"
);






await supabaseClient


.from("store_config")


.update({


facebook_title:

title.value,



facebook_description:

desc.value,


updated_at:

new Date()


})


.eq(
"id",
1
);






alert(
"Facebook分享设置保存成功"
);



}
