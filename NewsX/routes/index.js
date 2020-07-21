var express = require('express');
var authModel = require('../models/authModel');
const User = require('../schemas/userSchema')
const axios = require('axios');
const nodemailer = require("nodemailer");
const puppeteer = require('puppeteer')
// const convertHTMLToPDF = require("pdf-puppeteer");
const fs = require('fs');
const { route } = require('.');
var router = express.Router();

router.get('/dashboard',(req,res,next)=>{
    fs.readFile('./data.js','utf-8',(err, data)=>{
        if (err) throw err
        if(data){
            userdata = JSON.parse(data)
            user = userdata[0]
            axios.get('http://newsapi.org/v2/top-headlines?' +
            'sources=bbc-news&' +
            'apiKey=b4afd34289b4419cb09ecac98c2fab48')
            .then(function (response) {
                // handle success
                res.render('dashboard', { mydata: {newsdata : response.data.articles, user : user} });
                // fs.writeFile('./data.js', '', function(){console.log('Done my boy!')})
            })
        }
        else{
            res.redirect('/api/user/register');
        }       
    });
});


router.get('/',(req,res,next)=>{
    res.render('home');
    res.status(200);
})


router.post('/download/:id',(req,res,next)=>{
    async function printPDF(myu) {
        const browser = await puppeteer.launch({ headless: true,args: [
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--hide-scrollbars',
            '--disable-web-security',
            ],
        });
        const page = await browser.newPage();
        await page.goto(myu, {waitUntil: 'networkidle2'});
        page.on('request', (request) => {
            if (['image', 'video', 'font', 'script'].indexOf(request.resourceType()) !== -1) {
                request.abort();
            } else {
                request.continue();
            }
        });
        const pdf = await page.pdf({ format: 'A4', margin: {
            top: 30,
            right: 0,
            bottom: 50,
            left: 0,
          },
          pageRanges: '1-2',
          displayHeaderFooter:false
        });    
        await browser.close();
        return pdf
      }
      axios.get('http://newsapi.org/v2/top-headlines?' +
            'sources=bbc-news&' +
            'apiKey=b4afd34289b4419cb09ecac98c2fab48')
            .then(function (response) {
                printPDF(response.data.articles[req.params.id].url).then(pdf=>{
                    res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdf.length })
	                res.send(pdf)
                }).catch(err=>{
                    console.log(err);
                })
    });
});
// response.data.articles
router.post('/mail/:id',(req,res,next)=>{
    const email22 = req.body.email
    console.log(email22)
    axios.get('http://newsapi.org/v2/top-headlines?' +
            'sources=bbc-news&' +
            'apiKey=b4afd34289b4419cb09ecac98c2fab48')
            .then(function (response) {
                const sendNewsTitle = response.data.articles[req.params.id].title
                const sendNewsDes = response.data.articles[req.params.id].description
                const sendNewsUrl = response.data.articles[req.params.id].url
                const sendNewsUrlImage = response.data.articles[req.params.id].urlToImage
                const publishTime = response.data.articles[req.params.id].publishedAt
                let mailTransporter = nodemailer.createTransport({ 
                    service: 'gmail', 
                    auth: { 
                        user: 'example@gmail.com', 
                        pass: 'Your_Password'
                    } 
                }); 
                  
                let mailDetails = { 
                    from: 'example@gmail.com', 
                    to: `${email22}`, 
                    subject: 'Important news from NewsX exclusively for you!',
                    text: `${sendNewsTitle} \n\n${sendNewsDes} \n\n Time: ${publishTime} \n\nTo read more click here: ${sendNewsUrl}`
                }; 
                  
                mailTransporter.sendMail(mailDetails, function(err, data) { 
                    if(err) { 
                        console.log('Error Occurs'); 
                    } else { 
                        console.log('Email sent successfully'); 
                    }
                    res.redirect('/dashboard') 
                }); 
    });    
});


module.exports = router
