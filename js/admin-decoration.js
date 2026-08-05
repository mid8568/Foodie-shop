console.log("admin-decoration.js启动");


const SUPABASE_URL =
"https://ukxxmxnubxjezkwbbxdr.supabase.co";


const SUPABASE_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVreHhteG51YnhqZXprd2JieGRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NTQzMDQsImV4cCI6MjEwMDIzMDMwNH0.dGtGmntrqNyMc15wDZuIQBm99jn7n60qjinUvIEPrs0";


const supabaseClient =
supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);

window.supabaseClient = supabaseClient;

let decorations=[];
window.decorations = decorations;
let currentModule=null;

let selectedProducts=[];

let allProducts=[];



document.addEventListener(
"DOMContentLoaded",
()=>{


console.log(
"装修后台加载"
);


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
}
=
await supabaseClient
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



decorations =
data || [];

window.decorations = decorations;

await loadProducts();


renderModuleList();


renderPreview();


}





// =====================
// Storage 图片库
// =====================


async function loadDecorationLibrary(){


let box =
document.getElementById(
"decoration-image-list"
);



if(!box)return;



box.innerHTML=
"加载图片中...";



const {
data,
error
}
=
await supabaseClient
.storage
.from("decorations")
.list(
"",
{
limit:100,
sortBy:{
column:"created_at",
order:"desc"
}
}
);



if(error){


console.error(
error
);


box.innerHTML=
"加载失败";


return;


}



let html="";



data.forEach(item=>{


if(!item.name)
return;



const {
data:urlData
}
=
supabaseClient
.storage
.from("decorations")
.getPublicUrl(
item.name
);



let url =
urlData.publicUrl;


html +=

`

<div class="decoration-image-item"

onclick="chooseDecorationImage('${url}')">


<img src="${url}">


</div>

`;



});



box.innerHTML =
html || "暂无图片";


}




window.chooseDecorationImage=function(url){


let input =
document.getElementById(
"banner-image"
);



if(input){

input.value=url;

}




let preview =
document.getElementById(
"banner-preview"
);



if(preview){


preview.innerHTML=

`

<img src="${url}"

style="
width:100%;
height:220px;
object-fit:cover;
border-radius:8px;
">

`;

}




let modal =
document.getElementById(
"decoration-modal"
);



if(modal){

modal.classList.remove(
"show"
);

}



};
// =====================
// 编辑模块
// =====================

function editModule(item){


currentModule=item;



document.getElementById(
"module-id"
).value=item.id;



document.getElementById(
"module-title"
).value=item.title||"";



document.getElementById(
"module-type"
).value=item.type||"banner";



document.getElementById(
"module-sort"
).value=item.sort_order||0;



document.getElementById(
"module-status"
).checked=item.status!==false;



let content=item.content||{};



if(typeof content==="string"){


try{

content=JSON.parse(content);

}catch{

content={};

}

}




if(item.type==="banner"){


document.getElementById(
"banner-image"
).value=
content.image||"";


document.getElementById(
"banner-url"
).value=
content.url||"";



if(content.image){


document.getElementById(
"banner-preview"
).innerHTML=

`

<img src="${content.image}"

style="
width:100%;
height:220px;
object-fit:cover;
border-radius:8px;
">

`;

}


}





if(item.type==="notice"){


document.getElementById(
"notice-content"
).value=
content.text||"";


}





if(item.type==="products"){


selectedProducts =
content.product_ids || [];


}



showEditor(
item.type
);



renderSelectedProducts();


renderModuleList();


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



if(type==="banner"){


content={

image:
document.getElementById(
"banner-image"
).value||"",


url:
document.getElementById(
"banner-url"
).value||""

};


}




if(type==="notice"){


content={

text:
document.getElementById(
"notice-content"
).value||""

};


}





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
}
=
await supabaseClient
.from("decorations")
.update(update)
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
// 新增模块
// =====================

async function addModule(){



let module={


page_name:"home",


title:"新模块",


type:"banner",


content:{},


sort_order:
decorations.length,


status:true,


is_published:false


};




const {
data,
error
}
=
await supabaseClient
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




decorations.push(
data
);



renderModuleList();


renderPreview();


editModule(
data
);


}







// =====================
// 删除模块
// =====================

async function deleteModule(){



if(!currentModule)
return;




if(
!confirm(
"确定删除这个模块?"
)
)
return;





const {
error
}
=
await supabaseClient
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
x=>
x.id!==currentModule.id
);



currentModule=null;



renderModuleList();


renderPreview();



}








// =====================
// Banner上传
// =====================

async function uploadBanner(file){


if(!file)
return;



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





let result;


try{


result =
await supabaseClient
.storage
.from("decorations")
.upload(
filename,
file,
{
cacheControl:"3600",
upsert:false,
contentType:file.type
}
);



console.log(
"Storage返回:",
result
);



}catch(e){


console.error(
"网络异常:",
e
);



alert(
"网络异常:"
+
e.message
);



return;


}


const {
data,
error
}
=
result;





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
.from("decorations")
.getPublicUrl(
filename
);


let imageUrl =
urlData.publicUrl;



console.log(
"图片地址:",
imageUrl
);





document.getElementById(
"banner-image"
).value=imageUrl;





document.getElementById(
"banner-preview"
).innerHTML=

`

<img src="${imageUrl}"

style="
width:100%;
height:220px;
object-fit:cover;
border-radius:8px;
">

`;

if(currentModule){

currentModule.content={
image:imageUrl,
url:""
};
await supabaseClient
.from("decorations")
.update({
content:{
image:imageUrl,
url:""
},
updated_at:new Date().toISOString()
})
.eq(
"id",
currentModule.id
);

let index =
decorations.findIndex(
x=>x.id===currentModule.id
);


if(index>-1){

decorations[index].content =
currentModule.content;

}


renderPreview();

}

alert(
"Banner上传成功"
);



}
// =====================
// 商品加载
// =====================

async function loadProducts(){


const {
data,
error
}
=
await supabaseClient
.from("products")
.select(
"id,name,image,price,sale_price"
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
data || [];

}





// =====================
// 商品选择列表
// =====================

function renderProductList(list){


let box =
document.getElementById(
"product-select-list"
);



if(!box)
return;



box.innerHTML="";



list.forEach(product=>{


let div =
document.createElement(
"div"
);



div.className=
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

$${product.sale_price || product.price || 0}

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



}else{


selectedProducts.push(
product.id
);



div.classList.add(
"active"
);


}



};



box.appendChild(
div
);



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



if(!box)
return;



box.innerHTML="";



selectedProducts.forEach(id=>{


let p =
allProducts.find(
x=>
x.id==id
);



if(!p)
return;



box.innerHTML +=

`

<div class="selected-product">


<img src="${p.image||''}">


<span>

${p.name}

</span>


</div>

`;



});


}







// =====================
// 首页预览
// =====================

function renderPreview(){


let box =
document.getElementById(
"home-preview"
);



if(!box)
return;



box.innerHTML="";



decorations
.filter(
x=>x.status===true
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

content=JSON.parse(content);

}catch{

content={};

}

}





if(
item.type==="banner"
&&
content.image
){



box.innerHTML +=

`

<div class="preview-banner">


<img src="${content.image}"

style="
width:100%;
height:220px;
object-fit:cover;
border-radius:8px;
">


</div>

`;



}







if(
item.type==="notice"
){


box.innerHTML +=

`

<div class="preview-notice">

${content.text||""}

</div>

`;



}








if(
item.type==="products"
){



let html=

`

<div class="preview-title">

${item.title||"推荐商品"}

</div>


<div class="preview-product-grid">

`;





(content.product_ids||[])
.forEach(id=>{


let product =
allProducts.find(
p=>
p.id==id
);



if(product){



html +=

`

<div class="preview-product-card">


<img src="${product.image||''}">


<div>

${product.name||""}

</div>


<div>

$${product.sale_price || product.price || 0}

</div>


</div>

`;



}



});




html +=

`

</div>

`;



box.innerHTML += html;



}



});


}








// =====================
// 模块列表
// =====================

function renderModuleList(){


let box =
document.getElementById(
"module-list"
);



if(!box)
return;



box.innerHTML="";



decorations.forEach(item=>{


let div =
document.createElement(
"div"
);



div.className=
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


editModule(
item
);


};




box.appendChild(
div
);



});



initDrag();



}









// =====================
// 编辑器显示
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
)
return;




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



let addBtn =
document.getElementById(
"add-module-btn"
);



if(addBtn){

addBtn.onclick=
addModule;

}




let saveBtn =
document.getElementById(
"save-module-btn"
);



if(saveBtn){

saveBtn.onclick=
saveModule;

}





let deleteBtn =
document.getElementById(
"delete-module-btn"
);



if(deleteBtn){

deleteBtn.onclick=
deleteModule;

}







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







let libraryBtn =
document.getElementById(
"open-decoration-library"
);



if(libraryBtn){


libraryBtn.onclick=()=>{


let modal =
document.getElementById(
"decoration-modal"
);



if(modal){

modal.classList.add(
"show"
);

}



loadDecorationLibrary();



};



}







let closeLibrary =
document.getElementById(
"close-decoration-modal"
);



if(closeLibrary){


closeLibrary.onclick=()=>{


let modal =
document.getElementById(
"decoration-modal"
);



if(modal){

modal.classList.remove(
"show"
);

}



};



}







let productBtn =
document.getElementById(
"open-product-select"
);



if(productBtn){


productBtn.onclick=()=>{


renderProductList(
allProducts
);



let modal =
document.getElementById(
"product-modal"
);



if(modal){

modal.classList.add(
"show"
);

}



};


}







let closeProduct =
document.getElementById(
"close-product-modal"
);



if(closeProduct){


closeProduct.onclick=()=>{


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
window.renderPreview = renderPreview;
window.decorations = decorations;
window.loadDecorations = loadDecorations;
