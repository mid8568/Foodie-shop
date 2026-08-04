console.log("admin-decoration.js启动");


const SUPABASE_URL=
"https://ukxxmxnubxjezkwbbxdr.supabase.co";


const SUPABASE_KEY=
"sb_publishable_2IFHfms3ombozpvZCvaeEg_2VZ2z5hJ";


const supabaseClient=
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

console.log("装修后台初始化");

bindEvents();

loadDecorations();

});




// =====================
// 加载装修
// =====================

async function loadDecorations(){


const {
data,
error
}=await supabaseClient
.from("decorations")
.select("*")
.order(
"sort_order",
{
ascending:true
}
);



if(error){

console.error(error);

return;

}


decorations=data||[];


renderModuleList();

renderPreview();


}






// =====================
// 模块列表
// =====================

function renderModuleList(){


const box=
document.getElementById(
"module-list"
);


if(!box)return;


box.innerHTML="";


decorations.forEach(item=>{


let div=
document.createElement("div");


div.className=
"module-item";


if(
currentModule &&
currentModule.id===item.id
){

div.classList.add("active");

}


div.innerHTML=`

<div>
${item.title||"未命名"}
</div>

<small>
${item.type}
</small>

`;


div.onclick=()=>{

editModule(item);

};


box.appendChild(div);


});


}







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
).value=
item.title||"";


document.getElementById(
"module-type"
).value=
item.type||"banner";


document.getElementById(
"module-sort"
).value=
item.sort_order||0;


document.getElementById(
"module-status"
).checked=
item.status!==false;



let content=
item.content||{};



if(typeof content==="string"){

try{

content=JSON.parse(content);

}
catch{

content={};

}

}



document.getElementById(
"banner-url"
).value=
content.url||"";



document.getElementById(
"notice-content"
).value=
content.text||"";



showEditor(
item.type
);


}





// =====================
// 显示编辑器
// =====================

function showEditor(type){


let banner=
document.getElementById(
"banner-editor"
);


let product=
document.getElementById(
"product-editor"
);


let notice=
document.getElementById(
"notice-editor"
);



if(banner)
banner.style.display=
type==="banner"
?
"block"
:
"none";



if(product)
product.style.display=
type==="products"
?
"block"
:
"none";



if(notice)
notice.style.display=
type==="notice"
?
"block"
:
"none";


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


config:{},


sort_order:
decorations.length,


status:true,


is_published:false


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

alert(error.message);

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

alert("请选择模块");

return;

}



let type=
document.getElementById(
"module-type"
).value;



let content={};



if(type==="banner"){


content={


image:
currentModule.content?.image||"",


url:
document.getElementById(
"banner-url"
).value


};


}




if(type==="notice"){


content={


text:
document.getElementById(
"notice-content"
).value


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
).checked



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

alert(error.message);

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

if(!currentModule)return;


if(!confirm("确定删除这个模块?"))
return;



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

alert(error.message);

return;

}



decorations=
decorations.filter(
x=>x.id!==currentModule.id
);



currentModule=null;


renderModuleList();

renderPreview();


}








// =====================
// 上传Banner图片
// =====================

async function uploadBanner(file){


if(!file)
return;



let filename=
"banner/"
+
Date.now()
+
"_"
+
file.name;



const {
error
}=await supabaseClient
.storage
.from("decorations")
.upload(
filename,
file,
{
cacheControl:"3600",
upsert:false
}
);



if(error){

alert(
"上传失败:"
+
error.message
);

return;

}





const {
data:urlData
}=supabaseClient
.storage
.from("decorations")
.getPublicUrl(
filename
);



let imageUrl=
urlData.publicUrl;



if(currentModule){


let content=
currentModule.content||{};



if(typeof content==="string"){

try{

content=JSON.parse(content);

}
catch{

content={};

}

}



content.image=imageUrl;



currentModule.content=content;



await supabaseClient
.from("decorations")
.update({

content:content

})
.eq(
"id",
currentModule.id
);



}




let preview=
document.getElementById(
"banner-preview"
);



if(preview){

preview.innerHTML=
`
<img src="${imageUrl}">
`;

}



renderPreview();


}











// =====================
// 加载商品
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

console.error(error);

return;

}



allProducts=data||[];


renderProductList(
allProducts
);


}







function renderProductList(list){


let box=
document.getElementById(
"product-select-list"
);



if(!box)return;



box.innerHTML="";



list.forEach(p=>{


let div=
document.createElement(
"div"
);



div.className=
"product-card";



if(
selectedProducts.includes(p.id)
){

div.classList.add(
"active"
);

}



div.innerHTML=
`

<img src="${p.image||''}">

<p>
${p.name}
</p>

<p>
$${p.price||0}
</p>

`;



div.onclick=()=>{


if(
selectedProducts.includes(p.id)
){


selectedProducts=
selectedProducts.filter(
id=>id!==p.id
);


div.classList.remove(
"active"
);



}else{


selectedProducts.push(
p.id
);


div.classList.add(
"active"
);


}



};



box.appendChild(div);



});



}









function renderSelectedProducts(){


let box=
document.getElementById(
"selected-products"
);



if(!box)return;



box.innerHTML="";



selectedProducts.forEach(id=>{


let p=
allProducts.find(
x=>x.id==id
);



if(!p)return;



box.innerHTML+=
`

<div class="selected-product">

<img src="${p.image}">

<span>
${p.name}
</span>

</div>

`;



});



}











// =====================
// 首页实时预览
// =====================

function renderPreview(){


let box=
document.getElementById(
"home-preview"
);



if(!box)return;



box.innerHTML="";



decorations
.filter(
item=>
item.status &&
item.is_published!==false
)
.forEach(item=>{



let content=
item.content||{};



if(typeof content==="string"){

try{

content=JSON.parse(content);

}
catch{

content={};

}

}





if(item.type==="banner"){


box.innerHTML+=
`

<div class="preview-banner">

<img src="${content.image||''}">

</div>

`;



}



if(item.type==="notice"){


box.innerHTML+=
`

<div class="preview-notice">

${content.text||""}

</div>

`;



}



if(item.type==="products"){


box.innerHTML+=
`

<div class="preview-products">

推荐商品数量：
${content.product_ids?.length||0}

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
.querySelectorAll(".module-item")
.forEach(item=>{



item.draggable=true;



item.ondragstart=()=>{


dragId=
item.dataset.id;


};



item.ondragover=e=>{

e.preventDefault();

};



item.ondrop=async()=>{


let oldIndex=
decorations.findIndex(
x=>x.id==dragId
);



let newIndex=
decorations.findIndex(
x=>x.id==item.dataset.id
);



let move=
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



let add=
document.getElementById(
"add-module-btn"
);


if(add)
add.onclick=
addModule;





let save=
document.getElementById(
"save-module-btn"
);


if(save)
save.onclick=
saveModule;





let del=
document.getElementById(
"delete-module-btn"
);


if(del)
del.onclick=
deleteModule;





let type=
document.getElementById(
"module-type"
);



if(type){

type.onchange=
e=>
showEditor(
e.target.value
);

}






let upload=
document.getElementById(
"banner-upload"
);



if(upload){

upload.onchange=
e=>
uploadBanner(
e.target.files[0]
);

}







let open=
document.getElementById(
"open-product-select"
);



if(open){

open.onclick=()=>{


document
.getElementById(
"product-modal"
)
.classList
.add(
"show"
);



loadProducts();



};

}





let close=
document.getElementById(
"close-product-modal"
);



if(close){

close.onclick=()=>{


document
.getElementById(
"product-modal"
)
.classList
.remove(
"show"
);



};

}






let confirm=
document.getElementById(
"confirm-product-btn"
);



if(confirm){

confirm.onclick=()=>{


renderSelectedProducts();



document
.getElementById(
"product-modal"
)
.classList
.remove(
"show"
);



};

}



}
