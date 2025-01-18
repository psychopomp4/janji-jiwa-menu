const cart = [];
const favorites = [];
let seatingAreaSelected = false; // Menambahkan flag untuk memastikan area hanya dipilih sekali

// Fungsi untuk memilih ukuran
function selectSize(button, itemName) {
    const buttons = [...button.parentNode.querySelectorAll('.size-button')];
    buttons.forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');

    let selectedSize = button.getAttribute("data-size");
    let priceElement = button.closest(".menu-item").querySelector(".price");
    let price = selectedSize === 'large' ? priceElement.getAttribute("data-large") : priceElement.getAttribute("data-regular");

    priceElement.textContent = `Rp ${parseInt(price).toLocaleString()}`;
    button.closest(".menu-item").querySelector(".order-button").onclick = () => addToCart(itemName, parseInt(price), selectedSize);
}

function addToCart(itemName, itemPrice, itemSize) {
    let seatingArea = 'indoor'; // Default area tempat duduk

    // Cek apakah area tempat duduk sudah dipilih
    if (!seatingAreaSelected) {
        Swal.fire({
            title: '',
            html: `
                <div style="text-align: left;">
                    <label><strong><i class="fa fa-chair"></i> Pilih Area:</strong></label><br>
                    <div style="margin-top: 10px;">
                        <label style="margin-right: 15px;">
                            <input type="radio" id="indoor" name="seatingArea" value="indoor" checked>
                            <span style="margin-left: 5px;">Indoor</span>
                        </label>
                        <label>
                            <input type="radio" id="outdoor" name="seatingArea" value="outdoor">
                            <span style="margin-left: 5px;">Outdoor</span>
                        </label>
                    </div>
                </div>
                <div style="margin-top: 15px; text-align: left;">
                    <label><strong><i class="fa fa-table"></i> Pilih Nomor Meja:</strong></label>
                    <select id="tableNumber" style="width: 100%; padding: 5px; margin-top: 5px;">
                        ${Array.from({ length: 15 }, (_, i) => `<option value="${i + 1}">Meja ${i + 1}</option>`).join('')}
                    </select>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Pilih',
            cancelButtonText: 'Batal',
            customClass: {
                popup: 'swal-wide-popup',
                title: 'swal-title',
                confirmButton: 'swal-confirm-button',
                cancelButton: 'swal-cancel-button',
            },
            preConfirm: () => {
                seatingArea = document.querySelector('input[name="seatingArea"]:checked').value;
                tableNumber = document.getElementById('tableNumber').value;

                // Validasi input
                if (!seatingArea || !tableNumber) {
                    Swal.showValidationMessage('Semua kolom harus diisi!');
                } else {
                    seatingAreaSelected = true; // Set flag agar area hanya dipilih sekali
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                processCart(itemName, itemPrice, itemSize, seatingArea, tableNumber);
            }
        });
    } else {
        // Jika area sudah dipilih sebelumnya, lanjutkan ke proses menambahkan ke keranjang
        processCart(itemName, itemPrice, itemSize, seatingArea, tableNumber);
    }
}

function processCart(itemName, itemPrice, itemSize, seatingArea, tableNumber) {
    const existingItem = cart.find(item => item.name === itemName && item.size === itemSize && item.seating === seatingArea && item.table === tableNumber);
    if (existingItem) {
        existingItem.quantity++;
        existingItem.totalPrice += itemPrice;
    } else {
        cart.push({ name: itemName, price: itemPrice, size: itemSize, seating: seatingArea, table: tableNumber, quantity: 1, totalPrice: itemPrice });
    }
    updateCartDisplay();
    updateCartCount();
    showNotification("Item added to cart!");
}


// Fungsi untuk menambahkan item ke daftar favorit
function addToFavorites(itemName, itemImage) {
    const existingItem = favorites.find(item => item.name === itemName);
    
    if (existingItem) {
        showNotification(`"${itemName}" is already in favorites!`);
    } else {
        favorites.push({ name: itemName, image: itemImage });
        updateFavoritesDisplay();
        updateFavoritesCount();
        showNotification(`"${itemName}" added to favorites!`);
    }
}

// Fungsi untuk menghapus item dari daftar favorit
function removeFromFavorites(itemName) {
    const index = favorites.findIndex(item => item.name === itemName);
    if (index !== -1) {
        favorites.splice(index, 1);
        updateFavoritesDisplay();
        updateFavoritesCount();
        showNotification(`"${itemName}" removed from favorites!`);
    }
}

function updateFavoritesDisplay() {
    const favoriteItems = document.getElementById('favoriteItems');
    favoriteItems.innerHTML = '';

    if (favorites.length === 0) {
        favoriteItems.innerHTML = '<p>No favorites added yet!</p>';
        return;
    }

    const fragment = document.createDocumentFragment();
    favorites.forEach(item => {
        const listItem = document.createElement('li');
        listItem.innerHTML = ` 
            <img src="${item.image}" alt="${item.name}" style="width: 50px; height: auto; margin-right: 10px;">
            ${item.name}
            <button onclick="removeFromFavorites('${item.name}')">Remove</button>
        `;
        fragment.appendChild(listItem);
    });

    favoriteItems.appendChild(fragment);
}

function updateFavoritesCount() {
    const favoriteCount = document.getElementById('favoriteCount');
    favoriteCount.textContent = favorites.length;
}

function openFavorites() {
    const favoritesPanel = document.getElementById('favorites');
    favoritesPanel.style.display = 'flex';
}

function closeFavorites() {
    const favoritesPanel = document.getElementById('favorites');
    favoritesPanel.style.display = 'none';
}

// Fungsi untuk menghapus item dari cart
function removeFromCart(itemName, itemSize, seatingArea) {
    const index = cart.findIndex(item => item.name === itemName && item.size === itemSize && item.seating === seatingArea);
    if (index !== -1) {
        cart.splice(index, 1);
        updateCartDisplay();
        updateCartCount();
        showNotification("Item removed from cart!", "cartNotification");
    }
}

// Fungsi untuk memperbarui tampilan cart
function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const fragment = document.createDocumentFragment();
    let total = 0;
    
    // Kelompokkan item berdasarkan area tempat duduk
    const groupedCart = groupItemsBySeatingArea(cart);

    // Loop untuk menampilkan area dan itemnya
    for (const [seatingArea, items] of Object.entries(groupedCart)) {
        // Menampilkan area tempat duduk
        const seatingHeader = document.createElement('h3');
        seatingHeader.textContent = `Area Tempat Duduk: ${seatingArea}`;
        fragment.appendChild(seatingHeader);

        // Menampilkan daftar item untuk area tersebut
        items.forEach(item => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `${item.name} (${item.size}) x${item.quantity} - Rp ${item.totalPrice.toLocaleString()}`;
            listItem.innerHTML += `<button onclick="removeFromCart('${item.name}', '${item.size}', '${item.seating}')">Remove</button>`;
            fragment.appendChild(listItem);
            total += item.totalPrice;
        });
    }

    // Menampilkan daftar item dan total harga
    cartItems.innerHTML = '';
    cartItems.appendChild(fragment);
    cartTotal.textContent = `Total: Rp ${total.toLocaleString()}`;
}

// Fungsi untuk mengelompokkan item berdasarkan area tempat duduk
function groupItemsBySeatingArea(cart) {
    return cart.reduce((acc, item) => {
        // Jika belum ada grup untuk area tempat duduk, buat grup baru
        if (!acc[item.seating]) {
            acc[item.seating] = [];
        }
        acc[item.seating].push(item);
        return acc;
    }, {});
}

// Fungsi untuk memperbarui jumlah item di cart
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Fungsi lain tetap tidak berubah
function openCart() {
    document.getElementById('cart').style.display = 'flex';
}

function closeCart() {
    document.getElementById('cart').style.display = 'none';
}

function checkout() {
    if (cart.length === 0) {
        return showNotification('Your cart is empty!');
    }

    // Membuat pesan checkout dengan informasi area tempat duduk dan item
    let message = 'Pesanan Anda:\n';

    // Kelompokkan pesanan berdasarkan area dan meja
    const groupedCart = groupItemsBySeatingAreaAndTable(cart);

    for (const [key, items] of Object.entries(groupedCart)) {
        const [area, table] = key.split('-');
        message += `\nArea: ${area}\nMeja: ${table}\n\nItem:\n`;

        items.forEach((item, index) => {
            message += `${index + 1}. ${item.name} (${item.size}) x${item.quantity} - Rp ${item.totalPrice.toLocaleString()}\n`;
        });
    }

    // Tambahkan total harga
    const totalPrice = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    message += `\nTotal: Rp ${totalPrice.toLocaleString()}`;

    // Kirim pesan ke WhatsApp
    const whatsappLink = `https://wa.me/628988143220?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, '_blank');

    alert('Thank you!');
    cart.length = 0; // Kosongkan keranjang
    updateCartDisplay();
    updateCartCount();
    closeCart();
}

// Fungsi untuk mengelompokkan item berdasarkan area dan meja
function groupItemsBySeatingAreaAndTable(cart) {
    return cart.reduce((acc, item) => {
        const key = `${item.seating}-${item.table}`;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(item);
        return acc;
    }, {});
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Toggle Login/Logout
function toggleLogin() {
    if (sessionStorage.getItem('isAdmin') === 'true') {
        sessionStorage.removeItem('isAdmin');
        alert('Logged out!');
        document.getElementById('loginButton').textContent = 'Login';
        window.location.href = 'index.html';
    } else {
        const password = prompt('Enter admin password:');
        if (password === 'admin123') { // Ganti dengan password Anda
            sessionStorage.setItem('isAdmin', 'true');
            alert('Welcome, Admin!');
            document.getElementById('loginButton').textContent = 'Logout';
            window.location.href = 'admin.html';
        } else {
            alert('Wrong password!');
        }
    }
}

// Set initial login state
window.onload = () => {
    if (sessionStorage.getItem('isAdmin') === 'true') {
        document.getElementById('loginButton').textContent = 'Logout';
    }
};


function filterMenu() {
    const searchValue = document.getElementById('searchBar').value.toLowerCase();
    const menuItems = document.querySelectorAll('.menu-item');

    menuItems.forEach(item => {
        const itemName = item.getAttribute('data-name').toLowerCase();
        item.style.display = itemName.includes(searchValue) ? '' : 'none';
    });
}
