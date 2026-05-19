<?php

namespace App\Filament\Resources\Assets\Pages;

use App\Filament\Resources\Assets\AssetResource;
use App\Filament\Resources\Assets\Pages\Concerns\HandlesAssetUploads;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;

class EditAsset extends EditRecord
{
    use HandlesAssetUploads;

    protected static string $resource = AssetResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make(),
            DeleteAction::make(),
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    protected function mutateFormDataBeforeSave(array $data): array
    {
        return $this->prepareAssetData($data, $this->getRecord());
    }

    protected function afterSave(): void
    {
        $this->deleteReplacedAssetFile();
    }
}
