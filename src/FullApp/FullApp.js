import './FullApp.scss';

import React from 'react';

import {LuftBootComponent} from '@luft/boot';
import {
    PersistedQueryLink,
    useIsInternalServerError,
    useInternalServerErrorLink
} from '@luft/apollo';
import {LoaderComponent, useResolutions} from '@luft/common';
import {useAuthLink} from '@luft/user';

import {
    CheckoutComPlaceOrderContainer,
    ChechoutComPaymentMethodItemComponent,
    CheckoutComRendererContainer,
    CHECKOUT_COM_PAYMENT_CODE
} from 'bat-core/checkout-com';
import {
    CcAvenuePlaceOrderContainer,
    CcAvenuePaymentDetailsComponent,
    CCAVENUE_PAYMENT_CODE
} from 'bat-core/ccavenue';
import {
    Ipay88PlaceOrderContainer,
    Ipay88PaymentMethodItemComponent,
    Ipay88MethodsListContainer,
    IPAY88_CODE
} from 'bat-core/ipay88';
import {
    CartItemContainer,
    MiniCartProviderComponent,
    cartErrorLink
} from 'bat-core/cart';
import {MenuProviderComponent} from 'bat-core/catalog';
import {
    StoreConfigContainer,
    getLanguageCodeByPathname
} from 'bat-core/common';
import {ProductPreviewAltComponent, ProductPaneComponent} from 'bat-core/product';
import {PageBuilderComponent} from 'bat-core/page-builder';
import type {PredefinedStore} from 'bat-core/multistore';

import {App} from '../App';
import {MaintenancePage} from '../pages/MaintenancePage';

const {PUBLIC_URL} = process.env;

// Apollo Client GraphQL API endpoint
const {LUFT_APP_DATA_URI} = process.env;

// Functionality enablement flags
const {
    LUFT_APP_MULTISTORES,
    LUFT_APP_CACHE_WARMER,
    LUFT_APP_CMS_CONTENT_BLOCKS,
    LUFT_APP_CMS_CONTENT_PAGES,
    LUFT_APP_PUSH_NOTIFICATIONS,
    LUFT_APP_COOKIE_NOTICE
} = process.env;

// Push notifications configuration variables
const {
    LUFT_APP_FIREBASE_API_KEY,
    LUFT_APP_FIREBASE_AUTH_DOMAIN,
    LUFT_APP_FIREBASE_DATABASE_URL,
    LUFT_APP_FIREBASE_PROJECT_ID,
    LUFT_APP_FIREBASE_STORAGE_BUCKET,
    LUFT_APP_FIREBASE_MESSAGING_SENDER_ID,
    LUFT_APP_FIREBASE_APP_ID,
    LUFT_APP_FIREBASE_MEASUREMENT_ID,
    LUFT_APP_WEBSITE_SERVICE_URL,
    LUFT_APP_WEBSITE_PUSH_ID
} = process.env;

// defines which component should be used for CMS pages and CMS blocks. Can be M2, SFCC or empty
const {
    LUFT_APP_CMS_RENDERER
} = process.env;

const CMS_RENDERERS = {
    M2: PageBuilderComponent
};

const FRACTION_DIGITS = 2;

type Props = {
    /**
     * Application start url. Used in static router for ssr.
     */
    url?: string,
    /**
     * Apollo HTTP link uri. Used in ssr mode.
     */
    dataUri?: string,
    /**
     * if App should work in ssr mode.
     */
    ssr?: boolean,
    /**
     * Custom fetch instance for Apollo
     */
    fetch?: Object,
    /**
     * List of predefined stores
     */
    stores?: PredefinedStore[]
};

export function FullApp({
    url,
    dataUri = LUFT_APP_DATA_URI,
    ssr,
    fetch,
    stores
}: Props) {
    const {isSMdown} = useResolutions();
    const authLink = useAuthLink();
    const internalServerErrorLink = useInternalServerErrorLink();
    const isMaintenanceMode = useIsInternalServerError();

    const intl = getLanguageCodeByPathname() === 'ar' && {
        messages: () => import('../translations/ar.json')
    };

    const config = {
        ssr,
        url,
        fetch,
        dataUri,
        serviceWorker: {
            swSrc: `${PUBLIC_URL}/service-worker.js`
        },
        pushNotifications: {
            enabled: LUFT_APP_PUSH_NOTIFICATIONS,
            firebaseConfig: {
                apiKey: LUFT_APP_FIREBASE_API_KEY,
                authDomain: LUFT_APP_FIREBASE_AUTH_DOMAIN,
                databaseURL: LUFT_APP_FIREBASE_DATABASE_URL,
                projectId: LUFT_APP_FIREBASE_PROJECT_ID,
                storageBucket: LUFT_APP_FIREBASE_STORAGE_BUCKET,
                messagingSenderId: LUFT_APP_FIREBASE_MESSAGING_SENDER_ID,
                appId: LUFT_APP_FIREBASE_APP_ID,
                measurementId: LUFT_APP_FIREBASE_MEASUREMENT_ID
            },
            apnConfig: {
                webServiceUrl: LUFT_APP_WEBSITE_SERVICE_URL,
                websitePushId: LUFT_APP_WEBSITE_PUSH_ID
            }
        },
        payments: {
            renderers: new Map([
                [CHECKOUT_COM_PAYMENT_CODE, CheckoutComPlaceOrderContainer],
                [CCAVENUE_PAYMENT_CODE, CcAvenuePlaceOrderContainer],
                [IPAY88_CODE, Ipay88PlaceOrderContainer]
            ]),
            methodRenderers: new Map([
                [IPAY88_CODE, Ipay88PaymentMethodItemComponent],
                [CHECKOUT_COM_PAYMENT_CODE, ChechoutComPaymentMethodItemComponent]
            ]),
            methodDetailsRenderers: new Map([
                [CHECKOUT_COM_PAYMENT_CODE, CheckoutComRendererContainer],
                [CCAVENUE_PAYMENT_CODE, CcAvenuePaymentDetailsComponent],
                [IPAY88_CODE, Ipay88MethodsListContainer]
            ])
        },
        cms: {
            enableBlocks: LUFT_APP_CMS_CONTENT_BLOCKS,
            enablePages: LUFT_APP_CMS_CONTENT_PAGES,
            renderer: CMS_RENDERERS[LUFT_APP_CMS_RENDERER]
        },
        stores: {
            enabled: LUFT_APP_MULTISTORES,
            predefinedStores: stores,
            links: [
                internalServerErrorLink,
                new PersistedQueryLink({useGETForHashedQueries: true})
            ]
        },
        router: {
            shouldScrollTop: location => isSMdown || !location.pathname.startsWith('/checkout')
        },
        apollo: {
            links: [
                internalServerErrorLink,
                authLink,
                cartErrorLink,
                new PersistedQueryLink({useGETForHashedQueries: true})
            ]
        },
        intl: {
            ...intl,
            formats: {
                number: {
                    money: {
                        minimumFractionDigits: FRACTION_DIGITS,
                        maximumFractionDigits: FRACTION_DIGITS
                    }
                }
            }
        },
        cacheWarmer: {
            enabled: LUFT_APP_CACHE_WARMER
        },
        productRenderers: {
            ProductPreviewComponent: ProductPreviewAltComponent,
            ProductPaneComponent
        },
        cart: {
            renderers: new Map([
                ['CartItemContainer', CartItemContainer]
            ])
        }
    };

    return (
        <LuftBootComponent config={config}>
            {isMaintenanceMode ? (
                <MaintenancePage/>
            ) : (
                <MenuProviderComponent>
                    <MiniCartProviderComponent>
                        <StoreConfigContainer as={App}
                                              showCookieNotice={LUFT_APP_COOKIE_NOTICE}
                                              loadingAs={() => <LoaderComponent type="fixed"/>}/>
                    </MiniCartProviderComponent>
                </MenuProviderComponent>
            )}
        </LuftBootComponent>
    );
}
