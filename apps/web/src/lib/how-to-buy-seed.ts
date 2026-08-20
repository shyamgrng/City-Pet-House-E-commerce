import type { HowToBuyContent } from "./how-to-buy-types";

export const howToBuySeed: HowToBuyContent = {
  intro:
    "Shopping for your pet has never been easier. Follow these simple steps to order quality pet food, accessories, supplements, and pet care products from City Pet House. Our secure online ordering system allows you to select products, make digital payments, and receive your order at your doorstep.",
  steps: [
    {
      icon: "👤",
      title: "Create Your City Pet House Account",
      desc: "To place an order, first create your customer account.",
      items: ['Click "Register/Login".', "Enter your name, email, phone number, and password.", "Verify your account.", "Login to start shopping."],
      benefits: "Track orders, save delivery details, view purchase history, and receive order updates.",
      video: "How to Create an Account",
    },
    {
      icon: "🛒",
      title: "Browse and Select Pet Products",
      desc: "Explore our online store and choose products suitable for your pet — dog food, cat food, supplements, grooming products, toys, accessories, and health care products.",
      items: ["Search for your required product.", "Read product details.", "Select quantity.", 'Click "Add to Cart".'],
      video: "How to Search and Add Products to Cart",
    },
    {
      icon: "📋",
      title: "Review Your Order",
      desc: "Before checkout, check selected products, confirm quantity, and review the total amount, then proceed to checkout.",
      items: [],
    },
    {
      icon: "📍",
      title: "Provide Your Delivery Information",
      desc: "Enter your correct delivery details — full name, contact number, delivery address, and location. Currently available delivery areas: Kathmandu, Lalitpur, Bhaktapur.",
      items: [],
      note: "Please provide accurate contact details to ensure smooth delivery.",
      video: "How to Add Delivery Address",
    },
    {
      icon: "📱",
      title: "Complete Your Payment",
      desc: "City Pet House uses secure QR-based digital payment.",
      items: ["Select QR Payment option.", "Scan the displayed QR code.", "Complete your payment using your preferred banking app.", "Save your payment confirmation screenshot."],
      benefits: "Accepted payment methods: QR Banking Payment, Digital Wallets (when available).",
      video: "How to Make QR Payment",
    },
    {
      icon: "📤",
      title: "Submit Your Payment Proof",
      desc: "After completing payment, upload your payment receipt/screenshot, confirm payment details, and click Submit.",
      items: [],
      benefits: "Our team will verify your payment before processing your order.",
      video: "How to Upload Payment Receipt",
    },
    {
      icon: "✅",
      title: "We Confirm Your Order",
      desc: "After receiving your payment receipt, our admin team will verify payment, confirm product availability, approve your order, and start order processing. You will receive updates through email at each stage.",
      items: [],
    },
    {
      icon: "🚚",
      title: "Track Your Order Until Delivery",
      desc: "You will receive email notifications for: order received, payment verified, order confirmed, order prepared, and order dispatched. Your order will then be delivered to your selected location.",
      items: [],
    },
  ],
};
