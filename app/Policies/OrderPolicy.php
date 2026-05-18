<?php

namespace App\Policies;

use App\Domain\Payments\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function view(User $user, Order $order): bool
    {
        return $order->user_id === $user->id || $this->isStaff($user);
    }

    public function devApprove(User $user, Order $order): bool
    {
        return ! app()->environment('production') && $this->view($user, $order);
    }

    private function isStaff(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'support']);
    }
}
