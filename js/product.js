console.log("product.js启动");


// Supabase 初始化

const SUPABASE_URL =
"https://ukxxmxnubxjezkwbbxdr.supabase.co";


const SUPABASE_KEY =
"sb_publishable_2IFHfms3ombozpvZCvaeEg_2VZ2z5hJ";


const supabaseClient =
supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);


const params =
new URLSearchParams(
window.location.search
);


const productId =
params.get("id");


console.log("商品ID:",productId);



async function loadProduct(){


if(!productId){

document.getElementById(
"product-container"
).innerHTML=
"商品不存在";

return;

}



const {
data,
error
}
=
await supabaseClient
.from("products")
.select("*")
.eq("id",productId)
.single();



if(error){

console.log(error);

document.getElementById(
"product-container"
).innerHTML=
"商品加载失败";

return;

}



console.log(data);



let images=[];


if(data.image)
images.push(data.image);


if(data.image2)
images.push(data.image2);


if(data.image3)
images.push(data.image3);


if(data.image4)
images.push(data.image4);



if(data.detail_images){


try{


let detail=
typeof data.detail_images==="string"
?
JSON.parse(data.detail_images)
:
data.detail_images;


images=[
...images,
...detail
];


}catch(e){}



}



let html=`


<div class="product-main">


<div class="product-images">


<img id="main-image"
src="${images[0]||''}">


<div class="thumb-list">

${images.map(
img=>`

<img src="${img}"
onclick="changeImage('${img}')">

`
).join("")}


</div>


</div>



<div class="product-info">


<h1>

${data.name||""}

</h1>


<h2>

${data.name_en||""}

</h2>


<div class="price">

$${data.sale_price||data.price||0}

</div>



<div class="description">

${data.description||""}

</div>



<div class="description">

${data.description_en||""}

</div>



<div class="spec-box">


<h3>

Specifications

</h3>


${data.specifications||""}


</div>



<button class="buy-btn">

Buy Now

</button>



</div>


</div>


`;



document.getElementById(
"product-container"
)
.innerHTML=html;


}



function changeImage(src){

document.getElementById(
"main-image"
)
.src=src;

}



loadProduct();
