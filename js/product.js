// =========================
// Supabase配置
// =========================

const SUPABASE_URL =
"https://ukxxmxnubxjezkwbbxdr.supabase.co";


const SUPABASE_KEY =
"sb_publishable_2IFHfms3ombozpvZCvaeEg_2VZ2z5h";


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





// =========================
// 安全JSON解析
// =========================

function parseJSON(data){


    if(!data){

        return [];

    }


    if(typeof data === "object"){

        return data;

    }


    try{

        return JSON.parse(data);

    }
    catch(e){

        console.log(
            "JSON解析失败",
            e
        );

        return [];

    }


}







// =========================
// 加载商品
// =========================


async function loadProduct(){


const box =
document.getElementById(
"product-detail"
);



if(!productId){

    box.innerHTML =
    "Product not found";

    return;

}





const {

data,

error

}= await client


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
.filter(Boolean);







// =========================
// 详情图
// =========================


let detailImages =

parseJSON(
data.detail_images
);






// =========================
// 规格
// =========================


let specifications =

parseJSON(
data.specifications
);









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
// 规格HTML
// =========================


let specHTML="";



if(
Object.keys(specifications).length
){


specHTML +=`

<table class="spec-table">

`;



Object.entries(specifications)
.forEach(([key,value])=>{


specHTML +=`

<tr>

<td>${key}</td>

<td>${value}</td>

</tr>


`;


});


specHTML +=`

</table>

`;


}











// =========================
// 详情长图
// =========================


let detailHTML="";



if(
Array.isArray(detailImages)
){


detailImages.forEach(img=>{


detailHTML +=`

<img

src="${img}"

class="detail-img"

loading="lazy"

>


`;


});


}











// =========================
// 页面
// =========================


box.innerHTML =`


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

${data.name || ""}

</h1>




<p>

Category:

${data.category || "Chinese Product"}

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


${specHTML}




<br>



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


${detailHTML}


</div>



`;





document.title =
data.name;



}








// =========================
// 图片切换
// =========================


function changeImage(url){


document

.getElementById(
"main-image"
)

.src=url;



}





loadProduct();
