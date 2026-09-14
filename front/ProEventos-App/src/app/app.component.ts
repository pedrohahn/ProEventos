import { Component } from '@angular/core';
import { AccountService } from './services/account.service';
import { User } from './models/identity/User';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  
  constructor(public account: AccountService) { }

  ngOnInit(): void {
    this.setCurrentUser();
  } 

  setCurrentUser(): void { 

    let user : User | null;

    if (localStorage.getItem('user')) 
      user = JSON.parse(localStorage.getItem('user') || '{}');
    else 
      user = null;

    if (user)
      this.account.setCurrentUser(user);


  }
}
