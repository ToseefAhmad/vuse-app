import './StoreLocatorPage.scss';

import React, {useRef} from 'react';

import {
    SearchLocationComponent,
    StoreLocatorControlComponent,
    GoogleMapProviderContainer
} from 'bat-core/store-locator';

// We can't use svg icons for defaultIcon and selectedIcon because of google maps implementation
// https://developers.google.com/maps/documentation/javascript/markers
import defaultIcon from '../../common/resources/images/vuse-marker.png';
import selectedIcon from '../../common/resources/images/vuse-marker-selected.png';
import clusterIcon1 from '../../common/resources/svg/vuse-map-cluster-1.svg';
import clusterIcon2 from '../../common/resources/svg/vuse-map-cluster-2.svg';
import clusterIcon3 from '../../common/resources/svg/vuse-map-cluster-3.svg';

const STORE_ICONS = {
    active: selectedIcon,
    inactive: defaultIcon
};
const CLUSTER_ICONS = {1: clusterIcon1, 2: clusterIcon2, 3: clusterIcon3};

const getClusterIconUrl = (index) => CLUSTER_ICONS[index];

export const StoreLocatorPage = () => {
    const locationMapRef = useRef(null);

    return (
        <GoogleMapProviderContainer locationMapRef={locationMapRef}
                                    storeIcons={STORE_ICONS}>
            <div className="store-locator-page">
                <div className="store-locator-page-body">
                    <SearchLocationComponent brandName="VUSE"/>
                    <StoreLocatorControlComponent locationMapRef={locationMapRef}
                                                  storeIcons={STORE_ICONS}
                                                  getClusterIconUrl={getClusterIconUrl}/>
                </div>
            </div>
        </GoogleMapProviderContainer>
    );
};
