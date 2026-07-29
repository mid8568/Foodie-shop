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
// 获取商品ID
// =========================

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



if(!productId){

box.innerHTML="Product not found";

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


box.innerHTML =
"Product loading failed";


return;


}





// =========================
// 主图
// =========================


let images=[

data.image,

data.image2,

data.image3,

data.image4

]

.filter(Boolean);

console.log("商品图片:",images);
console.log("详情图片:",detailImages);




// =========================
// 详情图片 JSON转数组
// =========================


let detailImages = [];


if(data.detail_images){


    if(Array.isArray(data.detail_images)){

        detailImages = data.detail_images;

    }
    else{


        try{

            detailImages = JSON.parse(data.detail_images);

        }
        catch(e){

            detailImages=[];

        }


    }


}








// =========================
// 规格 JSON转对象
// =========================


let specifications={};



try{


let specifications={};


if(data.specifications){


    if(typeof data.specifications==="object"){

        specifications=data.specifications;

    }
    else{


        try{

            specifications=
            JSON.parse(data.specifications);

        }
        catch(e){

            specifications={};

        }


    }


}


}
catch(e){


specifications={};


}







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
// 规格表
// =========================


let specsHtml="";



Object.entries(specifications)
.forEach(([key,value])=>{


specsHtml +=`

<tr>

<td>${key}</td>

<td>${value}</td>

</tr>

`;

});









// =========================
// 详情长图
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









box.innerHTML=`


<div class="product-box">



<div class="gallery">


<img

id="main-image"

src="${images[0] || ''}"

class="main-image"


>



<div class="thumb-list">

${thumbs}

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

$${data.sale_price || 0}

</h2>






<h2>

Description

</h2>


<p>

${data.description || "Authentic Chinese Product"}

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





document.title=data.name;



}









function changeImage(url){


document.getElementById(
"main-image"
)
.src=url;


}





loadProduct();
