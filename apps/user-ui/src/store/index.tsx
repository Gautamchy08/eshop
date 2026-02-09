import { sendKafkaEvent } from '@/actions/track-user';
import {create} from 'zustand';
import {persist} from 'zustand/middleware';


type Product = {
    id : string;
    title : string;
    image : string;
    shopId : string;
    quantity?:number;
    price : number;
}

type Store = {
    cart : Product[];
    wishlist : Product[];
    addToCart : (
        product : Product,
        user :any,
        location : any,
        deviceInfo : any

    )=> void;
    removeFromCart : (
        product : Product,
        user :any,
        location : any,
        deviceInfo : any

    )=> void;
    addToWishlist : (
        product : Product,
        user :any,
        location : any,
        deviceInfo : any

    )=> void;
    removeFromWishlist : (
        product : Product,
        user :any,
        location : any,
        deviceInfo : any

    )=> void;
} 

export const useStore = create<Store>()(
    persist(
            (set,get)=>({
                cart :[],
                wishlist : [],

                // add to cart
                addToCart : (product,user,location,deviceInfo)=>{
                   

                    set((state)=>{

                        const existing = state.cart?.find((item)=> item.id === product.id);

                        if(existing){
                            return {
                                cart : state.cart.map((item)=>item.id===product.id ?{...item, quantity: (item.quantity ?? 1) + 1 } : item)
                            }
                        };
                        return {cart : [...state.cart, {...product, quantity:1}]}
                    });
                    //  send event to the server for tracking
                    console.log('[DEBUG Store] addToCart called with:', { userId: user?.id, location, deviceInfo });
                    if(user?.id && location && deviceInfo){
                        console.log('[DEBUG Store] Conditions met, calling sendKafkaEvent');
                        sendKafkaEvent({
                            userId : user?.id,
                            productId : product?.id,
                            shopId : product?.shopId,
                            action : 'add_to_cart',
                            country : location.country|| 'Unknown',
                            city : location.city,
                            device : deviceInfo,
                        })
                        
                    } else {
                        console.log('[DEBUG Store] Conditions NOT met, skipping sendKafkaEvent');
                    }
                    
                   
                },
                // remove from cart
                removeFromCart : (product,user,location,deviceInfo)=>{
                    // get the products in the cart
                    const removedProduct = get().cart.find((item)=> item.id === product.id);
                    console.log('[DEBUG Store] removeFromCart called:', { 
                        productId: product?.id,
                        userId: user?.id,
                        location,
                        deviceInfo,
                        removedProduct: removedProduct?.id
                    });
                    set((state)=>({
                        cart:state.cart?.filter((item)=> item.id !== product.id)
                    }))

                     //  send event to the server for tracking
                    if(user?.id && location && deviceInfo&& removedProduct){
                        console.log('[DEBUG Store] removeFromCart conditions met, sending event');
                        sendKafkaEvent({
                            userId : user?.id,
                            productId : removedProduct?.id,
                            shopId : removedProduct?.shopId,
                            action : 'remove_from_cart',
                            country : location.country|| 'Unknown',
                            city : location.city,
                            device : deviceInfo,
                        })
                        
                    } else {
                        console.log('[DEBUG Store] removeFromCart conditions NOT met');
                    }
                },
                // add to wishlist
                addToWishlist : (product,user,location,deviceInfo)=>{
                    set((state)=>{
                        if(state.wishlist.find((item)=> item.id === product.id)){
                            return state;
                        }
                        return {wishlist : [...state.wishlist, product]}
                    })

                     //  send event to the server for tracking
                    if(user?.id && location && deviceInfo){

                        sendKafkaEvent({
                            userId : user?.id,
                            productId : product?.id,
                            shopId : product?.shopId,
                            action : 'add_to_wishlist',
                            country : location.country|| 'Unknown',
                            city : location.city,
                            device : deviceInfo,
                        })
                        
                    }
                    

                },
                // remove from wishlist
                removeFromWishlist : (product,user,location,deviceInfo)=>{

                    const removeProduct = get().wishlist.find((item)=> item.id === product.id);
                    set((state)=>({
                        wishlist:state.wishlist?.filter((item)=> item.id !== product.id)
                    }));

                     //  send event to the server for tracking
                    if(user?.id && location && deviceInfo &&removeProduct){

                        sendKafkaEvent({
                            userId : user?.id,
                            productId : removeProduct?.id,
                            shopId : removeProduct?.shopId,
                            action : 'remove_from_wishlist',
                            country : location.country|| 'Unknown',
                            city : location.city,
                            device : deviceInfo,
                        })
                        
                    }
                }
            }),{name:'store-storage'}
    )
)