console.log("admin-decoration.js启动");

const SUPABASE_URL="https://ukxxmxnubxjezkwbbxdr.supabase.co";
const SUPABASE_KEY="sb_publishable_2IFHfms3ombozpvZCvaeEg_2VZ2z5hJ";

const supabaseClient=supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


let decorations=[];
let currentModule=null;
let selectedProducts=[];
let allProducts=[];



document.addEventListener("DOMContentLoaded",()=>{

    console.log("装修页面初始化");

    bindEvents();

    loadDecorations();

});



// =====================
// 加载装修模块
// =====================

async function loadDecorations(){

    console.log("读取decorations");


    const {
        data,
        error
    }=await supabaseClient
        .from("decorations")
        .select("*")
        .order("id",{ascending:true});



    if(error){

        console.error(error);

        document.getElementById("module-list").innerHTML=
        `
        <div class="empty">
        数据库错误:
        ${error.message}
        </div>
        `;

        return;
    }


    decorations=data||[];


    console.log(
        "装修数据:",
        decorations
    );


    renderModuleList();

    renderPreview();

}





// =====================
// 模块列表
// =====================

function renderModuleList(){

    const box=document.getElementById("module-list");

    if(!box)return;


    box.innerHTML="";


    if(!decorations.length){

        box.innerHTML=
        `
        <div class="empty">
        暂无模块
        </div>
        `;

        return;
    }



    decorations.forEach(item=>{


        let div=document.createElement("div");

        div.className="module-item";

        div.draggable=true;

        div.dataset.id=item.id;



        if(
            currentModule &&
            currentModule.id===item.id
        ){

            div.classList.add("active");

        }



        div.innerHTML=
        `
        <div class="title">
        ${item.title||"未命名模块"}
        <span class="drag-icon">
        ☰
        </span>
        </div>

        <div class="type">
        ${item.type||"未知"}
        </div>
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


    document.getElementById("module-id").value=item.id;

    document.getElementById("module-title").value=item.title||"";

    document.getElementById("module-type").value=item.type||"banner";

    document.getElementById("module-sort").value=item.sort_order||0;

    document.getElementById("module-status").checked=
    item.status!==false;



    let content=item.content||{};


    if(typeof content==="string"){

        try{

            content=JSON.parse(content);

        }catch{

            content={};

        }

    }



    document.getElementById("banner-url").value=
    content.url||"";


    document.getElementById("notice-content").value=
    content.text||"";



    selectedProducts=
    content.product_ids||[];



    showEditor(
        item.type
    );


    renderSelectedProducts();


}





function showEditor(type){

    let banner=document.getElementById("banner-editor");

    let product=document.getElementById("product-editor");

    let notice=document.getElementById("notice-editor");



    if(banner)
    banner.style.display=
    type==="banner"?"block":"none";


    if(product)
    product.style.display=
    type==="products"?"block":"none";


    if(notice)
    notice.style.display=
    type==="notice"?"block":"none";

}







// =====================
// 新增模块
// =====================

async function addModule(){


    const module={

        title:"新模块",

        type:"banner",

        content:{},

        sort_order:decorations.length,

        status:true

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
    document.getElementById("module-type").value;



    let content={};



    if(type==="banner"){

        content={

            image:
            currentModule.content?.image||"",

            url:
            document.getElementById("banner-url").value

        };

    }



    if(type==="products"){

        content={

            product_ids:selectedProducts

        };

    }



    if(type==="notice"){

        content={

            text:
            document.getElementById("notice-content").value

        };

    }



    const update={


        title:
        document.getElementById("module-title").value,


        type:type,


        content:content,


        sort_order:
        Number(
            document.getElementById("module-sort").value
        ),


        status:
        document.getElementById("module-status").checked

    };



    const {
        error
    }=await supabaseClient
        .from("decorations")
        .update(update)
        .eq("id",currentModule.id);



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


    alert("保存成功");


}







// =====================
// 删除
// =====================

async function deleteModule(){


    if(!currentModule)return;


    if(!confirm("删除模块?"))return;



    const {
        error
    }=await supabaseClient
        .from("decorations")
        .delete()
        .eq("id",currentModule.id);



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
// Banner上传
// =====================

async function uploadBanner(file){


    if(!file)return;


    let name=
    "banner_"+Date.now()+"_"+file.name;



    const {
        error
    }=await supabaseClient
        .storage
        .from("decorations")
        .upload(
            name,
            file
        );



    if(error){

        alert(error.message);

        return;

    }



    const {
        data
    }=supabaseClient
        .storage
        .from("decorations")
        .getPublicUrl(name);



    if(currentModule){

        currentModule.content=
        currentModule.content||{};


        currentModule.content.image=
        data.publicUrl;

    }



    document.getElementById("banner-preview").innerHTML=
    `
    <img src="${data.publicUrl}">
    `;


}








// =====================
// 商品
// =====================


async function loadProducts(){


    const {
        data,
        error
    }=await supabaseClient
        .from("products")
        .select("id,name,image,price")
        .order("id",{ascending:false});



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


    let box=document.getElementById(
        "product-select-list"
    );


    if(!box)return;


    box.innerHTML="";


    list.forEach(p=>{


        let div=document.createElement("div");

        div.className="product-card";


        if(selectedProducts.includes(p.id))
        div.classList.add("active");



        div.innerHTML=
        `
        <img src="${p.image||''}">
        <p>${p.name}</p>
        <p>$${p.price||0}</p>
        `;



        div.onclick=()=>{


            if(selectedProducts.includes(p.id)){

                selectedProducts=
                selectedProducts.filter(
                    id=>id!==p.id
                );


                div.classList.remove("active");


            }else{


                selectedProducts.push(p.id);

                div.classList.add("active");

            }


        };


        box.appendChild(div);


    });


}







function renderSelectedProducts(){

    let box=document.getElementById(
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
        <p>${p.name}</p>
        </div>
        `;


    });


}








// =====================
// 首页预览
// =====================

function renderPreview(){


    let box=document.getElementById(
        "home-preview"
    );


    if(!box)return;


    box.innerHTML="";


    decorations
    .filter(x=>x.status)
    .forEach(item=>{


        let content=item.content||{};


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



    });


}









// =====================
// 拖拽
// =====================

function initDrag(){


let drag=null;


document.querySelectorAll(".module-item")
.forEach(item=>{


item.ondragstart=()=>{

drag=item.dataset.id;

};


item.ondragover=e=>{

e.preventDefault();

};


item.ondrop=()=>{


let a=
decorations.findIndex(
x=>x.id==drag
);


let b=
decorations.findIndex(
x=>x.id==item.dataset.id
);


let move=
decorations.splice(a,1)[0];


decorations.splice(b,0,move);


renderModuleList();


renderPreview();


};



});


}









// =====================
// 事件
// =====================

function bindEvents(){


document.getElementById("add-module-btn")
.onclick=addModule;


document.getElementById("save-module-btn")
.onclick=saveModule;


document.getElementById("delete-module-btn")
.onclick=deleteModule;



document.getElementById("module-type")
.onchange=e=>
showEditor(e.target.value);



document.getElementById("banner-upload")
.onchange=e=>
uploadBanner(e.target.files[0]);



document.getElementById("open-product-select")
.onclick=()=>{


document.getElementById("product-modal")
.classList.add("show");


loadProducts();


};



document.getElementById("close-product-modal")
.onclick=()=>{

document.getElementById("product-modal")
.classList.remove("show");

};



document.getElementById("confirm-product-btn")
.onclick=()=>{


renderSelectedProducts();


document.getElementById("product-modal")
.classList.remove("show");


};



}

