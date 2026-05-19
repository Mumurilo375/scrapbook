<?php

namespace App\Domain\Assets\Enums;

enum AssetType: string
{
    case Sticker = 'sticker';
    case Texture = 'texture';
    case Paper = 'paper';
    case Background = 'background';
    case Frame = 'frame';
    case Tape = 'tape';
    case Label = 'label';
    case Envelope = 'envelope';
    case Stamp = 'stamp';
    case Flower = 'flower';
    case Decoration = 'decoration';
    case Icon = 'icon';
    case Shape = 'shape';
    case Border = 'border';
    case Overlay = 'overlay';
    case Cutout = 'cutout';
    case Newspaper = 'newspaper';
    case Doodle = 'doodle';
    case Other = 'other';
}
