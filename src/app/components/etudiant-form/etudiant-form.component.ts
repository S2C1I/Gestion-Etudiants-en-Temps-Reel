import { Component, OnInit } from '@angular/core';
import { EtudiantsService } from '../../services/etudiants.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-etudiant-form',
  standalone: false,
  templateUrl: './etudiant-form.component.html',
  styleUrl: './etudiant-form.component.scss'
})
export class EtudiantFormComponent {

  constructor(private etudiantsService: EtudiantsService, private router: Router) { }

  etudiant = {
    nom: '',
    prenom: '',
    email: '',
    matiere: [] as string[],
    image: ''
  };

  matieres = [
    'Anglais',
    'Arts',
    'Biologie',
    'Chimie',
    'EPS',
    'Français',
    'Géographie',
    'Histoire',
    'Informatique',
    'Littérature',
    'Mathématiques',
    'Musique',
    'Philosophie',
    'Physique',
    'SVT',
    'Technologie'
  ];

  onSubmit() {
    this.etudiantsService.createEtudiant(this.etudiant).subscribe({
      next: (response) => {

        // Optionally, reset the form or navigate away
        this.etudiant = {
          nom: '',
          prenom: '',
          email: '',
          matiere: [],
          image: ''
        };

        this.router.navigate(['/etudiant']);
      },
      error: (error) => {
        console.error('Error creating student:', error);
      }
    });
  }

  onCancel() {
    // Handle form cancellation
    this.router.navigate(['/etudiant']);
  }

  onMatiereChange(matiere: any, $event: any) {
    if ($event.target.checked) {
      this.etudiant.matiere.push(matiere);
    } else {
      const index = this.etudiant.matiere.indexOf(matiere);
      if (index > -1) {
        this.etudiant.matiere.splice(index, 1);
      }
    }
    console.log(this.etudiant.matiere);
  }
}
