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


detailImages +=`

<img

src="${img}"

class="detail-img">

`;


});


}







// 默认价格


let defaultPrice=

data.sale_price ||

data.price ||

0;




if(productSkus.length){


defaultPrice=

productSkus[0].sale_price;


selectedSku=

productSkus[0];


}









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






<div class="sales">

🔥 Sold:

${data.sales_count||0}

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


数量：



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





<div class="description">


${data.description_en||""}


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



let box=

document.getElementById(
"sku-options"
);



if(!box)return;



box.innerHTML="";



productSkus.forEach(
(sku,index)=>{


let btn=document.createElement(
"button"
);



btn.className="sku-btn";



btn.innerHTML=

sku.sku_name;



btn.onclick=()=>{


selectSku(index);



};



box.appendChild(btn);



});





}









// =================
// SKU切换
// =================


function selectSku(index){



selectedSku=

productSkus[index];




document.getElementById(
"price"
).innerHTML=


"$"+selectedSku.sale_price;





document.getElementById(
"stock"
).innerHTML=


"Stock: "

+

selectedSku.stock_quantity;





let buttons=

document.querySelectorAll(
".sku-btn"
);



buttons.forEach(
btn=>

btn.classList.remove(
"active"
)

);



if(buttons[index]){


buttons[index]

.classList.add(
"active"
);


}



}








function changeImage(src){


document.getElementById(
"main-image"
).src=src;


}








function changeQty(num){



let input=

document.getElementById(
"qty"
);



let value=

Number(input.value)+num;



if(value<1)

value=1;



input.value=value;


}








function buyNow(){


console.log(
"购买SKU:",
selectedSku
);



alert(

selectedSku

?

"购买："+selectedSku.sku_name

:

"请选择规格"

);


}






loadProduct();
