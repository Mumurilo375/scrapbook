<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
            'remember' => ['nullable', 'boolean'],
            'return_to' => ['nullable', 'string', 'max:2048'],
        ];
    }

    /**
     * @throws ValidationException
     */
    public function authenticate(): void
    {
        if (Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
            return;
        }

        throw ValidationException::withMessages([
            'email' => 'As credenciais informadas não conferem.',
        ]);
    }
}
