import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-details-user',
  standalone: false,
  templateUrl: './details-user.component.html',
  styleUrl: './details-user.component.scss'
})
export class DetailsUserComponent implements OnInit {

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  isEditing = false;
  user: any;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.userService.getUserById(id).subscribe(data => {
      this.user = data;
    });
  }

  saveUser() {
    console.log('saveUser called');
    console.log('User data:', this.user);

    if (!this.user || !this.user._id) {
      console.error('No user or user._id found');
      alert('Erreur: Données de l\'utilisateur manquantes');
      return;
    }

    // Clean the data - only send fields that should be updated
    const updateData = {
      nom: this.user.nom,
      prenom: this.user.prenom,
      email: this.user.email
    };

    console.log('Sending update data:', updateData);

    this.userService.updateUser(this.user._id, updateData).subscribe({
      next: (updatedUser) => {
        console.log('User updated successfully', updatedUser);
        this.ngOnInit(); // Refresh the user details
        this.isEditing = false;
        alert('Utilisateur mis à jour avec succès!');
      },
      error: (error) => {
        console.error('Error updating user:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Full error:', error);
        alert('Erreur lors de la mise à jour de l\'utilisateur. Vérifiez la console pour plus de détails.');
      }
    });
  }

  cancelEdit() {
    this.isEditing = false;
    this.ngOnInit(); // Reload user details to discard changes
  }

  editUser() {
    this.isEditing = true;
  }

  deleteUser() {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur?')) {
      if (this.user && this.user._id) {
        this.userService.deleteUser(this.user._id).subscribe(() => {
          console.log('User deleted');
          this.router.navigate(['/users']);
        });
      }
    }
  }
}
