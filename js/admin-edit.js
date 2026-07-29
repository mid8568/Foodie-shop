// =========================
// Supabase
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





// 当前商品ID


const id =

new URLSearchParams(
location.search
)

.get("id");





let oldImage="";





// =========================
// 加载商品
// =========================


async function loadProduct(){



const {

data,

error

}=await client


.from("products")


.select("*")


.eq("id",id)


.single();





if(error){

alert(error.message);

return;

}




oldImage=data.image;



document.getElementById(
"name_en"
).value=data.name_en || "";



document.getElementById(
"category"
).value=data.category || "";



document.getElementById(
"description_en"
).value=data.description_en || "";



document.getElementById(
"price"
).value=data.price || "";



document.getElementById(
"ebay_url"
).value=data.ebay_url || "";



document.getElementById(
"stock_status"
).value=data.stock_status || "上架";



document.getElementById(
"preview"
).src=data.image;



}






// =========================
// 上传新图片
// =========================


async function uploadNewImage(){



const file=

document.getElementById(
"imageFile"
)
.files[0];



if(!file){

return oldImage;

}




const fileName=

Date.now()
+
"_"
+
file.name;






const {

error

}=await client.storage


.from(
"product-images"
)


.upload(
fileName,
file
);





if(error){

alert(error.message);

return oldImage;

}





return SUPABASE_URL

+
"/storage/v1/object/public/product-images/"

+
fileName;


}









// =========================
// 保存修改
// =========================


async function updateProduct(){



const message=

document.getElementById(
"message"
);



message.innerHTML=
"保存中...";





const image=

await uploadNewImage();






const {

error

}=await client


.from("products")


.update({


name_en:

document.getElementById(
"name_en"
).value,


category:

document.getElementById(
"category"
).value,


image:image,


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


ebay_url:

document.getElementById(
"ebay_url"
).value,


stock_status:

document.getElementById(
"stock_status"
).value



})


.eq(
"id",
id
);






if(error){


message.innerHTML=
"修改失败："+error.message;


return;


}





message.innerHTML=
"修改成功";



}






loadProduct();
