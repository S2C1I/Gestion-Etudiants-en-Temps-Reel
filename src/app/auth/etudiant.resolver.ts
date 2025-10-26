import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { EtudiantsService } from '../services/etudiants.service';

@Injectable({
    providedIn: 'root'
})
export class EtudiantResolver implements Resolve<any> {
    constructor(private etudiantsService: EtudiantsService) { }

    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        const id = route.paramMap.get('id');

        if (id && id !== 'new') {
            // Load existing student
            return this.etudiantsService.getEtudiantById(+id);
        }

        // Return null for new student
        return new Observable(observer => {
            observer.next(null);
            observer.complete();
        });
    }
}
