<?php

namespace App\Http\Resources;

use App\Domain\Assets\Models\AssetCategory;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin AssetCategory
 */
class EditorAssetCategoryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'icon' => $this->icon,
            'sortOrder' => $this->sort_order,
        ];
    }
}
