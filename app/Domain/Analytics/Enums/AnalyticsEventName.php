<?php

namespace App\Domain\Analytics\Enums;

enum AnalyticsEventName: string
{
    case LandingViewed = 'landing_viewed';
    case LandingCtaClicked = 'landing_cta_clicked';
    case DemoCtaClicked = 'demo_cta_clicked';
    case PricingViewed = 'pricing_viewed';
    case FaqOpened = 'faq_opened';

    case CreateFlowStarted = 'create_flow_started';
    case OccasionSelected = 'occasion_selected';
    case TemplateListViewed = 'template_list_viewed';
    case TemplateSelected = 'template_selected';
    case TemplatePreviewed = 'template_previewed';
    case GiftDraftCreated = 'gift_draft_created';

    case RegisterStarted = 'register_started';
    case UserRegistered = 'user_registered';
    case LoginViewed = 'login_viewed';
    case UserLoggedIn = 'user_logged_in';
    case UserLoggedOut = 'user_logged_out';

    case EditorOpened = 'editor_opened';
    case PageSelected = 'page_selected';
    case ElementAdded = 'element_added';
    case ElementDeleted = 'element_deleted';
    case AssetAdded = 'asset_added';
    case StickerAdded = 'sticker_added';
    case ImageUploaded = 'image_uploaded';
    case ImageApplied = 'image_applied';
    case PageBackgroundChanged = 'page_background_changed';
    case EnvelopeAdded = 'envelope_added';
    case PolaroidAdded = 'polaroid_added';
    case PreviewOpened = 'preview_opened';
    case AutosaveFailed = 'autosave_failed';

    case ReviewOpened = 'review_opened';
    case PublicationCheckFailed = 'publication_check_failed';
    case GiftSentToCheckout = 'gift_sent_to_checkout';
    case GiftPublished = 'gift_published';

    case CheckoutOpened = 'checkout_opened';
    case OrderCreated = 'order_created';
    case PaymentPending = 'payment_pending';
    case PaymentApproved = 'payment_approved';
    case PaymentRejected = 'payment_rejected';
    case PaymentExpired = 'payment_expired';
    case OrderPaid = 'order_paid';
    case OrderCanceled = 'order_canceled';

    case SharePageOpened = 'share_page_opened';
    case PublicLinkCopied = 'public_link_copied';
    case QrCodeViewed = 'qr_code_viewed';
    case QrCodeDownloaded = 'qr_code_downloaded';
    case ShareCardOpened = 'share_card_opened';
    case ShareCardPrintClicked = 'share_card_print_clicked';
    case ShareClicked = 'share_clicked';

    case PublicGiftOpened = 'public_gift_opened';
    case GiftOpeningStarted = 'gift_opening_started';
    case GiftOpeningCompleted = 'gift_opening_completed';
    case GiftPageViewed = 'gift_page_viewed';
    case GiftCompleted = 'gift_completed';
    case EnvelopeOpened = 'envelope_opened';
    case EnvelopeClosed = 'envelope_closed';
    case PolaroidFlipped = 'polaroid_flipped';
    case CreateMyOwnClicked = 'create_my_own_clicked';

    case AdminAssetUploaded = 'admin_asset_uploaded';
    case AdminThemeUpdated = 'admin_theme_updated';
    case AdminTemplatePublished = 'admin_template_published';
    case AdminGiftConvertedToTemplate = 'admin_gift_converted_to_template';
    case AdminOrderStatusChanged = 'admin_order_status_changed';

    case UploadFailed = 'upload_failed';
    case PaymentWebhookFailed = 'payment_webhook_failed';
    case MediaProcessingFailed = 'media_processing_failed';
    case AssetProcessingFailed = 'asset_processing_failed';
    case ViewerLoadFailed = 'viewer_load_failed';
    case AutosaveError = 'autosave_error';

    public function group(): AnalyticsEventGroup
    {
        return match ($this) {
            self::LandingViewed,
            self::LandingCtaClicked,
            self::DemoCtaClicked,
            self::PricingViewed,
            self::FaqOpened => AnalyticsEventGroup::Marketing,

            self::CreateFlowStarted,
            self::OccasionSelected,
            self::TemplateListViewed,
            self::TemplateSelected,
            self::TemplatePreviewed,
            self::GiftDraftCreated => AnalyticsEventGroup::Creation,

            self::RegisterStarted,
            self::UserRegistered,
            self::LoginViewed,
            self::UserLoggedIn,
            self::UserLoggedOut => AnalyticsEventGroup::Auth,

            self::EditorOpened,
            self::PageSelected,
            self::ElementAdded,
            self::ElementDeleted,
            self::AssetAdded,
            self::StickerAdded,
            self::ImageApplied,
            self::PageBackgroundChanged,
            self::EnvelopeAdded,
            self::PolaroidAdded,
            self::PreviewOpened,
            self::AutosaveFailed => AnalyticsEventGroup::Editor,

            self::ImageUploaded => AnalyticsEventGroup::Media,

            self::ReviewOpened,
            self::PublicationCheckFailed,
            self::GiftSentToCheckout,
            self::GiftPublished => AnalyticsEventGroup::Publication,

            self::CheckoutOpened,
            self::OrderCreated,
            self::OrderCanceled => AnalyticsEventGroup::Checkout,

            self::PaymentPending,
            self::PaymentApproved,
            self::PaymentRejected,
            self::PaymentExpired,
            self::OrderPaid => AnalyticsEventGroup::Payment,

            self::SharePageOpened,
            self::PublicLinkCopied,
            self::QrCodeViewed,
            self::QrCodeDownloaded,
            self::ShareCardOpened,
            self::ShareCardPrintClicked,
            self::ShareClicked => AnalyticsEventGroup::Share,

            self::PublicGiftOpened,
            self::GiftOpeningStarted,
            self::GiftOpeningCompleted,
            self::GiftPageViewed,
            self::GiftCompleted,
            self::EnvelopeOpened,
            self::EnvelopeClosed,
            self::PolaroidFlipped,
            self::CreateMyOwnClicked => AnalyticsEventGroup::Viewer,

            self::AdminAssetUploaded,
            self::AdminThemeUpdated,
            self::AdminTemplatePublished,
            self::AdminGiftConvertedToTemplate,
            self::AdminOrderStatusChanged => AnalyticsEventGroup::Admin,

            self::PaymentWebhookFailed,
            self::MediaProcessingFailed,
            self::AssetProcessingFailed => AnalyticsEventGroup::System,

            self::UploadFailed,
            self::ViewerLoadFailed,
            self::AutosaveError => AnalyticsEventGroup::Error,
        };
    }

    public function isClientTrackable(): bool
    {
        return in_array($this, [
            self::LandingCtaClicked,
            self::DemoCtaClicked,
            self::FaqOpened,
            self::PageSelected,
            self::ElementAdded,
            self::ElementDeleted,
            self::AssetAdded,
            self::StickerAdded,
            self::ImageApplied,
            self::PageBackgroundChanged,
            self::EnvelopeAdded,
            self::PolaroidAdded,
            self::AutosaveFailed,
            self::PublicLinkCopied,
            self::QrCodeViewed,
            self::QrCodeDownloaded,
            self::ShareCardOpened,
            self::ShareCardPrintClicked,
            self::ShareClicked,
            self::GiftOpeningStarted,
            self::GiftOpeningCompleted,
            self::GiftPageViewed,
            self::GiftCompleted,
            self::EnvelopeOpened,
            self::EnvelopeClosed,
            self::PolaroidFlipped,
            self::CreateMyOwnClicked,
            self::AutosaveError,
            self::UploadFailed,
            self::ViewerLoadFailed,
        ], true);
    }

    public function shouldCreateGiftEvent(): bool
    {
        return $this->group() === AnalyticsEventGroup::Viewer
            || in_array($this, [
                self::PublicLinkCopied,
                self::QrCodeViewed,
                self::QrCodeDownloaded,
                self::ShareCardOpened,
                self::ShareCardPrintClicked,
                self::ShareClicked,
            ], true);
    }

    public function incrementsGiftVisitInteractions(): bool
    {
        return in_array($this, [
            self::GiftOpeningStarted,
            self::GiftOpeningCompleted,
            self::EnvelopeOpened,
            self::EnvelopeClosed,
            self::PolaroidFlipped,
            self::CreateMyOwnClicked,
            self::ShareClicked,
        ], true);
    }

    /**
     * @return array<string, string>
     */
    public static function clientOptions(): array
    {
        $options = [];

        foreach (self::cases() as $case) {
            if ($case->isClientTrackable()) {
                $options[$case->value] = $case->value;
            }
        }

        return $options;
    }
}
