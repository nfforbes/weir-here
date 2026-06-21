package com.weirhere.payment

/** Mirrors values in apps/web/src/components/payment/PaymentPageContent.tsx */
object PaymentConstants {
    const val HOSTED_BUTTON_ID = "XZYLWVXV3M33S"
    const val PAYPAL_SDK_CLIENT_ID =
        "BAARvCJLYRGOpdjcHJltnDeEmtBpeXJ4SekkzqZqCQhfWQ1MCQkEXY8q-y72JKulXoqCtOzY0BJt_5hynU"
    const val PAYPAL_SDK_URL =
        "https://www.paypal.com/sdk/js?client-id=$PAYPAL_SDK_CLIENT_ID&components=hosted-buttons&enable-funding=venmo&currency=USD"
    const val PAYPAL_CONTAINER_ID = "paypal-container-$HOSTED_BUTTON_ID"
}
