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


loadDecorations();


bindEvents();


});
 







// ==========================
// 加载装修模块
// ==========================


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

console.error(
"加载装修失败",
error
);

return;

}



decorations=data||[];



renderModuleList();


renderPreview();



}









// ==========================
// 左侧模块列表
// ==========================


function renderModuleList(){


const box=
document.getElementById(
"module-list"
);



if(!box)return;



box.innerHTML="";



if(!decorations.length){


box.innerHTML=
`
<div class="empty">
暂无装修模块
</div>
`;

return;


}





decorations.forEach(item=>{


let div=
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



div.draggable=true;


div.dataset.id=item.id;



div.innerHTML=

`
<div class="title">

${item.title}

<span class="drag-icon">
☰
</span>

</div>


<div class="type">

${getTypeName(item.type)}

</div>
`;





div.onclick=()=>{


editModule(item);


};



box.appendChild(div);



});



}









// ==========================
// 类型中文
// ==========================


function getTypeName(type){


let map={

banner:"首页Banner",

products:"推荐商品",

notice:"首页公告"

};


return map[type]||type;


}









// ==========================
// 新增模块
// ==========================


async function addModule(){



let module={


title:"新首页模块",

type:"products",


content:{


product_ids:[]

},


sort_order:
decorations.length,


status:true


};




const {
data,
error
}=await supabaseClient
.from("decorations")
.insert(
module
)
.select()
.single();





if(error){


alert(
"新增失败"
);

console.error(error);

return;

}





decorations.push(data);



renderModuleList();


editModule(data);



}









// ==========================
// 编辑模块
// ==========================


function editModule(item){


currentModule=item;



document
.getElementById(
"module-id"
).value=item.id;



document
.getElementById(
"module-title"
).value=
item.title||"";



document
.getElementById(
"module-type"
).value=
item.type;



document
.getElementById(
"module-sort"
).value=
item.sort_order||0;



document
.getElementById(
"module-status"
).checked=
item.status;



let content=
item.content||{};





if(typeof content==="string"){

try{

content=
JSON.parse(content);

}catch{

content={};

}

}





document
.getElementById(
"banner-url"
).value=
content.url||"";




document
.getElementById(
"notice-content"
).value=
content.text||"";





selectedProducts=[];



if(
content.product_ids
&&
content.product_ids.length
){


selectedProducts=
content.product_ids;


}



showEditorByType(
item.type
);



renderSelectedProducts();



}









// ==========================
// 根据类型显示编辑器
// ==========================


function showEditorByType(type){


document
.getElementById(
"banner-editor"
)
.style.display=
type==="banner"
?
"block"
:
"none";



document
.getElementById(
"product-editor"
)
.style.display=
type==="products"
?
"block"
:
"none";



document
.getElementById(
"notice-editor"
)
.style.display=
type==="notice"
?
"block"
:
"none";



}
// ==========================
// 保存当前模块
// ==========================


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
).value.trim()


};



}



if(type==="products"){


content={


product_ids:
selectedProducts


};



}



if(type==="notice"){


content={


text:
document.getElementById(
"notice-content"
).value.trim()


};


}





let updateData={


title:
document.getElementById(
"module-title"
).value.trim(),


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
new Date()


};





const {
error
}=await supabaseClient
.from("decorations")
.update(updateData)
.eq(
"id",
currentModule.id
);





if(error){


console.error(error);

alert(
"保存失败"
);


return;


}





Object.assign(
currentModule,
updateData
);



renderModuleList();


renderPreview();



alert(
"保存成功"
);


}









// ==========================
// 删除模块
// ==========================


async function deleteModule(){



if(!currentModule)return;



if(
!confirm(
"确定删除这个模块?"
)
)return;





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
"删除失败"
);

console.error(error);

return;

}





decorations=
decorations.filter(
item=>
item.id!==currentModule.id
);



currentModule=null;



renderModuleList();


renderPreview();


}









// ==========================
// Banner上传
// ==========================


async function uploadBanner(file){



if(!file)return "";




let ext=
file.name
.split(".")
.pop();



let filename=

"banner_"+
Date.now()
+
"."+
ext;





const {
error
}=await supabaseClient
.storage
.from(
"decorations"
)
.upload(
filename,
file
);



if(error){


console.error(
"上传失败",
error
);


alert(
"图片上传失败"
);


return "";


}





const {
data
}=supabaseClient
.storage
.from(
"decorations"
)
.getPublicUrl(
filename
);





return data.publicUrl;



}









// ==========================
// 加载商品
// ==========================


async function loadProducts(){


const {
data,
error
}=await supabaseClient
.from(
"products"
)
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



renderProductSelector(
allProducts
);



}









// ==========================
// 商品选择弹窗
// ==========================


function openProductModal(){



document
.getElementById(
"product-modal"
)
.classList.add(
"show"
);



if(!allProducts.length){

loadProducts();

}else{


renderProductSelector(
allProducts
);


}



}









function closeProductModal(){


document
.getElementById(
"product-modal"
)
.classList.remove(
"show"
);



}









// ==========================
// 商品列表
// ==========================


function renderProductSelector(list){



let box=
document.getElementById(
"product-select-list"
);



if(!box)return;



box.innerHTML="";



list.forEach(product=>{



let div=
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


<p>
${product.name}
</p>


<p>
$${product.price||0}
</p>

`;





div.onclick=()=>{


toggleProduct(
product.id,
div
);


};



box.appendChild(div);



});



}









function toggleProduct(id,dom){



if(
selectedProducts.includes(id)
){


selectedProducts=
selectedProducts.filter(
x=>x!==id
);



dom.classList.remove(
"active"
);



}else{


selectedProducts.push(id);


dom.classList.add(
"active"
);



}


}










// ==========================
// 已选择商品显示
// ==========================


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



let div=
document.createElement(
"div"
);



div.className=
"selected-product";



div.innerHTML=

`
<img src="${p.image||''}">


<p>
${p.name}
</p>
`;



box.appendChild(div);



});


}

// ==========================
// 拖拽排序
// ==========================


let dragId=null;



function initDrag(){



const items=
document.querySelectorAll(
".module-item"
);



items.forEach(item=>{



item.addEventListener(
"dragstart",
()=>{


dragId=item.dataset.id;


}
);





item.addEventListener(
"dragover",
e=>{


e.preventDefault();


}
);





item.addEventListener(
"drop",
()=>{


let targetId=
item.dataset.id;



if(
dragId &&
dragId!==targetId
){


changeSort(
dragId,
targetId
);


}



}
);



});



}









async function changeSort(
dragId,
targetId
){



let oldIndex=
decorations.findIndex(
x=>x.id==dragId
);



let newIndex=
decorations.findIndex(
x=>x.id==targetId
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



}









// ==========================
// Banner实时预览
// ==========================


async function previewBannerUpload(){



let file=
document
.getElementById(
"banner-upload"
)
.files[0];



if(!file)return;



let reader=
new FileReader();



reader.onload=function(e){



document
.getElementById(
"banner-preview"
)
.innerHTML=

`
<img src="${e.target.result}">
`;


};



reader.readAsDataURL(file);



let url=
await uploadBanner(file);



if(currentModule){


if(
typeof currentModule.content!=="object"
){

currentModule.content={};

}


currentModule.content.image=url;



}



}









// ==========================
// 首页实时预览
// ==========================


function renderPreview(){



let box=
document.getElementById(
"home-preview"
);



if(!box)return;



box.innerHTML="";




decorations
.filter(
x=>x.status
)
.sort(
(a,b)=>
a.sort_order-b.sort_order
)
.forEach(item=>{



let content=
item.content||{};



if(typeof content==="string"){


try{

content=JSON.parse(content);


}catch{

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







if(item.type==="products"){



let html="";



(content.product_ids||[])
.slice(0,6)
.forEach(id=>{



let p=
allProducts.find(
x=>x.id==id
);



if(p){



html+=

`

<div class="preview-product">


<img src="${p.image}">


<p>
${p.name}
</p>


</div>


`;



}


});





box.innerHTML+=


`

<h4>
${item.title}
</h4>


<div class="preview-products">

${html}

</div>

`;



}









if(item.type==="notice"){



box.innerHTML+=


`

<div style="
background:#fff7ed;
padding:12px;
border-radius:8px;
margin-bottom:15px;
">

${content.text||""}

</div>


`;



}




});




}









// ==========================
// 事件绑定
// ==========================


function bindEvents(){



// 新增

document
.getElementById(
"add-module-btn"
)
.onclick=
addModule;





// 保存全部

document
.getElementById(
"save-all-btn"
)
.onclick=
async()=>{


for(
let item of decorations
){


await supabaseClient
.from("decorations")
.update({

sort_order:
item.sort_order

})
.eq(
"id",
item.id
);



}



alert(
"全部保存完成"
);



};





// 保存当前


document
.getElementById(
"save-module-btn"
)
.onclick=
saveModule;





// 删除


document
.getElementById(
"delete-module-btn"
)
.onclick=
deleteModule;







// 类型切换


document
.getElementById(
"module-type"
)
.onchange=
e=>{


showEditorByType(
e.target.value
);


};







// 商品弹窗


document
.getElementById(
"open-product-select"
)
.onclick=
openProductModal;






document
.getElementById(
"close-product-modal"
)
.onclick=
closeProductModal;






document
.getElementById(
"confirm-product-btn"
)
.onclick=
()=>{


renderSelectedProducts();


closeProductModal();


renderPreview();


};








// Banner上传


document
.getElementById(
"banner-upload"
)
.onchange=
previewBannerUpload;







// 商品搜索


document
.getElementById(
"product-search"
)
.oninput=
e=>{


let key=
e.target.value
.trim()
.toLowerCase();



let result=
allProducts.filter(
p=>

p.name
.toLowerCase()
.includes(key)

);



renderProductSelector(
result
);



};





}










// 暴露

window.addModule=addModule;

window.saveModule=saveModule;

window.deleteModule=deleteModule;

window.openProductModal=openProductModal;

window.renderPreview=renderPreview;













