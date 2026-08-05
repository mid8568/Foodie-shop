console.log("前台 app.js 启动");


const SUPABASE_URL = "https://ukxxmxnubxjezkwbbxdr.supabase.co";
const SUPABASE_KEY = "sb_publishable_2IFHfms3ombozpvZCvaeEg_2VZ2z5hJ";


const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);



document.addEventListener(
    "DOMContentLoaded",
    ()=>{
        initHomePage();
    }
);



/**
 * 首页初始化
 */
async function initHomePage(){

    const container =
    document.getElementById(
        "home-container"
    );


    if(!container) return;


    try{


        const [
            decorations,
            productsMap
        ] =
        await Promise.all([

            fetchDecorations(),

            fetchAllProductsMap()

        ]);



        if(!decorations.length){

            container.innerHTML =
            '<div class="loading">暂无首页装修内容</div>';

            return;

        }



        container.innerHTML="";



        decorations.forEach(
            item=>{


                const section =
                createSectionNode(
                    item,
                    productsMap
                );


                if(section){

                    container.appendChild(section);

                }


            }
        );



    }catch(err){

        console.error(
            "加载首页失败:",
            err
        );


        container.innerHTML =
        '<div class="loading">页面加载失败</div>';

    }

}





/**
 * 获取装修模块
 */
async function fetchDecorations(){


    const {
        data,
        error
    }
    =
    await supabaseClient
    .from("decorations")
    .select("*")
    .eq("status",true)
    .order(
        "sort_order",
        {
            ascending:true
        }
    );



    if(error){

        console.error(
            error
        );

        return [];

    }


    return data || [];

}





/**
 * 获取商品
 */
async function fetchAllProductsMap(){


    const {
        data,
        error
    }
    =
    await supabaseClient
    .from("products")
    .select(
        `
        id,
        name,
        image,
        price,
        sale_price,
        currency
        `
    );



    if(error){

        console.error(
            "商品读取失败",
            error
        );

        return new Map();

    }



    const map =
    new Map();



    (data || []).forEach(
        product=>{

            map.set(
                product.id,
                product
            );

        }
    );


    return map;

}






/**
 * 创建装修模块
 */
function createSectionNode(
    item,
    productsMap
){


    let content =
    item.content || {};



    if(typeof content==="string"){

        try{

            content =
            JSON.parse(content);

        }catch(e){

            content={};

        }

    }




    const section =
    document.createElement(
        "section"
    );


    section.className =
    `decoration-section ${item.type}-section`;





    /**
     * Banner
     */
    if(item.type==="banner"){


        if(!content.image)
        return null;



        const img =
        document.createElement(
            "img"
        );


        img.src =
        content.image;


        img.alt =
        item.title || "Banner";




        if(content.url){


            const link =
            document.createElement(
                "a"
            );


            link.href =
            content.url;


            link.appendChild(
                img
            );


            section.appendChild(
                link
            );


        }else{


            section.appendChild(
                img
            );


        }


        return section;

    }






    /**
     * 公告
     */
    if(item.type==="notice"){


        if(!content.text)
        return null;



        section.innerText =
        content.text;



        return section;

    }







    /**
     * 商品推荐
     */
    if(item.type==="products"){



        const productIds =
        content.product_ids || [];



        if(!productIds.length)
        return null;




        if(item.title){


            const title =
            document.createElement(
                "h3"
            );


            title.className =
            "section-title";


            title.innerText =
            item.title;


            section.appendChild(
                title
            );


        }






        const grid =
        document.createElement(
            "div"
        );


        grid.className =
        "products-grid";



        let hasProduct=false;





        productIds.forEach(
            id=>{


                const product =
                productsMap.get(
                    id
                );



                if(product){


                    hasProduct=true;



                    const card =
                    document.createElement(
                        "div"
                    );



                    card.className =
                    "product-card";



                    // 商品点击进入详情页
                    card.onclick =
                    ()=>{


                        window.location.href =
                        "product.html?id="
                        +
                        product.id;


                    };





                    card.innerHTML =
                    `

                    <img 
                    src="${product.image || ''}"
                    alt="${product.name}"
                    >


                    <div class="title">
                    ${product.name}
                    </div>


                    <div class="price">
                    ${product.currency || "$"}
                    ${product.sale_price || product.price || 0}
                    </div>


                    `;



                    grid.appendChild(
                        card
                    );


                }


            }
        );





        if(!hasProduct)
        return null;




        section.appendChild(
            grid
        );



        return section;


    }





    return null;

}
