console.log(
"admin.js启动"
);



function loadPage(page){



const box =
document.getElementById(
"admin-content"
);



switch(page){


case "products":


box.innerHTML=`

<h1>
商品管理
</h1>


<div class="module">


<h3>
商品列表
</h3>


<p>
修改商品标题
</p>


<p>
修改英文标题
</p>


<p>
替换主图
</p>


<p>
增加/删除详情图片
</p>


<p>
修改描述
</p>


<p>
修改价格
</p>


<p>
修改上下架状态
</p>


</div>

`;

break;




case "decoration":


box.innerHTML=`

<h1>
前端装修
</h1>


<div class="module">


<p>
首页 Banner 图片
</p>


<p>
首页推荐商品
</p>


<p>
首页公告
</p>


<p>
首页模块标题
</p>


</div>

`;

break;





case "images":


box.innerHTML=`

<h1>
图片管理
</h1>


<div class="module">


<p>
商品主图管理
</p>


<p>
详情图片管理
</p>


<p>
Banner图片管理
</p>


</div>


`;

break;





case "ebay":


box.innerHTML=`

<h1>
eBay同步
</h1>


<div class="module">


<p>
同步商品到eBay
</p>


<p>
查看同步状态
</p>


<p>
更新价格库存
</p>


<p>
同步记录
</p>


</div>


`;

break;



}



}
