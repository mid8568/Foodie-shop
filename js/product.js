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

let selectedAttr1="";

let selectedAttr2="";

let option1Name="";

let option2Name="";


// =======================
// 加载商品
// =======================


async function loadProduct(){


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

return;

}



console.log(
"商品:",
data
);



productSkus =
data.product_skus || [];




// 图片


let images=[

data.image,

data.image2,

data.image3,

data.image4

].filter(Boolean);





let html=`


<div class="product-main">


<div class="product-images">


<img

id="main-image"

src="${images[0]||''}"

>


<div class="thumb-list">


${
images.map(img=>`

<img

src="${img}"

onclick="changeImage('${img}')"

>

`).join("")
}


</div>


</div>




<div class="product-info">


<h1>

${data.name}

</h1>



<div

class="price"

id="price">

$${productSkus.length
?
productSkus[0].sale_price
:
data.sale_price}

</div>




<div id="sales">

销量:

${data.sales_count || 0}

</div>


<div id="stock">

库存:

${data.stock_quantity || 0}

</div>




<div id="sku-options">

</div>




<button onclick="buyNow()">

Buy Now

</button>



</div>


</div>



<div class="product-detail">


<h2>

Product Details

</h2>


${
(data.detail_images||[])
.map(i=>`

<img class="detail-img" src="${i}">

`).join("")
}


</div>



`;





document.getElementById(
"product-container"
)

.innerHTML=html;




renderSku();


}








// =======================
// SKU显示
// =======================


function renderSku(){



let box =
document.getElementById(
"sku-options"
);



let attr1=new Set();

let attr2=new Set();



productSkus.forEach(sku=>{


let a =
sku.attributes || {};


let keys =
Object.keys(a);


if(keys[0]){

option1Name=keys[0];

attr1.add(a[keys[0]]);

}


if(keys[1]){

option2Name=keys[1];

attr2.add(a[keys[1]]);

}


});






box.innerHTML=`



<div>


<h3>
${option1Name}
</h3>



${
[...attr1].map(x=>`

<button

class="attr1"

onclick="selectAttr1('${x}')"

>

${x}

</button>


`).join("")
}



</div>





<div>


<h3>
${option2Name}
</h3>



${
[...attr2].map(x=>`

<button

class="attr2"

onclick="selectAttr2('${x}')"

>

${x}

</button>


`).join("")
}



</div>


`;



}








// =======================
// 选择参数1
// =======================


function selectAttr1(v){


selectedAttr1=v;


updateSku();


}







// =======================
// 选择参数2
// =======================


function selectAttr2(v){


selectedAttr2=v;


updateSku();


}








// =======================
// 匹配SKU
// =======================


function updateSku(){



let sku =

productSkus.find(s=>{


let a =
s.attributes || {};



return (

a[option1Name]==selectedAttr1

&&

a[option2Name]==selectedAttr2

);


});




if(!sku)

return;



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

"库存: "

+sku.stock_quantity;



}








function changeImage(src){


document.getElementById(
"main-image"
)

.src=src;


}







function buyNow(){



if(!selectedSku){


alert(
"请选择规格"
);


return;


}



console.log(
selectedSku
);



alert(

"购买: "

+

selectedSku.sku_name

);



}


window.selectAttr1 =
selectAttr1;


window.selectAttr2 =
selectAttr2;


window.changeImage =
changeImage;


window.buyNow =
buyNow;



loadProduct();
