console.log("app.js is accessed");
const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "og1nmaa62vto",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: "t-axGvGWfCbpwprsxGDGNKbsSfPkXqQMNWNJwFKOw2U"
});
console.log(client);

/* SELECT DOM VARIABLES */
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-btn");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");
// const eyeIcon = document.querySelector(".eye");
const clearCart = document.querySelector(".clear-cart");

// main cart array
let cart = [];
// buttons
let buttonsDOM = [];

// getting the products
class Products {
  async getProducts() {
    try {
      let contentful = await client.getEntries({
        content_type: "ginwoe"
      });
      console.log(contentful);
      // .then(response => console.log(response.items))
      // .catch(console.error);
      console.log(contentful.items);

      let result = await fetch("products.json");
      let data = await result.json();

      //use map to destructure the items json -> setup so complicated for the ease contentful api use
      // let products = data.items;
      let products = contentful.items;
      products = products.map(item => {
        const { title, description, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, description, price, id, image };
      });
      console.log("after products re-mapping, products:");
      console.log(products);

      return products;
    } catch (error) {
      console.log(error);
    }
    console.log("end of getProducts");
    console.log();
  }
}

// Display products UI
class UI {
  // maybe setup another class for cart
  displayProducts(products) {
    // console.log(products);
    let result = "";
    products.forEach(product => {
      //   console.log(result);
      result += `
      <!-- Single Product -->
         <article class="product">
         
          <div class="img-container">
          <h3 class="product-title">${product.title}</h3>
            <img
              src="${product.image}"
              alt="product"
              class="product-img"
            />
            <button class="bag-btn" data-id=${product.id}>
              <i class="fas fa-shopping-cart"></i>
              add to cart
            </button>
          </div>
          
          <h4>$${product.price}</h4>
        </article>
        <!-- END Single Product -->
        `;
    });
    // console.log(result);
    productsDOM.innerHTML = result;
  }
  getBagButtons() {
    // SPREAD operator -> used because we will be using a method to find the particular button clicked in the buttonDOM, and for that we will use the find() method and find() does NOT work function on NodeList ...
    //               ... -> spread operator / method
    const buttons = [...document.querySelectorAll(".bag-btn")];
    // console.log(buttons);
    buttonsDOM = buttons;
    buttons.forEach(button => {
      let id = button.dataset.id;
      let inCart = cart.find(item => item.id === id);
      if (inCart) {
        button.innerHTML = `
        <i class="fas fa-shopping-cart"></i>
              in cart
            </button>
        `;

        button.disabled = true;
      }
      button.addEventListener("click", event => {
        //   console.log(event);
        event.target.innerHTML = `
        <i class="fas fa-shopping-cart"></i>
              in cart
            </button>
        `;
        button.disabled = true;

        // get product from products
        // let cartItem = Storage.getProduct(id);
        // // console.log(cartItem);

        // OR... get product from products using spread operator
        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        // spread operator used to add property amount = 1
        // console.log(cartItem);

        // add product to the cart
        cart = [...cart, cartItem];
        // console.log(cart);

        // save the cart in local storage
        Storage.saveCart(cart);

        // set values of cart
        // console.log("this");
        // console.log(this);
        this.setCartValues(cart);

        // add cart item / display cart item
        this.addCartItem(cart);

        // show the cart
        this.showCart();
      });
    });
  }
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map(item => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;

    console.log(cartTotal);
    console.log(cartItems);
  }
  addCartItem(item) {
    console.log("addCartItem, ITEM:");
    console.log(item);
    let newItem;
    // Returns if a value is an array
    function isArray(value) {
      return value.constructor === Array;
    }

    //
    if (isArray(item)) {
      let ind = item.length - 1;
      newItem = item[ind];
    } else {
      newItem = item;
    }

    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
      <img src="${newItem.image}" alt="product" />
          <div class="piece-description">${newItem.shortDesc}</div>
          <div>
            <h4>${newItem.title}</h4>
            <h5><em>$${newItem.price}</em></h5>
            <span class="remove-item" data-id=${newItem.id}>remove</span>
          </div>       
      `;
    cartContent.appendChild(div);
    console.log(cartContent);
  }
  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }
  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }
  setupApp() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populate(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }
  populate(cart) {
    cart.forEach(item => this.addCartItem(item));
  }
  // cart = cartLogic(cart) {
  // clearCart.addEventListener("click", () => {
  //   cart = [];
  // });

  cartLogic() {
    //clear cart logic
    clearCart.addEventListener("click", () => {
      this.clearCart();
    });
    // remove / add item
    cartContent.addEventListener("click", event => {
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        // cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      }
      // this.removeItem();
    });
  }

  clearCart() {
    let cartItems = cart.map(item => item.id);
    // console.log(cartItems);
    cartItems.forEach(id => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `
        <i class="fas fa-shopping-cart"></i>
              add to cart
            </button>
    `;
    this.removeCartItem(id);
  }
  getSingleButton(id) {
    console.log("get single button");
    console.log(id);
    return buttonsDOM.find(button => button.dataset.id === id);
  }
  removeCartItem(id) {
    event.patrh;
  }
}

// local storage
/* 

    A potential more secure but probably slower alternative to holding all the product in local storage, acces contentful api or backend database to store them locally as needed. 
        Thought: to add all products with following info upon load of store-page:
            1. product.id
            2. product.title
            3. product.descriptioin
            4. product.price
            5. product.thumbnail
          Upon load of zoomed image:
              local store the following:
                  1. all images to ~max width of long-axis-of-device with waterMark. 
          Upon adding-to-cart-btn:
              local store:
                  addToCartTime
                  product.price
                  product.id
                           


*/
class Proc {
  static description(products) {
    products.forEach(product => {
      let longDesc = product.description;

      let longDescArr = longDesc.split(" ");

      let shortDescArr = longDescArr.slice(0, longDescArr.length / 3);
      let ashortDesc = shortDescArr.join(" ");
      ashortDesc += " ...";
      product.shortDesc = ashortDesc;
    });
  }
  static testFunction = function() {
    const desc = document.querySelector(".piece-description");
    console.log(desc);
  };
}
class Storage {
  /* 
  CREATE A STATIC METHOD, so method can be used without instanitation. 
    This is so we can acces these methods outside of the Storage class, 
  */
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find(product => product.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

// event listener for content loaded
document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  const processor = new Proc();

  //setup app
  ui.setupApp();

  /* 
products.getProducts().then(products => console.log(products));
*/

  // get all products -> run method on products instance products
  products
    .getProducts()
    .then(products => {
      ui.displayProducts(products);
      Proc.description(products);
      Proc.testFunction();
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});
