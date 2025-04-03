import Product from "../model/product.model.js";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const razorpay=new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY, 
    key_secret: process.env.RAZORPAY_API_SECRET, 
})

export const createProduct = async (req, res) => {
try{
    const{
        title,
        description,
        price,
        category
    } = req.body;

    if(!title || !price || !category){
        return res.status(400).json({message:"Please fill all the required fields"});
    }

    const imageUrls=req.files.map((file)=>{
        file.path;
    })


    const sellerId=req.user._id;
    const newproduct = new Product({
        title,
        description,
        price,
        category,
        images:imageUrls,
        sellerId
    });

    await newproduct.save();
    res.status(201).json({message:"Product created successfully"});
}catch(error){
    res.status(500).json({message:"Internal server error in creating product"});
}
};

export const updateProduct = async(req,res)=>{
try{
    const {
        title,
        description,
        price,
        category
    } = req.body;

    const productId=req.params;

    const product = await Product.findById(productId);
    if(!product){
        return res.status(404).json({message:"Product not found"});
    };
    const sellerId=req.user._id;
    if(product.sellerId.toString()!==sellerId.toString()){
        return res.status(403).json({message:"You are not authorized to update this product"});
    };
    let imageUrls=product.images;
    if(req.files && req.files.length > 0){
        imageUrls=req.files.map(file=>file.path);
    }

    product = await Product.findOneAndUpdate(productId,{
        title,description,price,category,images:imageUrls
    },{new:true});

    res.json(product);
}
catch(error){
    res.status(500).json({message:"Internal server error in updating product"});
}
};

export const deleteProduct = async(req,res)=>{
    try {

        const {id}=req.params;
        const product = await Product.findById(id);
        if(!product) return res.status(404).json({message:"Product not found"});
        const sellerId=req.user._id;
        if(product.sellerId.toString()!==sellerId.toString()){
            return res.status(403).json({message:"You are not authorized to delete this product"});
        };
        await product.deleteOne();
        res.json({message:"Product deleted successfully"}); 

    } catch (error) {
        res.status(500).json({message:"Internal server error in deleting product"});
    }
};

export const markProductsAsSold = async(req,res)=>{
    try {
        const{id}=req.params;
        const product = await Product.findById(id);
        if(!product) return res.status(404).json({message:"Product not found"});
        const sellerId=req.user._id;
        if(product.sellerId.toString()!==sellerId.toString()){
            return res.status(403).json({message:"You are not authorized to mark this product as sold"});
        };
        product.sold=true;
        await product.save();
        res.json({message:"Product marked as sold successfully"});
    } catch (error) {
        res.status(500).json({message:"Internal server error in marking product as sold"});
    }
}

export const getMyListings = async(req,res)=>{
    try {
        const sellerId = req.user._id;
        const products = await Product.find({ sellerId }).sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "Error fetching listings" });
    }
}

export const getProductById = async(req,res)=>{
    try {
        const {id} =req.params;
        const product = await Product.findById(id);
        if(!product) return res.status(404).json({message:"Product not found"});
        res.json(product);
    } catch (error) {
        res.status(500).json({message:"Internal server error in fetching product"});
    }

}

export const getAllProducts = async(req,res)=>{
    try {
        const products = await Product.find({sold:false}).populate("sellerId","name email");
        res.json(products);
    } catch (error) {
        res.status(500).json({message:"Internal server error in fetching products"});
    }
}

export const getUserOrders = async(req,res)=>{
try {
    const userId=req.user._id;
    const orders = await Product.find({buyerId:userId})
    .populate("sellerId","name email")
    .sort({createdAt:-1});
    res.status(200).json(orders);
} catch (error) {
    res.status(500).json({message:"Internal server error in fetching orders"});
}
};

export const buyNow = async(req,res)=>{
    try {
        const {productId}=req.params;
    const buyerId=req.body;

    const product = await Product.findById(productId);
    if(!product) return res.status(404).json({message:"Product not found"});
    if(product.sold) return res.status(400).json({message:"Product already sold"});
    if(product.sellerId.toString()===userId.toString()) return res.status(400).json({message:"You cannot buy your own product"});
    if(!product.price || isNaN(product.price)) return res.status(400).json({message:"Invalid product price"});
    
    const options={
        amount:product.price*100,
        currency:"INR",
        receipt:`receipt_order_${product._id}`,
    };

    const order = await razorpay.orders.create(options);
    if(!order) return res.status(500).json({message:"failed to create order"});

    res.status(200).json({
        orderId: order.id,
        productId: product._id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_API_KEY,
    });

    } catch (error) {
        console.log("error in buy now",error);
        res.status(500).json({message:"Internal server error in buying product"});
    }
}

export const verifyPayment = async(req,res)=>{
    try {
        const{
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature, 
            productId, 
            buyerId
        }=req.body;

        const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

        if(generatedSignature !== razorpay_signature){
            return res.status(400).json({message:"Invalid payment verification"});
        };

        const product= await Product.findById(productId);
        if(!product) return res.status(404).json({message:"Product not found"});

        product.sold=true;
        product.buyerId=buyerId;
        await product.save();

        res.status(200).json({message:"Payment verified successfully"});
  
    } catch (error) {
        res.status(500).json({message:"Internal server error in verifying payment"});
    }
}


export default {
    createProduct,
    updateProduct,
    deleteProduct,
    getMyListings,
    getProductById,
    getAllProducts,
    markProductsAsSold,
    buyNow,
    verifyPayment,
    getUserOrders
}