import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

const initializeConfig = async()=>{
    try {
        const exisxtConfig = await prisma.site_config.findFirst();
        if(!exisxtConfig)
            await prisma.site_config.create({
        data : {
            categories : [
                "Electroincs",
                "Fashion",
                "Home & Kitchen",
                "Sport and Fitness"
            ],
            subCategories :{
                "Electroincs" : ["Mobiles","Laptops","Cameras","Headphones"],
                "Fashion" : ["Men's Clothing","Women's Clothing","Accessories"],
                "Home & Kitchen" : ["Furniture","Appliances","Decor"],
                "Sport and Fitness" : ["Exercise Equipment","Outdoor Gear","Sportswear"]
            }
        }
    })
    } catch (error) {
        console.log('error initiliazing site config',error);
    }
}
export default initializeConfig;