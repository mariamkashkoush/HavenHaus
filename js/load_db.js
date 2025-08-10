async function  LoadFile(url){
    let response = await fetch(url);
    let json = await response.json();
        
    for(const key in json){
        localStorage.setItem(`${key}`,JSON.stringify(json[key]))
        // console.log(`${key}, ${JSON.stringify(json[key])}`)

    }
}

export async function LoadDB(){
    if(!window.localStorage.getItem("IsDBLoaded")){

      await  LoadFile("../data/user.json")
      await  LoadFile("../data/order.json")
      await  LoadFile("../data/product.json")
      await  LoadFile("../data/orderItem.json")
      await  LoadFile("../data/cartItem.json")
      await  LoadFile("../data/category.json")
      await  LoadFile("../data/inquiry.json")


        localStorage.setItem("IsDBLoaded",true)    
    }
}

await LoadDB();
