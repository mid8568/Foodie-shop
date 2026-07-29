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




// 获取ID

const params =
new URLSearchParams(
window.location.search
);


const productId =
params.get("id");






async function loadProduct(){


const box =
document.getElementById(
"product-detail"
);



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





if(error){


console.log(error);


box.innerHTML =
"Product loading failed";


return;


}




// 图片

let images=[

data.image,

data.image2,

data.image3,

data.image4

]


.filter(Boolean);

const detailImages =
data.detail_images || [];





let gallery="";


images.forEach(img=>{


gallery +=`


<img

src="${img}"

class="thumb"

onclick="changeImage('${img}')"

>


`;

});







// 规格参数


let specs="";



if(data.specifications){



specs+="<table class='spec-table'>";



Object.entries(
data.specifications
)
.forEach(([k,v])=>{


specs+=`

<tr>

<td>${k}</td>

<td>${v}</td>

</tr>

`;


});



specs+="</table>";



}





// 详情图片


let detail="";


if(data.detail_images){


data.detail_images.forEach(img=>{


detail+=`

<img

src="${img}"

class="detail-image"

>


`;


});


}







box.innerHTML=`

<div class="product-box">



<div class="gallery">


<img

id="main-image"

src="${images[0]}"

class="main-image"


>


<div class="thumb-list">

${gallery}

</div>


</div>





<div class="info">


<h1>

${data.name}

</h1>



<p class="category">

${data.category || "Chinese Products"}

</p>




<h2 class="price">

$${data.sale_price}

</h2>





<h2>
Product Description
</h2>


<p>

${data.description || "Authentic Chinese Product"}

</p>




<h2>

Product Details

</h2>

<div class="detail-images">


${
detailImages.map(img=>`

<img

src="${img}"

class="detail-img"

>

`).join("")

}


</div>

${specs}




<a

href="${data.ebay_url || '#'}"

class="buy-btn">

Buy Now

</a>



</div>



</div>



<h2>

1688 Product Details

</h2>


<div class="detail-images">

${detail}

</div>


`;




document.title=data.name;



}





function changeImage(url){


document.getElementById(
"main-image"
)
.src=url;


}



loadProduct();
