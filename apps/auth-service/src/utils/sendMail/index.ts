import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import ejs from 'ejs';
import path from 'path';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: true, // use TLS
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // using SMTP_PASS to match .env file
    }
});

// render an ejs template here

const renderEmailTemplate = async(templateName:string, data:Record<any,string>): Promise<string>=>{

    const templatePath = path.join(

        process.cwd(),
          'apps',
           'auth-service',
           'src',
           'utils',
           'email-templates', 
          `${templateName}.ejs`
    );

    return ejs.renderFile(templatePath, data);

}


// send an email using nodemailer

export const sendEmail = async(to: string, subject: string, templateName: string, data: Record<any,string>) => {
    try {
        if (!to || typeof to !== 'string') {
            throw new Error('Invalid recipient email address');
        }

        const html = await renderEmailTemplate(templateName, data);
        
        const mailOptions = {
            from: {
                name: 'Eshop',
                address: process.env.SMTP_USER || ''
            },
            to: to.trim(),
            subject: subject,
            html: html,
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', result.messageId);
        return true;
        
    } catch (error) {
        console.error('Error sending mail:', error);
        return false;   
    }
}
