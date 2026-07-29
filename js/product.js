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






// =========================
// 加载详情
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





if(error || !data){


    console.log(error);


    box.innerHTML =
    "Product loading failed";


    return;


}







// 图片数组


const images=[

data.image,

data.image2,

data.image3,

data.image4

]


.filter(Boolean);






let thumbs="";



images.forEach(img=>{


thumbs += `


<img

src="${img}"

class="thumb"

onclick="changeImage('${img}')"

>


`;


});








box.innerHTML = `



<div class="product-detail-box">






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

${data.name_en || data.name}

</h1>





<p class="category">

${data.category || "Chinese Products"}

</p>






<h2 class="price">

$${data.sale_price || 0}

</h2>







<p class="description">

${data.description_en || data.description || "Authentic Chinese Product"}

</p>








<a

href="https://m.me/你的Facebook主页用户名"

target="_blank"

class="buy-btn">


💬 Contact Us


</a>






</div>





</div>




`;





// 动态修改SEO


document.title =

data.seo_title ||

data.name_en ||

data.name;



}



 



// =========================
// 图片切换
// =========================


function changeImage(url){



document

.getElementById("main-image")

.src=url;



}





loadProduct();
