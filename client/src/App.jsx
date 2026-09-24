import { useState, useEffect } from "react";
import axios from "axios";

function App() {
    const [isRegister, setIsRegister] = useState(false);

    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "student",
        block: ""
    });

    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (isRegister) {
                const response = await axios.post(
                    "http://localhost:5000/api/auth/register",
                    form
                );

                setMessage(response.data.message);

                setForm({
                    name: "",
                    email: "",
                    password: "",
                    phone: "",
                    role: "student",
                    block: ""
                });

                setIsRegister(false);

            } else {
                const response = await axios.post(
                    "http://localhost:5000/api/auth/login",
                    {
                        email: form.email,
                        password: form.password
                    }
                );

                localStorage.setItem(
                    "token",
                    response.data.token
                );

                localStorage.setItem(
                    "user",
                    JSON.stringify(response.data.user)
                );

                setUser(response.data.user);
                setMessage("");
            }

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Something went wrong"
            );
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);

        setForm({
            name: "",
            email: "",
            password: "",
            phone: "",
            role: "student",
            block: ""
        });
    };

    if (user) {
        // Vendor and delivery dashboards already contain their own
        // full-page layout and navbar, so render them directly.
        if (user.role === "vendor") {
            return <VendorDashboard user={user} logout={logout} />;
        }

        if (user.role === "delivery_partner") {
            return <DeliveryDashboard user={user} logout={logout} />;
        }

        return (
            <div className="dashboard">
                <nav className="navbar">
                    <div className="navbar-brand">
                        <span className="brand-mark">CF</span>
                        <h2>CampusFlow</h2>
                    </div>

                    <div className="navbar-user">
                        <span className="navbar-role">Student</span>
                        <button
                            className="logout-btn"
                            onClick={logout}
                        >
                            Logout
                        </button>
                    </div>
                </nav>

                <div className="dashboard-content">
                    <div className="page-heading">
                        <span className="eyebrow">STUDENT PORTAL</span>
                        <h1>Welcome, {user.name} 👋</h1>
                        <p className="role-text">
                            Order food, track deliveries, and manage your campus orders.
                        </p>
                    </div>

                    <StudentDashboard user={user} />
                </div>
            </div>
        );
    }

    return (
        <div className="app">

            <div className="login-container">

                <div className="brand-section">
                    <h1>CampusFlow 🚀</h1>

                    <p>
                        Intelligent Campus Delivery &
                        Demand Optimization Platform
                    </p>
                </div>

                <div className="login-card">

                    <h2>
                        {isRegister
                            ? "Create Account"
                            : "Welcome Back"}
                    </h2>

                    <p className="subtitle">
                        {isRegister
                            ? "Join CampusFlow today"
                            : "Login to your CampusFlow account"}
                    </p>

                    <form onSubmit={handleSubmit}>

                        {isRegister && (
                            <>
                                <label>Name</label>

                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter your name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                />

                                <label>Phone</label>

                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="Enter your phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </>
                        )}

                        <label>Email</label>

                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />

                        <label>Password</label>

                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />

                        {isRegister && (
                            <>
                                <label>Role</label>

                                <select
                                    name="role"
                                    value={form.role}
                                    onChange={handleChange}
                                >
                                    <option value="student">
                                        Student
                                    </option>

                                    <option value="delivery_partner">
                                        Delivery Partner
                                    </option>

                                    <option value="vendor">
                                        Vendor
                                    </option>
                                </select>

                                <label>Block</label>

                                <input
                                    type="text"
                                    name="block"
                                    placeholder="Example: Block 32"
                                    value={form.block}
                                    onChange={handleChange}
                                />
                            </>
                        )}

                        <button type="submit">
                            {isRegister
                                ? "Register"
                                : "Login"}
                        </button>

                    </form>

                    {message && (
                        <p className="message">
                            {message}
                        </p>
                    )}

                    <p className="register-text">

                        {isRegister
                            ? "Already have an account?"
                            : "Don't have an account?"}

                        <span
                            onClick={() => {
                                setIsRegister(!isRegister);
                                setMessage("");
                            }}
                        >
                            {isRegister
                                ? " Login"
                                : " Register"}
                        </span>

                    </p>

                </div>

            </div>

        </div>
    );
}


// ======================================================
// STUDENT DASHBOARD
// ======================================================

function StudentDashboard({ user }) {

    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showVendors, setShowVendors] = useState(false);
    const [error, setError] = useState("");

    const [selectedVendor, setSelectedVendor] =
        useState(null);

    const [menuItems, setMenuItems] = useState([]);
    const [menuLoading, setMenuLoading] =
        useState(false);

    // Cart
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);

    const [deliveryBlock, setDeliveryBlock] =
        useState(user.block || "");

    const [message, setMessage] = useState("");

    // Orders
    const [orders, setOrders] = useState([]);
    const [showOrders, setShowOrders] = useState(false);
    const [ordersLoading, setOrdersLoading] =
        useState(false);


    // ==================================================
    // FETCH VENDORS
    // ==================================================

    const fetchVendors = async () => {

        try {

            setLoading(true);
            setError("");

            const token =
                localStorage.getItem("token");

            const response = await axios.get(
                "http://localhost:5000/api/vendors",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            setVendors(response.data.vendors);

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Failed to load vendors"
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        if (showVendors) {
            fetchVendors();
        }

    }, [showVendors]);


    // ==================================================
    // VIEW MENU
    // ==================================================

    const viewMenu = async (vendor) => {

        try {

            setMenuLoading(true);
            setError("");

            setSelectedVendor(vendor);

            const token =
                localStorage.getItem("token");

            const response = await axios.get(
                `http://localhost:5000/api/menu/vendor/${vendor._id}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            setMenuItems(
                response.data.menuItems
            );

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Failed to load menu"
            );

        } finally {

            setMenuLoading(false);

        }
    };


    // ==================================================
    // ADD TO CART
    // ==================================================

    const addToCart = (item) => {

        setCart((previousCart) => [
            ...previousCart,
            item
        ]);

        setMessage(
            `${item.name} added to cart ✅`
        );

        setShowCart(true);
    };


    // ==================================================
    // REMOVE FROM CART
    // ==================================================

    const removeFromCart = (index) => {

        setCart((previousCart) =>
            previousCart.filter(
                (_, i) => i !== index
            )
        );

    };


    // ==================================================
    // TOTAL
    // ==================================================

    const totalAmount = cart.reduce(
        (total, item) =>
            total + item.price,
        0
    );


    // ==================================================
    // PLACE ORDER
    // ==================================================

    const placeOrder = async () => {

        try {

            if (cart.length === 0) {
                setMessage("Your cart is empty");
                return;
            }

            if (!selectedVendor) {
                setMessage("Please select a vendor");
                return;
            }

            if (!deliveryBlock) {
                setMessage(
                    "Please enter delivery block"
                );
                return;
            }

            const token =
                localStorage.getItem("token");

            const orderItems = cart.map(
                (item) => ({
                    menuItem: item._id,
                    quantity: 1
                })
            );

            await axios.post(
                "http://localhost:5000/api/orders",
                {
                    vendor: selectedVendor._id,
                    items: orderItems,
                    deliveryBlock
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            setMessage(
                "Order placed successfully! 🎉"
            );

            setCart([]);
            setShowCart(false);

        } catch (error) {

            setMessage(
                error.response?.data?.message ||
                "Failed to place order"
            );

        }
    };


    // ==================================================
    // FETCH MY ORDERS
    // ==================================================

    const fetchOrders = async () => {

        try {

            setOrdersLoading(true);
            setMessage("");

            const token =
                localStorage.getItem("token");

            const response = await axios.get(
                "http://localhost:5000/api/orders/my-orders",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            setOrders(response.data.orders);

        } catch (error) {

            setMessage(
                error.response?.data?.message ||
                "Failed to load orders"
            );

        } finally {

            setOrdersLoading(false);

        }
    };


    // ==================================================
    // TOGGLE ORDERS
    // ==================================================

    const toggleOrders = () => {

        const newState = !showOrders;

        setShowOrders(newState);

        if (newState) {
            fetchOrders();
        }
    };


    return (
        <>

            {/* Dashboard Cards */}

            <div className="dashboard-grid">

                {/* Order Food */}

                <div className="dashboard-card">

                    <div className="card-icon">
                        🍔
                    </div>

                    <h3>
                        Order Food
                    </h3>

                    <p>
                        Browse campus vendors
                        and order your favorite
                        food.
                    </p>

                    <button
                        onClick={() =>
                            setShowVendors(
                                !showVendors
                            )
                        }
                    >
                        {showVendors
                            ? "Hide Vendors"
                            : "Browse Vendors"}
                    </button>

                </div>


                {/* My Orders */}

                <div className="dashboard-card">

                    <div className="card-icon">
                        📦
                    </div>

                    <h3>
                        My Orders
                    </h3>

                    <p>
                        Track your active
                        and previous food
                        orders.
                    </p>

                    <button
                        onClick={toggleOrders}
                    >
                        {showOrders
                            ? "Hide Orders"
                            : "View Orders"}
                    </button>

                </div>


                {/* Delivery Tracking */}

                <div className="dashboard-card">

                    <div className="card-icon">
                        🚚
                    </div>

                    <h3>
                        Delivery Tracking
                    </h3>

                    <p>
                        Track your order
                        and estimated
                        delivery time.
                    </p>

                    <button>
                        Track Order
                    </button>

                </div>


                {/* Profile */}

                <div className="dashboard-card">

                    <div className="card-icon">
                        👤
                    </div>

                    <h3>
                        Profile
                    </h3>

                    <p>
                        Block:{" "}
                        {user.block ||
                            "Not specified"}
                    </p>

                    <button>
                        View Profile
                    </button>

                </div>

            </div>


            {/* Message */}

            {message && (
                <p className="message">
                    {message}
                </p>
            )}


            {/* ==================================================
                MY ORDERS
            ================================================== */}

            {showOrders && (

                <div className="orders-section">

                    <h2>
                        📦 My Orders
                    </h2>

                    {ordersLoading && (
                        <p>
                            Loading orders...
                        </p>
                    )}

                    {!ordersLoading &&
                        orders.length === 0 && (
                            <p>
                                No orders found.
                            </p>
                        )}

                    <div className="orders-grid">

                        {orders.map(
                            (order) => (

                                <div
                                    className="order-card"
                                    key={order._id}
                                >

                                    <h3>
                                        {order.vendor?.name ||
                                            "Vendor"}
                                    </h3>

                                    <p>
                                        Order ID:{" "}
                                        {order._id}
                                    </p>

                                    <p>
                                        📍{" "}
                                        {order.deliveryBlock}
                                    </p>

                                    <p>
                                        💰 ₹
                                        {order.totalAmount}
                                    </p>

                                    <p>
                                        🚦 Status:{" "}
                                        <strong>
                                            {order.status}
                                        </strong>
                                    </p>

                                    <div className="order-items">

                                        {order.items.map(
                                            (item) => (

                                                <p
                                                    key={item._id}
                                                >
                                                    {item.name}
                                                    {" × "}
                                                    {item.quantity}
                                                </p>

                                            )
                                        )}

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                </div>

            )}


            {/* ==================================================
                CART BUTTON
            ================================================== */}

            {cart.length > 0 && (

                <button
                    className="cart-button"
                    onClick={() =>
                        setShowCart(!showCart)
                    }
                >
                    🛒 Cart ({cart.length})
                </button>

            )}


            {/* ==================================================
                VENDORS
            ================================================== */}

            {showVendors && (

                <div className="vendors-section">

                    <h2>
                        Campus Vendors 🍴
                    </h2>

                    {loading && (
                        <p>
                            Loading vendors...
                        </p>
                    )}

                    {error && (
                        <p className="error-message">
                            {error}
                        </p>
                    )}

                    {!loading &&
                        !error &&
                        vendors.length === 0 && (
                            <p>
                                No vendors available.
                            </p>
                        )}

                    <div className="vendor-grid">

                        {vendors.map(
                            (vendor) => (

                                <div
                                    className="vendor-card"
                                    key={vendor._id}
                                >

                                    <div className="vendor-icon">
                                        🏪
                                    </div>

                                    <h3>
                                        {vendor.name}
                                    </h3>

                                    <p>
                                        {vendor.description ||
                                            "Campus food vendor"}
                                    </p>

                                    <p>
                                        📍{" "}
                                        {vendor.location}
                                    </p>

                                    <p>
                                        📞{" "}
                                        {vendor.phone}
                                    </p>

                                    <span
                                        className={
                                            vendor.isOpen
                                                ? "open"
                                                : "closed"
                                        }
                                    >
                                        {vendor.isOpen
                                            ? "Open"
                                            : "Closed"}
                                    </span>

                                    <button
                                        onClick={() =>
                                            viewMenu(
                                                vendor
                                            )
                                        }
                                    >
                                        View Menu
                                    </button>

                                </div>

                            )
                        )}

                    </div>

                </div>

            )}


            {/* ==================================================
                MENU
            ================================================== */}

            {selectedVendor && (

                <div className="menu-section">

                    <div className="menu-header">

                        <h2>
                            {selectedVendor.name}
                            {" "}Menu 🍽️
                        </h2>

                        <button
                            className="close-menu"
                            onClick={() => {

                                setSelectedVendor(
                                    null
                                );

                                setMenuItems([]);

                            }}
                        >
                            Close
                        </button>

                    </div>

                    {menuLoading && (
                        <p>
                            Loading menu...
                        </p>
                    )}

                    {!menuLoading &&
                        menuItems.length === 0 && (
                            <p>
                                No menu items available.
                            </p>
                        )}

                    <div className="menu-grid">

                        {menuItems.map(
                            (item) => (

                                <div
                                    className="menu-card"
                                    key={item._id}
                                >

                                    <div className="menu-icon">
                                        🍕
                                    </div>

                                    <h3>
                                        {item.name}
                                    </h3>

                                    <p>
                                        {item.description ||
                                            "Delicious campus food"}
                                    </p>

                                    <h4>
                                        ₹{item.price}
                                    </h4>

                                    <span
                                        className={
                                            item.isAvailable
                                                ? "available"
                                                : "unavailable"
                                        }
                                    >
                                        {item.isAvailable
                                            ? "Available"
                                            : "Unavailable"}
                                    </span>

                                    <button
                                        disabled={
                                            !item.isAvailable
                                        }
                                        onClick={() =>
                                            addToCart(item)
                                        }
                                    >
                                        Add to Cart
                                    </button>

                                </div>

                            )
                        )}

                    </div>

                </div>

            )}


            {/* ==================================================
                CART
            ================================================== */}

            {showCart && (

                <div className="cart-section">

                    <h2>
                        🛒 Your Cart
                    </h2>

                    {cart.length === 0 ? (

                        <p>
                            Your cart is empty.
                        </p>

                    ) : (

                        <>

                            {cart.map(
                                (item, index) => (

                                    <div
                                        className="cart-item"
                                        key={`${item._id}-${index}`}
                                    >

                                        <div>

                                            <h3>
                                                {item.name}
                                            </h3>

                                            <p>
                                                ₹{item.price}
                                            </p>

                                        </div>

                                        <button
                                            onClick={() =>
                                                removeFromCart(
                                                    index
                                                )
                                            }
                                        >
                                            Remove
                                        </button>

                                    </div>

                                )
                            )}

                            <h3>
                                Total: ₹
                                {totalAmount}
                            </h3>

                            <label>
                                Delivery Block
                            </label>

                            <input
                                type="text"
                                value={deliveryBlock}
                                onChange={(e) =>
                                    setDeliveryBlock(
                                        e.target.value
                                    )
                                }
                                placeholder="Example: Block 32"
                            />

                            <button
                                className="place-order-btn"
                                onClick={placeOrder}
                            >
                                Place Order
                            </button>

                        </>

                    )}

                </div>

            )}

        </>
    );
}


// ======================================================
// VENDOR DASHBOARD
// ======================================================

function VendorDashboard({ user, logout }) {

    const [vendor, setVendor] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [vendorOrders, setVendorOrders] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    

    const [menuForm, setMenuForm] = useState({
        name: "",
        description: "",
        price: "",
        category: "other"
    });


    // Fetch vendor and menu
    const fetchVendorData = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            const vendorResponse = await axios.get(
                "http://localhost:5000/api/vendors",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const myVendor = vendorResponse.data.vendors.find(
                (v) => v.owner?._id === user.id
            );

            if (!myVendor) {
                setMessage("No vendor found for your account.");
                return;
            }

            setVendor(myVendor);

            const menuResponse = await axios.get(
                `http://localhost:5000/api/menu/vendor/${myVendor._id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMenuItems(menuResponse.data.menuItems);

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Failed to fetch vendor data"
            );
        } finally {
            setLoading(false);
        }
    };

    

    




    useEffect(() => {
        fetchVendorData();
    }, []);


    // Handle form input
    const handleMenuChange = (e) => {
        setMenuForm({
            ...menuForm,
            [e.target.name]: e.target.value
        });
    };


    // Add menu item
    const addMenuItem = async (e) => {
        e.preventDefault();

        if (!menuForm.name || !menuForm.price) {
            setMessage("Item name and price are required.");
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const response = await axios.post(
                "http://localhost:5000/api/menu",
                {
                    vendor: vendor._id,
                    name: menuForm.name,
                    description: menuForm.description,
                    price: Number(menuForm.price),
                    category: menuForm.category
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMenuItems([
                ...menuItems,
                response.data.menuItem
            ]);

            setMessage("Menu item added successfully ✅");

            setMenuForm({
                name: "",
                description: "",
                price: "",
                category: "other"
            });

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Failed to add menu item"
            );
        }
    };


    // Toggle availability
    const toggleAvailability = async (item) => {
        try {
            const token = localStorage.getItem("token");

            const response = await axios.put(
                `http://localhost:5000/api/menu/${item._id}/availability`,
                {
                    isAvailable: !item.isAvailable
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMessage(
                `${item.name} availability updated successfully ✅`
            );

            setMenuItems((prevItems) =>
                prevItems.map((menuItem) =>
                    menuItem._id === item._id
                        ? response.data.menuItem
                        : menuItem
                )
            );

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Failed to update availability"
            );
        }
    };


    return (
        <div className="dashboard">

            <nav className="navbar">

                <h2>
                    CampusFlow 🍕
                </h2>

                <button
                    className="logout-btn"
                    onClick={logout}
                >
                    Logout
                </button>

            </nav>


            <div className="dashboard-content">

                <h1>
                    Welcome, {user.name} 👋
                </h1>

                <p className="role-text">
                    Vendor Dashboard
                </p>


                {message && (
                    <p className="message">
                        {message}
                    </p>
                )}


                {loading ? (

                    <p>
                        Loading vendor information...
                    </p>

                ) : vendor ? (

                    <>

                        {/* Vendor Information */}

                        <div className="dashboard-grid">

                            <div className="dashboard-card">

                                <div className="card-icon">
                                    🍕
                                </div>

                                <h3>
                                    {vendor.name}
                                </h3>

                                <p>
                                    📍 {vendor.location}
                                </p>

                                <p>
                                    📞 {vendor.phone}
                                </p>

                                <p>
                                    Category: {vendor.category}
                                </p>

                                <span
                                    className={
                                        vendor.isOpen
                                            ? "open"
                                            : "closed"
                                    }
                                >
                                    {vendor.isOpen
                                        ? "Open"
                                        : "Closed"}
                                </span>

                            </div>


                            <div className="dashboard-card">

                                <div className="card-icon">
                                    🍽️
                                </div>

                                <h3>
                                    Menu Items
                                </h3>

                                <p>
                                    Total menu items:
                                    {" "}
                                    {menuItems.length}
                                </p>

                                <button
                                    onClick={fetchVendorData}
                                >
                                    Refresh Menu
                                </button>

                            </div>


                            <div className="dashboard-card">

                                <div className="card-icon">
                                    📦
                                </div>

                                <h3>
                                    Orders
                                </h3>

                                <p>
                                    Manage incoming customer orders.
                                </p>

                            </div>

                        </div>


                        {/* Add Menu Item */}

                        <div className="cart-section">

                            <h2>
                                Add Menu Item 🍔
                            </h2>

                            <br />

                            <form onSubmit={addMenuItem}>

                                <label>
                                    Item Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Example: Veg Burger"
                                    value={menuForm.name}
                                    onChange={handleMenuChange}
                                />


                                <label>
                                    Description
                                </label>

                                <input
                                    type="text"
                                    name="description"
                                    placeholder="Fresh vegetable burger"
                                    value={menuForm.description}
                                    onChange={handleMenuChange}
                                />


                                <label>
                                    Price
                                </label>

                                <input
                                    type="number"
                                    name="price"
                                    placeholder="80"
                                    min="0"
                                    value={menuForm.price}
                                    onChange={handleMenuChange}
                                />


                                <label>
                                    Category
                                </label>

                                <select
                                    name="category"
                                    value={menuForm.category}
                                    onChange={handleMenuChange}
                                >
                                    <option value="other">
                                        Other
                                    </option>

                                    <option value="pizza">
                                        Pizza
                                    </option>

                                    <option value="burger">
                                        Burger
                                    </option>

                                    <option value="snacks">
                                        Snacks
                                    </option>

                                    <option value="beverages">
                                        Beverages
                                    </option>

                                    <option value="dessert">
                                        Dessert
                                    </option>
                                </select>


                                <button
                                    type="submit"
                                    className="place-order-btn"
                                >
                                    Add Menu Item
                                </button>

                            </form>

                        </div>


                        {/* Menu */}

                        <div className="menu-section">

                            <div className="menu-header">

                                <h2>
                                    Your Menu
                                </h2>

                            </div>


                            {menuItems.length === 0 ? (

                                <p>
                                    No menu items found.
                                </p>

                            ) : (

                                <div className="menu-grid">

                                    {menuItems.map((item) => (

                                        <div
                                            className="menu-card"
                                            key={item._id}
                                        >

                                            <div className="menu-icon">
                                                🍽️
                                            </div>

                                            <h3>
                                                {item.name}
                                            </h3>

                                            <p>
                                                {item.description}
                                            </p>

                                            <h4>
                                                ₹{item.price}
                                            </h4>

                                            <span
                                                className={
                                                    item.isAvailable
                                                        ? "available"
                                                        : "unavailable"
                                                }
                                            >
                                                {item.isAvailable
                                                    ? "Available"
                                                    : "Unavailable"}
                                            </span>


                                            <button
                                                onClick={() =>
                                                    toggleAvailability(item)
                                                }
                                            >
                                                {item.isAvailable
                                                    ? "Mark Unavailable"
                                                    : "Mark Available"}
                                            </button>

                                        </div>

                                    ))}

                                </div>

                            )}

                        </div>

                    </>

                ) : (

                    <p className="error-message">
                        {message || "Vendor not found."}
                    </p>

                )}

            </div>

        </div>
    );
}

// ======================================================
// DELIVERY DASHBOARD
// ======================================================

function DeliveryDashboard({ user, logout }) {
    const [orders, setOrders] = useState([]);
    const [myDeliveries, setMyDeliveries] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    // Fetch available orders
    const fetchAvailableOrders = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            const response = await axios.get(
                "http://localhost:5000/api/delivery/available",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setOrders(response.data.orders);

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Failed to fetch available orders"
            );
        } finally {
            setLoading(false);
        }
    };


    // Fetch my assigned deliveries
    const fetchMyDeliveries = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await axios.get(
                "http://localhost:5000/api/delivery/my-deliveries",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMyDeliveries(response.data.orders);

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Failed to fetch deliveries"
            );
        }
    };


    // Load data when dashboard opens
    useEffect(() => {
        fetchAvailableOrders();
        fetchMyDeliveries();
    }, []);


    // Accept order
    const acceptOrder = async (orderId) => {
        try {
            const token = localStorage.getItem("token");

            await axios.put(
                `http://localhost:5000/api/delivery/accept/${orderId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMessage("Order accepted successfully ✅");

            // Refresh both lists
            fetchAvailableOrders();
            fetchMyDeliveries();

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Failed to accept order"
            );
        }
    };


    // Update delivery status
    const updateStatus = async (orderId, status) => {
        try {
            const token = localStorage.getItem("token");

            await axios.put(
                `http://localhost:5000/api/delivery/status/${orderId}`,
                {
                    status: status
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMessage(
                `Order status updated to ${status} ✅`
            );

            fetchMyDeliveries();

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Failed to update status"
            );
        }
    };


    return (
        <div className="dashboard">

            {/* Navbar */}

            <nav className="navbar">

                <h2>
                    CampusFlow 🚚
                </h2>

                <button
                    className="logout-btn"
                    onClick={logout}
                >
                    Logout
                </button>

            </nav>


            <div className="dashboard-content">

                <h1>
                    Welcome, {user.name} 👋
                </h1>

                <p className="role-text">
                    Delivery Partner Dashboard
                </p>


                {/* Message */}

                {message && (
                    <p className="message">
                        {message}
                    </p>
                )}


                {/* Dashboard Cards */}

                <div className="dashboard-grid">

                    <div className="dashboard-card">

                        <div className="card-icon">
                            📦
                        </div>

                        <h3>
                            Available Orders
                        </h3>

                        <p>
                            Orders waiting for delivery partners.
                        </p>

                        <button
                            onClick={fetchAvailableOrders}
                        >
                            Refresh Orders
                        </button>

                    </div>


                    <div className="dashboard-card">

                        <div className="card-icon">
                            🚚
                        </div>

                        <h3>
                            My Deliveries
                        </h3>

                        <p>
                            Orders currently assigned to you.
                        </p>

                        <button
                            onClick={fetchMyDeliveries}
                        >
                            Refresh Deliveries
                        </button>

                    </div>


                    <div className="dashboard-card">

                        <div className="card-icon">
                            📊
                        </div>

                        <h3>
                            Delivery Stats
                        </h3>

                        <p>
                            Track your delivery performance.
                        </p>

                    </div>

                </div>


                {/* Available Orders */}

                <div className="orders-section">

                    <h2>
                        Available Orders ({orders.length})
                    </h2>


                    {loading ? (

                        <p>
                            Loading orders...
                        </p>

                    ) : orders.length === 0 ? (

                        <p>
                            No orders are currently available.
                        </p>

                    ) : (

                        <div className="orders-grid">

                            {orders.map((order) => (

                                <div
                                    className="order-card"
                                    key={order._id}
                                >

                                    <h3>
                                        {order.vendor?.name}
                                    </h3>

                                    <p>
                                        📍 Vendor:
                                        {" "}
                                        {order.vendor?.location}
                                    </p>

                                    <p>
                                        🎓 Student:
                                        {" "}
                                        {order.student?.name}
                                    </p>

                                    <p>
                                        📞 Phone:
                                        {" "}
                                        {order.student?.phone}
                                    </p>

                                    <p>
                                        📍 Delivery:
                                        {" "}
                                        {order.student?.block}
                                    </p>

                                    <p>
                                        💰 Total:
                                        {" "}
                                        ₹{order.totalAmount}
                                    </p>

                                    <div className="order-items">

                                        {order.items.map(
                                            (item, index) => (

                                                <p key={index}>
                                                    {item.name}
                                                    {" × "}
                                                    {item.quantity}
                                                </p>

                                            )
                                        )}

                                    </div>


                                    <button
                                        className="place-order-btn"
                                        onClick={() =>
                                            acceptOrder(order._id)
                                        }
                                    >
                                        Accept Order 🚚
                                    </button>

                                </div>

                            ))}

                        </div>

                    )}

                </div>


                {/* My Deliveries */}

                <div className="orders-section">

                    <h2>
                        My Deliveries ({myDeliveries.length})
                    </h2>


                    {myDeliveries.length === 0 ? (

                        <p>
                            You don't have any assigned deliveries.
                        </p>

                    ) : (

                        <div className="orders-grid">

                            {myDeliveries.map((order) => (

                                <div
                                    className="order-card"
                                    key={order._id}
                                >

                                    <h3>
                                        {order.vendor?.name}
                                    </h3>

                                    <p>
                                        📍 Vendor:
                                        {" "}
                                        {order.vendor?.location}
                                    </p>

                                    <p>
                                        🎓 Student:
                                        {" "}
                                        {order.student?.name}
                                    </p>

                                    <p>
                                        📞 Phone:
                                        {" "}
                                        {order.student?.phone}
                                    </p>

                                    <p>
                                        📍 Delivery:
                                        {" "}
                                        {order.student?.block}
                                    </p>

                                    <p>
                                        💰 Total:
                                        {" "}
                                        ₹{order.totalAmount}
                                    </p>

                                    <p>
                                        🚦 Status:
                                        {" "}
                                        <strong>
                                            {order.status}
                                        </strong>
                                    </p>


                                    <div className="order-items">

                                        {order.items.map(
                                            (item, index) => (

                                                <p key={index}>
                                                    {item.name}
                                                    {" × "}
                                                    {item.quantity}
                                                </p>

                                            )
                                        )}

                                    </div>


                                    {/* Status buttons */}

                                    <button
                                        className="place-order-btn"
                                        onClick={() =>
                                            updateStatus(
                                                order._id,
                                                "preparing"
                                            )
                                        }
                                        disabled={
                                            order.status === "preparing" ||
                                            order.status === "ready" ||
                                            order.status === "out_for_delivery" ||
                                            order.status === "delivered"
                                        }
                                    >
                                        Preparing
                                    </button>


                                    <button
                                        className="place-order-btn"
                                        onClick={() =>
                                            updateStatus(
                                                order._id,
                                                "ready"
                                            )
                                        }
                                        disabled={
                                            order.status === "ready" ||
                                            order.status === "out_for_delivery" ||
                                            order.status === "delivered"
                                        }
                                    >
                                        Ready
                                    </button>


                                    <button
                                        className="place-order-btn"
                                        onClick={() =>
                                            updateStatus(
                                                order._id,
                                                "out_for_delivery"
                                            )
                                        }
                                        disabled={
                                            order.status === "out_for_delivery" ||
                                            order.status === "delivered"
                                        }
                                    >
                                        Out for Delivery 🚚
                                    </button>


                                    <button
                                        className="place-order-btn"
                                        onClick={() =>
                                            updateStatus(
                                                order._id,
                                                "delivered"
                                            )
                                        }
                                        disabled={
                                            order.status === "delivered"
                                        }
                                    >
                                        Delivered ✅
                                    </button>

                                </div>

                            ))}

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
}

export default App;