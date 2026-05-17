<?php

namespace App\Filament\Support;

use BackedEnum;
use Filament\Resources\Resource;
use Filament\Support\Icons\Heroicon;
use Illuminate\Contracts\Support\Htmlable;
use Illuminate\Database\Eloquent\Model;
use UnitEnum;

abstract class AdminResource extends Resource
{
    public static function canAccess(): bool
    {
        return self::isRoleAllowed();
    }

    public static function canViewAny(): bool
    {
        return self::isRoleAllowed();
    }

    public static function canView(Model $record): bool
    {
        return self::isRoleAllowed();
    }

    public static function canCreate(): bool
    {
        return self::isRoleAllowed() && (bool) self::option('create', true);
    }

    public static function canEdit(Model $record): bool
    {
        return self::isRoleAllowed() && (bool) self::option('edit', true);
    }

    public static function canDelete(Model $record): bool
    {
        return self::isRoleAllowed() && (bool) self::option('delete', false);
    }

    public static function canDeleteAny(): bool
    {
        return self::isRoleAllowed() && (bool) self::option('delete', false);
    }

    public static function canReorder(): bool
    {
        return self::isRoleAllowed() && (bool) self::option('reorder', false);
    }

    public static function shouldRegisterNavigation(): bool
    {
        return parent::shouldRegisterNavigation() && (bool) self::option('navigation', true);
    }

    public static function getNavigationGroup(): string|UnitEnum|null
    {
        return self::option('group') ?? parent::getNavigationGroup();
    }

    public static function getNavigationSort(): ?int
    {
        return self::option('sort') ?? parent::getNavigationSort();
    }

    public static function getNavigationLabel(): string
    {
        return self::option('pluralLabel') ?? parent::getNavigationLabel();
    }

    public static function getNavigationIcon(): string|BackedEnum|Htmlable|null
    {
        return self::option('icon') ?? Heroicon::OutlinedRectangleStack;
    }

    public static function getModelLabel(): string
    {
        return self::option('label') ?? parent::getModelLabel();
    }

    public static function getPluralModelLabel(): string
    {
        return self::option('pluralLabel') ?? parent::getPluralModelLabel();
    }

    protected static function resourceKey(): string
    {
        return str(class_basename(static::class))->beforeLast('Resource')->toString();
    }

    protected static function option(string $key, mixed $default = null): mixed
    {
        return AdminResourceRegistry::resourceOptions(static::resourceKey())[$key] ?? $default;
    }

    protected static function isRoleAllowed(): bool
    {
        if ((bool) self::option('adminOnly', false)) {
            return AdminAccess::isAdmin();
        }

        return AdminAccess::isStaff();
    }
}
