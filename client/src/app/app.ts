import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import ApiResponse from './types/ApiResponse';
import HealthResponse from './types/health/health.response';
import { environment } from '../environments/environment';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  standalone: true,
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly http = inject(HttpClient);

  protected isHealthy = signal<boolean>(true);

  ngOnInit() {
    this.http
      .get<ApiResponse<HealthResponse>>(`${environment.apiUrl}/health`)
      .pipe(
        catchError(() => of({ data: { status: 'error' } })),
      ) 
      .subscribe((health) => {
        if (health.data.status !== 'ok') {
          this.isHealthy.set(false);
        }
      });
  }
}
