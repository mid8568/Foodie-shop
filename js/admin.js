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
// 图片缓存
// =========================


let mainImageUrl = "";

let detailImageUrls = [];




// =========================
// 上传图片
// =========================


async function uploadFile(file){


if(!file){

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
"图片上传失败："
+
error.message
);


return null;


}




return (

SUPABASE_URL

+

"/storage/v1/object/public/product-images/"

+

fileName

);



}




// =========================
// 主图上传
// =========================


document
.getElementById("imageFile")
.addEventListener(
"change",
async function(){



const file =
this.files[0];



const url =
await uploadFile(file);



if(url){


mainImageUrl=url;


showMainImage();


}


});






function showMainImage(){



const box =

document.getElementById(
"mainEditImage"
);



if(!box)
return;



box.innerHTML="";



if(!mainImageUrl)
return;



box.innerHTML=`

<div class="image-item">


<img src="${mainImageUrl}">


<button

class="delete-img"

onclick="deleteMainImage()">

×

</button>


</div>

`;



}






function deleteMainImage(){


mainImageUrl="";


showMainImage();


}







// =========================
// 详情图片上传
// =========================


document

.getElementById("detailFiles")

.addEventListener(

"change",

async function(){



for(
let file of this.files
){


const url =
await uploadFile(file);



if(url){


detailImageUrls.push(url);


}


}



showDetailImages();



});







function showDetailImages(){



const box =

document.getElementById(
"detailEditImages"
);



if(!box)
return;



box.innerHTML="";



detailImageUrls.forEach(

(img,index)=>{


box.innerHTML += `


<div class="image-item">


<img src="${img}">


<button

class="delete-img"

onclick="deleteDetailImage(${index})">

×

</button>


</div>


`;



});


}







function deleteDetailImage(index){



detailImageUrls.splice(

index,

1

);



showDetailImages();



}







// =========================
// 自动计算售价
// =========================


function calcPrice(){



const cost =

Number(

document.getElementById(
"costPrice"
).value

);



if(!cost)
return;



document.getElementById(
"sellPrice"
).value =

Math.round(
cost * 3
);



}







// =========================
// 保存商品
// =========================


async function addProduct(){



const message =

document.getElementById(
"message"
);



message.innerHTML =
"正在保存商品...";





if(!mainImageUrl){


alert(
"请上传主图片"
);


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

mainImageUrl,



image2:

detailImageUrls[0] || "",



image3:

detailImageUrls[1] || "",



image4:

detailImageUrls[2] || "",





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

"保存失败："

+

error.message;



return;



}







const productId =

data[0].id;






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







// 清空

mainImageUrl="";

detailImageUrls=[];



showMainImage();

showDetailImages();






const form =

document.querySelector(
".admin-box"
);



if(form && form.reset){

form.reset();

}



}
