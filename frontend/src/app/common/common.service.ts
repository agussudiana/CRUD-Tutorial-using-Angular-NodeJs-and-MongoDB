import { Injectable } from '@angular/core';
import { User } from '../user-list/user.model'
import { Subject } from 'rxjs/Subject';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

@Injectable()
export class CommonService {
    public userList: User[]
    public add_subject=new Subject()
    public api="http://localhost:3000/api"
    
   

    constructor(private http : Http){
        this.userList = []
    }

    addUser(name,email,gender,fileToUpload: File){

        const formData: FormData = new FormData();
    
        if(fileToUpload!=null){
            formData.append('photo', fileToUpload, fileToUpload.name);
        }
        
        formData.append('name', name);
        formData.append('email',email);
        formData.append('gender',gender);

        return this.http.post(this.api+'/addUser',
           formData
		)
    }

    getUser(currentPage,perPage){
        return this.http.get(this.api+'/getUser?page='+currentPage+'&perPage='+perPage,{})
    }

    deleteUser(id,photo){
       
        return this.http.post(this.api+'/deleteUser',{
            id : id,
            photo:photo,
        })
        
    }

    updateUser(id,name,email,gender,oldphoto,fileToUpload: File){

        const formData: FormData = new FormData();
    
        if(fileToUpload!=null){
            formData.append('photo', fileToUpload, fileToUpload.name);
        }
        formData.append('id',id);
        formData.append('name', name);
        formData.append('email',email);
        formData.append('gender',gender);
        formData.append('oldphoto',oldphoto);
        return this.http.post(this.api+'/updateUser',formData)
    }

  

      search(key:Observable<String>,currentPage,perPage) {
        
        
        return  key.debounceTime(400).switchMap(
            key => this.searchEntries(key)
        )
      
 
       }
    
      searchEntries(key) {
        let keystring = key.split(",")

         let s =  keystring[0]
         let currentPage = keystring[1]
         let perPage = keystring[2]
        return this.http.get(this.api+'/searchUser?key='+s+'&page='+currentPage+'&perPage='+perPage);
          ;
      }




}
