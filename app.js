let menuBar = document.querySelector('#menu-bar');
let navBar = document.querySelector('.navbar');
let cartTotal = document.querySelector('.cart-total')
let cartItems = document.querySelector('.cart-items')
let cartContent = document.querySelector('.cart-content')
let cartOverlay = document.querySelector('.cart-overlay')
let cartDOM = document.querySelector('.cart')
let cartBtn = document.querySelector('.cart-btn')
let closeCartBtn = document.querySelector('.close-cart')
let clearCartBtn = document.querySelector('.clear-cart')

const productDom = document.querySelector('.popular-container');

menuBar.addEventListener('click', ()=> {
    navBar.classList.toggle('active')
})
window.onmouseup = () =>{
    menuBar.classList.remove('fa-times')
    navBar.classList.remove('active')
}


cart = [];


// Getting the product from json file
class Products{
    async getProducts(){
        try {
            let result = await fetch("product.json");
            let data = await result.json();
            let products = data.items;
            products = products.map(item => {
                const {title,price} = item.fields;
                const {id} = item.sys;
                const {image} = item.fields;
                return {title,price,image,id}
            })
            return products;
        } catch (error) {
            console.log(error)
        }
    }

}

// Displaying the Products
class UI{
    displayProduct(products){
       let result = '';
       products.forEach(product => {
           result += `
           <div class="box">
           <span class="price">${product.price}</span>
           <img src="${product.image}" alt="">
           <h3>${product.title}</h3>
           <div class="stars">
               <i class="fas fa-star"></i>
               <i class="fas fa-star"></i>
               <i class="fas fa-star"></i>
               <i class="fas fa-star"></i>
               <i class="far fa-star"></i>
           </div>
           <button href="#" class="button" data-id = "${product.id}" id = "button">order now</button>
           </div>
           `
           productDom.innerHTML = result;
       });
    }
    getBagButtons(){
        let buttons = [...document.querySelectorAll('#button')];
        buttons.forEach(button => {
           let id = button.dataset.id;
            // get product from products
           button.addEventListener('click', event =>{
            let cartItem = {...Storage.getProducts(id), amount: 1};
            // Add product to the cart
           cart = [...cart,cartItem]
            // save cart to the local Storage
            Storage.saveCart(cart)
            // set cart values
            this.setCartValues(cart);
            // Display cart item
            this.setCartItem(cartItem)
            // Show Cart
            this.showCart()
           })
        })
    }
    setCartValues(cart){
        let tempTotal = 0;
        let itemsTotla = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotla += item.amount;
        })
        // Temptotal means total amount of a cart
        cartTotal.innerText = parseFloat(tempTotal.toFixed());
        cartItems.innerText = itemsTotla;
    }
    setCartItem(item){
        const div = document.createElement('div');
        div.classList.add('cart-item')
        div.innerHTML = `
        <img src="${item.image}" alt="">
        <div>
          <h4>${item.title}</h4>
          <h5>${item.price}</h5>
          <span class="remove-item" data-id ='${item.id}'>remove</span>
        </div>
        <div>
            <i class="fas fa-chevron-up" data-id ='${item.id}'></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fas fa-chevron-down" data-id ='${item.id}'></i>
        `
        cartContent.appendChild(div);
    }
    showCart(){
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart')
    }
    setupAPP(){
        cart = Storage.getCart();
        this.setCartValues(cart)
        this.populateCart(cart)
        cartBtn.addEventListener('click', this.showCart)
        closeCartBtn.addEventListener('click', this.removeCart)
    }
    populateCart(cart){
        cart.forEach(item => {
            this.setCartItem(item)
        })
    }
    removeCart(){
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart')
    }
    cartLogic(){
        clearCartBtn.addEventListener('click', ()=>{
           this.clearCart()
        })
        cartContent.addEventListener('click', (event) => {
            if(event.target.classList.contains('remove-item')){
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild
                (removeItem.parentElement.parentElement);
                this.removeItem(id)
            }else if(event.target.classList.contains('fa-chevron-up')){
                 let addAmount = event.target;
                 let id = addAmount.dataset.id;
                 let tempItem = cart.find(item => item.id===id);
                 tempItem.amount = tempItem.amount + 1;
                 Storage.saveCart(cart)
                 this.setCartValues(cart);
                 addAmount.nextElementSibling.innerText = tempItem.amount;
             }else if(event.target.classList.contains('fa-chevron-down')){
                 let lowerAmount = event.target;
                 let id = lowerAmount.dataset.id;
                 let tempItem = cart.find(item => item.id===id);
                 tempItem.amount = tempItem.amount - 1;
                 if(tempItem.amount > 0){
                     Storage.saveCart(cart)
                     this.setCartValues(cart)
                     lowerAmount.previousElementSibling.innerText = tempItem.amount;
                 }else{
                     cartContent.removeChild(lowerAmount.parentElement.parentElement);
                     this.removeItem(id)
                 }
             }
         })
    }
    clearCart(){
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id))
        while(cartContent.children.length>0){
            cartContent.removeChild(cartContent.children[0])
        }
        this.hideCart()
    }
    removeItem(id){
        cart= cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
    }
} 
// Local Storage
class Storage{
 static saveProducts(products){
     localStorage.setItem("products", JSON.stringify(products))
 }
 static getProducts(id){
     let products = JSON.parse(localStorage.getItem('products'));
     return products.find(product => product.id === id)
 }
 static saveCart(cart){
     localStorage.setItem('cart', JSON.stringify(cart))
 }
 static getCart(){
     return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[]
 }
}

document.addEventListener('DOMContentLoaded', () =>{
    const ui = new UI();
    const products = new Products();
    // Setuop APP
    ui.setupAPP();

    products.getProducts().then(products => {ui.displayProduct(products)
    Storage.saveProducts(products);
    }).then(() => {
        ui.getBagButtons()
        ui.cartLogic()
    })
})