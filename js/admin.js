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
"图片上传失败："+error.message
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



const message =

document.getElementById(
"message"
);




message.innerHTML =
"正在保存商品...";






// 上传主图片


const imageUrl =

await uploadImage();





if(!imageUrl){

return;

}







// 商品数据


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









// =========================
// 保存商品
// =========================


const {

data,

error

}=await client


.from("products")


.insert(product)


.select();






if(error){


console.log(error);



message.innerHTML =

"保存失败："+error.message;


return;


}








// 获取新增商品ID


const productId =

data[0].id;






// 自动生成详情页地址


const detailUrl =

window.location.origin

+

"/product.html?id="

+

productId;







message.innerHTML = `


<h3>

商品添加成功！

</h3>


<p>

商品详情页：

</p>



<input

value="${detailUrl}"

readonly

style="width:100%;padding:8px;">





<p>

Facebook分享链接：

</p>



<input

value="${detailUrl}"

readonly

style="width:100%;padding:8px;">





<p>

复制链接即可发布到Facebook

</p>


`;







// 清空表单


const form =

document.querySelector(
".admin-box"
);



if(form && form.reset){


form.reset();


}



}
