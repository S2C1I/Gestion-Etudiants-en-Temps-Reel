import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  showRegister = false;

  loginData = {
    email: '',
    password: ''
  };

  registerData = {
    nom: '',
    prenom: '',
    email: '',
    password: ''
  };

  constructor( private userService: UserService, private router: Router) { }

  toggleForm(): void {
    this.showRegister = !this.showRegister;
  }

  onLogin(): void {
    this.userService.login(this.loginData).subscribe({
      next: (response) => {
        console.log('Login successful:', response);  
        // Handle successful login, e.g., store token, redirect, etc.
        this.userService.login(response.token); // Store the token
        this.router.navigate(['/etudiant']); // Redirect to student list
      },
      error: (error) => {
        console.error('Login error:', error);
      }
    });
  }

  onRegister(): void {
    this.userService.register(this.registerData).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        // Optionally, switch to login form or auto-login
        this.showRegister = false; // Switch to login form
      },
      error: (error) => {
        console.error('Registration error:', error);
      }
    });
  }
}
