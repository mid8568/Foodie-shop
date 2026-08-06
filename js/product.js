console.log("product.js启动");


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



let productSkus=[];


let selectedSku=null;


let selectedColor="";


let selectedSize="";






async function loadProduct(){


if(!productId){

document.getElementById(
"product-container"
).innerHTML="商品不存在";

return;

}




const {

data,

error

}=await supabaseClient

.from("products")

.select(`

*,

product_skus(*)

`)

.eq(
"id",
productId
)

.single();






if(error){

console.error(error);


document.getElementById(
"product-container"
).innerHTML="商品加载失败";


return;

}





console.log(
"商品数据:",
data
);





productSkus =

data.product_skus || [];








// =================
// 图片
// =================


let images=[];


[
data.image,
data.image2,
data.image3,
data.image4

]
.forEach(
img=>{


if(img){

images.push(img);

}


});








// =================
// 详情图片
// =================


let detailImages="";


if(data.detail_images){


let detail=


typeof data.detail_images==="string"

?

JSON.parse(data.detail_images)

:

data.detail_images;




detail.forEach(img=>{


detailImages+=`

<img

src="${img}"

class="detail-img">

`;


});


}







// 默认SKU


if(productSkus.length){


selectedSku=

productSkus[0];


}







let defaultPrice =


selectedSku

?

selectedSku.sale_price

:

data.sale_price || 0;







let html=`


<div class="product-main">



<div class="product-images">


<img

id="main-image"

src="${images[0]||''}">



<div class="thumb-list">


${

images.map(img=>`

<img

src="${img}"

onclick="changeImage('${img}')">

`).join("")

}


</div>


</div>





<div class="product-info">


<h1>

${data.name||""}

</h1>


<h2>

${data.name_en||""}

</h2>





<div class="price"

id="price">

$${defaultPrice}

</div>





<div class="stock"

id="stock">


Stock:

${

selectedSku

?

selectedSku.stock_quantity

:

data.stock_quantity||0

}


</div>





<div class="spec-box">


<h3>

Select Options

</h3>



<div id="sku-options">


</div>



</div>





<div class="quantity">


数量:


<button onclick="changeQty(-1)">

-

</button>


<input

id="qty"

value="1"

readonly>


<button onclick="changeQty(1)">

+

</button>



</div>





<div class="description">


${data.description||""}


</div>



<button

class="buy-btn"

onclick="buyNow()">


Buy Now


</button>



</div>


</div>





<div class="product-detail">


<h2>

Product Details

</h2>


${detailImages}


</div>


`;






document.getElementById(
"product-container"
)

.innerHTML=html;





renderSku();




}
// =================
// SKU显示
// =================


function renderSku(){


let box =

document.getElementById(
"sku-options"
);



if(!box)return;



let colors=new Set();

let sizes=new Set();





productSkus.forEach(sku=>{


let attr =

sku.attributes || {};



if(attr.颜色){

colors.add(attr.颜色);

}



if(attr.尺码){

sizes.add(attr.尺码);

}



});






box.innerHTML=`



<div class="sku-group">


<h4>

颜色

</h4>


<div>


${

[...colors].map(c=>`


<button

class="sku-btn color-btn"

onclick="selectColor('${c}')">


${c}


</button>


`).join("")


}


</div>



</div>







<div class="sku-group">


<h4>

尺码

</h4>



<div>


${

[...sizes].map(s=>`


<button

class="sku-btn size-btn"

onclick="selectSize('${s}')">


${s}


</button>


`).join("")


}


</div>


</div>



`;



}









// =================
// 选择颜色
// =================


function selectColor(color){


selectedColor=color;



document.querySelectorAll(
".color-btn"
)

.forEach(btn=>{


btn.classList.remove(
"active"
);



if(btn.innerText==color){


btn.classList.add(
"active"
);


}



});



updateSku();



}









// =================
// 选择尺码
// =================


function selectSize(size){


selectedSize=size;



document.querySelectorAll(
".size-btn"
)

.forEach(btn=>{


btn.classList.remove(
"active"
);



if(btn.innerText==size){


btn.classList.add(
"active"
);


}



});



updateSku();


}









// =================
// 匹配SKU
// =================


function updateSku(){



let sku =


productSkus.find(s=>{


let attr =

s.attributes || {};



return (

attr.颜色==selectedColor

&&

attr.尺码==selectedSize

);


});






if(!sku){


return;


}




selectedSku=sku;





document.getElementById(
"price"
)

.innerHTML=


"$"+sku.sale_price;






document.getElementById(
"stock"
)

.innerHTML=


"Stock: "

+

sku.stock_quantity;



}









// =================
// 图片切换
// =================


function changeImage(src){


document.getElementById(
"main-image"
)

.src=src;


}









// =================
// 数量
// =================


function changeQty(num){



let input=

document.getElementById(
"qty"
);



let value=

Number(input.value)+num;



if(value<1){

value=1;

}



input.value=value;


}









// =================
// 购买
// =================


function buyNow(){


console.log(
"购买SKU:",
selectedSku
);




if(!selectedSku){


alert(
"请选择颜色和尺码"
);


return;


}



alert(

"购买："+

selectedSku.sku_name

);



}







loadProduct();
