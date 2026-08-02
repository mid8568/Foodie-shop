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
// 当前商品ID
// =======================


const params =
new URLSearchParams(
window.location.search
);


const productId =
params.get("id");



let oldImage = "";





// =======================
// 页面加载
// =======================


document.addEventListener(
"DOMContentLoaded",
()=>{


if(!productId){

alert(
"没有商品ID"
);

return;

}


loadProduct();


}
);






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
"商品加载失败"
);


return;


}



console.log(data);



oldImage =
data.image || "";




document.getElementById(
"name"
).value =
data.name || "";



document.getElementById(
"name_en"
).value =
data.name_en || "";



document.getElementById(
"description"
).value =
data.description || "";



document.getElementById(
"price"
).value =
data.price || "";



if(
document.getElementById("cost_price")
){

document.getElementById(
"cost_price"
).value =
data.cost_price || "";

}



document.getElementById(
"status"
).value =
data.stock_status || "下架";





let img =
document.getElementById(
"preview"
);



if(img){

img.src =
oldImage;

}



}







// =======================
// 上传图片
// =======================


async function uploadImage(file){



if(!file){

return oldImage;

}



const fileName =

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

fileName,

file

);



if(error){


console.log(error);


alert(
"图片上传失败"
);


return oldImage;


}





const {

data

}=

supabaseClient

.storage

.from(
"product-images"
)

.getPublicUrl(
fileName
);



return data.publicUrl;



}








// =======================
// 保存商品
// =======================


async function saveProduct(){



let image = oldImage;




const file =

document.getElementById(
"image-file"
).files[0];



if(file){


image =
await uploadImage(file);


}




const updateData = {


name:

document.getElementById(
"name"
).value,


name_en:

document.getElementById(
"name_en"
).value,



description:

document.getElementById(
"description"
).value,



price:

Number(
document.getElementById(
"price"
).value
),



cost_price:

Number(
document.getElementById(
"cost_price"
).value || 0
),



stock_status:

document.getElementById(
"status"
).value,



image:image


};






const {

error

}=await supabaseClient

.from("products")

.update(updateData)

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
"修改成功"
);



location.href =
"admin-products.html";



}







// =======================
// 返回
// =======================


function backList(){


location.href =
"admin-products.html";


}





// 暴露


window.saveProduct =
saveProduct;


window.backList =
backList;
