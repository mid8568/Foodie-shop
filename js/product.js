const SUPABASE_URL =
"https://ukxxmxnubxjezkwbbxdr.supabase.co";


const SUPABASE_KEY =
"sb_publishable_2IFHfms3ombozpvZCvaeEg_2VZ2z5hJ";


const client =
supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);





async function loadProduct(){



const id =

new URLSearchParams(location.search)

.get("id");





const {

data,

error

}=await client


.from("products")

.select("*")

.eq("id",id)

.single();





if(error){


document.getElementById(
"product-detail"
).innerHTML=

"Product not found";


return;


}





// 修改网页标题

document.title =

data.name_en || data.name;





// 修改Facebook分享图片

let ogImage =

document.querySelector(
'meta[property="og:image"]'
);


ogImage.content =

data.image;





document.querySelector(
'meta[property="og:title"]'
)

.content =

data.name_en || data.name;






document.querySelector(
'meta[property="og:description"]'
)

.content =

data.description_en || "";







document.getElementById(
"product-detail"
)

.innerHTML=`

<div class="detail-card">


<img

src="${data.image}"

class="detail-image"

>




<h1>

${data.name_en || data.name}

</h1>





<p>

${data.description_en || ""}

</p>





<h2>

$${data.price}

</h2>






<a

href="${data.ebay_url}"

target="_blank">


<button class="buy-btn">

Buy on eBay

</button>


</a>







<button

onclick="shareFacebook()"

>

Share Facebook

</button>







<a href="index.html">

<button>

Back Home

</button>

</a>




</div>

`;



}






// Facebook分享

function shareFacebook(){



let url =

encodeURIComponent(
window.location.href
);



window.open(

"https://www.facebook.com/sharer/sharer.php?u="+url,

"_blank"

);


}







loadProduct();
