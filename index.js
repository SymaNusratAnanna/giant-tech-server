
const express = require('express');
const cors = require('cors');
const jwt = require ('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, MongoRuntimeError, ObjectId } = require('mongodb');
const res = require('express/lib/response');
const app = express()
const port = process.env.PORT ||5000;

app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7ovuwbj.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


 async function run(){

    try{
         await client.connect();
        const toolCollection = client.db('giant-tech').collection('tools');

        const userCollection = client.db('giant-tech').collection('users');
 
        app.get('/tool', async (req, res)=>{
            const query = {};
            const cursor = toolCollection.find(query);
            const  tools = await cursor.toArray();
            res.send(tools);
        });

        app.get('/tool/:id' , async(req, res)=>{
          const id= req.params.id;
          const query={_id:ObjectId(id)};
          const tool = await toolCollection.findOne(query);
          res.send(tool);
        });

        app.put('/user/:email', async(req, res)=>{
          const email = req.params.email;
          const user = req.body;
          const filter = {email: email};
          const options = { upsert: true};
          const updateDoc = {
            $set: user,
          };
          const result = await userCollection.updateOne(filter,updateDoc,options);
          const token = jwt.sign({email: email}, process.env.ACCESS_TOKEN_SECRET,{ expiresIn: '1h'})
          res.send({result, token});
        })

        //POST 
        app.post('/tool', async(req, res)=>{
         const newtool= req.body;
         const result = await toolCollection.insertOne(newtool);
         res.send(result);
        });

        //DELETE
         app.delete('/tool/:id', async(req, res) =>{
           const id = req.params.id;
           const query = {_id: ObjectId(id)};
           const result = await toolCollection.deleteOne(query);
           res.send(result);
         });
      
    }
    finally{

    }

}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})