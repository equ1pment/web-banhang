// Default customer data
export let defaultCustomers = [
    { id: 'KH-AAA0001', name: 'Nguyễn Âu Gia Hải', email: 'hhainguyen_skibidi@email.com', phone: '0901234567', status: 'Hoạt động', password: '123123123', address: '10 Đan Phượng, Hà Nội' },
    { id: 'KH-AAA0002', name: 'Nguyễn Quốc Tuấn', email: 'shinowa_toilet1337@email.com', phone: '0987654321', status: 'Đã khóa', password: '1231231213', address: '456 Đường Skibidi, Quận Giả Tưởng' },
    { id: 'KH-AAA0003', name: 'Miyo Sasaki', email: 'A_Whisker_Away@email.com', phone: '0123123123', status: 'Hoạt động', password: 'AWhiskerAway123', address: '24 Đường Kento, Phố Mèo' },
    { id: 'KH-AAA0004', name: 'Huyền Chom', email: 'chomchom_totite@email.com', phone: '0727727727', status: 'Hoạt động', password: 'Chomchom2007', address: '7 Hà Lội' },
    { id: 'KH-AAA0005', name: 'Pi Pi Pi', email: 'pikhongbel@email.com', phone: '0333666999', status: 'Hoạt động', password: 'Pikhongbell727', address: '727 Đường When You See It' },
    { id: 'KH-AAA0006', name: 'Nguyễn Văn Mười', email: 'tencuacaulagi@gmail.com', phone:  '0026082016', status: 'Hoạt động', password: 'YourNameIs', address: '16 Nguyễn Văn Mười' },
    { id: 'KH-AAA0007', name: 'Masaya Oya', email: 'exithisearthsatomosphere@gmail.com', phone: '0101010101', status: 'Hoạt động', password: 'Camellia', address: '69 Parallel' },
    { id: 'KH-AAA0008', name: 'Frieren', email: 'haruuu@gmail.com', phone: '0029092023', status: 'Hoạt động', password: 'hareniharehanayosake', address: '139 Unknownish' },
    { id: 'KH-AAA0009', name: 'Eula Lawrence', email: 'eulalawrence@gmail.com', phone: '0025109999', status: 'Hoạt động', password: 'Vengence', address: '239 Mondstadt' },
    { id: 'KH-AAA0010', name: 'suis', email: 'justasunnydayforyou@gmail.com', phone: 'None', status: 'Hoạt động', password: 'SummerBloomsWithoutYou', address: '247 Stockholm' }
];

// Product type data
export const productTypes = [
    { id: 'LSP001', name: 'Máy tính bàn', status: 'Hoạt động', src: 'assets/images/computer.png' },
    { id: 'LSP002', name: 'Laptop', status: 'Hoạt động', src: 'assets/images/laptop.png' },
    { id: 'LSP003', name: 'Linh kiện máy tính', status: 'Hoạt động', src: 'assets/images/motherboard.png' },
    { id: 'LSP004', name: 'Phụ kiện máy tính', status: 'Hoạt động', src: 'assets/images/keyboard-and-mouse.png' },
    { id: 'LSP005', name: 'Ghế - Bàn', status: 'Hoạt động', src: 'assets/images/gaming-chair.png' },
    { id: 'LSP006', name: 'Phần mềm', status: 'Hoạt động', src: 'assets/images/coding.png' }
];

// Demo product data
const demoProducts = [
    { id: 'SP001', typeId: 'LSP002', name: 'Laptop MSI Gaming Katana AI', brand: 'MSI', price: 0, status: 'Hoạt động', isFeatured: true, 
      imageUrl: 'assets/images/laptop.png', 
      description: 'Laptop của MSI\nCPU: Intel Core i7\nGPU: RTX 4060\nRAM: 16GB DDR5' 
    },
    { id: 'SP002', typeId: 'LSP003', name: 'CPU Intel Core i9-14900KS', brand: 'Intel', price: 0, status: 'Hoạt động', isFeatured: true, 
      imageUrl: 'assets/images/motherboard.png', 
      description: 'CPU xịn nhất của Intel, xử lý đa tác vụ / chơi game nặng không thành vấn đề' 
    },
    { id: 'SP003', typeId: 'LSP004', name: 'Bàn phím cơ AKKO 5075S', brand: 'AKKO', price: 0, status: 'Hoạt động', isFeatured: false, 
      imageUrl: 'assets/images/keyboard-and-mouse.png', 
      description: 'Bàn phím "cơ" gõ "lách tách" vui tai.\nSwitch: AKKO Cream Yellow\nPlate: Nhôm' 
    },
    { id: 'SP004', typeId: 'LSP005', name: 'Ghế Gaming E-Dra Hercules', brand: 'E-Dra', price: 0, status: 'Đã ẩn', isFeatured: false, 
      imageUrl: 'assets/images/gaming-chair.png', 
      description: 'Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text.' 
    }
];

// Demo product import data
const demoProductImports = [
    { id: 'PN1001', productId: 'SP001', type: 'Laptop', brand: 'MSI', name: 'Laptop MSI Gaming Katana AI', quantity: 20, importprice: 20000000, importdate: '2025-10-01' },
    { id: 'PN1002', productId: 'SP002', type: 'Linh kiện máy tính', brand: 'Intel', name: 'CPU Intel Core i9-14900KS', quantity: 50, importprice: 15000000, importdate: '2025-10-02' },
    { id: 'PN1003', productId: 'SP003', type: 'Phụ kiện máy tính', brand: 'AKKO', name: 'Bàn phím cơ AKKO 5075S', quantity: 30, importprice: 1000000, importdate: '2025-10-03' },
    { id: 'PN1004', productId: 'SP004', type: 'Ghế - Bàn', brand: 'E-Dra', name: 'Ghế Gaming E-Dra Hercules', quantity: 10, importprice: 2500000, importdate: '2025-10-04' }
];

// Demo inventory transaction data
const demoInventoryTransactions = [
    { transactionId: 'T001', importId: 'PN1001', productId: 'SP001', type: 'import', quantity: 20, date: '2025-10-01' },
    { transactionId: 'T002', orderId: 'DH2001', productId: 'SP001', type: 'export', quantity: 1, date: '2025-10-05' },
    { transactionId: 'T003', orderId: 'DH2002', productId: 'SP001', type: 'export', quantity: 1, date: '2025-10-06' },
    { transactionId: 'T004', importId: 'PN1002', productId: 'SP002', type: 'import', quantity: 50, date: '2025-10-02' },
    { transactionId: 'T005', orderId: 'DH2002', productId: 'SP002', type: 'export', quantity: 5, date: '2025-10-06' },
    { transactionId: 'T006', importId: 'PN1003', productId: 'SP003', type: 'import', quantity: 30, date: '2025-10-03' },
    { transactionId: 'T007', orderId: 'DH2001', productId: 'SP003', type: 'export', quantity: 1, date: '2025-10-05' },
    { transactionId: 'T008', importId: 'PN1004', productId: 'SP004', type: 'import', quantity: 10, date: '2025-10-04' }
];

// Demo order data
const demoOrders = [
    {
        id: "DH2001",
        customer: { id: "KH-AAA0003", name: "Miyo Sasaki" },
        items: [
            { id: 'SP001', name: 'Laptop MSI Gaming Katana AI', price: 22000000, quantity: 1 },
            { id: 'SP003', name: 'Bàn phím cơ AKKO 5075S', price: 1200000, quantity: 1 }
        ],
        total: 23200000,
        date: "2025-10-05",
        status: "Đã hoàn thành",
        shippingInfo: {
            name: "Miyo Sasaki", phone: "0123123123", address: "789 Phố Mèo, Nhật Bản"
        },
        payment: "cod"
    },
    {
        id: "DH2002",
        customer: { id: "KH-AAA0008", name: "Frieren" },
        items: [
            { id: 'SP001', name: 'Laptop MSI Gaming Katana AI', price: 22000000, quantity: 1 },
            { id: 'SP002', name: 'CPU Intel Core i9-14900KS', price: 17250000, quantity: 5 }
        ],
        total: 108250000,
        date: "2025-10-06",
        status: "Đang xử lý",
        shippingInfo: {
            name: "Frieren", phone: "0029092023", address: "Lục địa Phía Bắc"
        },
        payment: "transfer"
    }
];

// Demo profit settings data
const demoProfitSettings = {
    "LSP002": 10,
    "LSP003": 15,
    "SP003": 20
};

// localStorage helper functions
function getData(key, defaultValue) {
    const storedData = localStorage.getItem(key);
    if (storedData) {
        return JSON.parse(storedData);
    } else {
        localStorage.setItem(key, JSON.stringify(defaultValue));
        return defaultValue;
    }
}
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Data access functions
export const getCustomers = () => getData('customers', defaultCustomers);
export const saveCustomers = (data) => saveData('customers', data);

export const getProducts = () => getData('productsMasterData', demoProducts);
export const saveProducts = (data) => saveData('productsMasterData', data);

export const getProductImports = () => getData('productImports', demoProductImports);
export const saveProductImports = (data) => saveData('productImports', data);

export const getInventoryTransactions = () => getData('inventoryTransactions', demoInventoryTransactions);
export const saveInventoryTransactions = (data) => saveData('inventoryTransactions', data);

export const getProfitSettings = () => getData('profitSettings', demoProfitSettings);
export const saveProfitSettings = (data) => saveData('profitSettings', data);

export const getOrders = () => getData('orders', demoOrders);
export const saveOrders = (data) => saveData('orders', data);

// Cart management functions
export const getCart = (userId) => getData(`cart_${userId}`, []);
export const saveCart = (userId, data) => saveData(`cart_${userId}`, data);
