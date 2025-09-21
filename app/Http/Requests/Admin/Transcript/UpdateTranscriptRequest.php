<?php

namespace App\Http\Requests\Admin\Transcript;

use App\Models\Transcript;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTranscriptRequest extends FormRequest
{
    public function authorize(): bool
    {
        $transcript = $this->route('transcript');

        if (! $transcript instanceof Transcript) {
            return false;
        }

        return $this->user()?->can('update', $transcript) ?? false;
    }

    public function rules(): array
    {
        return [
            'final_grade' => ['nullable', 'string', 'max:12'],
            'grade_points' => ['nullable', 'numeric', 'min:0', 'max:4'],
            'published_at' => ['nullable', 'date'],
        ];
    }
}
