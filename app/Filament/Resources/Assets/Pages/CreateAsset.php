<?php

namespace App\Filament\Resources\Assets\Pages;

use App\Filament\Resources\Assets\AssetResource;
use App\Filament\Resources\Assets\Pages\Concerns\HandlesAssetUploads;
use Filament\Resources\Pages\CreateRecord;

class CreateAsset extends CreateRecord
{
    use HandlesAssetUploads;

    protected static string $resource = AssetResource::class;

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    protected function mutateFormDataBeforeCreate(array $data): array
    {
        return $this->prepareAssetData($data);
    }
}
