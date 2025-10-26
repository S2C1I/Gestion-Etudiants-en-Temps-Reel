import { Component, OnInit } from '@angular/core';
import { EtudiantsService } from '../../services/etudiants.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-details-etudiant',
  standalone: false,
  templateUrl: './details-etudiant.component.html',
  styleUrl: './details-etudiant.component.scss'
})
export class DetailsEtudiantComponent implements OnInit {

  constructor(private etudiantsService: EtudiantsService, private route: ActivatedRoute, private router: Router) { }

  isEditing = false;
  isLoading = false; // No loading needed - resolver provides data

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
  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  ngOnInit() {
    // Get data from resolver - no loading needed!
    this.route.data.subscribe(data => {
      if (data['etudiant']) {
        this.etudiant = data['etudiant'];
        // Ensure matiere is always an array
        if (typeof this.etudiant.matiere === 'string') {
          this.etudiant.matiere = this.etudiant.matiere ? [this.etudiant.matiere] : [];
        } else if (!Array.isArray(this.etudiant.matiere)) {
          this.etudiant.matiere = [];
        }
      }
    });
  }
  etudiant: any;

  saveEtudiant() {
    console.log('saveEtudiant called');
    console.log('Etudiant data:', this.etudiant);

    if (!this.etudiant || !this.etudiant.id) {
      console.error('No etudiant or etudiant.id found');
      return;
    }

    // Clean the data - only send fields that should be updated
    const updateData = {
      nom: this.etudiant.nom,
      prenom: this.etudiant.prenom,
      email: this.etudiant.email,
      matiere: this.etudiant.matiere,
      image: this.etudiant.image
    };

    console.log('Sending update data:', updateData);

    this.etudiantsService.updateEtudiant(this.etudiant.id, updateData).subscribe({
      next: (updatedEtudiant) => {

        this.ngOnInit(); // Refresh the student details
        this.isEditing = false;

      },
      error: (error) => {
        console.error('Error updating student:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Full error:', error);
      }
    });
  }

  cancelEdit() {
    this.isEditing = false;
    this.ngOnInit(); // Reload student details to discard changes

  }

  editEtudiant() {
    console.log('Edit button clicked, isEditing:', this.isEditing);
    console.log('Current etudiant:', this.etudiant);
    this.isEditing = true;
    console.log('After toggle, isEditing:', this.isEditing);
  }

  deleteEtudiant() {
    if (this.etudiant && this.etudiant.id) {
      this.etudiantsService.deleteEtudiant(this.etudiant.id).subscribe(() => {
        console.log('Student deleted');
        this.router.navigate(['/etudiant']);
      });
    }

  }

  onMatiereChange(matiere: any, $event: any) {
    // Ensure matiere is an array
    if (!Array.isArray(this.etudiant.matiere)) {
      this.etudiant.matiere = [];
    }

    if ($event.target.checked) {
      if (!this.etudiant.matiere.includes(matiere)) {
        this.etudiant.matiere.push(matiere);
      }
    } else {
      const index = this.etudiant.matiere.indexOf(matiere);
      if (index > -1) {
        this.etudiant.matiere.splice(index, 1);
      }
    }
    console.log(this.etudiant.matiere);
  }

  isMatieresChecked(matiere: string): boolean {
    return Array.isArray(this.etudiant?.matiere) && this.etudiant.matiere.includes(matiere);
  }
}
