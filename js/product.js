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

"<h2>Product not found</h2>";

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

"<h2>Product not found</h2>";



return;


}






// =========================
// 修改网页标题
// =========================


document.title =

(data.name_en || data.name)

+
" | China Direct Shop";








// =========================
// Facebook分享信息
// =========================


setMeta(

"og:title",

data.name_en || data.name

);



setMeta(

"og:description",

data.description_en || ""

);



setMeta(

"og:image",

data.image

);



setMeta(

"og:url",

window.location.href

);






// =========================
// 显示商品
// =========================


box.innerHTML = `


<div class="detail-card">





<img

src="${data.image || ''}"

class="detail-image"

>






<h1>

${data.name_en || data.name}

</h1>






<p class="category">

${data.category || "Chinese Products"}

</p>






<p class="desc">

${data.description_en || ""}

</p>







<h2 class="price">

$${data.price || 0}

</h2>








<a

href="${data.ebay_url || '#'}"

target="_blank">


<button class="buy-btn">

Buy on eBay

</button>


</a>







<button

class="share-btn"

onclick="shareFacebook()">

Share on Facebook

</button>







<br><br>





<a href="index.html">


<button>

Back Home

</button>


</a>





</div>


`;



}









// =========================
// 设置Meta信息
// =========================


function setMeta(property,value){



let meta =

document.querySelector(

`meta[property="${property}"]`

);





if(!meta){



meta = document.createElement(
"meta"
);


meta.setAttribute(
"property",
property
);


document.head.appendChild(
meta
);



}





meta.setAttribute(
"content",
value || ""
);



}









// =========================
// Facebook分享
// =========================


function shareFacebook(){



const url =

encodeURIComponent(
window.location.href
);





window.open(

"https://www.facebook.com/sharer/sharer.php?u="
+
url,


"_blank"


);



}









// =========================
// 初始化
// =========================


loadProduct();
