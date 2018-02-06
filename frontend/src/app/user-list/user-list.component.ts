import { Component, OnInit } from '@angular/core';
import { CommonService } from '../common/common.service'
import { User } from './user.model'; 
import { trigger,style,transition,animate,keyframes,query,stagger,state } from '@angular/animations';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.less'],
  animations: [

    trigger('animate', [
      transition('* => *', [

        query(':enter', style({ opacity: 0 }), {optional: true}),

        query(':enter', stagger('100ms', [
          animate('.3s ease-in', keyframes([
            style({opacity: 0, transform: 'translateY(-75%)', offset: 0}),
            style({opacity: .5, transform: 'translateY(15px)',  offset: 0.3}),
            style({opacity: 1, transform: 'translateY(0)',     offset: 1.0}),
          ]))]), {optional: true})
          ,
        query(':leave', stagger('100ms', [
          animate('.3s ease-out', keyframes([
            style({opacity: 1, transform: 'translateY(0)', offset: 0}),
            style({opacity: .5, transform: 'translateY(15px)',  offset: 0.3}),
            style({opacity: 0, transform: 'translateY(-75%)',     offset: 1.0}),
          ]))]), {optional: true})
      ])
    ])
      
  ]
})
export class UserListComponent implements OnInit {

  public userList:User[];
  public editUser = [];
  public deletedUser = [];
  public addUser = {};
  public currentEdit;
  public isLoading:Boolean;
  public isAdd:Boolean;
  public isEdit:Boolean;
  public isDelete:Boolean;
  public showForm:Boolean;
  public onSearch:Boolean;
  public isEmpty:Boolean;
  public isValidName:Boolean=true;
  public isValidEmail:Boolean=true;
  public isValidGender:Boolean=true;
  public errormsg = [];
  public keystring;
  public defaultImg;
  public imgPreview;
  public oldPhoto;
  searchTerm = new Subject<string>();
  public perPage = 5;
  public currentPage=1;
  public totalPage;
  public skip = 0;
  fileToUpload: File = null;
  public filename:String;
  Arr = Array;
  public api_image="http://localhost:3000/static/uploads"


    constructor(private commonService:CommonService){
      this.userList = [];
      this.addUser={"name":"","email":"","gender":"","photo":"select photo"};
      this.onSearch = false;
      this.keystring=""
      this.defaultImg = "assets/user_photo_default.png"
      


    

    
    }

    ngOnInit(){

  
      
      this.getAllUser(this.currentPage);
      /* test using subject
      this.commonService.add_subject.subscribe(res => {
        this.getAllUser();
       })
       */

       this.commonService.search(this.searchTerm,this.currentPage,this.perPage).subscribe(res=>{

      this.isLoading = false
        this.generateList(res,this.currentPage)
       })


    }


    searchUser(currentPage){

      this.isLoading = true;
      this.currentPage = currentPage;
          
      
      if(this.keystring.length>0 && this.keystring.trim() ){
        


       let message = [this.keystring,this.currentPage,this.perPage];
       this.onSearch = true;
      this.searchTerm.next(message.toString())

      }else{
        this.onSearch = false;
        
       this.getAllUser(1);  
      }
      
    }



    getAllUser(currentPage){

      this.isLoading = true
      this.currentPage = currentPage
      this.commonService.getUser(currentPage,this.perPage).subscribe(res =>{
       
        this.isLoading=false

       this.generateList(res,currentPage)
      
        

      })
    }


    
    generateList(res,currentPage){
      
      if (res.json().data.length >0 ){
        this.isEmpty=false;
        this.userList  = []
        res.json().data.map(e => {
          let created_at = new Date(parseInt(e._id.substring(0, 8), 16) * 1000);
        
          this.userList.push(new User(e._id,e.name,e.email,e.gender,e.photo,created_at));

        })

        
       this.totalPage= Math.ceil(res.json().total/this.perPage)
       this.skip = (currentPage-1)*this.perPage

      }else{

        this.isEmpty=true;


      }


    }

    showAddUser(){

    this.showForm =true;
    this.isAdd = !this.isAdd;
    this.imgPreview = this.defaultImg;

    }



    submitAddUser(user){
      
      if(this.checkValidation(user)){
      this.isLoading = true
      this.isAdd = false
      this.commonService.addUser(user.name,user.email,user.gender,this.fileToUpload).subscribe(res => {
        
          //this.commonService.add_subject.next()
          
          let id = res.json().data[0]._id
          let photo = res.json().data[0].photo
          let created_at = new Date(parseInt(id.substring(0, 8), 16) * 1000);
          this.userList.push(new User(id,user.name,user.email,user.gender,photo,created_at));
          this.isLoading = false;
          this.cancelAll()
      })
      
    }
  }

 
    deleteUser(user){
    this.showForm =true;
    this.isDelete = true;

    this.deletedUser =user;
      
    }

    submitDeleteUser(user){

      this.isLoading = true;
      this.cancelAll()
      this.commonService.deleteUser(user.id,user.photo).subscribe(res => {
          
        let index = this.userList.indexOf(user);
        this.userList.splice(index,1);
        this.isLoading = false;
        
      
    })



    }




    updateUser(user,index){
      this.showForm =true;
      this.isEdit=true;
      this.editUser = Object.assign([], user);

      if(this.editUser["photo"]!=""){
        this.imgPreview = this.api_image+'/'+this.editUser["photo"];
        this.editUser["oldPhoto"] =  this.editUser["photo"];
        this.editUser["photo"] = "Change photo" 
      }else{
        this.imgPreview = this.defaultImg; 
        this.editUser["oldPhoto"] =  "";
        this.editUser["photo"] = "Select photo" 
      }
      
      this.currentEdit = index;

    }

    submitUpdateUser(user){

      if(this.checkValidation(user)){
      this.isLoading = true;
      this.isEdit=false;
      this.commonService.updateUser(user.id,user.name,user.email,user.gender,user.oldPhoto,this.fileToUpload).subscribe(res => {
        
        
        let photo = res.json().data.photo
        this.userList[this.currentEdit].name = user.name;
        this.userList[this.currentEdit].email = user.email;
        this.userList[this.currentEdit].gender = user.gender;

        this.userList[this.currentEdit].photo = photo;


        this.isLoading = false;
        this.cancelAll()
    })
    
       
    }

    }


    handleFileInput(event:any) {
      this.fileToUpload = event.target.files[0];
      this.addUser["photo"] = event.target.files[0].name;
      this.editUser["photo"] = event.target.files[0].name;
      if (event.target.files && event.target.files[0]) {
        var reader = new FileReader();
    
        reader.onload = (event:any) => {
          this.imgPreview = event.target.result;
        }
    
        reader.readAsDataURL(event.target.files[0]);
      }
      
  }
 
  

  


    checkValidation(user){

      this.isValidName = true
      this.isValidEmail = true
      this.isValidGender = true
      this.errormsg["name"]="please complete your name"
      this.errormsg["email"]="please complete your email"
      this.errormsg["gender"]="please select your gender"
      let emailpattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  
     let isValid = true
      if (user.name.length==0 || !user.name.trim()){
        this.isValidName = false
        isValid =  false;
      }
      
      if (user.email.length==0 || !user.email.trim()){
        this.isValidEmail = false
        isValid =  false;
      }
  
      if (!emailpattern.test(String(user.email).toLowerCase())){
        this.isValidEmail = false
        isValid =  false;
        this.errormsg["email"]="please input valid email"
      }
  
      if (user.gender.length==0 || !user.gender.trim()){
        this.isValidGender = false
        isValid =  false;
      }
      
      
      return isValid;
  
      
    }
  
  

    cancelAll(){
      this.showForm =false;
      this.isEdit=false;
      this.isAdd=false;
      this.isDelete=false;
      this.fileToUpload = null;
      this.editUser =[]
      this.addUser={"name":"","email":"","gender":"","photo":"select photo"};
    }


}

