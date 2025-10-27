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
    matiere: [] as string[]
  };

  selectedFile: File | null = null;
  previewUrl: string | null = null;

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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    const formData = new FormData();

    // Append file if selected
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    // Append other fields
    formData.append('nom', this.etudiant.nom);
    formData.append('prenom', this.etudiant.prenom);
    formData.append('email', this.etudiant.email);
    formData.append('matiere', JSON.stringify(this.etudiant.matiere));

    this.etudiantsService.createEtudiant(formData).subscribe({
      next: (response) => {
        console.log('Student created successfully:', response);

        // Reset the form
        this.etudiant = {
          nom: '',
          prenom: '',
          email: '',
          matiere: []
        };
        this.selectedFile = null;
        this.previewUrl = null;

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
