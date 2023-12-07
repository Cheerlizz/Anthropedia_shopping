let listProductHTML = document.querySelector('.listProduct');
let listCartHTML = document.querySelector('.listCart');
let iconCart = document.querySelector('.icon-cart');
let iconCartSpan = document.querySelector('.icon-cart span');
let body = document.querySelector('body');
let closeCart = document.querySelector('.close');
let products = [];
let cart = [];

let ws = new WebSocket('wss://anthropedia-web-680e6a971c1a.herokuapp.com:443');

// Array to hold the current prompts
let prompts = [];





iconCart.addEventListener('click', () => {
    body.classList.toggle('showCart');
})
closeCart.addEventListener('click', () => {
    body.classList.toggle('showCart');
})

    const addDataToHTML = () => {
    // remove datas default from HTML

        // add new datas
        if(products.length > 0) // if has data
        {
            products.forEach(product => {
                let newProduct = document.createElement('div');
                newProduct.dataset.id = product.id;
                newProduct.classList.add('item');
                newProduct.innerHTML = 
                `<div class="image-container">
                    <img src="${product.image}" alt="${product.name}">
                    
                </div>   
                <h2>${product.name}</h2>
                <div class="price">$${product.price}</div>
                <button class="addCart">Add To Cart</button>`;
                // Add event listener for mouse hover
                let imgElement = newProduct.querySelector('img');
                imgElement.addEventListener('mouseenter', () => {
                    imgElement.src = product.image_activated; // Change to activated image
                });
                imgElement.addEventListener('mouseleave', () => {
                    imgElement.src = product.image; // Revert to original image
                });
                // Add event listener for mouse hover
                newProduct.querySelector('img').addEventListener('mouseenter', (event) => {
                    showProductInfo(event.target, product);
                });
                newProduct.querySelector('img').addEventListener('mouseleave', () => {
                    hideProductInfo();
                });
              
                listProductHTML.appendChild(newProduct);
            });
        }
    }
        // Function to show product information
    const showProductInfo = (imgElement, product) => {
        // Create the pop-up element if it doesn't exist
        let popup = document.querySelector('.product-popup');
        if (!popup) {
            popup = document.createElement('div');
            popup.classList.add('product-popup');
            document.body.appendChild(popup);
        }

        // Set the content of the pop-up
        popup.innerHTML = `
        <div class="image-container">
            <img src="${product.info}"
            </div> 
        `;

         // Get the position of the image element
    const rect = imgElement.getBoundingClientRect();

    // Position the pop-up at the top left of the image
    popup.style.left = `${0.8*rect.right + window.scrollX}px`;
    popup.style.top = `${rect.top + window.scrollY}px`;

    // Show the pop-up
    popup.style.display = 'block'
    }



    listProductHTML.addEventListener('click', (event) => {
        let positionClick = event.target;
        if(positionClick.classList.contains('addCart')){
            let id_product = positionClick.parentElement.dataset.id;
            addToCart(id_product);
        }
    })
const addToCart = (product_id) => {
    let positionThisProductInCart = cart.findIndex((value) => value.product_id == product_id);
    if(cart.length <= 0){
        cart = [{
            product_id: product_id,
            quantity: 1
        }];
    }else if(positionThisProductInCart < 0){
        cart.push({
            product_id: product_id,
            quantity: 1
        });
    }else{
        cart[positionThisProductInCart].quantity = cart[positionThisProductInCart].quantity + 1;
    }
    addCartToHTML();
    addCartToMemory();
}
const addCartToMemory = () => {
    localStorage.setItem('cart', JSON.stringify(cart));
}
const addCartToHTML = () => {
    listCartHTML.innerHTML = '';
    let totalQuantity = 0;
    if(cart.length > 0){
        cart.forEach(item => {
            totalQuantity = totalQuantity +  item.quantity;
            let newItem = document.createElement('div');
            newItem.classList.add('item');
            newItem.dataset.id = item.product_id;

            let positionProduct = products.findIndex((value) => value.id == item.product_id);
            let info = products[positionProduct];
            listCartHTML.appendChild(newItem);
            newItem.innerHTML = `
            <div class="image">
                    <img src="${info.image_activated}">
                </div>
                <div class="name">
                ${info.name}
                </div>
                <div class="totalPrice">$${info.price * item.quantity}</div>
                <div class="quantity">
                    <span class="minus"><</span>
                    <span>${item.quantity}</span>
                    <span class="plus">></span>
                </div>
            `;
        })
    }
    iconCartSpan.innerText = totalQuantity;
}

listCartHTML.addEventListener('click', (event) => {
    let positionClick = event.target;
    if(positionClick.classList.contains('minus') || positionClick.classList.contains('plus')){
        let product_id = positionClick.parentElement.parentElement.dataset.id;
        let type = 'minus';
        if(positionClick.classList.contains('plus')){
            type = 'plus';
        }
        changeQuantityCart(product_id, type);
    }
})
const changeQuantityCart = (product_id, type) => {
    let positionItemInCart = cart.findIndex((value) => value.product_id == product_id);
    if(positionItemInCart >= 0){
        let info = cart[positionItemInCart];
        switch (type) {
            case 'plus':
                cart[positionItemInCart].quantity = cart[positionItemInCart].quantity + 1;
                break;
        
            default:
                let changeQuantity = cart[positionItemInCart].quantity - 1;
                if (changeQuantity > 0) {
                    cart[positionItemInCart].quantity = changeQuantity;
                }else{
                    cart.splice(positionItemInCart, 1);
                }
                break;
        }
    }
    addCartToHTML();
    addCartToMemory();
}

document.getElementById('checkOutButton').addEventListener('click', () => {
    //clearCart();
});

const clearCart = () => {
    // Empty the cart array
    cart = [];

    // Update the cart display
    addCartToHTML();

    // Clear cart data from localStorage
    localStorage.removeItem('cart');

    // Optionally, you can add a confirmation message or redirect the user
    //alert('Thank you for your purchase!');
    //window.location.href = 'index.html'; // Redirect to a thank you page
}



document.getElementById('checkOutButton').addEventListener('click', () => {
    // Show and fade in the image
    const checkoutImage = document.getElementById('checkoutImage');
    checkoutImage.style.display = 'block';
    setTimeout(() => {
        checkoutImage.style.opacity = 1;
    }, 10); // Start the fade-in after a short delay

    // Wait for 2 seconds, then fade out the image
    setTimeout(() => {
        checkoutImage.style.opacity = 0;

        // After the fade-out transition, hide the image again
        setTimeout(() => {
            checkoutImage.style.display = 'none';
        }, 200); // This 500ms should match the CSS transition time
    }, 1500); // 2000ms for the image to stay visible

    // Generate the checkout prompt and send it to the WebSocket server
    let checkoutTotals = generateCheckoutTotal();
    ws.send(JSON.stringify(checkoutTotals));

    clearCart(); // Call the clearCart function or other checkout logic
});

const generateCheckoutTotal = () => {
    let checkoutTotals = {};
    let grandTotal = 0;

    cart.forEach(item => {
        let product = products.find(p => p.id.toString() === item.product_id);
        if (product) {
            let totalForThisProduct = product.price * item.quantity;
            checkoutTotals[product.name] = (checkoutTotals[product.name] || 0) + totalForThisProduct;
            grandTotal += totalForThisProduct;
        }
    });

    checkoutTotals['Total'] = grandTotal;
    return checkoutTotals;
}




ws.addEventListener('open', (event) => {
    console.log('Socket connection open');
    // alert('Successfully connected to socket server 🎉');
    ws.send('pong');
  });
  
  ws.addEventListener('message', (message) => {
    if (message && message.data) {
      if (message.data === "ping") {
        console.log("got ping");
        ws.send("pong");
        return;
      }
      let data = JSON.parse(message.data);
      if (data) {
        console.log("got data", data);
      }
    }
    console.log("message", message)
  });
  
  ws.addEventListener('error', (error) => {
      console.error('Error in the connection', error);
      alert('error connecting socket server', error);
  });
  
  ws.addEventListener('close', (event) => {
      console.log('Socket connection closed');
      alert('closing socket server');
  });
  
  


  


const initApp = () => {
    // get data product
    fetch('products.json')
    .then(response => response.json())
    .then(data => {
        products = data;
        addDataToHTML();

        // get data cart from memory
        if(localStorage.getItem('cart')){
            cart = JSON.parse(localStorage.getItem('cart'));
            addCartToHTML();
        }
    })
}
initApp();