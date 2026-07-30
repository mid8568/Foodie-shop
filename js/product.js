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
// 商品ID
// =========================

const params =
new URLSearchParams(
window.location.search
);


const productId =
params.get("id");




// =========================
// 加载商品
// =========================


async function loadProduct(){


const box =
document.getElementById(
"product-detail"
);



if(!productId){

box.innerHTML=
"Product not found";

return;

}




const {

data,

error

}=await client

.from("products")

.select("*")

.eq(
"id",
productId
)

.single();





if(error || !data){


console.log(error);


box.innerHTML=
"Product loading failed";


return;

}





console.log(
"商品数据:",
data
);




// =========================
// 主图
// =========================


let images=[


data.image,

data.image2,

data.image3,

data.image4


]
.filter(
x=>x && x.trim()
);





// 没有图片

if(images.length===0){


images=[
"https://via.placeholder.com/600"
];


}







// =========================
// 详情图片
// =========================


let detailImages=[];



if(
Array.isArray(data.detail_images)
){


detailImages =
data.detail_images;


}




// 去除重复

detailImages =
[...new Set(detailImages)]

.filter(img=>{


if(!img)
return false;


let x =
img.toLowerCase();



return !(

x.includes("icon")

||

x.includes("logo")

||

x.includes("160x160")

||

x.includes("80x80")

||

x.includes("50x50")

);


});







console.log(
"详情:",
detailImages
);







// =========================
// 规格
// =========================


let specifications =
data.specifications || {};





let specsHtml="";



Object.entries(
specifications
)
.forEach(([k,v])=>{


specsHtml += `

<tr>

<td>${k}</td>

<td>${v}</td>

</tr>

`;


});








// =========================
// 缩略图
// =========================


let thumbs="";



images.forEach(img=>{


thumbs +=`

<img

src="${img}"

class="thumb"

onclick="changeImage('${img}')"

>

`;


});








// =========================
// 详情HTML
// =========================


let detailHtml="";



detailImages.forEach(img=>{


detailHtml +=`

<img

src="${img}"

class="detail-img"

loading="lazy"

>

`;


});









// =========================
// 页面
// =========================


box.innerHTML=`


<div class="product-box">



<div class="gallery">


<img

id="main-image"

src="${images[0]}"

class="main-image"


>



<div class="thumb-list">

${thumbs}

</div>



</div>






<div class="info">


<h1>

${data.name || ""}

</h1>



<p>

${data.category || "Chinese Products"}

</p>



<h2 class="price">

$${data.sale_price || 0}

</h2>



<h2>
Description
</h2>


<p>

${data.description || ""}

</p>




<h2>
Specifications
</h2>


<table class="spec-table">

${specsHtml}

</table>



<a

href="${data.ebay_url || '#'}"

class="buy-btn"

>

Buy Now

</a>



</div>


</div>





<h2>

Product Details

</h2>



<div class="detail-images">

${detailHtml}

</div>


`;





document.title =
data.name;



}







function changeImage(url){


const img =
document.getElementById(
"main-image"
);


if(img){

img.src=url;

}


}





loadProduct();
