const loadAllItems = require('../src/items');
const loadPromotions = require('../src/promotions');
//匹配订单
function findList(selectedItems){
  var arr = new Array();
  var allItems = loadAllItems();
  //console.log(" :"+allItems.length);
  //分离参数
      for(var i=0;i<selectedItems.length;i++){
          var strs=selectedItems[i].split(' x ');
          arr.push({id:strs[0],
                    name:"",
                    price:0.00,
                    count:strs[1],
                    allprice:0.00
          });
      }
  //装填信息
  for(var k=0;k<arr.length;k++){
    for(var m=0;m<allItems.length;m++){
        if(arr[k].id===allItems[m].id){
          arr[k].name = allItems[m].name;
          arr[k].price = allItems[m].price;
          arr[k].allprice= allItems[m].price * arr[k].count;
        }
    }
  }
  //for(var j=0;j<arr.length;j++){
  //  console.log("\n------------------------\n"+"id ： "+arr[j].id+"\ncount ："+arr[j].count+"\nname ："+arr[j].name+"\nprice ："+arr[j].price+"\nallprice:" +arr[j].allprice);
  //}
  return arr;
}
//促销
function  equPromotions(arr){//使用(比较)优惠，返回优惠类型
  var str = [{totalPrice:0,Promotions:'满30减6元'},{totalPrice:0,food:[],savePrice:0,Promotions:'指定菜品半价'},{totalPrice:0,Promotions:' '}];
  var PromotionsList =loadPromotions();
  var flag = 0;
  //总价
  for(var i=0;i<arr.length;i++){
    str[2].totalPrice+=arr[i].allprice;
  }
  //满30减6
  if(str[2].totalPrice >= 30){
    flag =1;
    str[0].totalPrice = str[2].totalPrice-6;
  }else{
    str[0].totalPrice = str[2].totalPrice;
  }

  //指定菜品半价
  for(var i=0;i<arr.length;i++){
    for(var j=0;j<PromotionsList[1].items.length;j++){
      if(arr[i].id === PromotionsList[1].items[j]){
        flag = 1;
        arr[i].price= arr[i].price/2;
        str[1].food.push(arr[i].name);
        str[1].savePrice +=arr[i].price;
      }
    }
  }
  for(var i=0;i<arr.length;i++){
    str[1].totalPrice+=arr[i].price*arr[i].count;
  }


  //----------------------对价格排序
  str.sort(function(x,y){
    return x.totalPrice > y.totalPrice ? 1 :-1;
  });

  if(flag === 0){
    str[0].Promotions = ' ';
  }



  //console.log(str);

  //for(var i=0;i<str.length;i++){
  //  console.log('totalPrice:'+str[i].totalPrice+'Promotions:'+str[i].Promotions);
  //}
  return str;

}
//算价格
module.exports =function bestCharge(selectedItems) {
  var arr = findList(selectedItems);
  var string;
  //第一部分string1
  var string1 =  '============= 订餐明细 =============';
  for(var i=0;i<arr.length;i++){
      string1 +='\n'+arr[i].name+' x '+arr[i].count+' = '+arr[i].allprice+'元';
  }
  string1 += '\n-----------------------------------';

  //第二部分string2
  var strPromotions = equPromotions(arr);
    var string2;
  if(strPromotions[0].Promotions !== ' '){

    if(strPromotions[0].Promotions === '满30减6元'){
      string2 = '\n使用优惠:\n满30减6元，省6元\n-----------------------------------'
    }

    if(strPromotions[0].Promotions === '指定菜品半价'){
      string2 = '\n使用优惠:\n指定菜品半价(';
      for(var i=0;i<strPromotions[0].food.length;i++){
        string2 += strPromotions[0].food[i]+'，';
      }
      string2 = string2.substr(0,string2.length-1);
      string2 +=')，省'+strPromotions[0].savePrice+'元\n-----------------------------------';
    }

    string = string1+string2;
  }else{
    string = string1;
  }
  //第三部分string3

  var string3='\n总计：'+strPromotions[0].totalPrice+'元\n===================================';

  string += string3;
  //console.log(string);
  return string;
}
