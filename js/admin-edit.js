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



let oldImage="";






// =======================
// 页面加载
// =======================


document.addEventListener(
"DOMContentLoaded",
()=>{


if(!productId){

alert(
"商品ID不存在"
);

return;

}


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




oldImage =
data.image || "";




// 基础


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
"status",
data.status || data.stock_status
);





// 1688


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






// 图片


document.getElementById(
"main-image"
).src =
data.image || "";



document.getElementById(
"image2"
).src =
data.image2 || "";



document.getElementById(
"image3"
).src =
data.image3 || "";



document.getElementById(
"image4"
).src =
data.image4 || "";





// 详情图片


let box =
document.getElementById(
"detail-images"
);


box.innerHTML="";



if(
Array.isArray(
data.detail_images
)
){


data.detail_images.forEach(url=>{


let img =
document.createElement(
"img"
);


img.src=url;


img.className=
"small-image";


box.appendChild(img);



});


}





// 描述


setValue(
"description",
data.description
);



setValue(
"description_en",
data.description_en
);







// 价格


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







// 规格


setValue(
"specifications",

JSON.stringify(
data.specifications || {},
null,
2
)

);






// SEO


setValue(
"seo_title",
data.seo_title
);



setValue(
"seo_description",
data.seo_description
);



}









// =======================
// 设置值
// =======================


function setValue(id,value){


let el =
document.getElementById(id);


if(el){

el.value =
value || "";

}


}









// =======================
// 上传主图
// =======================


async function uploadImage(file){



if(!file){

return oldImage;

}



let filename =

Date.now()

+"_"+file.name;





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

return oldImage;

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
// 保存
// =======================


async function saveProduct(){



let image =
oldImage;




let file =

document.getElementById(
"image-file"
)

.files[0];




if(file){

image =
await uploadImage(file);

}





let specifications={};


try{


specifications =

JSON.parse(

document.getElementById(
"specifications"
).value

);


}catch(e){


alert(
"规格JSON格式错误"
);


return;


}






const updateData={



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



seo_title:

value("seo_title"),



seo_description:

value("seo_description"),



specifications,



image:image



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

console.log(error);

alert(
"保存失败"
);

return;

}




alert(
"保存成功"
);



location.href=
"admin-products.html";



}







function value(id){


let el =
document.getElementById(id);


return el ?
el.value :
"";


}








// =======================
// 返回
// =======================


function backList(){


location.href=
"admin-products.html";


}





window.saveProduct =
saveProduct;


window.backList =
backList;
