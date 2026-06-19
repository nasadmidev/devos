import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import {
  email,
  form,
  FormField,
  FormRoot,
  minLength,
  pattern,
  required,
} from '@angular/forms/signals';
import { Highlight } from 'ngx-highlightjs';
import { environment } from '@/environments/environment';
import { lastValueFrom } from 'rxjs';
import ApiResponse from '@app/types/ApiResponse';
import UserModel from '@app/types/user/user.model';
import { Terminal } from "@app/components/terminal/terminal";

@Component({
  selector: 'app-register',
  imports: [FormField, Highlight, FormRoot, Terminal],
  templateUrl: './register.html',
})
export class Register {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly date = new Date().toISOString();

  registerModel = signal({
    email: '',
    password: '',
    confirmPassword: '',
  });

  getConsoleErrorMessage(): string {
  const errors = this.registerForm().errorSummary()

  if (!errors || errors.length === 0) {
    return `devos@system:~$ █`;
  };

  return `[devos-cli] ❌ Error: Operation failed with exit code 1
    [type]      ${errors[0].kind.toUpperCase()}
    [message]   ${errors[0].message || 'An unhandled exception occurred in the auth controller.'}
    [timestamp] ${this.date}

devos@system:~$ █`;
  }

  registerForm = form(
    this.registerModel,
    (schemaPath) => {
      required(schemaPath.email, { message: 'Email is required' });
      email(schemaPath.email, { message: 'Email is not valid' });
      required(schemaPath.password, { message: 'Password is required' });
      minLength(schemaPath.password, 8, { message: 'Password must have at least 8 characters' });
      pattern(schemaPath.password, /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/, {
        message: 'Password must have at least one uppercase, one lowercase and one number',
      });
      required(schemaPath.confirmPassword, { message: 'Please confirm your password' });
    },
    {
      submission: {
        action: async (field) => {
          const { email, password, confirmPassword } = field().value();
          if (password !== confirmPassword) {
            return { kind: 'validationError', message: 'Password do not match' };
          }
          try {
            const user = await lastValueFrom(
              this.http.post<ApiResponse<UserModel>>(`${environment.apiUrl}/user`, { email, password }),
            );
            if (user.statusCode === 201) {
              console.log(user.data);
              return { kind: 'successfully' };
            } else {
              return {
                kind: 'serverError',
                message: `Server respond with status: ${user.statusCode}`,
              };
            }
          } catch (err) {
            return { kind: 'promiseError', message: `${err}` };
          }
        },
      },
    },
  );
}
