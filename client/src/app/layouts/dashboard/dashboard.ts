import { CookieService } from '@/app/common/services/cookie.service';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { environment } from '@/environments/environment';
import UserModel from '@/app/types/user/user.model';
import ProfileModel from '@/app/types/user/profile.model';
import { catchError, of } from 'rxjs';
import ApiResponse from '@/app/types/ApiResponse';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private readonly cookie = inject(CookieService);
  private readonly http = inject(HttpClient);
  
  ngOnInit(): void {
    this.http.get<ApiResponse<UserModel & { profile: ProfileModel }>>(`${environment.apiUrl}/user?select=profile`)
    .pipe(
      catchError(() => of({ statusCode: 403 }))
    )
    .subscribe((user) => {
      if (user.statusCode !== 200) {
        console.error('user not defined');
      } else {
        console.log(user);
      }
    });
  }
}
