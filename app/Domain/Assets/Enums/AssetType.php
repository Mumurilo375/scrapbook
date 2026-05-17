<?php

namespace App\Domain\Assets\Enums;

enum AssetType: string
{
    case Sticker = 'sticker';
    case Tape = 'tape';
    case Paper = 'paper';
    case Texture = 'texture';
    case Envelope = 'envelope';
    case Frame = 'frame';
    case Icon = 'icon';
    case Cutout = 'cutout';
    case Newspaper = 'newspaper';
    case Doodle = 'doodle';
    case Background = 'background';
    case Other = 'other';
}
