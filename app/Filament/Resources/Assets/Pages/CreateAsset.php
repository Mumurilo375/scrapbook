<?php

namespace App\Filament\Resources\Assets\Pages;

use App\Domain\Analytics\Enums\AnalyticsEventName;
use App\Domain\Analytics\Services\AnalyticsTracker;
use App\Filament\Resources\Assets\AssetResource;
use App\Filament\Resources\Assets\Pages\Concerns\HandlesAssetUploads;
use App\Filament\Support\AdminAccess;
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

    protected function afterCreate(): void
    {
        app(AnalyticsTracker::class)->track(AnalyticsEventName::AdminAssetUploaded, [
            'source' => 'admin',
            'user' => AdminAccess::user(),
        ], [
            'asset_id' => $this->getRecord()->id,
            'type' => $this->getRecord()->type,
            'mime_type' => $this->getRecord()->mime_type,
            'size_bytes' => $this->getRecord()->size_bytes,
        ]);

        activity('admin')
            ->causedBy(AdminAccess::user())
            ->event(AnalyticsEventName::AdminAssetUploaded->value)
            ->performedOn($this->getRecord())
            ->withProperties([
                'asset_id' => $this->getRecord()->id,
                'type' => $this->getRecord()->type,
            ])
            ->log(AnalyticsEventName::AdminAssetUploaded->value);
    }
}
