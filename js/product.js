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
// 加载商品详情
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


console.log(
error
);


box.innerHTML =
"Product loading failed";


return;


}





// =========================
// 主图
// =========================


const images=[


data.image,

data.image2,

data.image3,

data.image4


].filter(Boolean);







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







// =========================
// 详情图片
// =========================


let detailHtml="";



if(

data.detail_images

&&

Array.isArray(data.detail_images)

){


data.detail_images.forEach(img=>{


detailHtml += `


<img

src="${img}"

class="detail-img"

>


`;


});


}







// =========================
// 商品描述
// =========================


let description =

data.description ||

data.description_en ||

"Authentic Chinese Product";



description =

description.replace(
/\n/g,
"<br>"
);







// =========================
// 页面HTML
// =========================


box.innerHTML = `



<div class="product-detail-box">





<!-- 商品图片 -->


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









<!-- 商品信息 -->


<div class="info">



<h1>

${data.name_en || data.name || ""}

</h1>





<p class="category">

${data.category || "Chinese Products"}

</p>







<h2 class="price">


$${data.sale_price || data.price || 0}


</h2>








<p class="cost">


</p>







<a


href="https://m.me/你的Facebook主页用户名"


target="_blank"


class="buy-btn">


💬 Contact Us


</a>





</div>






</div>









<!-- 商品描述 -->


<section class="description-box">


<h2>

Product Description

</h2>


<div class="description-text">


${description}


</div>



</section>









<!-- 规格参数 -->


<section class="spec-box">


<h2>

Product Information

</h2>



<table>


<tr>

<td>
Supplier
</td>


<td>
${data.supplier || "China Supplier"}

</td>


</tr>





<tr>

<td>
Source
</td>


<td>
1688 China

</td>


</tr>





<tr>

<td>
Shipping

</td>


<td>
Worldwide Shipping

</td>


</tr>


</table>


</section>









<!-- 1688详情图片 -->


<section class="detail-box">


<h2>

Product Details

</h2>



${detailHtml || 

"<p>No detail images</p>"

}



</section>




`;







// =========================
// SEO
// =========================


document.title =

data.seo_title ||

data.name_en ||

data.name;



}





// =========================
// 图片切换
// =========================


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
