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





let productId=null;

let product=null;







// =======================
// 页面启动
// =======================


window.onload=function(){



let params =
new URLSearchParams(
window.location.search
);



productId =
params.get("id");



if(!productId){

alert(
"商品ID不存在"
);

return;

}



loadProduct();



};












// =======================
// 加载商品
// =======================


async function loadProduct(){



let {

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





product=data;





name.value =
data.name || "";



name_en.value =
data.name_en || "";



description.value =
data.description || "";



description_en.value =
data.description_en || "";



cost_price.value =
data.cost_price || "";



sale_price.value =
data.sale_price || "";



stock_status.value =
data.stock_status || "上架";





renderImages();



}











// =======================
// 图片显示
// =======================


function renderImages(){



let main =
document.getElementById(
"mainImage"
);



main.innerHTML=


`

<img src="${product.image}"

width="200">

`;







let box =
document.getElementById(
"detailImages"
);



box.innerHTML="";





[
product.image2,
product.image3,
product.image4

]


.forEach(img=>{



if(img){


box.innerHTML +=


`

<div>


<img src="${img}"

width="120">



<br>


<button onclick="deleteDetailImage('${img}')">

删除

</button>


</div>


`;


}



});



}









// =======================
// 保存商品
// =======================


async function saveProduct(){



let update={



name:

name.value,



name_en:

name_en.value,



description:

description.value,



description_en:

description_en.value,



cost_price:

Number(cost_price.value),



sale_price:

Number(sale_price.value),



stock_status:

stock_status.value



};






let {

error

}=await supabaseClient


.from("products")


.update(update)


.eq(
"id",
productId
);





if(error){


alert(
error.message
);


return;


}



alert(
"修改成功"
);



}











// =======================
// 自动计算销售价
// =======================


if(
document.getElementById(
"cost_price"
)
){


cost_price.oninput=function(){



let cost =
Number(
cost_price.value
);



if(cost){



sale_price.value =


(
cost * 1.5
)

.toFixed(2);



}



};


}











// =======================
// 上传主图
// =======================


async function uploadMainImage(){



let file =
mainUpload.files[0];



if(!file)

return;





let path =

"products/"

+

Date.now()

+

file.name;






let {

error

}=await supabaseClient.storage


.from(
"product-images"
)


.upload(
path,
file
);






if(error){


alert(
error.message
);


return;


}







let {

data

}=supabaseClient.storage


.from(
"product-images"
)


.getPublicUrl(
path
);







await supabaseClient


.from("products")


.update({

image:

data.publicUrl

})


.eq(
"id",
productId
);






alert(
"主图替换成功"
);



loadProduct();



}











// =======================
// 上传详情图片
// =======================


async function uploadDetailImages(){



let files =
detailUpload.files;



let update={};



let index=2;





if(product.image2)

index=3;



if(product.image3)

index=4;







for(let file of files){



if(index>4)

break;





let path =


"detail/"

+

Date.now()

+

file.name;







await supabaseClient.storage


.from(
"product-images"
)


.upload(
path,
file
);







let {

data

}=supabaseClient.storage


.from(
"product-images"
)


.getPublicUrl(
path
);







update[
"image"+index
]
=

data.publicUrl;



index++;




}







await supabaseClient


.from("products")


.update(update)


.eq(
"id",
productId
);






alert(
"详情图片添加成功"
);



loadProduct();



}











// =======================
// 删除详情图片
// =======================


async function deleteDetailImage(url){



let update={};





if(product.image2===url)

update.image2=null;




if(product.image3===url)

update.image3=null;




if(product.image4===url)

update.image4=null;








await supabaseClient


.from("products")


.update(update)


.eq(
"id",
productId
);






loadProduct();



}











// =======================
// 返回列表
// =======================


function backProducts(){


window.location.href=

"admin-products.html";


}
