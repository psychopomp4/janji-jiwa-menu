// Inisialisasi array untuk menyimpan menu
let menuItems = [];

// Fungsi untuk menambahkan menu baru
function addMenuItem(itemName, regularPrice, largePrice, itemDescription) {
    const newItem = {
        id: Date.now(), // Menggunakan waktu sebagai ID unik
        itemName,
        regularPrice,
        largePrice,
        itemDescription
    };
    menuItems.push(newItem);
    updateMenuList();
}

// Fungsi untuk memperbarui daftar menu
function updateMenuList() {
    const menuList = document.getElementById('menuList');
    menuList.innerHTML = ''; // Kosongkan daftar sebelumnya

    menuItems.forEach(item => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <strong>${item.itemName}</strong><br>
            Regular: ${item.regularPrice} | Large: ${item.largePrice}<br>
            ${item.itemDescription}<br>
            <button onclick="editMenuItem(${item.id})">Edit</button>
            <button onclick="deleteMenuItem(${item.id})">Delete</button>
        `;
        menuList.appendChild(listItem);
    });
}

// Fungsi untuk mengedit menu
function editMenuItem(itemId) {
    const item = menuItems.find(item => item.id === itemId);
    if (item) {
        document.getElementById('itemName').value = item.itemName;
        document.getElementById('regularPrice').value = item.regularPrice;
        document.getElementById('largePrice').value = item.largePrice;
        document.getElementById('itemDescription').value = item.itemDescription;
        
        // Sembunyikan tombol Add dan tampilkan tombol Update
        document.getElementById('addButton').style.display = 'none';
        document.getElementById('updateButton').style.display = 'block';
        
        // Tambahkan event untuk tombol Update
        document.getElementById('updateButton').onclick = function() {
            updateMenuItem(itemId);
        };
    }
}

// Fungsi untuk memperbarui menu
function updateMenuItem(itemId) {
    const itemName = document.getElementById('itemName').value;
    const regularPrice = document.getElementById('regularPrice').value;
    const largePrice = document.getElementById('largePrice').value;
    const itemDescription = document.getElementById('itemDescription').value;

    const item = menuItems.find(item => item.id === itemId);
    if (item) {
        item.itemName = itemName;
        item.regularPrice = regularPrice;
        item.largePrice = largePrice;
        item.itemDescription = itemDescription;
    }

    // Reset form dan update daftar menu
    resetForm();
    updateMenuList();
}

// Fungsi untuk menghapus menu
function deleteMenuItem(itemId) {
    menuItems = menuItems.filter(item => item.id !== itemId);
    updateMenuList();
}

// Fungsi untuk mereset form
function resetForm() {
    document.getElementById('menuForm').reset();
    document.getElementById('addButton').style.display = 'block';
    document.getElementById('updateButton').style.display = 'none';
}

// Fungsi logout
function logout() {
    // Hapus data login dari penyimpanan lokal/session (jika ada)
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');

    // Arahkan pengguna ke halaman login
    window.location.href = 'login.html';
}


// Event listener untuk form submit
document.getElementById('menuForm').onsubmit = function(event) {
    event.preventDefault(); // Mencegah form dari reload halaman
    const itemName = document.getElementById('itemName').value;
    const regularPrice = document.getElementById('regularPrice').value;
    const largePrice = document.getElementById('largePrice').value;
    const itemDescription = document.getElementById('itemDescription').value;

    addMenuItem(itemName, regularPrice, largePrice, itemDescription);
    resetForm();
};
