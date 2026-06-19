import { Oauth } from '@/app/components/oauth/oauth';
import { Terminal } from '@/app/components/terminal/terminal';
import ApiException from '@/app/types/ApiException';
import ApiResponse from '@/app/types/ApiResponse';
import TokenResponse from '@/app/types/auth/token.response';
import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { email, form, FormField, FormRoot, required } from '@angular/forms/signals';
import { Highlight } from 'ngx-highlightjs';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [FormField, FormRoot, Oauth, Highlight, Terminal],
  templateUrl: './login.html',
})
export class Login {
  private readonly http = inject(HttpClient);
  readonly environment = environment;
  private readonly date = new Date().toISOString();
  protected loginSchema = signal({
    email: '',
    password: '',
  });

  getConsoleErrorMessage(): string {
    const errors = this.loginForm().errorSummary();

    if (!errors || errors.length === 0) {
      return `devos@system:~$ █`;
    }

    if (errors[0].kind === 'successfully') {
      return `[devos-cli] ✅ The process complete with exit code 0
    [type]      ${errors[0].kind.toUpperCase()}
    [message]   ${errors[0].message || 'An unhandled exception occurred in the auth controller.'}
    [timestamp] ${this.date}

devos@system:~$ █`;
    }

    return `[devos-cli] ❌ Error: Operation failed with exit code 1
    [type]      ${errors[0].kind.toUpperCase()}
    [message]   ${errors[0].message || 'An unhandled exception occurred in the auth controller.'}
    [timestamp] ${this.date}

devos@system:~$ █`;
  }

  protected loginForm = form(
    this.loginSchema,
    (schemaPath) => {
      required(schemaPath.email, { message: 'Email is required' });
      email(schemaPath.email, { message: 'Email is not valid' });
      required(schemaPath.password, { message: 'Password is required' });
    },
    {
      submission: {
        action: async () => {
          const { email, password } = this.loginForm().value();
          try {
            const token = await lastValueFrom(
              this.http.post<ApiResponse<TokenResponse>>(`${environment.apiUrl}/auth/login`, {
                identity: email,
                password,
              }),
            );
            console.log(token);
            if (token.statusCode === 201) {
              console.log(token.data.access_token);
              return { kind: 'successfully', message: 'redirecting to dashboard' };
            } else {
              return { kind: 'token', message: 'token not received' };
            }
          } catch (err) {
            const exception = err as { error: ApiException };
            if (exception.error.statusCode && exception.error.message) {
              if (exception.error.statusCode === 401) {
                return { kind: 'unauthorized', message: 'Email or password invalid' };
              } else {
                return { kind: 'exception', message: exception.error.message };
              }
            } else {
              return { kind: 'promiseError', message: JSON.stringify(err as object) };
            }
          }
        },
      },
    },
  );
}
