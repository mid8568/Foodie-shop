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
// 当前编辑商品ID
// =========================


let editId = null;




// =========================
// 图片缓存
// =========================


let mainImageUrl = "";

let detailImageUrls = [];





// =========================
// 页面初始化
// =========================


window.onload=function(){



// 判断是否编辑


const params =
new URLSearchParams(
window.location.search
);



editId =
params.get("id");





if(editId){


loadProduct(editId);


}



};







// =========================
// 加载商品
// =========================


async function loadProduct(id){



const {

data,

error

}=await client


.from("products")


.select("*")


.eq(
"id",
id
)


.single();






if(error){

console.log(error);

alert(
"读取商品失败"
);

return;

}







// 基本信息


document.getElementById(
"name"
).value =
data.name || "";



document.getElementById(
"name_en"
).value =
data.name_en || "";



document.getElementById(
"category"
).value =
data.category || "";






document.getElementById(
"description"
).value =
data.description || "";



document.getElementById(
"description_en"
).value =
data.description_en || "";






document.getElementById(
"price"
).value =
data.price || "";



document.getElementById(
"currency"
).value =
data.currency || "USD";



document.getElementById(
"cost_price"
).value =
data.cost_price || "";







document.getElementById(
"supplier"
).value =
data.supplier || "";



document.getElementById(
"supplier_url"
).value =
data.supplier_url || "";



document.getElementById(
"supplier_contact"
).value =
data.supplier_contact || "";







document.getElementById(
"ebay_item_id"
).value =
data.ebay_item_id || "";



document.getElementById(
"ebay_url"
).value =
data.ebay_url || "";



document.getElementById(
"ebay_title"
).value =
data.ebay_title || "";



document.getElementById(
"ebay_category"
).value =
data.ebay_category || "";







document.getElementById(
"seo_title"
).value =
data.seo_title || "";



document.getElementById(
"seo_description"
).value =
data.seo_description || "";






document.getElementById(
"stock_status"
).value =
data.stock_status || "上架";








// 图片


mainImageUrl =
data.image || "";



detailImageUrls=[];



if(data.image2)
detailImageUrls.push(data.image2);



if(data.image3)
detailImageUrls.push(data.image3);



if(data.image4)
detailImageUrls.push(data.image4);





showMainImage();


showDetailImages();



}






// =========================
// 显示主图
// =========================


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
// 显示详情图
// =========================


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
"上传失败："+error.message
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








// =========================
// 详情图上传
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









// =========================
// 计算价格
// =========================


function calcPrice(){



const cost =

Number(

document.getElementById(
"cost_price"
).value

);



if(!cost)
return;




const price =
Math.round(
cost*3
);



document.getElementById(
"price"
).value =
price;




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
"正在保存...";







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









let result;





// =========================
// 判断新增还是修改
// =========================



if(editId){



result = await client


.from("products")


.update(product)


.eq(
"id",
editId
)





}else{



result = await client


.from("products")


.insert(product);



}







if(result.error){



console.log(
result.error
);



message.innerHTML =

"保存失败："

+

result.error.message;



return;



}








message.innerHTML = `


<h3>
保存成功！
</h3>


<p>

商品已经更新

</p>


`;






setTimeout(()=>{


location.href =
"admin-products.html";



},1500);



}
