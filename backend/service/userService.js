const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url = 'mongodb://localhost:27017';
const dbName = 'fleava';
var mongodb = require('mongodb'); 
var fs = require('fs');
class UserService{
    constructor(req, res){
        this.req = req
        this.res = res
    }


    insert(name,email,gender,photo, db, callback){
        db.collection('user').insertOne({
                "name" : name,
                "email" :email,
                "gender":gender,
                "photo":photo
        }, function(err,data){
            
            callback(data.ops)      
        })
    }

    update(id,name,email,gender,photo, db, callback){
        db.collection('user').findOneAndUpdate({
            _id : new mongodb.ObjectID(id)
        },{
            $set:{ "name" :name ,"email" :email,"gender":gender, "photo":photo }

        },{
            returnOriginal: false
            
        }, function(err,data){
            callback(data.value)      
        })
    }


    delete(id, db,callback){
        
        db.collection('user').deleteOne({
                _id : new mongodb.ObjectID(id)
        }, function(err,result){
            
            callback()      
        })
    }

    addUser(){

        let self = this;
        let name = this.req.body.name;
        let email = this.req.body.email;
        let gender = this.req.body.gender;
        let photo = ""
        if(this.req.file){
             photo = this.req.file.filename
        }
        
        try{
            MongoClient.connect(url, function(err, client) {
                assert.equal(null, err);
                const db = client.db(dbName);

                self.insert(name,email,gender,photo, db, function(data){
                    client.close();
                    return self.res.status(200).json({
                        status: 'success',
                        data:data
                    })
                })
            });
        }
        catch(error){
            return self.res.status(500).json({
                status: 'error',
                error: error
            })
        }
        
    }

    updateUser(){

        let self = this;
        let id = this.req.body.id;
        let name = this.req.body.name;
        let email = this.req.body.email;
        let gender = this.req.body.gender;
        let photo = this.req.body.oldphoto
        if(this.req.file){
            if(photo !=""){
                fs.unlinkSync('./public/uploads/'+photo);
            }          
             photo = this.req.file.filename
             //delete old                     
        }

        try{
            MongoClient.connect(url, function(err, client) {
                assert.equal(null, err);
                const db = client.db(dbName);

                self.update(id,name,email,gender,photo, db, function(data){
                    client.close();
                    return self.res.status(200).json({
                        status: 'success',
                        data:data
                    })
                })
            });
        }
        catch(error){
            return self.res.status(500).json({
                status: 'error',
                error: error
            })
        }
        
    }


    getUser(){

        let self = this;
        let page = this.req.query.page;
        let perPage = parseInt(this.req.query.perPage);
        let skip = parseInt((page-1)*perPage);
    try{
        MongoClient.connect(url, function(err, client) {
            assert.equal(null, err);

            const db = client.db(dbName);

            let userList = []
            let cursor = db.collection('user').find().skip(skip).limit(perPage);
            let cursortotal=db.collection('user').find();
            let total = 0;
            cursortotal.each(function(err, doc) {
                total++
                 assert.equal(err, null);
               });

            cursor.each(function(err, doc) {
             
              assert.equal(err, null);
              if (doc != null) {
                userList.push(doc)
              } else {
                return self.res.status(200).json({
                    status: 'success',
                    data: userList,
                    total:total-1
                })
              }
            });
			
			client.close();
        });
    }
    catch(error){
        return self.res.status(500).json({
            status: 'error',
            error: error
        })
    }

    }


    deleteUser(){

        let self = this;
        let id = this.req.body.id;
        let photo = this.req.body.photo
        if(photo !=""){
                fs.unlinkSync('./public/uploads/'+photo);
        } 
        try{
            MongoClient.connect(url, function(err, client) {
                assert.equal(null, err);
                const db = client.db(dbName);

                self.delete(id,db, function(){
                   client.close();
                    return self.res.status(200).json({
                        status: 'success'
                    })
                })
            });
        }
        catch(error){
            return self.res.status(500).json({
                status: 'error',
                error: error
            })
        }
        
    }


    searchUser(){

        let self = this;
        let key = this.req.query.key;
        let page = this.req.query.page;
        let perPage = parseInt(this.req.query.perPage);
        let skip = parseInt((page-1)*perPage);

    try{
        MongoClient.connect(url, function(err, client) {
            assert.equal(null, err);

            const db = client.db(dbName);

            let userList = []
            let cursor = db.collection('user').find({
                "$or": [{
                    "name": {'$regex' : '.*' + key + '.*'}
                }, {
                    "email": {'$regex' : '.*' + key + '.*'}
                }]
                      
            }).skip(skip).limit(perPage);

            let cursortotal=db.collection('user').find({
                "$or": [{
                    "name": {'$regex' : '.*' + key + '.*'}
                }, {
                    "email": {'$regex' : '.*' + key + '.*'}
                }]
                      
            });

            let total = 0;
            cursortotal.each(function(err, doc) {
                total++
                 assert.equal(err, null);
               });


			
            cursor.each(function(err, doc) {
              assert.equal(err, null);
              if (doc != null) {
                userList.push(doc)
              } else {
                return self.res.status(200).json({
                    status: 'success',
                    data: userList,
                    total:total-1
                })
              }
            });
			
			client.close();
        });
    }
    catch(error){
        return self.res.status(500).json({
            status: 'error',
            error: error
        })
    }

    }


}
module.exports = UserService
