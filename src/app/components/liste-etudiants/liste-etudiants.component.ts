import { Component, OnInit } from '@angular/core';
import { EtudiantsService } from '../../services/etudiants.service';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-liste-etudiants',
  standalone: false,
  templateUrl: './liste-etudiants.component.html',
  styleUrl: './liste-etudiants.component.scss'
})
export class ListeEtudiantsComponent implements OnInit {

  constructor(private etudiantsService: EtudiantsService,
    private router: Router,
    private socketService: SocketService) {
  }
  etudiants: any[] = [];
  total = 0;
  page = 1;
  limit = 5;
  searchControl = new FormControl('');
  currentSearch = '';

  ngOnInit() {
    this.loadEtudiants();

    // Set up search functionality
    this.searchControl.valueChanges
      .pipe(
        startWith(''),
        debounceTime(400),          // Wait 400ms after user stops typing
        distinctUntilChanged()       // Only trigger if value actually changed
      )
      .subscribe(searchTerm => {
        this.currentSearch = searchTerm || '';
        this.page = 1;               // Reset to first page on new search
        this.loadEtudiants(this.currentSearch);
      });

    // Listen for etudiant added event
    this.socketService.onEtudiantAdded().subscribe((etudiant) => {
      if (etudiant) {
        console.log('Received etudiantAdded via WebSocket:', etudiant);
        this.loadEtudiants(this.currentSearch);
      }
    });

    // Listen for etudiant updated event
    this.socketService.onEtudiantUpdated().subscribe((etudiant) => {
      if (etudiant) {
        console.log('Received etudiantUpdated via WebSocket:', etudiant);
        this.loadEtudiants(this.currentSearch);
      }
    });

    // Listen for etudiant deleted event
    this.socketService.onEtudiantDeleted().subscribe((data) => {
      if (data) {
        console.log('Received etudiantDeleted via WebSocket:', data);
        this.loadEtudiants(this.currentSearch);
      }
    });

    // Keep the old listener for backward compatibility (can remove later)
    this.socketService.onEtudiantUpdate().subscribe((data) => {
      if (data) {
        console.log('Received etudiantUpdate via WebSocket:', data);
        this.loadEtudiants(this.currentSearch);
      }
    });
  }

  onSelectEtudiant(etudiant: any) {
    // Handle student selection
    this.router.navigate([`/etudiant/${etudiant.id}`]);
  }


  addEtudiant() {
    this.router.navigate([`/etudiant/new`]);
  }


  loadEtudiants(search: string = '') {
    this.etudiantsService.getEtudiants(this.page, this.limit, search)
      .subscribe(res => {
        this.etudiants = res.data;
        this.total = res.total;
      });
  }

  nextPage() {
    if (this.page * this.limit < this.total) {
      this.page++;
      this.loadEtudiants(this.currentSearch);
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadEtudiants(this.currentSearch);
    }
  }

  onLimitChange(event: Event) {
    const value = (event.target as HTMLSelectElement | HTMLInputElement).value;
    this.limit = +value;
    this.page = 1;
    this.loadEtudiants(this.currentSearch);
  }

  clearSearch() {
    this.searchControl.setValue('');
  }

}
