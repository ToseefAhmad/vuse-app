import './ProductPage.scss';

import React from 'react';
import {useLocation} from 'react-router';
import type {RefObject} from 'react';
import {useIntl} from 'react-intl';

import {useAddToRecentViewedProduct} from '@luft/product';

import {
    ProductDetailComponent,
    RecommendedProductsListContainer,
    ProductContainer,
    useInitialProductStateInEditMode
} from 'bat-core/product';

import messages from './resources/messages';

type Props = {
    entityId: number,
    addToCartRef: RefObject
};

export const ProductPage = (props: Props) => {
    const {entityId, addToCartRef} = props;
    const {search} = useLocation();
    const queryParams = new URLSearchParams(search);
    const cartItemId = queryParams.get('cart_item_id');
    const wishlistItemId = queryParams.get('wishlist_item_id');
    const initialProductState = useInitialProductStateInEditMode({cartItemId, wishlistItemId});
    const {formatMessage} = useIntl();

    useAddToRecentViewedProduct({productId: entityId});

    return (
        <div className="product-page">
            <ProductContainer productId={entityId}
                              initialState={initialProductState}>
                <ProductDetailComponent addToCartRef={addToCartRef}
                                        brandName="VUSE"/>
            </ProductContainer>
            <RecommendedProductsListContainer productId={entityId}
                                              className="recommended-products-list-component"
                                              title={formatMessage(messages.title)}/>
        </div>
    );
};
