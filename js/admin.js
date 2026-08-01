console.log(
"admin.js启动"
);



function openModule(module){


let frame =
document.getElementById(
"module-frame"
);



switch(module){


case "products":

frame.src =
"admin-products.html";

break;



case "decoration":

frame.src =
"admin-decoration.html";

break;



case "images":

frame.src =
"admin-images.html";

break;



case "ebay":

frame.src =
"admin-ebay.html";

break;


}


}
