import prisma from '@packages/libs/prisma';

import cron from 'node-cron';

cron.schedule('0 * * * *', async () => {

    try {
         const now = new Date();

         const deletedProducts = await prisma.products.deleteMany({
            where :{
                isDeleted:true,
                deletedAt : {lte:now}
            }
         })

         console.log(`Deleted ${deletedProducts.count} products permanently.`);
    } catch (error) {
        console.log(error);
    }
})