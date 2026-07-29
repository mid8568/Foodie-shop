// =========================
// Supabase配置
// =========================


const SUPABASE_URL =
"https://ukxxmxnubxjezkwbbxdr.supabase.co";


const SUPABASE_KEY =
"sb_publishable_2IFHfms3ombozpvZCvaeEg_2VZ2z5hJ";



const client =
supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);




// =========================
// 上传图片
// =========================


async function uploadImage(){



const file =

document

.getElementById("imageFile")

.files[0];



if(!file){


alert("请选择商品图片");


return null;


}





const fileName =

Date.now()
+
"_"
+
file.name;






const {

error

}=await client


.storage


.from("product-images")


.upload(

fileName,

file

);






if(error){


console.log(error);


alert(
"图片上传失败"
);


return null;


}







const imageUrl =


SUPABASE_URL

+
"/storage/v1/object/public/product-images/"

+
fileName;





return imageUrl;



}









// =========================
// 添加商品
// =========================


async function addProduct(){





let message =

document.getElementById(
"message"
);





message.innerHTML =
"正在保存...";







// 上传图片

const imageUrl =

await uploadImage();





if(!imageUrl){


return;


}








const product = {





name:

document.getElementById(
"name"
).value,




name_en:

document.getElementById(
"name_en"
).value,




category:

document.getElementById(
"category"
).value,




image:

imageUrl,




image2:

document.getElementById(
"image2"
).value,




image3:

document.getElementById(
"image3"
).value,




image4:

document.getElementById(
"image4"
).value,






description:

document.getElementById(
"description"
).value,






description_en:

document.getElementById(
"description_en"
).value,







price:

Number(
document.getElementById(
"price"
).value
),






currency:

document.getElementById(
"currency"
).value,







cost_price:

Number(
document.getElementById(
"cost_price"
).value
),







supplier:

document.getElementById(
"supplier"
).value,






supplier_url:

document.getElementById(
"supplier_url"
).value,






supplier_contact:

document.getElementById(
"supplier_contact"
).value,







ebay_item_id:

document.getElementById(
"ebay_item_id"
).value,






ebay_url:

document.getElementById(
"ebay_url"
).value,






ebay_title:

document.getElementById(
"ebay_title"
).value,






ebay_category:

document.getElementById(
"ebay_category"
).value,







seo_title:

document.getElementById(
"seo_title"
).value,






seo_description:

document.getElementById(
"seo_description"
).value,







stock_status:

document.getElementById(
"stock_status"
).value



};









// 写入Supabase


const {

error

}=await client


.from("products")


.insert(product);









if(error){


console.log(error);


message.innerHTML =

"保存失败：" + error.message;


return;


}







message.innerHTML =

"商品添加成功";





// 清空表单

document.querySelector(
".admin-box"
)

.reset?.();





}
