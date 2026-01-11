import { AuthError, NotFoundError, ValidationError } from "@packages/error-handler";
import {imageKit} from "@packages/libs/imagekit";
import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
//  get product categories

const prisma = new PrismaClient();

export const getCategories = async (req:Request, res:Response, next:NextFunction) => {

    try {
       
        const config = await prisma?.site_config.findFirst();

        if(!config){

            return res.status(404).json({error : 'Site configuration not found'});
        }
        return res.status(200).json({
            categories : config.categories,
            subCategories : config.subCategories
        });
    } catch (error) {
        return next(error);
    }

}

export const createDiscountCodes = async (req:Request, res:Response, next:NextFunction) => {

    try {
        if (!req.seller) {
            return res.status(401).json({ error: 'Seller not authenticated' });
        }

        const {public_name,discountType,discountValue,discountCode} = req.body;

        const isDiscountCodeExist = await prisma.discount_codes.findFirst({
            where : {
                 discountCode
            }
        });
        if(isDiscountCodeExist){
            return res.status(400).json({error : 'Discount code already exists'});
        }
        const discount_code = await prisma.discount_codes.create({
            data : {
                public_name,
                discountType,
                discountValue: parseInt(discountValue),
                discountCode,
                sellerId : req.seller.id
            }
        });

        return res.status(201).json({message : 'Discount code created successfully', discount_code});
    } catch (error) {
        return next(error);
    }
}


export const getDiscountCodes = async (req:Request, res:Response, next:NextFunction) => {

    try {
        if (!req.seller) {
            return res.status(401).json({ error: 'Seller not  authenticated' });
            }

        const discount_codes = await prisma.discount_codes.findMany({
            where : {
                sellerId : req.seller.id
            }
        }); 
        return res.status(200).json({discount_codes});
    } catch (error) {
        return next(error);
    }   
}


export const deleteDiscountCode = async (req:Request, res:Response, next:NextFunction) => {

    try {
        const {id} = req.params;
        const sellerId = req.seller?.id;

        const discountCode = await prisma.discount_codes.findUnique({
            where : {id},
            select : {id  : true, sellerId : true}
        })

        if(!discountCode){
            return next(new NotFoundError('Discount code not found'));

        }
        if(discountCode.sellerId !== sellerId){
            return res.status(403).json({error : 'Unauthorized to delete this discount code'});
        }

        await prisma.discount_codes.delete({
            where : {id}
        });
        return res.status(200).json({message : 'Discount code deleted successfully'});
    } catch (error) {
        return next(error);
    }
}

//  upload product images

export const uploadProductImage = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const {imageBase64 } = req.body;

        if(!    imageBase64){
            return res.status(400).json({error : 'File is required'});
        }

        const response = await imageKit.files.upload ({
            file:   imageBase64,
            fileName :`product-${Date.now()}.jpg`,
            folder : '/products'
        })
        console.log('consoling response on image-upload',response);
        res.status(201).json({
            file_url:response.url,
            fileId : response.fileId,
            success : true
        })
    } catch (error) {
        console.log('error occuring in image upload',error);
        return next(error);
    }

}

//  delete product images

export const deleteProductImage = async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const {fileId} = req.body;

        if(!fileId){
            return res.status(400).json({error : 'fileId is required'});
        }

        const response = await imageKit.files.delete(fileId);
        res.status(200).json({
            success : true,
            message : 'Image deleted successfully',
            response 
        });

    }catch(error){
         return next(error);
    }
}

// crete Product controller functions here

export const createProduct = async(req:Request,res:Response,next:NextFunction)=>{

    try {
        const{
            title,
            short_description,
            detailed_description,
            warranty,
            custom_specifications,
            slug,
            tags,
            cash_on_delivery,
            brand,
            video_url,
            category,
            colors = [],
            sizes = [],
            discountCodes,
            stock,
            sale_price,
            regular_price,
            subCategory,
            custom_properties = [],
            images = []
        } = req.body;

    if(!title || !slug  || !short_description || !category || !subCategory || !stock || !sale_price || !regular_price || !images || !tags ){
         return next (new ValidationError('Required fields are missing'));
    }
     
    if(!req.seller?.id){
        return next(new AuthError('only seller can create product'));
    }
    
    const slugChecking = await prisma.products.findUnique({
        where : {
            slug
        }
    })

    if(slugChecking){
        return next (new ValidationError('Product with this slug already exists'));
    }

    const newProduct = await prisma.products.create({
        data : {
            title,
            short_description,
            detailed_description,
            warranty,
            cash_on_delivery,
            slug,
            sellerId: req.seller?.id!,
            shopId:req.seller?.shop?.id,
            tags : Array.isArray(tags)?tags:tags.split(','),
            brand,
            video_url,
            category,
            subCategory,
            colors : colors||[],
            discount_codes : discountCodes ? discountCodes.map((codeId:string)=>codeId) : [],
            sizes : sizes||[],
            stock : parseInt(stock), 
            sale_price : parseFloat(sale_price),
            regular_price : parseFloat(regular_price),
            custom_specifications : custom_specifications||{},
            custom_properties : custom_properties||{},
            images: {
                create : images.filter((img:any)=>img&&img.file_url&&img.fileId).map((image:any)=>({
                file_id: image.fileId,
                url : image.file_url
            }))
            }
        },
        include : {
            images:true
        }
    })
    console.log('response from create-product',newProduct);
    res.status(200).json({
        messages : ' finally Product created successfully',
        success:true,
        newProduct

    })
    
    
    } catch (error) {
        return next(error);
        
    }
}

// get logged in seller Products

export const getShopProducts = async(req:Request,res:Response,next:NextFunction)=>{
    try {
           

        const products = await prisma.products.findMany({

            where : {
                shopId : req.seller?.shop?.id
            },
            include : {
                images : true   
            }
        });

        res.status(200).json({
            products,
            success : true
        })
        
    } catch (error) {
       return next(error); 
    }
}

// delete product

export const deleteProduct = async (req:Request,res:Response,next:NextFunction)=>{
    try {
       const {productId} = req.params
        const sellerId  = req.seller?.id

        if(!productId){
           return next (new ValidationError('productId is required') ); 
        }

        const product = await prisma.products.findUnique({
            where : {id:productId},
            select : {id:true,sellerId:true,isDeleted:true}
        })
        if(!product){
            return next ( new NotFoundError('product not found'))
        }

        if(product.sellerId!==sellerId){
            return next (new AuthError('Unauthorized to delete this product'));
        }
        if(product.isDeleted){
            return next(new ValidationError('product is already deleted'))
        }

        const deletedProduct = await prisma.products.update({
            where : {id:productId},
            data : {
                isDeleted : true,
                deletedAt : new Date(Date.now() + 24*60*60*1000)
            }
        })

       return res.status(200).json({
            message : 'Product is scheduled for deletion. You can restore it within 24 hours.',
            deletedAt : deletedProduct.deletedAt
        })

    } catch (error) {
      return next(error);   
    }
}

// restore Product

export const restoreProduct = async (req:Request,res:Response,next:NextFunction)=>{

    try {
               const {productId} = req.params
        const sellerId  = req.seller?.shop?.id

        const product = await prisma.products.findUnique({
            where : {id:productId},
            select : {id:true,shopId:true,isDeleted:true}
        })
        if(!product){
            return next ( new NotFoundError('product not found'))
        }

        if(product.shopId!==sellerId){
            return next (new AuthError('Unauthorized to delete this product'));
        }
        
        if(!product.isDeleted){
            return next(new ValidationError('product is not deleted'))
        }
         
        await prisma.products.update({
            where : {id:productId},
            data : {
                isDeleted : false,
                deletedAt : null
            }
        })
        return res.status(200).json({
            message: "product restore successfully"
        })
    } catch (error) {

        return res.status(500).json({message : "Error restoring product "})
        
    }
}