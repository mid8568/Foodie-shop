console.log(
"admin-images.js启动"
);




// Supabase


const SUPABASE_URL =
"https://ukxxmxnubxjezkwbbxdr.supabase.co";


const SUPABASE_KEY =
"sb_publishable_2IFHfms3ombozpvZCvaeEg_2VZ2z5hJ";



const supabaseClient =
supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);





let products=[];


// =======================
// 分页设置
// =======================

const PAGE_SIZE = 15;

let currentPage = 1;

let totalPages = 1;

document.addEventListener(
"DOMContentLoaded",
()=>{


loadProducts();


});







// 加载商品


async function loadProducts(page=1){


currentPage = page;



let start =
(page-1)*PAGE_SIZE;


let end =
start + PAGE_SIZE - 1;



let {

data,

count,

error

}=await supabaseClient

.from("products")

.select(
"id,name,image",
{
count:"exact"
}
)

.order(
"id",
{
ascending:false
}
)

.range(
start,
end
);



if(error){

console.log(error);

return;

}



products=data;



totalPages =
Math.ceil(
count / PAGE_SIZE
);



renderProducts();


renderPagination();


}







// 商品列表


function renderProducts(){


let box =
document.getElementById(
"image-product-list"
);



box.innerHTML="";



products.forEach(
item=>{



box.innerHTML += `


<tr>


<td>

<img

src="${item.image || ''}"

class="table-image"

>


</td>



<td>

${item.name}

</td>



<td>


<button

onclick="openImages(${item.id})"

>

查看图片

</button>


</td>



</tr>


`;



});



}










// 打开图片


async function openImages(id){



let {

data,

error

}=await supabaseClient

.from("products")

.select("*")

.eq(
"id",
id
)

.single();




if(error){

console.log(error);

return;

}





document.getElementById(
"product-box"
)
.style.display="none";




document.getElementById(
"image-detail-box"
)
.style.display="block";




document.getElementById(
"current-product-name"
)
.innerText =
data.name;







let main=[];


if(data.image)
main.push(data.image);


if(data.image2)
main.push(data.image2);


if(data.image3)
main.push(data.image3);


if(data.image4)
main.push(data.image4);





renderImages(
"main-images",
main
);





renderImages(
"detail-images",
data.detail_images || []
);



}









// 显示图片


function renderImages(boxId,list){


let box =
document.getElementById(
boxId
);



box.innerHTML="";



list.forEach(
url=>{


box.innerHTML +=`


<div class="image-card">


<img src="${url}">


</div>


`;


});


}







// 返回


function backProducts(){


document.getElementById(
"product-box"
)
.style.display="block";



document.getElementById(
"image-detail-box"
)
.style.display="none";


}




window.openImages =
openImages;


window.backProducts =
backProducts;
// =======================
// 分页
// =======================


function renderPagination(){


let box =
document.getElementById(
"image-pagination"
);



if(!box){

return;

}



box.innerHTML="";



let html="";



html += `


<button

onclick="loadProducts(${currentPage-1})"

${currentPage<=1?"disabled":""}

>

上一页

</button>


`;





for(
let i=1;
i<=totalPages;
i++
){


html += `


<button

onclick="loadProducts(${i})"

class="${i===currentPage?'active':''}"

>

${i}

</button>


`;



}



html += `


<button

onclick="loadProducts(${currentPage+1})"

${currentPage>=totalPages?"disabled":""}

>

下一页

</button>


`;



box.innerHTML = html;


}



window.loadProducts =
loadProducts;
