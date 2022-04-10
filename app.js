const express = require("express");
const app = express();
const bodyParser=require("body-parser");
const _=require("lodash");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));


app.set('view engine','ejs');


const mongoose=require("mongoose");
mongoose.connect("mongodb://localhost:27017/listdb");

const itemschema=new mongoose.Schema({
    name:String
});
const Item=mongoose.model("Item",itemschema);
const item1=new Item({
    name:"Welcome to Todo List"
})
const item2=new Item({
    name:"Hit the + to add new items"
});
const item3=new Item({
    name:"<-- Hit this to delete an item"
});
const defaultvalue=[item1,item2,item3];

const listschema={
    name:String,
    items:[itemschema]
}
const List=mongoose.model("List",listschema);

app.get("/",(req,res)=>{
    Item.find(function(err,founditems){
        if(founditems.length==0){
          Item.insertMany(defaultvalue,function(){
          })
          res.redirect("/");
        }
            res.render("list",{listtitle:"Today",newItems:founditems})
    
    })
})

app.post("/",(req,res)=>{
     const itemName=req.body.work;
     const listName=req.body.list;
      const item=new Item({
        name:itemName
    });
    if(listName=="Today"){
        item.save();
        res.redirect("/")
    }
    else{
        List.findOne({name:listName},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName)
        })
    }
})

app.post("/delete",(req,res)=>{
    const checkedItemId=req.body.checkbox;
    const listName=req.body.listName;
    if(listName=="Today"){
        Item.findByIdAndRemove(checkedItemId,function(){
            res.redirect("/")
    })
}
else{
List.findOneAndUpdate({name:listName},
    {$pull:{items:{_id:checkedItemId}}},function(err,foundList){
        if(!err){
            res.redirect("/"+listName)
        }
    })
}
})   

app.get("/:listname",(req,res)=>{
    const customlistname=_.capitalize(req.params.listname);
      List.findOne({name:customlistname},function(err,foundlist){
       if(!err){
           if(!foundlist){
            const list=new List({
                name:customlistname,
                items:defaultvalue
            });
            list.save();
            res.redirect("/"+customlistname)
           }
           else{
            res.render("list",{listtitle:foundlist.name,newItems:foundlist.items})
           }
       }
    })

})


app.listen(3000,()=>{
    console.log("Server is running at 3000 port");
})