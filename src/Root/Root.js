import React, {useEffect} from 'react';

import {RestrictAccessProviderComponent} from 'bat-core/restrict-access/src/components/RestrictAccessProvider.component';
import {getLanguageCodeByPathname} from 'bat-core/common/src/util/getLanguageCodeByPathname';

import {MicroApp} from '../MicroApp';
import {FullApp} from '../FullApp';

const {LUFT_APP_DATA_URI} = process.env;

const {origin} = new URL(LUFT_APP_DATA_URI);

const STORES = [
    {
        base_url: `${origin}/my/en`,
        base_name: '/my/en',
        locale: 'en-US',
        code: 'vuse_my_en_my'
    },
    {
        base_url: `${origin}/sa/en`,
        base_name: '/sa/en',
        locale: 'en-US',
        code: 'vuse_sa_en_sa'
    },
    {
        base_url: `${origin}/sa/ar`,
        base_name: '/sa/ar',
        locale: 'ar-AR',
        code: 'vuse_sa_ar_sa'
    },
    {
        base_url: `${origin}/ae/en`,
        base_name: '/ae/en',
        locale: 'en-US',
        code: 'vuse_ae_en_ae'
    }
];

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
    fetch?: Object
};

export function Root(props: Props) {
    const {url, ...other} = props;

    const isRtl = getLanguageCodeByPathname() === 'ar';

    useEffect(() => {
        if (!window || !isRtl) return;

        document.body.dir = 'rtl';
    }, [isRtl]);

    return (
        <RestrictAccessProviderComponent url={url}
                                         stores={STORES}>
            <MicroApp url={url}
                      stores={STORES}/>
            <FullApp {...other}
                     url={url}
                     stores={STORES}/>
        </RestrictAccessProviderComponent>
    );
}
