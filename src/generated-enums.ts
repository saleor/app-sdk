/**
 * Generated file, do not modify it by hand.
 * To update it to the current schema, use `pnpm generate` script.
 */
/** An enumeration. */
export type GeneratedAccountErrorCode =
  | "ACCOUNT_NOT_CONFIRMED"
  | "ACTIVATE_OWN_ACCOUNT"
  | "ACTIVATE_SUPERUSER_ACCOUNT"
  | "CHANNEL_INACTIVE"
  | "DEACTIVATE_OWN_ACCOUNT"
  | "DEACTIVATE_SUPERUSER_ACCOUNT"
  | "DELETE_NON_STAFF_USER"
  | "DELETE_OWN_ACCOUNT"
  | "DELETE_STAFF_ACCOUNT"
  | "DELETE_SUPERUSER_ACCOUNT"
  | "DUPLICATED_INPUT_ITEM"
  | "GRAPHQL_ERROR"
  | "INACTIVE"
  | "INVALID"
  | "INVALID_CREDENTIALS"
  | "INVALID_PASSWORD"
  | "JWT_DECODE_ERROR"
  | "JWT_INVALID_CSRF_TOKEN"
  | "JWT_INVALID_TOKEN"
  | "JWT_MISSING_TOKEN"
  | "JWT_SIGNATURE_EXPIRED"
  | "LEFT_NOT_MANAGEABLE_PERMISSION"
  | "MISSING_CHANNEL_SLUG"
  | "NOT_FOUND"
  | "OUT_OF_SCOPE_GROUP"
  | "OUT_OF_SCOPE_PERMISSION"
  | "OUT_OF_SCOPE_USER"
  | "PASSWORD_ENTIRELY_NUMERIC"
  | "PASSWORD_RESET_ALREADY_REQUESTED"
  | "PASSWORD_TOO_COMMON"
  | "PASSWORD_TOO_SHORT"
  | "PASSWORD_TOO_SIMILAR"
  | "REQUIRED"
  | "UNIQUE";

/** An enumeration. */
export type GeneratedAddressTypeEnum = "BILLING" | "SHIPPING";

/**
 * Determine the allocation strategy for the channel.
 *
 *     PRIORITIZE_SORTING_ORDER - allocate stocks according to the warehouses' order
 *     within the channel
 *
 *     PRIORITIZE_HIGH_STOCK - allocate stock in a warehouse with the most stock
 */
export type GeneratedAllocationStrategyEnum = "PRIORITIZE_HIGH_STOCK" | "PRIORITIZE_SORTING_ORDER";

/** An enumeration. */
export type GeneratedAppErrorCode =
  | "FORBIDDEN"
  | "GRAPHQL_ERROR"
  | "INVALID"
  | "INVALID_CUSTOM_HEADERS"
  | "INVALID_MANIFEST_FORMAT"
  | "INVALID_PERMISSION"
  | "INVALID_STATUS"
  | "INVALID_URL_FORMAT"
  | "MANIFEST_URL_CANT_CONNECT"
  | "NOT_FOUND"
  | "OUT_OF_SCOPE_APP"
  | "OUT_OF_SCOPE_PERMISSION"
  | "REQUIRED"
  | "UNIQUE"
  | "UNSUPPORTED_SALEOR_VERSION";

/** All places where app extension can be mounted. */
export type GeneratedAppExtensionMountEnum =
  | "CUSTOMER_DETAILS_MORE_ACTIONS"
  | "CUSTOMER_OVERVIEW_CREATE"
  | "CUSTOMER_OVERVIEW_MORE_ACTIONS"
  | "NAVIGATION_CATALOG"
  | "NAVIGATION_CUSTOMERS"
  | "NAVIGATION_DISCOUNTS"
  | "NAVIGATION_ORDERS"
  | "NAVIGATION_PAGES"
  | "NAVIGATION_TRANSLATIONS"
  | "ORDER_DETAILS_MORE_ACTIONS"
  | "ORDER_OVERVIEW_CREATE"
  | "ORDER_OVERVIEW_MORE_ACTIONS"
  | "PRODUCT_DETAILS_MORE_ACTIONS"
  | "PRODUCT_OVERVIEW_CREATE"
  | "PRODUCT_OVERVIEW_MORE_ACTIONS";

/**
 * All available ways of opening an app extension.
 *
 *     POPUP - app's extension will be mounted as a popup window
 *     APP_PAGE - redirect to app's page
 */
export type GeneratedAppExtensionTargetEnum = "APP_PAGE" | "POPUP";

export type GeneratedAppSortField =
  /** Sort apps by creation date. */
  | "CREATION_DATE"
  /** Sort apps by name. */
  | "NAME";

/** Enum determining type of your App. */
export type GeneratedAppTypeEnum =
  /** Local Saleor App. The app is fully manageable from dashboard. You can change assigned permissions, add webhooks, or authentication token */
  | "LOCAL"
  /** Third party external App. Installation is fully automated. Saleor uses a defined App manifest to gather all required information. */
  | "THIRDPARTY";

/** An enumeration. */
export type GeneratedAreaUnitsEnum =
  | "SQ_CM"
  | "SQ_DM"
  | "SQ_FT"
  | "SQ_INCH"
  | "SQ_KM"
  | "SQ_M"
  | "SQ_MM"
  | "SQ_YD";

/** An enumeration. */
export type GeneratedAttributeBulkCreateErrorCode =
  | "ALREADY_EXISTS"
  | "BLANK"
  | "DUPLICATED_INPUT_ITEM"
  | "GRAPHQL_ERROR"
  | "INVALID"
  | "MAX_LENGTH"
  | "NOT_FOUND"
  | "REQUIRED"
  | "UNIQUE";

/** An enumeration. */
export type GeneratedAttributeBulkUpdateErrorCode =
  | "ALREADY_EXISTS"
  | "BLANK"
  | "DUPLICATED_INPUT_ITEM"
  | "GRAPHQL_ERROR"
  | "INVALID"
  | "MAX_LENGTH"
  | "NOT_FOUND"
  | "REQUIRED"
  | "UNIQUE";

export type GeneratedAttributeChoicesSortField =
  /** Sort attribute choice by name. */
  | "NAME"
  /** Sort attribute choice by slug. */
  | "SLUG";

/** An enumeration. */
export type GeneratedAttributeEntityTypeEnum = "PAGE" | "PRODUCT" | "PRODUCT_VARIANT";

/** An enumeration. */
export type GeneratedAttributeErrorCode =
  | "ALREADY_EXISTS"
  | "GRAPHQL_ERROR"
  | "INVALID"
  | "NOT_FOUND"
  | "REQUIRED"
  | "UNIQUE";

/** An enumeration. */
export type GeneratedAttributeInputTypeEnum =
  | "BOOLEAN"
  | "DATE"
  | "DATE_TIME"
  | "DROPDOWN"
  | "FILE"
  | "MULTISELECT"
  | "NUMERIC"
  | "PLAIN_TEXT"
  | "REFERENCE"
  | "RICH_TEXT"
  | "SWATCH";

export type GeneratedAttributeSortField =
  /** Sort attributes based on whether they can be displayed or not in a product grid. */
  | "AVAILABLE_IN_GRID"
  /** Sort attributes by the filterable in dashboard flag */
  | "FILTERABLE_IN_DASHBOARD"
  /** Sort attributes by the filterable in storefront flag */
  | "FILTERABLE_IN_STOREFRONT"
  /** Sort attributes by the variant only flag */
  | "IS_VARIANT_ONLY"
  /** Sort attributes by name */
  | "NAME"
  /** Sort attributes by slug */
  | "SLUG"
  /** Sort attributes by their position in storefront */
  | "STOREFRONT_SEARCH_POSITION"
  /** Sort attributes by the value required flag */
  | "VALUE_REQUIRED"
  /** Sort attributes by visibility in the storefront */
  | "VISIBLE_IN_STOREFRONT";

/** An enumeration. */
export type GeneratedAttributeTranslateErrorCode =
  | "GRAPHQL_ERROR"
  | "INVALID"
  | "NOT_FOUND"
  | "REQUIRED";

/** An enumeration. */
export type GeneratedAttributeTypeEnum = "PAGE_TYPE" | "PRODUCT_TYPE";

/** An enumeration. */
export type GeneratedAttributeValueTranslateErrorCode =
  | "GRAPHQL_ERROR"
  | "INVALID"
  | "NOT_FOUND"
  | "REQUIRED";

export type GeneratedCategorySortField =
  /** Sort categories by name. */
  | "NAME"
  /** Sort categories by product count. */
  | "PRODUCT_COUNT"
  /** Sort categories by subcategory count. */
  | "SUBCATEGORY_COUNT";

/** An enumeration. */
export type GeneratedChannelErrorCode =
  | "ALREADY_EXISTS"
  | "CHANNELS_CURRENCY_MUST_BE_THE_SAME"
  | "CHANNEL_WITH_ORDERS"
  | "DUPLICATED_INPUT_ITEM"
  | "GRAPHQL_ERROR"
  | "INVALID"
  | "NOT_FOUND"
  | "REQUIRED"
  | "UNIQUE";

/**
 * Determine a current authorize status for checkout.
 *
 *     We treat the checkout as fully authorized when the sum of authorized and charged
 *     funds cover the checkout.total.
 *     We treat the checkout as partially authorized when the sum of authorized and charged
 *     funds covers only part of the checkout.total
 *     We treat the checkout as not authorized when the sum of authorized and charged funds
 *     is 0.
 *
 *     NONE - the funds are not authorized
 *     PARTIAL - the cover funds don't cover fully the checkout's total
 *     FULL - the cover funds covers the checkout's total
 */
export type GeneratedCheckoutAuthorizeStatusEnum = "FULL" | "NONE" | "PARTIAL";

/**
 * Determine the current charge status for the checkout.
 *
 *     The checkout is considered overcharged when the sum of the transactionItem's charge
 *     amounts exceeds the value of `checkout.total`.
 *     If the sum of the transactionItem's charge amounts equals
 *     `checkout.total`, we consider the checkout to be fully charged.
 *     If the sum of the transactionItem's charge amounts covers a part of the
 *     `checkout.total`, we treat the checkout as partially charged.
 *
 *
 *     NONE - the funds are not charged.
 *     PARTIAL - the funds that are charged don't cover the checkout's total
 *     FULL - the funds that are charged fully cover the checkout's total
 *     OVERCHARGED - the charged funds are bigger than checkout's total
 */
export type GeneratedCheckoutChargeStatusEnum = "FULL" | "NONE" | "OVERCHARGED" | "PARTIAL";

/** An enumeration. */
export type GeneratedCheckoutCreateFromOrderErrorCode =
  | "CHANNEL_INACTIVE"
  | "GRAPHQL_ERROR"
  | "INVALID"
  | "ORDER_NOT_FOUND"
  | "TAX_ERROR";

/** An enumeration. */
export type GeneratedCheckoutCreateFromOrderUnavailableVariantErrorCode =
  | "INSUFFICIENT_STOCK"
  | "NOT_FOUND"
  | "PRODUCT_NOT_PUBLISHED"
  | "PRODUCT_UNAVAILABLE_FOR_PURCHASE"
  | "QUANTITY_GREATER_THAN_LIMIT"
  | "UNAVAILABLE_VARIANT_IN_CHANNEL";

/** An enumeration. */
export type GeneratedCheckoutErrorCode =
  | "BILLING_ADDRESS_NOT_SET"
  | "CHANNEL_INACTIVE"
  | "CHECKOUT_NOT_FULLY_PAID"
  | "DELIVERY_METHOD_NOT_APPLICABLE"
  | "EMAIL_NOT_SET"
  | "GIFT_CARD_NOT_APPLICABLE"
  | "GRAPHQL_ERROR"
  | "INACTIVE_PAYMENT"
  | "INSUFFICIENT_STOCK"
  | "INVALID"
  | "INVALID_SHIPPING_METHOD"
  | "MISSING_CHANNEL_SLUG"
  | "NOT_FOUND"
  | "NO_LINES"
  | "PAYMENT_ERROR"
  | "PRODUCT_NOT_PUBLISHED"
  | "PRODUCT_UNAVAILABLE_FOR_PURCHASE"
  | "QUANTITY_GREATER_THAN_LIMIT"
  | "REQUIRED"
  | "SHIPPING_ADDRESS_NOT_SET"
  | "SHIPPING_METHOD_NOT_APPLICABLE"
  | "SHIPPING_METHOD_NOT_SET"
  | "SHIPPING_NOT_REQUIRED"
  | "TAX_ERROR"
  | "UNAVAILABLE_VARIANT_IN_CHANNEL"
  | "UNIQUE"
  | "VOUCHER_NOT_APPLICABLE"
  | "ZERO_QUANTITY";

export type GeneratedCheckoutSortField =
  /** Sort checkouts by creation date. */
  | "CREATION_DATE"
  /** Sort checkouts by customer. */
  | "CUSTOMER"
  /** Sort checkouts by payment. */
  | "PAYMENT";

/** An enumeration. */
export type GeneratedCollectionErrorCode =
  | "CANNOT_MANAGE_PRODUCT_WITHOUT_VARIANT"
  | "DUPLICATED_INPUT_ITEM"
  | "GRAPHQL_ERROR"
  | "INVALID"
  | "NOT_FOUND"
  | "REQUIRED"
  | "UNIQUE";

export type GeneratedCollectionPublished = "HIDDEN" | "PUBLISHED";

export type GeneratedCollectionSortField =
  /**
   * Sort collections by availability.
   *
   * This option requires a channel filter to work as the values can vary between channels.
   */
  | "AVAILABILITY"
  /** Sort collections by name. */
  | "NAME"
  /** Sort collections by product count. */
  | "PRODUCT_COUNT"
  /**
   * Sort collections by publication date.
   *
   * This option requires a channel filter to work as the values can vary between channels.
   */
  | "PUBLICATION_DATE"
  /**
   * Sort collections by publication date.
   *
   * This option requires a channel filter to work as the values can vary between channels.
   */
  | "PUBLISHED_AT";

/** An enumeration. */
export type GeneratedConfigurationTypeFieldEnum =
  | "BOOLEAN"
  | "MULTILINE"
  | "OUTPUT"
  | "PASSWORD"
  | "SECRET"
  | "SECRETMULTILINE"
  | "STRING";

/** An enumeration. */
export type GeneratedCountryCode =
  | "AD"
  | "AE"
  | "AF"
  | "AG"
  | "AI"
  | "AL"
  | "AM"
  | "AO"
  | "AQ"
  | "AR"
  | "AS"
  | "AT"
  | "AU"
  | "AW"
  | "AX"
  | "AZ"
  | "BA"
  | "BB"
  | "BD"
  | "BE"
  | "BF"
  | "BG"
  | "BH"
  | "BI"
  | "BJ"
  | "BL"
  | "BM"
  | "BN"
  | "BO"
  | "BQ"
  | "BR"
  | "BS"
  | "BT"
  | "BV"
  | "BW"
  | "BY"
  | "BZ"
  | "CA"
  | "CC"
  | "CD"
  | "CF"
  | "CG"
  | "CH"
  | "CI"
  | "CK"
  | "CL"
  | "CM"
  | "CN"
  | "CO"
  | "CR"
  | "CU"
  | "CV"
  | "CW"
  | "CX"
  | "CY"
  | "CZ"
  | "DE"
  | "DJ"
  | "DK"
  | "DM"
  | "DO"
  | "DZ"
  | "EC"
  | "EE"
  | "EG"
  | "EH"
  | "ER"
  | "ES"
  | "ET"
  | "EU"
  | "FI"
  | "FJ"
  | "FK"
  | "FM"
  | "FO"
  | "FR"
  | "GA"
  | "GB"
  | "GD"
  | "GE"
  | "GF"
  | "GG"
  | "GH"
  | "GI"
  | "GL"
  | "GM"
  | "GN"
  | "GP"
  | "GQ"
  | "GR"
  | "GS"
  | "GT"
  | "GU"
  | "GW"
  | "GY"
  | "HK"
  | "HM"
  | "HN"
  | "HR"
  | "HT"
  | "HU"
  | "ID"
  | "IE"
  | "IL"
  | "IM"
  | "IN"
  | "IO"
  | "IQ"
  | "IR"
  | "IS"
  | "IT"
  | "JE"
  | "JM"
  | "JO"
  | "JP"
  | "KE"
  | "KG"
  | "KH"
  | "KI"
  | "KM"
  | "KN"
  | "KP"
  | "KR"
  | "KW"
  | "KY"
  | "KZ"
  | "LA"
  | "LB"
  | "LC"
  | "LI"
  | "LK"
  | "LR"
  | "LS"
  | "LT"
  | "LU"
  | "LV"
  | "LY"
  | "MA"
  | "MC"
  | "MD"
  | "ME"
  | "MF"
  | "MG"
  | "MH"
  | "MK"
  | "ML"
  | "MM"
  | "MN"
  | "MO"
  | "MP"
  | "MQ"
  | "MR"
  | "MS"
  | "MT"
  | "MU"
  | "MV"
  | "MW"
  | "MX"
  | "MY"
  | "MZ"
  | "NA"
  | "NC"
  | "NE"
  | "NF"
  | "NG"
  | "NI"
  | "NL"
  | "NO"
  | "NP"
  | "NR"
  | "NU"
  | "NZ"
  | "OM"
  | "PA"
  | "PE"
  | "PF"
  | "PG"
  | "PH"
  | "PK"
  | "PL"
  | "PM"
  | "PN"
  | "PR"
  | "PS"
  | "PT"
  | "PW"
  | "PY"
  | "QA"
  | "RE"
  | "RO"
  | "RS"
  | "RU"
  | "RW"
  | "SA"
  | "SB"
  | "SC"
  | "SD"
  | "SE"
  | "SG"
  | "SH"
  | "SI"
  | "SJ"
  | "SK"
  | "SL"
  | "SM"
  | "SN"
  | "SO"
  | "SR"
  | "SS"
  | "ST"
  | "SV"
  | "SX"
  | "SY"
  | "SZ"
  | "TC"
  | "TD"
  | "TF"
  | "TG"
  | "TH"
  | "TJ"
  | "TK"
  | "TL"
  | "TM"
  | "TN"
  | "TO"
  | "TR"
  | "TT"
  | "TV"
  | "TW"
  | "TZ"
  | "UA"
  | "UG"
  | "UM"
  | "US"
  | "UY"
  | "UZ"
  | "VA"
  | "VC"
  | "VE"
  | "VG"
  | "VI"
  | "VN"
  | "VU"
  | "WF"
  | "WS"
  | "YE"
  | "YT"
  | "ZA"
  | "ZM"
  | "ZW";

/** An enumeration. */
export type GeneratedCustomerBulkUpdateErrorCode =
  | "BLANK"
  | "DUPLICATED_INPUT_ITEM"
  | "GRAPHQL_ERROR"
  | "INVALID"
  | "MAX_LENGTH"
  | "NOT_FOUND"
  | "REQUIRED"
  | "UNIQUE";

/** An enumeration. */
export type GeneratedCustomerEventsEnum =
  | "ACCOUNT_ACTIVATED"
  | "ACCOUNT_CREATED"
  | "ACCOUNT_DEACTIVATED"
  | "CUSTOMER_DELETED"
  | "DIGITAL_LINK_DOWNLOADED"
  | "EMAIL_ASSIGNED"
  | "EMAIL_CHANGED"
  | "EMAIL_CHANGED_REQUEST"
  | "NAME_ASSIGNED"
  | "NOTE_ADDED"
  | "NOTE_ADDED_TO_ORDER"
  | "PASSWORD_CHANGED"
  | "PASSWORD_RESET"
  | "PASSWORD_RESET_LINK_SENT"
  | "PLACED_ORDER";

/** An enumeration. */
export type GeneratedDiscountErrorCode =
  | "ALREADY_EXISTS"
  | "CANNOT_MANAGE_PRODUCT_WITHOUT_VARIANT"
  | "DUPLICATED_INPUT_ITEM"
  | "GRAPHQL_ERROR"
  | "INVALID"
  | "NOT_FOUND"
  | "REQUIRED"
  | "UNIQUE";

export type GeneratedDiscountStatusEnum = "ACTIVE" | "EXPIRED" | "SCHEDULED";

export type GeneratedDiscountValueTypeEnum = "FIXED" | "PERCENTAGE";

/** An enumeration. */
export type GeneratedDistanceUnitsEnum = "CM" | "DM" | "FT" | "INCH" | "KM" | "M" | "MM" | "YD";

export type GeneratedErrorPolicyEnum =
  /** Save what is possible within a single row. If there are errors in an input data row, try to save it partially and skip the invalid part. */
  | "IGNORE_FAILED"
  /** Reject all rows if there is at least one error in any of them. */
  | "REJECT_EVERYTHING"
  /** Reject rows with errors. */
  | "REJECT_FAILED_ROWS";

export type GeneratedEventDeliveryAttemptSortField =
  /** Sort event delivery attempts by created at. */
  "CREATED_AT";

export type GeneratedEventDeliverySortField =
  /** Sort event deliveries by created at. */
  "CREATED_AT";

export type GeneratedEventDeliveryStatusEnum = "FAILED" | "PENDING" | "SUCCESS";

/** An enumeration. */
export type GeneratedExportErrorCode = "GRAPHQL_ERROR" | "INVALID" | "NOT_FOUND" | "REQUIRED";

/** An enumeration. */
export type GeneratedExportEventsEnum =
  | "EXPORTED_FILE_SENT"
  | "EXPORT_DELETED"
  | "EXPORT_FAILED"
  | "EXPORT_FAILED_INFO_SENT"
  | "EXPORT_PENDING"
  | "EXPORT_SUCCESS";

export type GeneratedExportFileSortField =
  | "CREATED_AT"
  | "LAST_MODIFIED_AT"
  | "STATUS"
  | "UPDATED_AT";

export type GeneratedExportScope =
  /** Export all products. */
  | "ALL"
  /** Export the filtered products. */
  | "FILTER"
  /** Export products with given ids. */
  | "IDS";

/** An enumeration. */
export type GeneratedExternalNotificationErrorCodes =
  | "CHANNEL_INACTIVE"
  | "INVALID_MODEL_TYPE"
  | "NOT_FOUND"
  | "REQUIRED";

/** An enumeration. */
export type GeneratedFileTypesEnum = "CSV" | "XLSX";

/** An enumeration. */
export type GeneratedFulfillmentStatus =
  | "CANCELED"
  | "FULFILLED"
  | "REFUNDED"
  | "REFUNDED_AND_RETURNED"
  | "REPLACED"
  | "RETURNED"
  | "WAITING_FOR_APPROVAL";

/** An enumeration. */
export type GeneratedGiftCardErrorCode =
  | "ALREADY_EXISTS"
  | "DUPLICATED_INPUT_ITEM"
  | "EXPIRED_GIFT_CARD"
  | "GRAPHQL_ERROR"
  | "INVALID"
  | "NOT_FOUND"
  | "REQUIRED"
  | "UNIQUE";

/** An enumeration. */
export type GeneratedGiftCardEventsEnum =
  | "ACTIVATED"
  | "BALANCE_RESET"
  | "BOUGHT"
  | "DEACTIVATED"
  | "EXPIRY_DATE_UPDATED"
  | "ISSUED"
  | "NOTE_ADDED"
  | "RESENT"
  | "SENT_TO_CUSTOMER"
  | "TAGS_UPDATED"
  | "UPDATED"
  | "USED_IN_ORDER";

/** An enumeration. */
export type GeneratedGiftCardSettingsErrorCode = "GRAPHQL_ERROR" | "INVALID" | "REQUIRED";

/** An enumeration. */
export type GeneratedGiftCardSettingsExpiryTypeEnum = "EXPIRY_PERIOD" | "NEVER_EXPIRE";

export type GeneratedGiftCardSortField =
  /**
   * Sort gift cards by created at.
   *
   * Added in Saleor 3.8.
   */
  | "CREATED_AT"
  /** Sort gift cards by current balance. */
  | "CURRENT_BALANCE"
  /** Sort gift cards by product. */
  | "PRODUCT"
  /** Sort gift cards by used by. */
  | "USED_BY";

/** Thumbnail formats for icon images. */
export type GeneratedIconThumbnailFormatEnum = "ORIGINAL" | "WEBP";

/** An enumeration. */
export type GeneratedInvoiceErrorCode =
  | "EMAIL_NOT_SET"
  | "INVALID_STATUS"
  | "NOT_FOUND"
  | "NOT_READY"
  | "NO_INVOICE_PLUGIN"
  | "NUMBER_NOT_SET"
  | "REQUIRED"
  | "URL_NOT_SET";

/** An enumeration. */
export type GeneratedJobStatusEnum = "DELETED" | "FAILED" | "PENDING" | "SUCCESS";

/** An enumeration. */
export type GeneratedLanguageCodeEnum =
  | "AF"
  | "AF_NA"
  | "AF_ZA"
  | "AGQ"
  | "AGQ_CM"
  | "AK"
  | "AK_GH"
  | "AM"
  | "AM_ET"
  | "AR"
  | "AR_AE"
  | "AR_BH"
  | "AR_DJ"
  | "AR_DZ"
  | "AR_EG"
  | "AR_EH"
  | "AR_ER"
  | "AR_IL"
  | "AR_IQ"
  | "AR_JO"
  | "AR_KM"
  | "AR_KW"
  | "AR_LB"
  | "AR_LY"
  | "AR_MA"
  | "AR_MR"
  | "AR_OM"
  | "AR_PS"
  | "AR_QA"
  | "AR_SA"
  | "AR_SD"
  | "AR_SO"
  | "AR_SS"
  | "AR_SY"
  | "AR_TD"
  | "AR_TN"
  | "AR_YE"
  | "AS"
  | "ASA"
  | "ASA_TZ"
  | "AST"
  | "AST_ES"
  | "AS_IN"
  | "AZ"
  | "AZ_CYRL"
  | "AZ_CYRL_AZ"
  | "AZ_LATN"
  | "AZ_LATN_AZ"
  | "BAS"
  | "BAS_CM"
  | "BE"
  | "BEM"
  | "BEM_ZM"
  | "BEZ"
  | "BEZ_TZ"
  | "BE_BY"
  | "BG"
  | "BG_BG"
  | "BM"
  | "BM_ML"
  | "BN"
  | "BN_BD"
  | "BN_IN"
  | "BO"
  | "BO_CN"
  | "BO_IN"
  | "BR"
  | "BRX"
  | "BRX_IN"
  | "BR_FR"
  | "BS"
  | "BS_CYRL"
  | "BS_CYRL_BA"
  | "BS_LATN"
  | "BS_LATN_BA"
  | "CA"
  | "CA_AD"
  | "CA_ES"
  | "CA_ES_VALENCIA"
  | "CA_FR"
  | "CA_IT"
  | "CCP"
  | "CCP_BD"
  | "CCP_IN"
  | "CE"
  | "CEB"
  | "CEB_PH"
  | "CE_RU"
  | "CGG"
  | "CGG_UG"
  | "CHR"
  | "CHR_US"
  | "CKB"
  | "CKB_IQ"
  | "CKB_IR"
  | "CS"
  | "CS_CZ"
  | "CU"
  | "CU_RU"
  | "CY"
  | "CY_GB"
  | "DA"
  | "DAV"
  | "DAV_KE"
  | "DA_DK"
  | "DA_GL"
  | "DE"
  | "DE_AT"
  | "DE_BE"
  | "DE_CH"
  | "DE_DE"
  | "DE_IT"
  | "DE_LI"
  | "DE_LU"
  | "DJE"
  | "DJE_NE"
  | "DSB"
  | "DSB_DE"
  | "DUA"
  | "DUA_CM"
  | "DYO"
  | "DYO_SN"
  | "DZ"
  | "DZ_BT"
  | "EBU"
  | "EBU_KE"
  | "EE"
  | "EE_GH"
  | "EE_TG"
  | "EL"
  | "EL_CY"
  | "EL_GR"
  | "EN"
  | "EN_AE"
  | "EN_AG"
  | "EN_AI"
  | "EN_AS"
  | "EN_AT"
  | "EN_AU"
  | "EN_BB"
  | "EN_BE"
  | "EN_BI"
  | "EN_BM"
  | "EN_BS"
  | "EN_BW"
  | "EN_BZ"
  | "EN_CA"
  | "EN_CC"
  | "EN_CH"
  | "EN_CK"
  | "EN_CM"
  | "EN_CX"
  | "EN_CY"
  | "EN_DE"
  | "EN_DG"
  | "EN_DK"
  | "EN_DM"
  | "EN_ER"
  | "EN_FI"
  | "EN_FJ"
  | "EN_FK"
  | "EN_FM"
  | "EN_GB"
  | "EN_GD"
  | "EN_GG"
  | "EN_GH"
  | "EN_GI"
  | "EN_GM"
  | "EN_GU"
  | "EN_GY"
  | "EN_HK"
  | "EN_IE"
  | "EN_IL"
  | "EN_IM"
  | "EN_IN"
  | "EN_IO"
  | "EN_JE"
  | "EN_JM"
  | "EN_KE"
  | "EN_KI"
  | "EN_KN"
  | "EN_KY"
  | "EN_LC"
  | "EN_LR"
  | "EN_LS"
  | "EN_MG"
  | "EN_MH"
  | "EN_MO"
  | "EN_MP"
  | "EN_MS"
  | "EN_MT"
  | "EN_MU"
  | "EN_MW"
  | "EN_MY"
  | "EN_NA"
  | "EN_NF"
  | "EN_NG"
  | "EN_NL"
  | "EN_NR"
  | "EN_NU"
  | "EN_NZ"
  | "EN_PG"
  | "EN_PH"
  | "EN_PK"
  | "EN_PN"
  | "EN_PR"
  | "EN_PW"
  | "EN_RW"
  | "EN_SB"
  | "EN_SC"
  | "EN_SD"
  | "EN_SE"
  | "EN_SG"
  | "EN_SH"
  | "EN_SI"
  | "EN_SL"
  | "EN_SS"
  | "EN_SX"
  | "EN_SZ"
  | "EN_TC"
  | "EN_TK"
  | "EN_TO"
  | "EN_TT"
  | "EN_TV"
  | "EN_TZ"
  | "EN_UG"
  | "EN_UM"
  | "EN_US"
  | "EN_VC"
  | "EN_VG"
  | "EN_VI"
  | "EN_VU"
  | "EN_WS"
  | "EN_ZA"
  | "EN_ZM"
  | "EN_ZW"
  | "EO"
  | "ES"
  | "ES_AR"
  | "ES_BO"
  | "ES_BR"
  | "ES_BZ"
  | "ES_CL"
  | "ES_CO"
  | "ES_CR"
  | "ES_CU"
  | "ES_DO"
  | "ES_EA"
  | "ES_EC"
  | "ES_ES"
  | "ES_GQ"
  | "ES_GT"
  | "ES_HN"
  | "ES_IC"
  | "ES_MX"
  | "ES_NI"
  | "ES_PA"
  | "ES_PE"
  | "ES_PH"
  | "ES_PR"
  | "ES_PY"
  | "ES_SV"
  | "ES_US"
  | "ES_UY"
  | "ES_VE"
  | "ET"
  | "ET_EE"
  | "EU"
  | "EU_ES"
  | "EWO"
  | "EWO_CM"
  | "FA"
  | "FA_AF"
  | "FA_IR"
  | "FF"
  | "FF_ADLM"
  | "FF_ADLM_BF"
  | "FF_ADLM_CM"
  | "FF_ADLM_GH"
  | "FF_ADLM_GM"
  | "FF_ADLM_GN"
  | "FF_ADLM_GW"
  | "FF_ADLM_LR"
  | "FF_ADLM_MR"
  | "FF_ADLM_NE"
  | "FF_ADLM_NG"
  | "FF_ADLM_SL"
  | "FF_ADLM_SN"
  | "FF_LATN"
  | "FF_LATN_BF"
  | "FF_LATN_CM"
  | "FF_LATN_GH"
  | "FF_LATN_GM"
  | "FF_LATN_GN"
  | "FF_LATN_GW"
  | "FF_LATN_LR"
  | "FF_LATN_MR"
  | "FF_LATN_NE"
  | "FF_LATN_NG"
  | "FF_LATN_SL"
  | "FF_LATN_SN"
  | "FI"
  | "FIL"
  | "FIL_PH"
  | "FI_FI"
  | "FO"
  | "FO_DK"
  | "FO_FO"
  | "FR"
  | "FR_BE"
  | "FR_BF"
  | "FR_BI"
  | "FR_BJ"
  | "FR_BL"
  | "FR_CA"
  | "FR_CD"
  | "FR_CF"
  | "FR_CG"
  | "FR_CH"
  | "FR_CI"
  | "FR_CM"
  | "FR_DJ"
  | "FR_DZ"
  | "FR_FR"
  | "FR_GA"
  | "FR_GF"
  | "FR_GN"
  | "FR_GP"
  | "FR_GQ"
  | "FR_HT"
  | "FR_KM"
  | "FR_LU"
  | "FR_MA"
  | "FR_MC"
  | "FR_MF"
  | "FR_MG"
  | "FR_ML"
  | "FR_MQ"
  | "FR_MR"
  | "FR_MU"
  | "FR_NC"
  | "FR_NE"
  | "FR_PF"
  | "FR_PM"
  | "FR_RE"
  | "FR_RW"
  | "FR_SC"
  | "FR_SN"
  | "FR_SY"
  | "FR_TD"
  | "FR_TG"
  | "FR_TN"
  | "FR_VU"
  | "FR_WF"
  | "FR_YT"
  | "FUR"
  | "FUR_IT"
  | "FY"
  | "FY_NL"
  | "GA"
  | "GA_GB"
  | "GA_IE"
  | "GD"
  | "GD_GB"
  | "GL"
  | "GL_ES"
  | "GSW"
  | "GSW_CH"
  | "GSW_FR"
  | "GSW_LI"
  | "GU"
  | "GUZ"
  | "GUZ_KE"
  | "GU_IN"
  | "GV"
  | "GV_IM"
  | "HA"
  | "HAW"
  | "HAW_US"
  | "HA_GH"
  | "HA_NE"
  | "HA_NG"
  | "HE"
  | "HE_IL"
  | "HI"
  | "HI_IN"
  | "HR"
  | "HR_BA"
  | "HR_HR"
  | "HSB"
  | "HSB_DE"
  | "HU"
  | "HU_HU"
  | "HY"
  | "HY_AM"
  | "IA"
  | "ID"
  | "ID_ID"
  | "IG"
  | "IG_NG"
  | "II"
  | "II_CN"
  | "IS"
  | "IS_IS"
  | "IT"
  | "IT_CH"
  | "IT_IT"
  | "IT_SM"
  | "IT_VA"
  | "JA"
  | "JA_JP"
  | "JGO"
  | "JGO_CM"
  | "JMC"
  | "JMC_TZ"
  | "JV"
  | "JV_ID"
  | "KA"
  | "KAB"
  | "KAB_DZ"
  | "KAM"
  | "KAM_KE"
  | "KA_GE"
  | "KDE"
  | "KDE_TZ"
  | "KEA"
  | "KEA_CV"
  | "KHQ"
  | "KHQ_ML"
  | "KI"
  | "KI_KE"
  | "KK"
  | "KKJ"
  | "KKJ_CM"
  | "KK_KZ"
  | "KL"
  | "KLN"
  | "KLN_KE"
  | "KL_GL"
  | "KM"
  | "KM_KH"
  | "KN"
  | "KN_IN"
  | "KO"
  | "KOK"
  | "KOK_IN"
  | "KO_KP"
  | "KO_KR"
  | "KS"
  | "KSB"
  | "KSB_TZ"
  | "KSF"
  | "KSF_CM"
  | "KSH"
  | "KSH_DE"
  | "KS_ARAB"
  | "KS_ARAB_IN"
  | "KU"
  | "KU_TR"
  | "KW"
  | "KW_GB"
  | "KY"
  | "KY_KG"
  | "LAG"
  | "LAG_TZ"
  | "LB"
  | "LB_LU"
  | "LG"
  | "LG_UG"
  | "LKT"
  | "LKT_US"
  | "LN"
  | "LN_AO"
  | "LN_CD"
  | "LN_CF"
  | "LN_CG"
  | "LO"
  | "LO_LA"
  | "LRC"
  | "LRC_IQ"
  | "LRC_IR"
  | "LT"
  | "LT_LT"
  | "LU"
  | "LUO"
  | "LUO_KE"
  | "LUY"
  | "LUY_KE"
  | "LU_CD"
  | "LV"
  | "LV_LV"
  | "MAI"
  | "MAI_IN"
  | "MAS"
  | "MAS_KE"
  | "MAS_TZ"
  | "MER"
  | "MER_KE"
  | "MFE"
  | "MFE_MU"
  | "MG"
  | "MGH"
  | "MGH_MZ"
  | "MGO"
  | "MGO_CM"
  | "MG_MG"
  | "MI"
  | "MI_NZ"
  | "MK"
  | "MK_MK"
  | "ML"
  | "ML_IN"
  | "MN"
  | "MNI"
  | "MNI_BENG"
  | "MNI_BENG_IN"
  | "MN_MN"
  | "MR"
  | "MR_IN"
  | "MS"
  | "MS_BN"
  | "MS_ID"
  | "MS_MY"
  | "MS_SG"
  | "MT"
  | "MT_MT"
  | "MUA"
  | "MUA_CM"
  | "MY"
  | "MY_MM"
  | "MZN"
  | "MZN_IR"
  | "NAQ"
  | "NAQ_NA"
  | "NB"
  | "NB_NO"
  | "NB_SJ"
  | "ND"
  | "NDS"
  | "NDS_DE"
  | "NDS_NL"
  | "ND_ZW"
  | "NE"
  | "NE_IN"
  | "NE_NP"
  | "NL"
  | "NL_AW"
  | "NL_BE"
  | "NL_BQ"
  | "NL_CW"
  | "NL_NL"
  | "NL_SR"
  | "NL_SX"
  | "NMG"
  | "NMG_CM"
  | "NN"
  | "NNH"
  | "NNH_CM"
  | "NN_NO"
  | "NUS"
  | "NUS_SS"
  | "NYN"
  | "NYN_UG"
  | "OM"
  | "OM_ET"
  | "OM_KE"
  | "OR"
  | "OR_IN"
  | "OS"
  | "OS_GE"
  | "OS_RU"
  | "PA"
  | "PA_ARAB"
  | "PA_ARAB_PK"
  | "PA_GURU"
  | "PA_GURU_IN"
  | "PCM"
  | "PCM_NG"
  | "PL"
  | "PL_PL"
  | "PRG"
  | "PS"
  | "PS_AF"
  | "PS_PK"
  | "PT"
  | "PT_AO"
  | "PT_BR"
  | "PT_CH"
  | "PT_CV"
  | "PT_GQ"
  | "PT_GW"
  | "PT_LU"
  | "PT_MO"
  | "PT_MZ"
  | "PT_PT"
  | "PT_ST"
  | "PT_TL"
  | "QU"
  | "QU_BO"
  | "QU_EC"
  | "QU_PE"
  | "RM"
  | "RM_CH"
  | "RN"
  | "RN_BI"
  | "RO"
  | "ROF"
  | "ROF_TZ"
  | "RO_MD"
  | "RO_RO"
  | "RU"
  | "RU_BY"
  | "RU_KG"
  | "RU_KZ"
  | "RU_MD"
  | "RU_RU"
  | "RU_UA"
  | "RW"
  | "RWK"
  | "RWK_TZ"
  | "RW_RW"
  | "SAH"
  | "SAH_RU"
  | "SAQ"
  | "SAQ_KE"
  | "SAT"
  | "SAT_OLCK"
  | "SAT_OLCK_IN"
  | "SBP"
  | "SBP_TZ"
  | "SD"
  | "SD_ARAB"
  | "SD_ARAB_PK"
  | "SD_DEVA"
  | "SD_DEVA_IN"
  | "SE"
  | "SEH"
  | "SEH_MZ"
  | "SES"
  | "SES_ML"
  | "SE_FI"
  | "SE_NO"
  | "SE_SE"
  | "SG"
  | "SG_CF"
  | "SHI"
  | "SHI_LATN"
  | "SHI_LATN_MA"
  | "SHI_TFNG"
  | "SHI_TFNG_MA"
  | "SI"
  | "SI_LK"
  | "SK"
  | "SK_SK"
  | "SL"
  | "SL_SI"
  | "SMN"
  | "SMN_FI"
  | "SN"
  | "SN_ZW"
  | "SO"
  | "SO_DJ"
  | "SO_ET"
  | "SO_KE"
  | "SO_SO"
  | "SQ"
  | "SQ_AL"
  | "SQ_MK"
  | "SQ_XK"
  | "SR"
  | "SR_CYRL"
  | "SR_CYRL_BA"
  | "SR_CYRL_ME"
  | "SR_CYRL_RS"
  | "SR_CYRL_XK"
  | "SR_LATN"
  | "SR_LATN_BA"
  | "SR_LATN_ME"
  | "SR_LATN_RS"
  | "SR_LATN_XK"
  | "SU"
  | "SU_LATN"
  | "SU_LATN_ID"
  | "SV"
  | "SV_AX"
  | "SV_FI"
  | "SV_SE"
  | "SW"
  | "SW_CD"
  | "SW_KE"
  | "SW_TZ"
  | "SW_UG"
  | "TA"
  | "TA_IN"
  | "TA_LK"
  | "TA_MY"
  | "TA_SG"
  | "TE"
  | "TEO"
  | "TEO_KE"
  | "TEO_UG"
  | "TE_IN"
  | "TG"
  | "TG_TJ"
  | "TH"
  | "TH_TH"
  | "TI"
  | "TI_ER"
  | "TI_ET"
  | "TK"
  | "TK_TM"
  | "TO"
  | "TO_TO"
  | "TR"
  | "TR_CY"
  | "TR_TR"
  | "TT"
  | "TT_RU"
  | "TWQ"
  | "TWQ_NE"
  | "TZM"
  | "TZM_MA"
  | "UG"
  | "UG_CN"
  | "UK"
  | "UK_UA"
  | "UR"
  | "UR_IN"
  | "UR_PK"
  | "UZ"
  | "UZ_ARAB"
  | "UZ_ARAB_AF"
  | "UZ_CYRL"
  | "UZ_CYRL_UZ"
  | "UZ_LATN"
  | "UZ_LATN_UZ"
  | "VAI"
  | "VAI_LATN"
  | "VAI_LATN_LR"
  | "VAI_VAII"
  | "VAI_VAII_LR"
  | "VI"
  | "VI_VN"
  | "VO"
  | "VUN"
  | "VUN_TZ"
  | "WAE"
  | "WAE_CH"
  | "WO"
  | "WO_SN"
  | "XH"
  | "XH_ZA"
  | "XOG"
  | "XOG_UG"
  | "YAV"
  | "YAV_CM"
  | "YI"
  | "YO"
  | "YO_BJ"
  | "YO_NG"
  | "YUE"
  | "YUE_HANS"
  | "YUE_HANS_CN"
  | "YUE_HANT"
  | "YUE_HANT_HK"
  | "ZGH"
  | "ZGH_MA"
  | "ZH"
  | "ZH_HANS"
  | "ZH_HANS_CN"
  | "ZH_HANS_HK"
  | "ZH_HANS_MO"
  | "ZH_HANS_SG"
  | "ZH_HANT"
  | "ZH_HANT_HK"
  | "ZH_HANT_MO"
  | "ZH_HANT_TW"
  | "ZU"
  | "ZU_ZA";

/**
 * Determine the mark as paid strategy for the channel.
 *
 *     TRANSACTION_FLOW - new orders marked as paid will receive a
 *     `TransactionItem` object, that will cover the `order.total`.
 *
 *     PAYMENT_FLOW - new orders marked as paid will receive a
 *     `Payment` object, that will cover the `order.total`.
 */
export type GeneratedMarkAsPaidStrategyEnum = "PAYMENT_FLOW" | "TRANSACTION_FLOW";

/** An enumeration. */
export type GeneratedMeasurementUnitsEnum =
  | "ACRE_FT"
  | "ACRE_IN"
  | "CM"
  | "CUBIC_CENTIMETER"
  | "CUBIC_DECIMETER"
  | "CUBIC_FOOT"
  | "CUBIC_INCH"
  | "CUBIC_METER"
  | "CUBIC_MILLIMETER"
  | "CUBIC_YARD"
  | "DM"
  | "FL_OZ"
  | "FT"
  | "G"
  | "INCH"
  | "KG"
  | "KM"
  | "LB"
  | "LITER"
  | "M"
  | "MM"
  | "OZ"
  | "PINT"
  | "QT"
  | "SQ_CM"
  | "SQ_DM"
  | "SQ_FT"
  | "SQ_INCH"
  | "SQ_KM"
  | "SQ_M"
  | "SQ_MM"
  | "SQ_YD"
  | "TONNE"
  | "YD";

export type GeneratedMediaChoicesSortField =
  /** Sort media by ID. */
  "ID";

/** An enumeration. */
export type GeneratedMenuErrorCode =
  | "CANNOT_ASSIGN_NODE"
  | "GRAPHQL_ERROR"
  | "INVALID"
  | "INVALID_MENU_ITEM"
  | "NOT_FOUND"
  | "NO_MENU_ITEM_PROVIDED"
  | "REQUIRED"
  | "TOO_MANY_MENU_ITEMS"
  | "UNIQUE";

export type GeneratedMenuItemsSortField =
  /** Sort menu items by name. */
  "NAME";

export type GeneratedMenuSortField =
  /** Sort menus by items count. */
  | "ITEMS_COUNT"
  /** Sort menus by name. */
  | "NAME";

/** An enumeration. */
export type GeneratedMetadataErrorCode =
  | "GRAPHQL_ERROR"
  | "INVALID"
  | "NOT_FOUND"
  | "NOT_UPDATED"
  | "REQUIRED";

export type GeneratedNavigationType =
  /** Main storefront navigation. */
  | "MAIN"
  /** Secondary storefront navigation. */
  | "SECONDARY";

export type GeneratedOrderAction =
  /** Represents the capture action. */
  | "CAPTURE"
  /** Represents a mark-as-paid action. */
  | "MARK_AS_PAID"
  /** Represents a refund action. */
  | "REFUND"
  /** Represents a void action. */
  | "VOID";

/**
 * Determine a current authorize status for order.
 *
 *     We treat the order as fully authorized when the sum of authorized and charged funds
 *     cover the `order.total`-`order.totalGrantedRefund`.
 *     We treat the order as partially authorized when the sum of authorized and charged
 *     funds covers only part of the `order.total`-`order.totalGrantedRefund`.
 *     We treat the order as not authorized when the sum of authorized and charged funds is
 *     0.
 *
 *     NONE - the funds are not authorized
 *     PARTIAL - the funds that are authorized and charged don't cover fully the
 *     `order.total`-`order.totalGrantedRefund`
 *     FULL - the funds that are authorized and charged fully cover the
 *     `order.total`-`order.totalGrantedRefund`
 */
export type GeneratedOrderAuthorizeStatusEnum = "FULL" | "NONE" | "PARTIAL";

/** An enumeration. */
export type GeneratedOrderBulkCreateErrorCode =
  | "BULK_LIMIT"
  | "FUTURE_DATE"
  | "GRAPHQL_ERROR"
  | "INCORRECT_CURRENCY"
  | "INSUFFICIENT_STOCK"
  | "INVALID"
  | "INVALID_QUANTITY"
  | "METADATA_KEY_REQUIRED"
  | "NEGATIVE_INDEX"
  | "NON_EXISTING_STOCK"
  | "NOTE_LENGTH"
  | "NOT_FOUND"
  | "NO_RELATED_ORDER_LINE"
  | "ORDER_LINE_FULFILLMENT_LINE_MISMATCH"
  | "PRICE_ERROR"
  | "REQUIRED"
  | "TOO_MANY_IDENTIFIERS"
  | "UNIQUE";

/**
 * Determine the current charge status for the order.
 *
 *     An order is considered overcharged when the sum of the
 *     transactionItem's charge amounts exceeds the value of
 *     `order.total` - `order.totalGrantedRefund`.
 *     If the sum of the transactionItem's charge amounts equals
 *     `order.total` - `order.totalGrantedRefund`, we consider the order to be fully
 *     charged.
 *     If the sum of the transactionItem's charge amounts covers a part of the
 *     `order.total` - `order.totalGrantedRefund`, we treat the order as partially charged.
 *
 *     NONE - the funds are not charged.
 *     PARTIAL - the funds that are charged don't cover the
 *     `order.total`-`order.totalGrantedRefund`
 *     FULL - the funds that are charged fully cover the
 *     `order.total`-`order.totalGrantedRefund`
 *     OVERCHARGED - the charged funds are bigger than the
 *     `order.total`-`order.totalGrantedRefund`
 */
export type GeneratedOrderChargeStatusEnum = "FULL" | "NONE" | "OVERCHARGED" | "PARTIAL";

/** An enumeration. */
export type GeneratedOrderCreateFromCheckoutErrorCode =
  | "BILLING_ADDRESS_NOT_SET"
  | "CHANNEL_INACTIVE"
  | "CHECKOUT_NOT_FOUND"
  | "EMAIL_NOT_SET"
  | "GIFT_CARD_NOT_APPLICABLE"
  | "GRAPHQL_ERROR"
  | "INSUFFICIENT_STOCK"
  | "INVALID_SHIPPING_METHOD"
  | "NO_LINES"
  | "SHIPPING_ADDRESS_NOT_SET"
  | "SHIPPING_METHOD_NOT_SET"
  | "TAX_ERROR"
  | "UNAVAILABLE_VARIANT_IN_CHANNEL"
  | "VOUCHER_NOT_APPLICABLE";

export type GeneratedOrderDirection =
  /** Specifies an ascending sort order. */
  | "ASC"
  /** Specifies a descending sort order. */
  | "DESC";

/** An enumeration. */
export type GeneratedOrderDiscountType = "MANUAL" | "SALE" | "VOUCHER";

/** An enumeration. */
export type GeneratedOrderErrorCode =
  | "BILLING_ADDRESS_NOT_SET"
  | "CANNOT_CANCEL_FULFILLMENT"
  | "CANNOT_CANCEL_ORDER"
  | "CANNOT_DELETE"
  | "CANNOT_DISCOUNT"
  | "CANNOT_FULFILL_UNPAID_ORDER"
  | "CANNOT_REFUND"
  | "CAPTURE_INACTIVE_PAYMENT"
  | "CHANNEL_INACTIVE"
  | "DUPLICATED_INPUT_ITEM"
  | "FULFILL_ORDER_LINE"
  | "GIFT_CARD_LINE"
  | "GRAPHQL_ERROR"
  | "INSUFFICIENT_STOCK"
  | "INVALID"
  | "INVALID_QUANTITY"
  | "NOT_AVAILABLE_IN_CHANNEL"
  | "NOT_EDITABLE"
  | "NOT_FOUND"
  | "ORDER_NO_SHIPPING_ADDRESS"
  | "PAYMENT_ERROR"
  | "PAYMENT_MISSING"
  | "PRODUCT_NOT_PUBLISHED"
  | "PRODUCT_UNAVAILABLE_FOR_PURCHASE"
  | "REQUIRED"
  | "SHIPPING_METHOD_NOT_APPLICABLE"
  | "SHIPPING_METHOD_REQUIRED"
  | "TAX_ERROR"
  | "TRANSACTION_ERROR"
  | "UNIQUE"
  | "VOID_INACTIVE_PAYMENT"
  | "ZERO_QUANTITY";

/** An enumeration. */
export type GeneratedOrderEventsEmailsEnum =
  | "CONFIRMED"
  | "DIGITAL_LINKS"
  | "FULFILLMENT_CONFIRMATION"
  | "ORDER_CANCEL"
  | "ORDER_CONFIRMATION"
  | "ORDER_REFUND"
  | "PAYMENT_CONFIRMATION"
  | "SHIPPING_CONFIRMATION"
  | "TRACKING_UPDATED";

/** The different order event types. */
export type GeneratedOrderEventsEnum =
  | "ADDED_PRODUCTS"
  | "CANCELED"
  | "CONFIRMED"
  | "DRAFT_CREATED"
  | "DRAFT_CREATED_FROM_REPLACE"
  | "EMAIL_SENT"
  | "EXPIRED"
  | "EXTERNAL_SERVICE_NOTIFICATION"
  | "FULFILLMENT_AWAITS_APPROVAL"
  | "FULFILLMENT_CANCELED"
  | "FULFILLMENT_FULFILLED_ITEMS"
  | "FULFILLMENT_REFUNDED"
  | "FULFILLMENT_REPLACED"
  | "FULFILLMENT_RESTOCKED_ITEMS"
  | "FULFILLMENT_RETURNED"
  | "INVOICE_GENERATED"
  | "INVOICE_REQUESTED"
  | "INVOICE_SENT"
  | "INVOICE_UPDATED"
  | "NOTE_ADDED"
  | "NOTE_UPDATED"
  | "ORDER_DISCOUNT_ADDED"
  | "ORDER_DISCOUNT_AUTOMATICALLY_UPDATED"
  | "ORDER_DISCOUNT_DELETED"
  | "ORDER_DISCOUNT_UPDATED"
  | "ORDER_FULLY_PAID"
  | "ORDER_LINE_DISCOUNT_REMOVED"
  | "ORDER_LINE_DISCOUNT_UPDATED"
  | "ORDER_LINE_PRODUCT_DELETED"
  | "ORDER_LINE_VARIANT_DELETED"
  | "ORDER_MARKED_AS_PAID"
  | "ORDER_REPLACEMENT_CREATED"
  | "OTHER"
  | "OVERSOLD_ITEMS"
  | "PAYMENT_AUTHORIZED"
  | "PAYMENT_CAPTURED"
  | "PAYMENT_FAILED"
  | "PAYMENT_REFUNDED"
  | "PAYMENT_VOIDED"
  | "PLACED"
  | "PLACED_FROM_DRAFT"
  | "REMOVED_PRODUCTS"
  | "TRACKING_UPDATED"
  | "TRANSACTION_CANCEL_REQUESTED"
  | "TRANSACTION_CHARGE_REQUESTED"
  | "TRANSACTION_EVENT"
  | "TRANSACTION_MARK_AS_PAID_FAILED"
  | "TRANSACTION_REFUND_REQUESTED"
  | "UPDATED_ADDRESS";

/** An enumeration. */
export type GeneratedOrderGrantRefundCreateErrorCode =
  | "GRAPHQL_ERROR"
  | "INVALID"
  | "NOT_FOUND"
  | "REQUIRED"
  | "SHIPPING_COSTS_ALREADY_GRANTED";

/** An enumeration. */
export type GeneratedOrderGrantRefundCreateLineErrorCode =
  | "GRAPHQL_ERROR"
  | "NOT_FOUND"
  | "QUANTITY_GREATER_THAN_AVAILABLE";

/** An enumeration. */
export type GeneratedOrderGrantRefundUpdateErrorCode =
  | "GRAPHQL_ERROR"
  | "INVALID"
  | "NOT_FOUND"
  | "REQUIRED"
  | "SHIPPING_COSTS_ALREADY_GRANTED";

/** An enumeration. */
export type GeneratedOrderGrantRefundUpdateLineErrorCode =
  | "GRAPHQL_ERROR"
  | "NOT_FOUND"
  | "QUANTITY_GREATER_THAN_AVAILABLE";

/** An enumeration. */
export type GeneratedOrderNoteAddErrorCode = "GRAPHQL_ERROR" | "REQUIRED";

/** An enumeration. */
export type GeneratedOrderNoteUpdateErrorCode = "GRAPHQL_ERROR" | "NOT_FOUND" | "REQUIRED";

/** An enumeration. */
export type GeneratedOrderOriginEnum = "BULK_CREATE" | "CHECKOUT" | "DRAFT" | "REISSUE";

/** An enumeration. */
export type GeneratedOrderSettingsErrorCode = "INVALID";

export type GeneratedOrderSortField =
  /**
   * Sort orders by creation date.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0.
   */
  | "CREATED_AT"
  /**
   * Sort orders by creation date.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0.
   */
  | "CREATION_DATE"
  /** Sort orders by customer. */
  | "CUSTOMER"
  /** Sort orders by fulfillment status. */
  | "FULFILLMENT_STATUS"
  /** Sort orders by last modified at. */
  | "LAST_MODIFIED_AT"
  /** Sort orders by number. */
  | "NUMBER"
  /** Sort orders by payment. */
  | "PAYMENT"
  /** Sort orders by rank. Note: This option is available only with the `search` filter. */
  | "RANK";

/** An enumeration. */
export type GeneratedOrderStatus =
  | "CANCELED"
  | "DRAFT"
  | "EXPIRED"
  | "FULFILLED"
  | "PARTIALLY_FULFILLED"
  | "PARTIALLY_RETURNED"
  | "RETURNED"
  | "UNCONFIRMED"
  | "UNFULFILLED";

export type GeneratedOrderStatusFilter =
  | "CANCELED"
  | "FULFILLED"
  | "PARTIALLY_FULFILLED"
  | "READY_TO_CAPTURE"
  | "READY_TO_FULFILL"
  | "UNCONFIRMED"
  | "UNFULFILLED";

/** An enumeration. */
export type GeneratedPageErrorCode =
  | "ATTRIBUTE_ALREADY_ASSIGNED"
  | "DUPLICATED_INPUT_ITEM"
  | "GRAPHQL_ERROR"
  | "INVALID"
  | "NOT_FOUND"
  | "REQUIRED"
  | "UNIQUE";

export type GeneratedPageSortField =
  /**
   * Sort pages by creation date.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0.
   */
  | "CREATED_AT"
  /**
   * Sort pages by creation date.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0.
   */
  | "CREATION_DATE"
  /**
   * Sort pages by publication date.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0.
   */
  | "PUBLICATION_DATE"
  /**
   * Sort pages by publication date.
   *
   * DEPRECATED: this field will be removed in Saleor 4.0.
   */
  | "PUBLISHED_AT"
  /** Sort pages by slug. */
  | "SLUG"
  /** Sort pages by title. */
  | "TITLE"
  /** Sort pages by visibility. */
  | "VISIBILITY";

export type GeneratedPageTypeSortField =
  /** Sort page types by name. */
  | "NAME"
  /** Sort page types by slug. */
  | "SLUG";

/** An enumeration. */
export type GeneratedPaymentChargeStatusEnum =
  | "CANCELLED"
  | "FULLY_CHARGED"
  | "FULLY_REFUNDED"
  | "NOT_CHARGED"
  | "PARTIALLY_CHARGED"
  | "PARTIALLY_REFUNDED"
  | "PENDING"
  | "REFUSED";

/** An enumeration. */
export type GeneratedPaymentErrorCode =
  | "BALANCE_CHECK_ERROR"
  | "BILLING_ADDRESS_NOT_SET"
  | "CHANNEL_INACTIVE"
  | "CHECKOUT_EMAIL_NOT_SET"
  | "GRAPHQL_ERROR"
  | "INVALID"
  | "INVALID_SHIPPING_METHOD"
  | "NOT_FOUND"
  | "NOT_SUPPORTED_GATEWAY"
  | "NO_CHECKOUT_LINES"
  | "PARTIAL_PAYMENT_NOT_ALLOWED"
  | "PAYMENT_ERROR"
  | "REQUIRED"
  | "SHIPPING_ADDRESS_NOT_SET"
  | "SHIPPING_METHOD_NOT_SET"
  | "UNAVAILABLE_VARIANT_IN_CHANNEL"
  | "UNIQUE";

/** An enumeration. */
export type GeneratedPaymentGatewayConfigErrorCode = "GRAPHQL_ERROR" | "INVALID" | "NOT_FOUND";

/** An enumeration. */
export type GeneratedPaymentGatewayInitializeErrorCode = "GRAPHQL_ERROR" | "INVALID" | "NOT_FOUND";

/** An enumeration. */
export type GeneratedPermissionEnum =
  | "HANDLE_CHECKOUTS"
  | "HANDLE_PAYMENTS"
  | "HANDLE_TAXES"
  | "IMPERSONATE_USER"
  | "MANAGE_APPS"
  | "MANAGE_CHANNELS"
  | "MANAGE_CHECKOUTS"
  | "MANAGE_DISCOUNTS"
  | "MANAGE_GIFT_CARD"
  | "MANAGE_MENUS"
  | "MANAGE_OBSERVABILITY"
  | "MANAGE_ORDERS"
  | "MANAGE_ORDERS_IMPORT"
  | "MANAGE_PAGES"
  | "MANAGE_PAGE_TYPES_AND_ATTRIBUTES"
  | "MANAGE_PLUGINS"
  | "MANAGE_PRODUCTS"
  | "MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES"
  | "MANAGE_SETTINGS"
  | "MANAGE_SHIPPING"
  | "MANAGE_STAFF"
  | "MANAGE_TAXES"
  | "MANAGE_TRANSLATIONS"
  | "MANAGE_USERS";

/** An enumeration. */
export type GeneratedPermissionGroupErrorCode =
  | "ASSIGN_NON_STAFF_MEMBER"
  | "CANNOT_REMOVE_FROM_LAST_GROUP"
  | "DUPLICATED_INPUT_ITEM"
  | "LEFT_NOT_MANAGEABLE_PERMISSION"
  | "OUT_OF_SCOPE_CHANNEL"
  | "OUT_OF_SCOPE_PERMISSION"
  | "OUT_OF_SCOPE_USER"
  | "REQUIRED"
  | "UNIQUE";

/** Sorting options for permission groups. */
export type GeneratedPermissionGroupSortField =
  /** Sort permission group accounts by name. */
  "NAME";

export type GeneratedPluginConfigurationType = "GLOBAL" | "PER_CHANNEL";

/** An enumeration. */
export type GeneratedPluginErrorCode =
  | "GRAPHQL_ERROR"
  | "INVALID"
  | "NOT_FOUND"
  | "PLUGIN_MISCONFIGURED"
  | "REQUIRED"
  | "UNIQUE";

export type GeneratedPluginSortField = "IS_ACTIVE" | "NAME";

/** An enumeration. */
export type GeneratedPostalCodeRuleInclusionTypeEnum = "EXCLUDE" | "INCLUDE";

export type GeneratedProductAttributeType = "PRODUCT" | "VARIANT";

/** An enumeration. */
export type GeneratedProductBulkCreateErrorCode =
  | "ATTRIBUTE_ALREADY_ASSIGNED"
  | "ATTRIBUTE_CANNOT_BE_ASSIGNED"
  | "ATTRIBUTE_VARIANTS_DISABLED"
  | "BLANK"
  | "DUPLICATED_INPUT_ITEM"
  | "GRAPHQL_ERROR"
  | "INVALID"
  | "INVALID_PRICE"
  | "MAX_LENGTH"
  | "NOT_FOUND"
  | "PRODUCT_NOT_ASSIGNED_TO_CHANNEL"
  | "PRODUCT_WITHOUT_CATEGORY"
  | "REQUIRED"
  | "UNIQUE"
  | "UNSUPPORTED_MEDIA_PROVIDER";

/** An enumeration. */
export type GeneratedProductErrorCode =
  | "ALREADY_EXISTS"
  | "ATTRIBUTE_ALREADY_ASSIGNED"
  | "ATTRIBUTE_CANNOT_BE_ASSIGNED"
  | "ATTRIBUTE_VARIANTS_DISABLED"
  | "CANNOT_MANAGE_PRODUCT_WITHOUT_VARIANT"
  | "DUPLICATED_INPUT_ITEM"
  | "GRAPHQL_ERROR"
  | "INVALID"
  | "INVALID_PRICE"
  | "MEDIA_ALREADY_ASSIGNED"
  | "NOT_FOUND"
  | "NOT_PRODUCTS_IMAGE"
  | "NOT_PRODUCTS_VARIANT"
  | "PREORDER_VARIANT_CANNOT_BE_DEACTIVATED"
  | "PRODUCT_NOT_ASSIGNED_TO_CHANNEL"
  | "PRODUCT_WITHOUT_CATEGORY"
  | "REQUIRED"
  | "UNIQUE"
  | "UNSUPPORTED_MEDIA_PROVIDER"
  | "VARIANT_NO_DIGITAL_CONTENT";

export type GeneratedProductFieldEnum =
  | "CATEGORY"
  | "CHARGE_TAXES"
  | "COLLECTIONS"
  | "DESCRIPTION"
  | "NAME"
  | "PRODUCT_MEDIA"
  | "PRODUCT_TYPE"
  | "PRODUCT_WEIGHT"
  | "VARIANT_ID"
  | "VARIANT_MEDIA"
  | "VARIANT_SKU"
  | "VARIANT_WEIGHT";

/** An enumeration. */
export type GeneratedProductMediaType = "IMAGE" | "VIDEO";

export type GeneratedProductOrderField =
  /**
   * Sort products by collection. Note: This option is available only for the `Collection.products` query.
   *
   * This option requires a channel filter to work as the values can vary between channels.
   */
  | "COLLECTION"
  /**
   * Sort products by creation date.
   *
   * Added in Saleor 3.8.
   */
  | "CREATED_AT"
  /** Sort products by update date. */
  | "DATE"
  /** Sort products by update date. */
  | "LAST_MODIFIED"
  /** Sort products by update date. */
  | "LAST_MODIFIED_AT"
  /**
   * Sort products by a minimal price of a product's variant.
   *
   * This option requires a channel filter to work as the values can vary between channels.
   */
  | "MINIMAL_PRICE"
  /** Sort products by name. */
  | "NAME"
  /**
   * Sort products by price.
   *
   * This option requires a channel filter to work as the values can vary between channels.
   */
  | "PRICE"
  /**
   * Sort products by publication date.
   *
   * This option requires a channel filter to work as the values can vary between channels.
   */
  | "PUBLICATION_DATE"
  /**
   * Sort products by publication status.
   *
   * This option requires a channel filter to work as the values can vary between channels.
   */
  | "PUBLISHED"
  /**
   * Sort products by publication date.
   *
   * This option requires a channel filter to work as the values can vary between channels.
   */
  | "PUBLISHED_AT"
  /** Sort products by rank. Note: This option is available only with the `search` filter. */
  | "RANK"
  /** Sort products by rating. */
  | "RATING"
  /** Sort products by type. */
  | "TYPE";

/** An enumeration. */
export type GeneratedProductTranslateErrorCode =
  | "GRAPHQL_ERROR"
  | "INVALID"
  | "NOT_FOUND"
  | "REQUIRED";

export type GeneratedProductTypeConfigurable = "CONFIGURABLE" | "SIMPLE";

export type GeneratedProductTypeEnum = "DIGITAL" | "SHIPPABLE";

/** An enumeration. */
export type GeneratedProductTypeKindEnum = "GIFT_CARD" | "NORMAL";

export type GeneratedProductTypeSortField =
  /** Sort products by type. */
  | "DIGITAL"
  /** Sort products by name. */
  | "NAME"
  /** Sort products by shipping. */
  | "SHIPPING_REQUIRED";

/** An enumeration. */
export type GeneratedProductVariantBulkErrorCode =
  | "ATTRIBUTE_ALREADY_ASSIGNED"
  | "ATTRIBUTE_CANNOT_BE_ASSIGNED"
  | "ATTRIBUTE_VARIANTS_DISABLED"
  | "DUPLICATED_INPUT_ITEM"
  | "GRAPHQL_ERROR"
  | "INVALID"
  | "INVALID_PRICE"
  | "NOT_FOUND"
  | "NOT_PRODUCTS_VARIANT"
  | "PRODUCT_NOT_ASSIGNED_TO_CHANNEL"
  | "REQUIRED"
  | "UNIQUE";

export type GeneratedProductVariantSortField =
  /** Sort products variants by last modified at. */
  "LAST_MODIFIED_AT";

/** An enumeration. */
export type GeneratedProductVariantTranslateErrorCode =
  | "GRAPHQL_ERROR"
  | "INVALID"
  | "NOT_FOUND"
  | "REQUIRED";

export type GeneratedReportingPeriod = "THIS_MONTH" | "TODAY";

export type GeneratedSaleSortField =
  /** Sort sales by created at. */
  | "CREATED_AT"
  /** Sort sales by end date. */
  | "END_DATE"
  /** Sort sales by last modified at. */
  | "LAST_MODIFIED_AT"
  /** Sort sales by name. */
  | "NAME"
  /** Sort sales by start date. */
  | "START_DATE"
  /** Sort sales by type. */
  | "TYPE"
  /**
   * Sort sales by value.
   *
   * This option requires a channel filter to work as the values can vary between channels.
   */
  | "VALUE";

export type GeneratedSaleType = "FIXED" | "PERCENTAGE";

/** An enumeration. */
export type GeneratedSendConfirmationEmailErrorCode =
  | "ACCOUNT_CONFIRMED"
  | "CONFIRMATION_ALREADY_REQUESTED"
  | "INVALID"
  | "MISSING_CHANNEL_SLUG";

/** An enumeration. */
export type GeneratedShippingErrorCode =
  | "ALREADY_EXISTS"
  | "DUPLICATED_INPUT_ITEM"
  | "GRAPHQL_ERROR"
  | "INVALID"
  | "MAX_LESS_THAN_MIN"
  | "NOT_FOUND"
  | "REQUIRED"
  | "UNIQUE";

/** An enumeration. */
export type GeneratedShippingMethodTypeEnum = "PRICE" | "WEIGHT";

/** An enumeration. */
export type GeneratedShopErrorCode =
  | "ALREADY_EXISTS"
  | "CANNOT_FETCH_TAX_RATES"
  | "GRAPHQL_ERROR"
  | "INVALID"
  | "NOT_FOUND"
  | "REQUIRED"
  | "UNIQUE";

/** Represents status of a staff account. */
export type GeneratedStaffMemberStatus =
  /** User account has been activated. */
  | "ACTIVE"
  /** User account has not been activated yet. */
  | "DEACTIVATED";

export type GeneratedStockAvailability = "IN_STOCK" | "OUT_OF_STOCK";

/** An enumeration. */
export type GeneratedStockBulkUpdateErrorCode =
  | "GRAPHQL_ERROR"
  | "INVALID"
  | "NOT_FOUND"
  | "REQUIRED";

/** An enumeration. */
export type GeneratedStockErrorCode =
  | "ALREADY_EXISTS"
  | "GRAPHQL_ERROR"
  | "INVALID"
  | "NOT_FOUND"
  | "REQUIRED"
  | "UNIQUE";

/**
 * Determine how stocks should be updated, while processing an order.
 *
 *     SKIP - stocks are not checked and not updated.
 *     UPDATE - only do update, if there is enough stock.
 *     FORCE - force update, if there is not enough stock.
 */
export type GeneratedStockUpdatePolicyEnum = "FORCE" | "SKIP" | "UPDATE";

/** Enum representing the type of a payment storage in a gateway. */
export type GeneratedStorePaymentMethodEnum =
  /** Storage is disabled. The payment is not stored. */
  | "NONE"
  /** Off session storage type. The payment is stored to be reused even if the customer is absent. */
  | "OFF_SESSION"
  /** On session storage type. The payment is stored only to be reused when the customer is present in the checkout flow. */
  | "ON_SESSION";

export type GeneratedTaxCalculationStrategy = "FLAT_RATES" | "TAX_APP";

/** An enumeration. */
export type GeneratedTaxClassCreateErrorCode = "GRAPHQL_ERROR" | "INVALID" | "NOT_FOUND";

/** An enumeration. */
export type GeneratedTaxClassDeleteErrorCode = "GRAPHQL_ERROR" | "INVALID" | "NOT_FOUND";

export type GeneratedTaxClassSortField =
  /** Sort tax classes by name. */
  "NAME";

/** An enumeration. */
export type GeneratedTaxClassUpdateErrorCode =
  | "DUPLICATED_INPUT_ITEM"
  | "GRAPHQL_ERROR"
  | "INVALID"
  | "NOT_FOUND";

/** An enumeration. */
export type GeneratedTaxConfigurationUpdateErrorCode =
  | "DUPLICATED_INPUT_ITEM"
  | "GRAPHQL_ERROR"
  | "INVALID"
  | "NOT_FOUND";

/** An enumeration. */
export type GeneratedTaxCountryConfigurationDeleteErrorCode =
  | "GRAPHQL_ERROR"
  | "INVALID"
  | "NOT_FOUND";

/** An enumeration. */
export type GeneratedTaxCountryConfigurationUpdateErrorCode =
  | "CANNOT_CREATE_NEGATIVE_RATE"
  | "GRAPHQL_ERROR"
  | "INVALID"
  | "NOT_FOUND"
  | "ONLY_ONE_DEFAULT_COUNTRY_RATE_ALLOWED";

/** An enumeration. */
export type GeneratedTaxExemptionManageErrorCode =
  | "GRAPHQL_ERROR"
  | "INVALID"
  | "NOT_EDITABLE_ORDER"
  | "NOT_FOUND";

/** An enumeration. */
export type GeneratedThumbnailFormatEnum = "AVIF" | "ORIGINAL" | "WEBP";

/** An enumeration. */
export type GeneratedTimePeriodTypeEnum = "DAY" | "MONTH" | "WEEK" | "YEAR";

/**
 * Represents possible actions on payment transaction.
 *
 *     The following actions are possible:
 *     CHARGE - Represents the charge action.
 *     REFUND - Represents a refund action.
 *     CANCEL - Represents a cancel action. Added in Saleor 3.12.
 */
export type GeneratedTransactionActionEnum = "CANCEL" | "CHARGE" | "REFUND";

/** An enumeration. */
export type GeneratedTransactionCreateErrorCode =
  | "GRAPHQL_ERROR"
  | "INCORRECT_CURRENCY"
  | "INVALID"
  | "METADATA_KEY_REQUIRED"
  | "NOT_FOUND"
  | "UNIQUE";

/** An enumeration. */
export type GeneratedTransactionEventReportErrorCode =
  | "ALREADY_EXISTS"
  | "GRAPHQL_ERROR"
  | "INCORRECT_DETAILS"
  | "INVALID"
  | "NOT_FOUND";

/**
 * Represents possible event types.
 *
 *     Added in Saleor 3.12.
 *
 *     The following types are possible:
 *     AUTHORIZATION_SUCCESS - represents success authorization.
 *     AUTHORIZATION_FAILURE - represents failure authorization.
 *     AUTHORIZATION_ADJUSTMENT - represents authorization adjustment.
 *     AUTHORIZATION_REQUEST - represents authorization request.
 *     AUTHORIZATION_ACTION_REQUIRED - represents authorization that needs
 *     additional actions from the customer.
 *     CHARGE_ACTION_REQUIRED - represents charge that needs
 *     additional actions from the customer.
 *     CHARGE_SUCCESS - represents success charge.
 *     CHARGE_FAILURE - represents failure charge.
 *     CHARGE_BACK - represents chargeback.
 *     CHARGE_REQUEST - represents charge request.
 *     REFUND_SUCCESS - represents success refund.
 *     REFUND_FAILURE - represents failure refund.
 *     REFUND_REVERSE - represents reverse refund.
 *     REFUND_REQUEST - represents refund request.
 *     CANCEL_SUCCESS - represents success cancel.
 *     CANCEL_FAILURE - represents failure cancel.
 *     CANCEL_REQUEST - represents cancel request.
 *     INFO - represents info event.
 */
export type GeneratedTransactionEventTypeEnum =
  | "AUTHORIZATION_ACTION_REQUIRED"
  | "AUTHORIZATION_ADJUSTMENT"
  | "AUTHORIZATION_FAILURE"
  | "AUTHORIZATION_REQUEST"
  | "AUTHORIZATION_SUCCESS"
  | "CANCEL_FAILURE"
  | "CANCEL_REQUEST"
  | "CANCEL_SUCCESS"
  | "CHARGE_ACTION_REQUIRED"
  | "CHARGE_BACK"
  | "CHARGE_FAILURE"
  | "CHARGE_REQUEST"
  | "CHARGE_SUCCESS"
  | "INFO"
  | "REFUND_FAILURE"
  | "REFUND_REQUEST"
  | "REFUND_REVERSE"
  | "REFUND_SUCCESS";

/**
 * Determine the transaction flow strategy.
 *
 *     AUTHORIZATION - the processed transaction should be only authorized
 *     CHARGE - the processed transaction should be charged.
 */
export type GeneratedTransactionFlowStrategyEnum = "AUTHORIZATION" | "CHARGE";

/** An enumeration. */
export type GeneratedTransactionInitializeErrorCode = "GRAPHQL_ERROR" | "INVALID" | "NOT_FOUND";

/** An enumeration. */
export type GeneratedTransactionKind =
  | "ACTION_TO_CONFIRM"
  | "AUTH"
  | "CANCEL"
  | "CAPTURE"
  | "CONFIRM"
  | "EXTERNAL"
  | "PENDING"
  | "REFUND"
  | "REFUND_ONGOING"
  | "VOID";

/** An enumeration. */
export type GeneratedTransactionProcessErrorCode =
  | "GRAPHQL_ERROR"
  | "INVALID"
  | "MISSING_PAYMENT_APP"
  | "MISSING_PAYMENT_APP_RELATION"
  | "NOT_FOUND"
  | "TRANSACTION_ALREADY_PROCESSED";

/** An enumeration. */
export type GeneratedTransactionRequestActionErrorCode =
  | "GRAPHQL_ERROR"
  | "INVALID"
  | "MISSING_TRANSACTION_ACTION_REQUEST_WEBHOOK"
  | "NOT_FOUND";

/** An enumeration. */
export type GeneratedTransactionRequestRefundForGrantedRefundErrorCode =
  | "GRAPHQL_ERROR"
  | "INVALID"
  | "MISSING_TRANSACTION_ACTION_REQUEST_WEBHOOK"
  | "NOT_FOUND";

/** An enumeration. */
export type GeneratedTransactionUpdateErrorCode =
  | "GRAPHQL_ERROR"
  | "INCORRECT_CURRENCY"
  | "INVALID"
  | "METADATA_KEY_REQUIRED"
  | "NOT_FOUND"
  | "UNIQUE";

export type GeneratedTranslatableKinds =
  | "ATTRIBUTE"
  | "ATTRIBUTE_VALUE"
  | "CATEGORY"
  | "COLLECTION"
  | "MENU_ITEM"
  | "PAGE"
  | "PRODUCT"
  | "SALE"
  | "SHIPPING_METHOD"
  | "VARIANT"
  | "VOUCHER";

/** An enumeration. */
export type GeneratedTranslationErrorCode = "GRAPHQL_ERROR" | "INVALID" | "NOT_FOUND" | "REQUIRED";

/** An enumeration. */
export type GeneratedUploadErrorCode = "GRAPHQL_ERROR";

export type GeneratedUserSortField =
  /** Sort users by created at. */
  | "CREATED_AT"
  /** Sort users by email. */
  | "EMAIL"
  /** Sort users by first name. */
  | "FIRST_NAME"
  /** Sort users by last modified at. */
  | "LAST_MODIFIED_AT"
  /** Sort users by last name. */
  | "LAST_NAME"
  /** Sort users by order count. */
  | "ORDER_COUNT";

export type GeneratedVariantAttributeScope = "ALL" | "NOT_VARIANT_SELECTION" | "VARIANT_SELECTION";

/** An enumeration. */
export type GeneratedVolumeUnitsEnum =
  | "ACRE_FT"
  | "ACRE_IN"
  | "CUBIC_CENTIMETER"
  | "CUBIC_DECIMETER"
  | "CUBIC_FOOT"
  | "CUBIC_INCH"
  | "CUBIC_METER"
  | "CUBIC_MILLIMETER"
  | "CUBIC_YARD"
  | "FL_OZ"
  | "LITER"
  | "PINT"
  | "QT";

export type GeneratedVoucherDiscountType = "FIXED" | "PERCENTAGE" | "SHIPPING";

export type GeneratedVoucherSortField =
  /** Sort vouchers by code. */
  | "CODE"
  /** Sort vouchers by end date. */
  | "END_DATE"
  /**
   * Sort vouchers by minimum spent amount.
   *
   * This option requires a channel filter to work as the values can vary between channels.
   */
  | "MINIMUM_SPENT_AMOUNT"
  /** Sort vouchers by start date. */
  | "START_DATE"
  /** Sort vouchers by type. */
  | "TYPE"
  /** Sort vouchers by usage limit. */
  | "USAGE_LIMIT"
  /**
   * Sort vouchers by value.
   *
   * This option requires a channel filter to work as the values can vary between channels.
   */
  | "VALUE";

export type GeneratedVoucherTypeEnum = "ENTIRE_ORDER" | "SHIPPING" | "SPECIFIC_PRODUCT";

/** An enumeration. */
export type GeneratedWarehouseClickAndCollectOptionEnum = "ALL" | "DISABLED" | "LOCAL";

/** An enumeration. */
export type GeneratedWarehouseErrorCode =
  | "ALREADY_EXISTS"
  | "GRAPHQL_ERROR"
  | "INVALID"
  | "NOT_FOUND"
  | "REQUIRED"
  | "UNIQUE";

export type GeneratedWarehouseSortField =
  /** Sort warehouses by name. */
  "NAME";

/** An enumeration. */
export type GeneratedWebhookDryRunErrorCode =
  | "GRAPHQL_ERROR"
  | "INVALID_ID"
  | "MISSING_EVENT"
  | "MISSING_PERMISSION"
  | "MISSING_SUBSCRIPTION"
  | "NOT_FOUND"
  | "SYNTAX"
  | "TYPE_NOT_SUPPORTED"
  | "UNABLE_TO_PARSE";

/** An enumeration. */
export type GeneratedWebhookErrorCode =
  | "DELETE_FAILED"
  | "GRAPHQL_ERROR"
  | "INVALID"
  | "INVALID_CUSTOM_HEADERS"
  | "INVALID_NOTIFY_WITH_SUBSCRIPTION"
  | "MISSING_EVENT"
  | "MISSING_SUBSCRIPTION"
  | "NOT_FOUND"
  | "REQUIRED"
  | "SYNTAX"
  | "UNABLE_TO_PARSE"
  | "UNIQUE";

/** Enum determining type of webhook. */
export type GeneratedWebhookEventTypeAsyncEnum =
  /** An account email change is requested. */
  | "ACCOUNT_CHANGE_EMAIL_REQUESTED"
  /** An account confirmation is requested. */
  | "ACCOUNT_CONFIRMATION_REQUESTED"
  /** An account is confirmed. */
  | "ACCOUNT_CONFIRMED"
  /** An account is deleted. */
  | "ACCOUNT_DELETED"
  /** An account delete is requested. */
  | "ACCOUNT_DELETE_REQUESTED"
  /** An account email was changed */
  | "ACCOUNT_EMAIL_CHANGED"
  /** Setting a new password for the account is requested. */
  | "ACCOUNT_SET_PASSWORD_REQUESTED"
  /** A new address created. */
  | "ADDRESS_CREATED"
  /** An address deleted. */
  | "ADDRESS_DELETED"
  /** An address updated. */
  | "ADDRESS_UPDATED"
  /**
   * All the events.
   *
   * DEPRECATED: this value will be removed in Saleor 4.0.
   */
  | "ANY_EVENTS"
  /** An app deleted. */
  | "APP_DELETED"
  /** A new app installed. */
  | "APP_INSTALLED"
  /** An app status is changed. */
  | "APP_STATUS_CHANGED"
  /** An app updated. */
  | "APP_UPDATED"
  /** A new attribute is created. */
  | "ATTRIBUTE_CREATED"
  /** An attribute is deleted. */
  | "ATTRIBUTE_DELETED"
  /** An attribute is updated. */
  | "ATTRIBUTE_UPDATED"
  /** A new attribute value is created. */
  | "ATTRIBUTE_VALUE_CREATED"
  /** An attribute value is deleted. */
  | "ATTRIBUTE_VALUE_DELETED"
  /** An attribute value is updated. */
  | "ATTRIBUTE_VALUE_UPDATED"
  /** A new category created. */
  | "CATEGORY_CREATED"
  /** A category is deleted. */
  | "CATEGORY_DELETED"
  /** A category is updated. */
  | "CATEGORY_UPDATED"
  /** A new channel created. */
  | "CHANNEL_CREATED"
  /** A channel is deleted. */
  | "CHANNEL_DELETED"
  /** A channel metadata is updated. */
  | "CHANNEL_METADATA_UPDATED"
  /** A channel status is changed. */
  | "CHANNEL_STATUS_CHANGED"
  /** A channel is updated. */
  | "CHANNEL_UPDATED"
  /** A new checkout is created. */
  | "CHECKOUT_CREATED"
  | "CHECKOUT_FULLY_PAID"
  /**
   * A checkout metadata is updated.
   *
   * Added in Saleor 3.8.
   */
  | "CHECKOUT_METADATA_UPDATED"
  /** A checkout is updated. It also triggers all updates related to the checkout. */
  | "CHECKOUT_UPDATED"
  /** A new collection is created. */
  | "COLLECTION_CREATED"
  /** A collection is deleted. */
  | "COLLECTION_DELETED"
  /**
   * A collection metadata is updated.
   *
   * Added in Saleor 3.8.
   */
  | "COLLECTION_METADATA_UPDATED"
  /** A collection is updated. */
  | "COLLECTION_UPDATED"
  /** A new customer account is created. */
  | "CUSTOMER_CREATED"
  /** A customer account is deleted. */
  | "CUSTOMER_DELETED"
  /**
   * A customer account metadata is updated.
   *
   * Added in Saleor 3.8.
   */
  | "CUSTOMER_METADATA_UPDATED"
  /** A customer account is updated. */
  | "CUSTOMER_UPDATED"
  /** A draft order is created. */
  | "DRAFT_ORDER_CREATED"
  /** A draft order is deleted. */
  | "DRAFT_ORDER_DELETED"
  /** A draft order is updated. */
  | "DRAFT_ORDER_UPDATED"
  /** A fulfillment is approved. */
  | "FULFILLMENT_APPROVED"
  /** A fulfillment is cancelled. */
  | "FULFILLMENT_CANCELED"
  /** A new fulfillment is created. */
  | "FULFILLMENT_CREATED"
  /**
   * A fulfillment metadata is updated.
   *
   * Added in Saleor 3.8.
   */
  | "FULFILLMENT_METADATA_UPDATED"
  /** A new gift card created. */
  | "GIFT_CARD_CREATED"
  /** A gift card is deleted. */
  | "GIFT_CARD_DELETED"
  /**
   * A gift card metadata is updated.
   *
   * Added in Saleor 3.8.
   */
  | "GIFT_CARD_METADATA_UPDATED"
  /**
   * A gift card has been sent.
   *
   * Added in Saleor 3.13.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | "GIFT_CARD_SENT"
  /** A gift card status is changed. */
  | "GIFT_CARD_STATUS_CHANGED"
  /** A gift card is updated. */
  | "GIFT_CARD_UPDATED"
  /** An invoice is deleted. */
  | "INVOICE_DELETED"
  /** An invoice for order requested. */
  | "INVOICE_REQUESTED"
  /** Invoice has been sent. */
  | "INVOICE_SENT"
  /** A new menu created. */
  | "MENU_CREATED"
  /** A menu is deleted. */
  | "MENU_DELETED"
  /** A new menu item created. */
  | "MENU_ITEM_CREATED"
  /** A menu item is deleted. */
  | "MENU_ITEM_DELETED"
  /** A menu item is updated. */
  | "MENU_ITEM_UPDATED"
  /** A menu is updated. */
  | "MENU_UPDATED"
  /** User notification triggered. */
  | "NOTIFY_USER"
  /** An observability event is created. */
  | "OBSERVABILITY"
  /**
   * Orders are imported.
   *
   * Added in Saleor 3.14.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | "ORDER_BULK_CREATED"
  /** An order is cancelled. */
  | "ORDER_CANCELLED"
  /** An order is confirmed (status change unconfirmed -> unfulfilled) by a staff user using the OrderConfirm mutation. It also triggers when the user completes the checkout and the shop setting `automatically_confirm_all_new_orders` is enabled. */
  | "ORDER_CONFIRMED"
  /** A new order is placed. */
  | "ORDER_CREATED"
  /** An order is expired. */
  | "ORDER_EXPIRED"
  /** An order is fulfilled. */
  | "ORDER_FULFILLED"
  /** Payment is made and an order is fully paid. */
  | "ORDER_FULLY_PAID"
  /**
   * The order is fully refunded.
   *
   * Added in Saleor 3.14.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | "ORDER_FULLY_REFUNDED"
  /**
   * An order metadata is updated.
   *
   * Added in Saleor 3.8.
   */
  | "ORDER_METADATA_UPDATED"
  /**
   * Payment has been made. The order may be partially or fully paid.
   *
   * Added in Saleor 3.14.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | "ORDER_PAID"
  /**
   * The order received a refund. The order may be partially or fully refunded.
   *
   * Added in Saleor 3.14.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | "ORDER_REFUNDED"
  /** An order is updated; triggered for all changes related to an order; covers all other order webhooks, except for ORDER_CREATED. */
  | "ORDER_UPDATED"
  /** A new page is created. */
  | "PAGE_CREATED"
  /** A page is deleted. */
  | "PAGE_DELETED"
  /** A new page type is created. */
  | "PAGE_TYPE_CREATED"
  /** A page type is deleted. */
  | "PAGE_TYPE_DELETED"
  /** A page type is updated. */
  | "PAGE_TYPE_UPDATED"
  /** A page is updated. */
  | "PAGE_UPDATED"
  /** A new permission group is created. */
  | "PERMISSION_GROUP_CREATED"
  /** A permission group is deleted. */
  | "PERMISSION_GROUP_DELETED"
  /** A permission group is updated. */
  | "PERMISSION_GROUP_UPDATED"
  /** A new product is created. */
  | "PRODUCT_CREATED"
  /** A product is deleted. */
  | "PRODUCT_DELETED"
  /**
   * A new product media is created.
   *
   * Added in Saleor 3.12.
   */
  | "PRODUCT_MEDIA_CREATED"
  /**
   * A product media is deleted.
   *
   * Added in Saleor 3.12.
   */
  | "PRODUCT_MEDIA_DELETED"
  /**
   * A product media is updated.
   *
   * Added in Saleor 3.12.
   */
  | "PRODUCT_MEDIA_UPDATED"
  /**
   * A product metadata is updated.
   *
   * Added in Saleor 3.8.
   */
  | "PRODUCT_METADATA_UPDATED"
  /** A product is updated. */
  | "PRODUCT_UPDATED"
  /** A product variant is back in stock. */
  | "PRODUCT_VARIANT_BACK_IN_STOCK"
  /** A new product variant is created. */
  | "PRODUCT_VARIANT_CREATED"
  /** A product variant is deleted. */
  | "PRODUCT_VARIANT_DELETED"
  /**
   * A product variant metadata is updated.
   *
   * Added in Saleor 3.8.
   */
  | "PRODUCT_VARIANT_METADATA_UPDATED"
  /** A product variant is out of stock. */
  | "PRODUCT_VARIANT_OUT_OF_STOCK"
  /** A product variant stock is updated */
  | "PRODUCT_VARIANT_STOCK_UPDATED"
  /** A product variant is updated. */
  | "PRODUCT_VARIANT_UPDATED"
  /** A sale is created. */
  | "SALE_CREATED"
  /** A sale is deleted. */
  | "SALE_DELETED"
  /** A sale is activated or deactivated. */
  | "SALE_TOGGLE"
  /** A sale is updated. */
  | "SALE_UPDATED"
  /** A new shipping price is created. */
  | "SHIPPING_PRICE_CREATED"
  /** A shipping price is deleted. */
  | "SHIPPING_PRICE_DELETED"
  /** A shipping price is updated. */
  | "SHIPPING_PRICE_UPDATED"
  /** A new shipping zone is created. */
  | "SHIPPING_ZONE_CREATED"
  /** A shipping zone is deleted. */
  | "SHIPPING_ZONE_DELETED"
  /**
   * A shipping zone metadata is updated.
   *
   * Added in Saleor 3.8.
   */
  | "SHIPPING_ZONE_METADATA_UPDATED"
  /** A shipping zone is updated. */
  | "SHIPPING_ZONE_UPDATED"
  /**
   * Shop metadata is updated.
   *
   * Added in Saleor 3.15.
   */
  | "SHOP_METADATA_UPDATED"
  /** A new staff user is created. */
  | "STAFF_CREATED"
  /** A staff user is deleted. */
  | "STAFF_DELETED"
  /** Setting a new password for the staff account is requested. */
  | "STAFF_SET_PASSWORD_REQUESTED"
  /** A staff user is updated. */
  | "STAFF_UPDATED"
  /**
   * A thumbnail is created.
   *
   * Added in Saleor 3.12.
   */
  | "THUMBNAIL_CREATED"
  /**
   * Transaction item metadata is updated.
   *
   * Added in Saleor 3.8.
   */
  | "TRANSACTION_ITEM_METADATA_UPDATED"
  /** A new translation is created. */
  | "TRANSLATION_CREATED"
  /** A translation is updated. */
  | "TRANSLATION_UPDATED"
  /** A new voucher created. */
  | "VOUCHER_CREATED"
  /** A voucher is deleted. */
  | "VOUCHER_DELETED"
  /**
   * A voucher metadata is updated.
   *
   * Added in Saleor 3.8.
   */
  | "VOUCHER_METADATA_UPDATED"
  /** A voucher is updated. */
  | "VOUCHER_UPDATED"
  /** A new warehouse created. */
  | "WAREHOUSE_CREATED"
  /** A warehouse is deleted. */
  | "WAREHOUSE_DELETED"
  /**
   * A warehouse metadata is updated.
   *
   * Added in Saleor 3.8.
   */
  | "WAREHOUSE_METADATA_UPDATED"
  /** A warehouse is updated. */
  | "WAREHOUSE_UPDATED";

/** Enum determining type of webhook. */
export type GeneratedWebhookEventTypeEnum =
  /** An account email change is requested. */
  | "ACCOUNT_CHANGE_EMAIL_REQUESTED"
  /** An account confirmation is requested. */
  | "ACCOUNT_CONFIRMATION_REQUESTED"
  /** An account is confirmed. */
  | "ACCOUNT_CONFIRMED"
  /** An account is deleted. */
  | "ACCOUNT_DELETED"
  /** An account delete is requested. */
  | "ACCOUNT_DELETE_REQUESTED"
  /** An account email was changed */
  | "ACCOUNT_EMAIL_CHANGED"
  /** Setting a new password for the account is requested. */
  | "ACCOUNT_SET_PASSWORD_REQUESTED"
  /** A new address created. */
  | "ADDRESS_CREATED"
  /** An address deleted. */
  | "ADDRESS_DELETED"
  /** An address updated. */
  | "ADDRESS_UPDATED"
  /**
   * All the events.
   *
   * DEPRECATED: this value will be removed in Saleor 4.0.
   */
  | "ANY_EVENTS"
  /** An app deleted. */
  | "APP_DELETED"
  /** A new app installed. */
  | "APP_INSTALLED"
  /** An app status is changed. */
  | "APP_STATUS_CHANGED"
  /** An app updated. */
  | "APP_UPDATED"
  /** A new attribute is created. */
  | "ATTRIBUTE_CREATED"
  /** An attribute is deleted. */
  | "ATTRIBUTE_DELETED"
  /** An attribute is updated. */
  | "ATTRIBUTE_UPDATED"
  /** A new attribute value is created. */
  | "ATTRIBUTE_VALUE_CREATED"
  /** An attribute value is deleted. */
  | "ATTRIBUTE_VALUE_DELETED"
  /** An attribute value is updated. */
  | "ATTRIBUTE_VALUE_UPDATED"
  /** A new category created. */
  | "CATEGORY_CREATED"
  /** A category is deleted. */
  | "CATEGORY_DELETED"
  /** A category is updated. */
  | "CATEGORY_UPDATED"
  /** A new channel created. */
  | "CHANNEL_CREATED"
  /** A channel is deleted. */
  | "CHANNEL_DELETED"
  /** A channel metadata is updated. */
  | "CHANNEL_METADATA_UPDATED"
  /** A channel status is changed. */
  | "CHANNEL_STATUS_CHANGED"
  /** A channel is updated. */
  | "CHANNEL_UPDATED"
  /**
   * Event called for checkout tax calculation.
   *
   * Added in Saleor 3.6.
   */
  | "CHECKOUT_CALCULATE_TAXES"
  /** A new checkout is created. */
  | "CHECKOUT_CREATED"
  /** Filter shipping methods for checkout. */
  | "CHECKOUT_FILTER_SHIPPING_METHODS"
  | "CHECKOUT_FULLY_PAID"
  /**
   * A checkout metadata is updated.
   *
   * Added in Saleor 3.8.
   */
  | "CHECKOUT_METADATA_UPDATED"
  /** A checkout is updated. It also triggers all updates related to the checkout. */
  | "CHECKOUT_UPDATED"
  /** A new collection is created. */
  | "COLLECTION_CREATED"
  /** A collection is deleted. */
  | "COLLECTION_DELETED"
  /**
   * A collection metadata is updated.
   *
   * Added in Saleor 3.8.
   */
  | "COLLECTION_METADATA_UPDATED"
  /** A collection is updated. */
  | "COLLECTION_UPDATED"
  /** A new customer account is created. */
  | "CUSTOMER_CREATED"
  /** A customer account is deleted. */
  | "CUSTOMER_DELETED"
  /**
   * A customer account metadata is updated.
   *
   * Added in Saleor 3.8.
   */
  | "CUSTOMER_METADATA_UPDATED"
  /** A customer account is updated. */
  | "CUSTOMER_UPDATED"
  /** A draft order is created. */
  | "DRAFT_ORDER_CREATED"
  /** A draft order is deleted. */
  | "DRAFT_ORDER_DELETED"
  /** A draft order is updated. */
  | "DRAFT_ORDER_UPDATED"
  /** A fulfillment is approved. */
  | "FULFILLMENT_APPROVED"
  /** A fulfillment is cancelled. */
  | "FULFILLMENT_CANCELED"
  /** A new fulfillment is created. */
  | "FULFILLMENT_CREATED"
  /**
   * A fulfillment metadata is updated.
   *
   * Added in Saleor 3.8.
   */
  | "FULFILLMENT_METADATA_UPDATED"
  /** A new gift card created. */
  | "GIFT_CARD_CREATED"
  /** A gift card is deleted. */
  | "GIFT_CARD_DELETED"
  /**
   * A gift card metadata is updated.
   *
   * Added in Saleor 3.8.
   */
  | "GIFT_CARD_METADATA_UPDATED"
  /**
   * A gift card has been sent.
   *
   * Added in Saleor 3.13.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | "GIFT_CARD_SENT"
  /** A gift card status is changed. */
  | "GIFT_CARD_STATUS_CHANGED"
  /** A gift card is updated. */
  | "GIFT_CARD_UPDATED"
  /** An invoice is deleted. */
  | "INVOICE_DELETED"
  /** An invoice for order requested. */
  | "INVOICE_REQUESTED"
  /** Invoice has been sent. */
  | "INVOICE_SENT"
  /** A new menu created. */
  | "MENU_CREATED"
  /** A menu is deleted. */
  | "MENU_DELETED"
  /** A new menu item created. */
  | "MENU_ITEM_CREATED"
  /** A menu item is deleted. */
  | "MENU_ITEM_DELETED"
  /** A menu item is updated. */
  | "MENU_ITEM_UPDATED"
  /** A menu is updated. */
  | "MENU_UPDATED"
  /** User notification triggered. */
  | "NOTIFY_USER"
  /** An observability event is created. */
  | "OBSERVABILITY"
  /**
   * Orders are imported.
   *
   * Added in Saleor 3.14.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | "ORDER_BULK_CREATED"
  /**
   * Event called for order tax calculation.
   *
   * Added in Saleor 3.6.
   */
  | "ORDER_CALCULATE_TAXES"
  /** An order is cancelled. */
  | "ORDER_CANCELLED"
  /** An order is confirmed (status change unconfirmed -> unfulfilled) by a staff user using the OrderConfirm mutation. It also triggers when the user completes the checkout and the shop setting `automatically_confirm_all_new_orders` is enabled. */
  | "ORDER_CONFIRMED"
  /** A new order is placed. */
  | "ORDER_CREATED"
  /** An order is expired. */
  | "ORDER_EXPIRED"
  /** Filter shipping methods for order. */
  | "ORDER_FILTER_SHIPPING_METHODS"
  /** An order is fulfilled. */
  | "ORDER_FULFILLED"
  /** Payment is made and an order is fully paid. */
  | "ORDER_FULLY_PAID"
  /**
   * The order is fully refunded.
   *
   * Added in Saleor 3.14.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | "ORDER_FULLY_REFUNDED"
  /**
   * An order metadata is updated.
   *
   * Added in Saleor 3.8.
   */
  | "ORDER_METADATA_UPDATED"
  /**
   * Payment has been made. The order may be partially or fully paid.
   *
   * Added in Saleor 3.14.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | "ORDER_PAID"
  /**
   * The order received a refund. The order may be partially or fully refunded.
   *
   * Added in Saleor 3.14.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | "ORDER_REFUNDED"
  /** An order is updated; triggered for all changes related to an order; covers all other order webhooks, except for ORDER_CREATED. */
  | "ORDER_UPDATED"
  /** A new page is created. */
  | "PAGE_CREATED"
  /** A page is deleted. */
  | "PAGE_DELETED"
  /** A new page type is created. */
  | "PAGE_TYPE_CREATED"
  /** A page type is deleted. */
  | "PAGE_TYPE_DELETED"
  /** A page type is updated. */
  | "PAGE_TYPE_UPDATED"
  /** A page is updated. */
  | "PAGE_UPDATED"
  /** Authorize payment. */
  | "PAYMENT_AUTHORIZE"
  /** Capture payment. */
  | "PAYMENT_CAPTURE"
  /** Confirm payment. */
  | "PAYMENT_CONFIRM"
  | "PAYMENT_GATEWAY_INITIALIZE_SESSION"
  /** Listing available payment gateways. */
  | "PAYMENT_LIST_GATEWAYS"
  /** Process payment. */
  | "PAYMENT_PROCESS"
  /** Refund payment. */
  | "PAYMENT_REFUND"
  /** Void payment. */
  | "PAYMENT_VOID"
  /** A new permission group is created. */
  | "PERMISSION_GROUP_CREATED"
  /** A permission group is deleted. */
  | "PERMISSION_GROUP_DELETED"
  /** A permission group is updated. */
  | "PERMISSION_GROUP_UPDATED"
  /** A new product is created. */
  | "PRODUCT_CREATED"
  /** A product is deleted. */
  | "PRODUCT_DELETED"
  /**
   * A new product media is created.
   *
   * Added in Saleor 3.12.
   */
  | "PRODUCT_MEDIA_CREATED"
  /**
   * A product media is deleted.
   *
   * Added in Saleor 3.12.
   */
  | "PRODUCT_MEDIA_DELETED"
  /**
   * A product media is updated.
   *
   * Added in Saleor 3.12.
   */
  | "PRODUCT_MEDIA_UPDATED"
  /**
   * A product metadata is updated.
   *
   * Added in Saleor 3.8.
   */
  | "PRODUCT_METADATA_UPDATED"
  /** A product is updated. */
  | "PRODUCT_UPDATED"
  /** A product variant is back in stock. */
  | "PRODUCT_VARIANT_BACK_IN_STOCK"
  /** A new product variant is created. */
  | "PRODUCT_VARIANT_CREATED"
  /** A product variant is deleted. */
  | "PRODUCT_VARIANT_DELETED"
  /**
   * A product variant metadata is updated.
   *
   * Added in Saleor 3.8.
   */
  | "PRODUCT_VARIANT_METADATA_UPDATED"
  /** A product variant is out of stock. */
  | "PRODUCT_VARIANT_OUT_OF_STOCK"
  /** A product variant stock is updated */
  | "PRODUCT_VARIANT_STOCK_UPDATED"
  /** A product variant is updated. */
  | "PRODUCT_VARIANT_UPDATED"
  /** A sale is created. */
  | "SALE_CREATED"
  /** A sale is deleted. */
  | "SALE_DELETED"
  /** A sale is activated or deactivated. */
  | "SALE_TOGGLE"
  /** A sale is updated. */
  | "SALE_UPDATED"
  /** Fetch external shipping methods for checkout. */
  | "SHIPPING_LIST_METHODS_FOR_CHECKOUT"
  /** A new shipping price is created. */
  | "SHIPPING_PRICE_CREATED"
  /** A shipping price is deleted. */
  | "SHIPPING_PRICE_DELETED"
  /** A shipping price is updated. */
  | "SHIPPING_PRICE_UPDATED"
  /** A new shipping zone is created. */
  | "SHIPPING_ZONE_CREATED"
  /** A shipping zone is deleted. */
  | "SHIPPING_ZONE_DELETED"
  /**
   * A shipping zone metadata is updated.
   *
   * Added in Saleor 3.8.
   */
  | "SHIPPING_ZONE_METADATA_UPDATED"
  /** A shipping zone is updated. */
  | "SHIPPING_ZONE_UPDATED"
  /**
   * Shop metadata is updated.
   *
   * Added in Saleor 3.15.
   */
  | "SHOP_METADATA_UPDATED"
  /** A new staff user is created. */
  | "STAFF_CREATED"
  /** A staff user is deleted. */
  | "STAFF_DELETED"
  /** Setting a new password for the staff account is requested. */
  | "STAFF_SET_PASSWORD_REQUESTED"
  /** A staff user is updated. */
  | "STAFF_UPDATED"
  /**
   * A thumbnail is created.
   *
   * Added in Saleor 3.12.
   */
  | "THUMBNAIL_CREATED"
  /**
   * Event called when cancel has been requested for transaction.
   *
   * Added in Saleor 3.13.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | "TRANSACTION_CANCELATION_REQUESTED"
  /**
   * Event called when charge has been requested for transaction.
   *
   * Added in Saleor 3.13.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | "TRANSACTION_CHARGE_REQUESTED"
  | "TRANSACTION_INITIALIZE_SESSION"
  /**
   * Transaction item metadata is updated.
   *
   * Added in Saleor 3.8.
   */
  | "TRANSACTION_ITEM_METADATA_UPDATED"
  | "TRANSACTION_PROCESS_SESSION"
  /**
   * Event called when refund has been requested for transaction.
   *
   * Added in Saleor 3.13.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | "TRANSACTION_REFUND_REQUESTED"
  /** A new translation is created. */
  | "TRANSLATION_CREATED"
  /** A translation is updated. */
  | "TRANSLATION_UPDATED"
  /** A new voucher created. */
  | "VOUCHER_CREATED"
  /** A voucher is deleted. */
  | "VOUCHER_DELETED"
  /**
   * A voucher metadata is updated.
   *
   * Added in Saleor 3.8.
   */
  | "VOUCHER_METADATA_UPDATED"
  /** A voucher is updated. */
  | "VOUCHER_UPDATED"
  /** A new warehouse created. */
  | "WAREHOUSE_CREATED"
  /** A warehouse is deleted. */
  | "WAREHOUSE_DELETED"
  /**
   * A warehouse metadata is updated.
   *
   * Added in Saleor 3.8.
   */
  | "WAREHOUSE_METADATA_UPDATED"
  /** A warehouse is updated. */
  | "WAREHOUSE_UPDATED";

/** Enum determining type of webhook. */
export type GeneratedWebhookEventTypeSyncEnum =
  /**
   * Event called for checkout tax calculation.
   *
   * Added in Saleor 3.6.
   */
  | "CHECKOUT_CALCULATE_TAXES"
  /** Filter shipping methods for checkout. */
  | "CHECKOUT_FILTER_SHIPPING_METHODS"
  /**
   * Event called for order tax calculation.
   *
   * Added in Saleor 3.6.
   */
  | "ORDER_CALCULATE_TAXES"
  /** Filter shipping methods for order. */
  | "ORDER_FILTER_SHIPPING_METHODS"
  /** Authorize payment. */
  | "PAYMENT_AUTHORIZE"
  /** Capture payment. */
  | "PAYMENT_CAPTURE"
  /** Confirm payment. */
  | "PAYMENT_CONFIRM"
  | "PAYMENT_GATEWAY_INITIALIZE_SESSION"
  /** Listing available payment gateways. */
  | "PAYMENT_LIST_GATEWAYS"
  /** Process payment. */
  | "PAYMENT_PROCESS"
  /** Refund payment. */
  | "PAYMENT_REFUND"
  /** Void payment. */
  | "PAYMENT_VOID"
  /** Fetch external shipping methods for checkout. */
  | "SHIPPING_LIST_METHODS_FOR_CHECKOUT"
  /**
   * Event called when cancel has been requested for transaction.
   *
   * Added in Saleor 3.13.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | "TRANSACTION_CANCELATION_REQUESTED"
  /**
   * Event called when charge has been requested for transaction.
   *
   * Added in Saleor 3.13.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | "TRANSACTION_CHARGE_REQUESTED"
  | "TRANSACTION_INITIALIZE_SESSION"
  | "TRANSACTION_PROCESS_SESSION"
  /**
   * Event called when refund has been requested for transaction.
   *
   * Added in Saleor 3.13.
   *
   * Note: this API is currently in Feature Preview and can be subject to changes at later point.
   */
  | "TRANSACTION_REFUND_REQUESTED";

/** An enumeration. */
export type GeneratedWebhookSampleEventTypeEnum =
  | "ACCOUNT_CHANGE_EMAIL_REQUESTED"
  | "ACCOUNT_CONFIRMATION_REQUESTED"
  | "ACCOUNT_CONFIRMED"
  | "ACCOUNT_DELETED"
  | "ACCOUNT_DELETE_REQUESTED"
  | "ACCOUNT_EMAIL_CHANGED"
  | "ACCOUNT_SET_PASSWORD_REQUESTED"
  | "ADDRESS_CREATED"
  | "ADDRESS_DELETED"
  | "ADDRESS_UPDATED"
  | "APP_DELETED"
  | "APP_INSTALLED"
  | "APP_STATUS_CHANGED"
  | "APP_UPDATED"
  | "ATTRIBUTE_CREATED"
  | "ATTRIBUTE_DELETED"
  | "ATTRIBUTE_UPDATED"
  | "ATTRIBUTE_VALUE_CREATED"
  | "ATTRIBUTE_VALUE_DELETED"
  | "ATTRIBUTE_VALUE_UPDATED"
  | "CATEGORY_CREATED"
  | "CATEGORY_DELETED"
  | "CATEGORY_UPDATED"
  | "CHANNEL_CREATED"
  | "CHANNEL_DELETED"
  | "CHANNEL_METADATA_UPDATED"
  | "CHANNEL_STATUS_CHANGED"
  | "CHANNEL_UPDATED"
  | "CHECKOUT_CREATED"
  | "CHECKOUT_FULLY_PAID"
  | "CHECKOUT_METADATA_UPDATED"
  | "CHECKOUT_UPDATED"
  | "COLLECTION_CREATED"
  | "COLLECTION_DELETED"
  | "COLLECTION_METADATA_UPDATED"
  | "COLLECTION_UPDATED"
  | "CUSTOMER_CREATED"
  | "CUSTOMER_DELETED"
  | "CUSTOMER_METADATA_UPDATED"
  | "CUSTOMER_UPDATED"
  | "DRAFT_ORDER_CREATED"
  | "DRAFT_ORDER_DELETED"
  | "DRAFT_ORDER_UPDATED"
  | "FULFILLMENT_APPROVED"
  | "FULFILLMENT_CANCELED"
  | "FULFILLMENT_CREATED"
  | "FULFILLMENT_METADATA_UPDATED"
  | "GIFT_CARD_CREATED"
  | "GIFT_CARD_DELETED"
  | "GIFT_CARD_METADATA_UPDATED"
  | "GIFT_CARD_SENT"
  | "GIFT_CARD_STATUS_CHANGED"
  | "GIFT_CARD_UPDATED"
  | "INVOICE_DELETED"
  | "INVOICE_REQUESTED"
  | "INVOICE_SENT"
  | "MENU_CREATED"
  | "MENU_DELETED"
  | "MENU_ITEM_CREATED"
  | "MENU_ITEM_DELETED"
  | "MENU_ITEM_UPDATED"
  | "MENU_UPDATED"
  | "NOTIFY_USER"
  | "OBSERVABILITY"
  | "ORDER_BULK_CREATED"
  | "ORDER_CANCELLED"
  | "ORDER_CONFIRMED"
  | "ORDER_CREATED"
  | "ORDER_EXPIRED"
  | "ORDER_FULFILLED"
  | "ORDER_FULLY_PAID"
  | "ORDER_FULLY_REFUNDED"
  | "ORDER_METADATA_UPDATED"
  | "ORDER_PAID"
  | "ORDER_REFUNDED"
  | "ORDER_UPDATED"
  | "PAGE_CREATED"
  | "PAGE_DELETED"
  | "PAGE_TYPE_CREATED"
  | "PAGE_TYPE_DELETED"
  | "PAGE_TYPE_UPDATED"
  | "PAGE_UPDATED"
  | "PERMISSION_GROUP_CREATED"
  | "PERMISSION_GROUP_DELETED"
  | "PERMISSION_GROUP_UPDATED"
  | "PRODUCT_CREATED"
  | "PRODUCT_DELETED"
  | "PRODUCT_MEDIA_CREATED"
  | "PRODUCT_MEDIA_DELETED"
  | "PRODUCT_MEDIA_UPDATED"
  | "PRODUCT_METADATA_UPDATED"
  | "PRODUCT_UPDATED"
  | "PRODUCT_VARIANT_BACK_IN_STOCK"
  | "PRODUCT_VARIANT_CREATED"
  | "PRODUCT_VARIANT_DELETED"
  | "PRODUCT_VARIANT_METADATA_UPDATED"
  | "PRODUCT_VARIANT_OUT_OF_STOCK"
  | "PRODUCT_VARIANT_STOCK_UPDATED"
  | "PRODUCT_VARIANT_UPDATED"
  | "SALE_CREATED"
  | "SALE_DELETED"
  | "SALE_TOGGLE"
  | "SALE_UPDATED"
  | "SHIPPING_PRICE_CREATED"
  | "SHIPPING_PRICE_DELETED"
  | "SHIPPING_PRICE_UPDATED"
  | "SHIPPING_ZONE_CREATED"
  | "SHIPPING_ZONE_DELETED"
  | "SHIPPING_ZONE_METADATA_UPDATED"
  | "SHIPPING_ZONE_UPDATED"
  | "SHOP_METADATA_UPDATED"
  | "STAFF_CREATED"
  | "STAFF_DELETED"
  | "STAFF_SET_PASSWORD_REQUESTED"
  | "STAFF_UPDATED"
  | "THUMBNAIL_CREATED"
  | "TRANSACTION_ITEM_METADATA_UPDATED"
  | "TRANSLATION_CREATED"
  | "TRANSLATION_UPDATED"
  | "VOUCHER_CREATED"
  | "VOUCHER_DELETED"
  | "VOUCHER_METADATA_UPDATED"
  | "VOUCHER_UPDATED"
  | "WAREHOUSE_CREATED"
  | "WAREHOUSE_DELETED"
  | "WAREHOUSE_METADATA_UPDATED"
  | "WAREHOUSE_UPDATED";

/** An enumeration. */
export type GeneratedWebhookTriggerErrorCode =
  | "GRAPHQL_ERROR"
  | "INVALID_ID"
  | "MISSING_EVENT"
  | "MISSING_PERMISSION"
  | "MISSING_QUERY"
  | "MISSING_SUBSCRIPTION"
  | "NOT_FOUND"
  | "SYNTAX"
  | "TYPE_NOT_SUPPORTED"
  | "UNABLE_TO_PARSE";

/** An enumeration. */
export type GeneratedWeightUnitsEnum = "G" | "KG" | "LB" | "OZ" | "TONNE";
