console.log("admin-decoration.js启动");


const SUPABASE_URL =
"https://ukxxmxnubxjezkwbbxdr.supabase.co";


const SUPABASE_KEY =
"sb_publishable_2IFHfms3ombozpvZCvaeEg_2VZ2z5hJ";


const supabaseClient =
supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);



let decorations=[];

let currentModule=null;

let selectedProducts=[];

let allProducts=[];




document.addEventListener(
"DOMContentLoaded",
()=>{

console.log("装修后台加载");


bindEvents();

loadDecorations();


});






// =====================
// 加载装修模块
// =====================

async function loadDecorations(){


const {
data,
error
}=await supabaseClient
.from("decorations")
.select("*")
.eq(
"page_name",
"home"
)
.order(
"sort_order",
{
ascending:true
}
);



if(error){

console.error(
"读取装修失败:",
error
);

return;

}



decorations=data||[];


renderModuleList();

renderPreview();



}









// =====================
// 渲染模块列表
// =====================

function renderModuleList(){


let box =
document.getElementById(
"module-list"
);



if(!box)return;



box.innerHTML="";




decorations.forEach(item=>{


let div =
document.createElement(
"div"
);



div.className =
"module-item";



if(
currentModule &&
currentModule.id===item.id
){

div.classList.add(
"active"
);

}



div.dataset.id =
item.id;



div.innerHTML=

`

<div>

${item.title||"未命名模块"}

</div>


<span>

${item.type||"banner"}

</span>

`;





div.onclick=()=>{

editModule(item);

};




box.appendChild(div);



});



initDrag();


}











// =====================
// 编辑模块
// =====================

function editModule(item){


currentModule=item;



let id =
document.getElementById(
"module-id"
);



if(id){

id.value=item.id;

}




let title =
document.getElementById(
"module-title"
);



if(title){

title.value=
item.title||"";

}




let type =
document.getElementById(
"module-type"
);



if(type){

type.value=
item.type||"banner";

}




let sort =
document.getElementById(
"module-sort"
);



if(sort){

sort.value=
item.sort_order||0;

}




let status =
document.getElementById(
"module-status"
);



if(status){

status.checked=
item.status!==false;

}





let content =
item.content||{};



if(typeof content==="string"){


try{

content=
JSON.parse(content);

}
catch{

content={};

}

}







// Banner链接

let url =
document.getElementById(
"banner-url"
);



if(url){

url.value=
content.url||"";

}







// Banner图片预览

let preview =
document.getElementById(
"banner-preview"
);



if(
preview &&
content.image
){


preview.innerHTML=

`

<img 
src="${content.image}"
style="
max-width:100%;
height:120px;
object-fit:cover;
">

`;



}





// 公告

let notice =
document.getElementById(
"notice-content"
);



if(notice){

notice.value=
content.text||"";

}




selectedProducts =
content.product_ids||[];




showEditor(
item.type
);



renderSelectedProducts();



}









// =====================
// 显示编辑区域
// =====================

function showEditor(type){



let banner =
document.getElementById(
"banner-editor"
);



let products =
document.getElementById(
"product-editor"
);



let notice =
document.getElementById(
"notice-editor"
);





if(banner){

banner.style.display =
type==="banner"
?
"block"
:
"none";

}



if(products){

products.style.display =
type==="products"
?
"block"
:
"none";

}



if(notice){

notice.style.display =
type==="notice"
?
"block"
:
"none";

}



}










// =====================
// 新增模块
// =====================

async function addModule(){



let module={


page_name:
"home",


title:
"新模块",


type:
"banner",


content:
{},


config:
{},


sort_order:
decorations.length,


status:
true,


is_published:
false


};





const {
data,
error
}=await supabaseClient
.from("decorations")
.insert(module)
.select()
.single();





if(error){


alert(
"新增失败:"
+
error.message
);


return;

}





decorations.push(data);



renderModuleList();


editModule(data);



}
// =====================
// 保存模块
// =====================

async function saveModule(){


if(!currentModule){

alert(
"请选择模块"
);

return;

}



let type =
document.getElementById(
"module-type"
).value;



let content={};





// Banner

if(type==="banner"){


let old =
currentModule.content||{};



if(typeof old==="string"){


try{

old=
JSON.parse(old);

}
catch{

old={};

}

}




content={

image:
old.image||"",


url:
document.getElementById(
"banner-url"
).value||""

};



}





// 公告

if(type==="notice"){


content={

text:
document.getElementById(
"notice-content"
).value||""

};


}





// 推荐商品

if(type==="products"){


content={

product_ids:
selectedProducts

};


}







let update={


title:
document.getElementById(
"module-title"
).value,


type:type,


content:content,


config:
currentModule.config||{},



sort_order:
Number(
document.getElementById(
"module-sort"
).value
),



status:
document.getElementById(
"module-status"
).checked,



updated_at:
new Date().toISOString()



};







const {
error
}=await supabaseClient
.from("decorations")
.update(update)
.eq(
"id",
currentModule.id
);






if(error){


alert(
"保存失败:"
+
error.message
);


return;


}







Object.assign(
currentModule,
update
);



renderModuleList();


renderPreview();



alert(
"保存成功"
);



}











// =====================
// 删除模块
// =====================

async function deleteModule(){



if(!currentModule){

return;

}




if(
!confirm(
"确定删除这个模块?"
)
){

return;

}





const {
error
}=await supabaseClient
.from("decorations")
.delete()
.eq(
"id",
currentModule.id
);





if(error){


alert(
error.message
);


return;


}







decorations =
decorations.filter(
item=>
item.id!==currentModule.id
);




currentModule=null;



renderModuleList();


renderPreview();



}











// =====================
// Banner上传
// =====================

async function uploadBanner(file){


if(!file){

return;

}




console.log(
"开始上传:",
file.name
);





let filename =

"banner_"

+
Date.now()
+
"_"
+
file.name;






const {
data,
error
}=await supabaseClient
.storage
.from(
"decorations"
)
.upload(
filename,
file,
{

cacheControl:"3600",

upsert:true

}
);






if(error){


console.error(
"上传失败:",
error
);



alert(
"上传失败:"
+
error.message
);


return;


}






const {
data:urlData
}
=
supabaseClient
.storage
.from(
"decorations"
)
.getPublicUrl(
filename
);






let imageUrl =
urlData.publicUrl;






console.log(
"图片地址:",
imageUrl
);







if(currentModule){


let content =
currentModule.content||{};



if(typeof content==="string"){


try{

content=
JSON.parse(content);

}
catch{

content={};

}

}





content.image =
imageUrl;





await supabaseClient
.from("decorations")
.update({

content:content,


updated_at:
new Date().toISOString()

})
.eq(
"id",
currentModule.id
);





currentModule.content =
content;



}








let preview =
document.getElementById(
"banner-preview"
);




if(preview){


preview.innerHTML=

`

<img
src="${imageUrl}"
style="
max-width:100%;
height:120px;
object-fit:cover;
">

`;



}





renderPreview();



}











// =====================
// 商品加载
// =====================

async function loadProducts(){



const {
data,
error
}=await supabaseClient
.from("products")
.select(
"id,name,image,price"
)
.order(
"id",
{
ascending:false
}
);





if(error){


console.error(
"商品读取失败:",
error
);


return;


}





allProducts =
data||[];




renderProductList(
allProducts
);



}












// =====================
// 商品选择列表
// =====================

function renderProductList(list){



let box =
document.getElementById(
"product-select-list"
);



if(!box)return;



box.innerHTML="";





list.forEach(product=>{



let div =
document.createElement(
"div"
);



div.className =
"product-card";




if(
selectedProducts.includes(
product.id
)
){

div.classList.add(
"active"
);

}




div.innerHTML=

`

<img src="${product.image||''}">


<div>
${product.name||""}
</div>


<div>
$${product.price||0}
</div>


`;





div.onclick=()=>{


if(
selectedProducts.includes(
product.id
)
){


selectedProducts =
selectedProducts.filter(
id=>
id!==product.id
);



div.classList.remove(
"active"
);



}
else{


selectedProducts.push(
product.id
);



div.classList.add(
"active"
);



}


};





box.appendChild(div);



});



}











// =====================
// 已选择商品
// =====================

function renderSelectedProducts(){



let box =
document.getElementById(
"selected-products"
);



if(!box)return;



box.innerHTML="";





selectedProducts.forEach(id=>{



let product =
allProducts.find(
x=>
x.id==id
);




if(!product)return;





box.innerHTML+=

`

<div class="selected-product">


<img src="${product.image||''}">


<span>
${product.name}
</span>


</div>

`;



});



}
// =====================
// 首页实时预览
// =====================

function renderPreview(){


let box =
document.getElementById(
"home-preview"
);



if(!box)return;



box.innerHTML="";





decorations
.filter(
item=>
item.status===true
)
.sort(
(a,b)=>
a.sort_order-b.sort_order
)
.forEach(item=>{



let content =
item.content||{};



if(typeof content==="string"){


try{

content=
JSON.parse(content);

}
catch{

content={};

}

}







// Banner

if(
item.type==="banner"
){



if(content.image){



box.innerHTML+=

`

<div class="preview-banner">


<img
src="${content.image}"
style="
width:100%;
max-height:220px;
object-fit:cover;
">


</div>


`;



}



}









// 公告

if(
item.type==="notice"
){



box.innerHTML+=

`

<div class="preview-notice">


${content.text||""}


</div>


`;



}









// 推荐商品

if(
item.type==="products"
){



box.innerHTML+=

`

<div class="preview-products">


推荐商品：

${content.product_ids?.length||0}

个


</div>


`;



}





});



}











// =====================
// 拖拽排序
// =====================

function initDrag(){



let dragId=null;




document
.querySelectorAll(
".module-item"
)
.forEach(item=>{



item.draggable=true;





item.ondragstart=()=>{


dragId =
item.dataset.id;


};







item.ondragover=e=>{


e.preventDefault();


};







item.ondrop=async()=>{


let oldIndex =
decorations.findIndex(
x=>
x.id==dragId
);



let newIndex =
decorations.findIndex(
x=>
x.id==item.dataset.id
);





if(
oldIndex<0 ||
newIndex<0
){

return;

}





let move =
decorations.splice(
oldIndex,
1
)[0];





decorations.splice(
newIndex,
0,
move
);






for(
let i=0;
i<decorations.length;
i++
){



decorations[i].sort_order=i;



await supabaseClient
.from("decorations")
.update({

sort_order:i

})
.eq(
"id",
decorations[i].id
);



}






renderModuleList();


renderPreview();



};




});



}











// =====================
// 事件绑定
// =====================

function bindEvents(){





// 新增模块

let addBtn =
document.getElementById(
"add-module-btn"
);



if(addBtn){


addBtn.onclick =
addModule;


}








// 保存

let saveBtn =
document.getElementById(
"save-module-btn"
);



if(saveBtn){


saveBtn.onclick =
saveModule;


}








// 删除

let deleteBtn =
document.getElementById(
"delete-module-btn"
);



if(deleteBtn){


deleteBtn.onclick =
deleteModule;


}









// 类型切换

let typeSelect =
document.getElementById(
"module-type"
);



if(typeSelect){



typeSelect.onchange=e=>{


showEditor(
e.target.value
);


};



}









// Banner上传

let upload =
document.getElementById(
"banner-upload"
);



if(upload){



upload.onchange=e=>{


uploadBanner(
e.target.files[0]
);



};



}









// 打开商品选择

let productBtn =
document.getElementById(
"open-product-select"
);



if(productBtn){



productBtn.onclick=()=>{


let modal =
document.getElementById(
"product-modal"
);



if(modal){


modal.classList.add(
"show"
);


}



loadProducts();



};



}









// 关闭商品选择

let closeBtn =
document.getElementById(
"close-product-modal"
);



if(closeBtn){



closeBtn.onclick=()=>{


let modal =
document.getElementById(
"product-modal"
);



if(modal){


modal.classList.remove(
"show"
);


}



};



}









// 确认商品

let confirmBtn =
document.getElementById(
"confirm-product-btn"
);



if(confirmBtn){



confirmBtn.onclick=()=>{


renderSelectedProducts();



let modal =
document.getElementById(
"product-modal"
);



if(modal){


modal.classList.remove(
"show"
);


}



};



}





}
