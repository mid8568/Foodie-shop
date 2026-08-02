console.log(
"admin.js启动"
);




// 页面打开读取参数


document.addEventListener(
"DOMContentLoaded",
()=>{


let params =
new URLSearchParams(
window.location.search
);



let page =
params.get("page");



if(!page){

page="products";

}



loadPage(page);



});






function loadPage(page,id){



let frame =
document.getElementById(
"module-frame"
);



let url="";



switch(page){



case "products":

url=
"admin-products.html";

break;



case "images":

url=
"admin-images.html";

break;



case "edit":

url=
"admin-edit.html?id="+id;

break;



case "decoration":

url=
"admin-decoration.html";

break;



case "ebay":

url=
"admin-ebay.html";

break;



default:

url=
"admin-products.html";


}



frame.src=url;



}








function openPage(page,id=""){



let url=
"admin.html?page="+page;



if(id){

url+="&id="+id;

}



history.pushState(
null,
"",
url
);



loadPage(
page,
id
);



}







window.openPage =
openPage;
