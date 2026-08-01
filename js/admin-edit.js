console.log("admin-edit.js启动");



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

let currentProduct=null;







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




currentProduct=data;





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





if(
document.getElementById(
"description_en"
)

)

{

document.getElementById(
"description_en"
).value =
data.description_en || "";

}






document.getElementById(
"cost_price"
).value =
data.cost_price || "";





document.getElementById(
"sale_price"
).value =
data.sale_price || "";






document.getElementById(
"stock_status"
).value =
data.stock_status || "上架";





renderImages();



}











// =======================
// 显示图片
// =======================



function renderImages(){



let main =
document.getElementById(
"mainImage"
);



if(main){


main.innerHTML=

`

<img src="${currentProduct.image || ''}"

width="200">

`;



}







let box =
document.getElementById(
"detailImages"
);



if(!box)

return;



box.innerHTML="";






[

currentProduct.image2,

currentProduct.image3,

currentProduct.image4


]

.forEach(img=>{


if(img){



box.innerHTML +=


`

<div>


<img src="${img}" width="120">


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



description_en:

document.getElementById(
"description_en"
)

?

document.getElementById(
"description_en"
).value

:

"",




cost_price:

Number(
document.getElementById(
"cost_price"
).value
),




sale_price:

Number(
document.getElementById(
"sale_price"
).value
),




stock_status:

document.getElementById(
"stock_status"
).value



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
// 上传主图
// =======================



async function uploadMainImage(){



let file =
document.getElementById(
"mainUpload"
).files[0];




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
document.getElementById(
"detailUpload"
).files;



let update={};





let index=2;





if(currentProduct.image2)

index=3;


if(currentProduct.image3)

index=4;






for(
let file of files
){



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





if(currentProduct.image2===url)

update.image2=null;




if(currentProduct.image3===url)

update.image3=null;




if(currentProduct.image4===url)

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
