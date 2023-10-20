const nodemailer = require('nodemailer');
const { User } = require('../models');

class MailService{
    constructor()
    {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port:process.env.SMTP_PORT,
            secure:false,
            auth:{
                user:process.env.SMTP_USER,
                pass:process.env.SMTP_PASSWORD,
            }
        })        
    }
    async sendActivationMail(to,link)
    {
        await this.transporter.sendMail({
            from:process.env.SMTP_USER,
            to,
            subject:'Account activation on '+ process.env.PROJECT_NAME,
            text:'123',
            html:`
                    <div>
                    <h1>Press on the link to activate your account</h1>
                    <a href="${link}">${link}</a>
                    </div>
            `
        })
    }
    
}

module.exports = new MailService;