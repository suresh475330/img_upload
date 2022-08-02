const express = require("express")
const app = express()
require("dotenv").config()
const fs = require('fs');
const path = require('path');
const connectDB  = require("./db/connect")
const multer = require('multer');
const imgModel = require("./models/imageUpload")
const postModel = require("./models/post")


// body passer
app.use(express.json())
app.use(express.urlencoded({extended : false}))

// Set EJS as templating engine 
app.set("view engine", "ejs");



const storage = multer.diskStorage({
    destination : (req,file,cb) => {
        cb(null,"uploads")
    },
    filename : (req,file,cb) => {

        cb(null, Date.now() + "_" + file.originalname)
    }
})
const upload = multer({storage : storage})


  
app.get('/', (req, res) => {
    imgModel.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
            res.render('imagesPage', { items: items });
        }
    });
});

 
app.post('/', upload.single('image'),(req, res, next) => {
  
    var obj = {
        name: req.body.name,
        desc: req.body.desc,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType: 'image/png'
        }
    }
    imgModel.create(obj, (err, item) => {
        if (err) {
            console.log(err);
        }
        else {
            item.save();
            res.redirect('/');
        }
    });
});

app.post("/blogpost",upload.single("image"), async (req,res) => {
    // convert the img to buffer 
        const  data =  fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename))


    // convert the buffer to img src
    const b64 = Buffer.from(data).toString('base64');
    // CHANGE THIS IF THE IMAGE YOU ARE WORKING WITH IS .jpg OR WHATEVER
    const mimeType = 'image/png'; // e.g., image/png
    
    const src = `data:${mimeType};base64,${b64}`

    // res.status(200).send(`<img src="data:${mimeType};base64,${b64}" />`);

    const obj = {
        title : req.body.name,
        dec : req.body.desc,
        img : src
    }
    const post = await postModel.create(obj)
    res.status(200).json({post})
})

app.use("*",(req,res)=>{
    res.status(404).send(`Can't find the page/Route`)
})






const port = process.env.PORT || 3000

const Start =  async () =>{
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(port,() => {
            console.log(`Server is runing on port ${port}...`);
        })
    } catch (error) {
        console.log(error);
    }
}

Start();