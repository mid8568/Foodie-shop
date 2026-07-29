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
// 商品数据
// =========================


let allProducts = [];




// =========================
// 加载商品
// =========================


async function loadProducts(){


    const box =
    document.getElementById(
        "product-list"
    );



    box.innerHTML =
    "Loading products...";




    const {

        data,

        error

    } = await client



    .from("products")


    .select("*")


    .eq(
        "status",
        "上架"
    )


    .order(
        "id",
        {
            ascending:false
        }
    );





    if(error){


        console.log(error);



        box.innerHTML =
        "Products loading failed";


        return;


    }





    allProducts = data || [];



    showProducts(
        allProducts
    );



}







// =========================
// 显示商品
// =========================


function showProducts(list){



    const box =
    document.getElementById(
        "product-list"
    );



    let html = "";





    if(!list || list.length===0){


        box.innerHTML =
        "<h3>No products found</h3>";

        return;


    }







    list.forEach(item=>{


        html += `


        <div class="card">



            <img

            src="${item.image || ''}"

            alt="${item.name_en || item.name || ''}"

            >





            <h3>

            ${item.name_en || item.name || ""}

            </h3>





            <p class="category">

            ${item.category || "Chinese Products"}

            </p>





            <p class="desc">

            ${item.description_en || item.description || ""}

            </p>





            <p class="price">

            $${item.sale_price || 0}

            </p>





            <a

            href="product.html?id=${item.id}">


                <button

                class="buy-btn">

                View Details

                </button>


            </a>





        </div>


        `;



    });





    box.innerHTML = html;



}








// =========================
// 分类筛选
// =========================


function filterProducts(category){



    if(category==="全部"){


        showProducts(
            allProducts
        );


        return;


    }







    const result =


    allProducts.filter(item=>


        item.category === category


    );





    showProducts(
        result
    );



}








// =========================
// 搜索商品
// =========================


function searchProducts(){



    const input =

    document

    .getElementById("search");



    if(!input) return;




    const key =


    input.value

    .trim()

    .toLowerCase();







    const result =


    allProducts.filter(item=>{



        return (



            item.name &&

            item.name

            .toLowerCase()

            .includes(key)



        )



        ||




        (item.name_en &&


        item.name_en

        .toLowerCase()

        .includes(key)



        )



        ||




        (item.category &&


        item.category

        .toLowerCase()

        .includes(key)



        )



    });







    showProducts(
        result
    );



}








// =========================
// 初始化
// =========================


loadProducts();
